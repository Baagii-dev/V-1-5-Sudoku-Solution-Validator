"""Ажиллуулах: python -m unittest discover -s tests -t . -v  (эсвэл: python tests/test_validator.py)"""

import http.client
import json
import subprocess
import sys
import tempfile
import threading
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT.parent / "src"
sys.path.insert(0, str(SRC))

from sudoku_io import SudokuInputError, load_board  # noqa: E402
from validator import build_tasks, validate  # noqa: E402


def bad_kinds(report):
    return {t["kind"] for t in report["threads"] if not t["ok"]}


class ValidatorTests(unittest.TestCase):
    def test_thread_counts(self):
        self.assertEqual(len(build_tasks(11)), 11)
        self.assertEqual(len(build_tasks(27)), 27)

    def test_valid_book(self):
        for mode in (11, 27):
            r = validate(load_board(ROOT / "valid_book.txt"), mode)
            self.assertTrue(r["valid"], mode)
            self.assertEqual(len({t["thread"] for t in r["threads"]}), mode)

    def test_invalid_row(self):
        r = validate(load_board(ROOT / "invalid_row.txt"))
        self.assertFalse(r["valid"])
        self.assertIn("row", bad_kinds(r))

    def test_invalid_col(self):
        r = validate(load_board(ROOT / "invalid_col.txt"))
        self.assertFalse(r["valid"])
        self.assertIn("col", bad_kinds(r))

    def test_invalid_box(self):
        r = validate(load_board(ROOT / "invalid_box.txt"))
        self.assertFalse(r["valid"])
        self.assertIn("box", bad_kinds(r))

    def test_invalid_cell_marks_duplicate_cells(self):
        r = validate(load_board(ROOT / "invalid_cell.txt"), 27)
        row1 = next(t for t in r["threads"] if t["name"].endswith("Мөр 1"))
        self.assertEqual(row1["groups"][0]["bad"], [(0, 0), (0, 8)])

    def test_modes_agree(self):
        for name in ("valid_book", "invalid_row", "invalid_col", "invalid_box", "invalid_cell"):
            b = load_board(ROOT / f"{name}.txt")
            self.assertEqual(validate(b, 11)["valid"], validate(b, 27)["valid"], name)

    def test_bad_input_reported(self):
        for name in ("bad_letter", "bad_range", "bad_short"):
            with self.assertRaises(SudokuInputError, msg=name):
                load_board(ROOT / f"{name}.txt")

    def test_missing_and_empty_input(self):
        with self.assertRaises(SudokuInputError):
            load_board(ROOT / "no_such_file.txt")
        from sudoku_io import parse_board

        with self.assertRaises(SudokuInputError):
            parse_board("")

    def test_windows_bom_and_crlf(self):
        text = (ROOT / "valid_book.txt").read_text(encoding="utf-8").replace("\r\n", "\n").replace("\n", "\r\n")
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "win.txt"
            f.write_bytes(b"\xef\xbb\xbf" + text.encode("utf-8"))
            self.assertTrue(validate(load_board(f))["valid"])

    def test_bad_mode(self):
        with self.assertRaises(ValueError):
            build_tasks(5)

    def test_unicode_digits_rejected(self):
        # '²'.isdigit() == True боловч int('²') унадаг (review R1)
        from sudoku_io import parse_board

        base = (ROOT / "valid_book.txt").read_text(encoding="utf-8-sig").splitlines()
        for tok in ("²", "٣", "５"):
            lines = list(base)
            lines[0] = tok + lines[0][1:]
            with self.assertRaises(SudokuInputError, msg=tok) as cm:
                parse_board("\n".join(lines))
            self.assertIn("тоо биш", str(cm.exception))

    def test_cli_bad_mode_exits_cleanly(self):
        # --mode=abc, --mode=12 нь traceback биш usage мессеж, exit 2 (review R3)
        for arg in ("--mode=abc", "--mode=12", "--mode="):
            p = subprocess.run(
                [sys.executable, str(SRC / "validator.py"), arg, str(ROOT / "valid_book.txt")],
                capture_output=True, text=True, encoding="utf-8",
            )
            self.assertEqual(p.returncode, 2, arg)
            self.assertNotIn("Traceback", p.stderr, arg)
            self.assertIn("--mode", p.stdout, arg)


class ApiTests(unittest.TestCase):
    """HTTP API: буруу хүсэлтэд сервер хариу өгөх ёстой (review R1, R2)."""

    @classmethod
    def setUpClass(cls):
        from http.server import ThreadingHTTPServer

        import app

        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
        cls.port = cls.server.server_address[1]
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def post(self, body, length=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        headers = {"Content-Type": "application/json", "Content-Length": str(len(data) if length is None else length)}
        conn.request("POST", "/api/validate", body=data, headers=headers)
        resp = conn.getresponse()
        out = resp.status, json.loads(resp.read())
        conn.close()
        return out

    def test_valid_request(self):
        text = (ROOT / "valid_book.txt").read_text(encoding="utf-8-sig")
        status, body = self.post(json.dumps({"board": text, "mode": 27}))
        self.assertEqual(status, 200)
        self.assertTrue(body["valid"])

    def test_non_object_json_gets_400(self):
        for raw in ("[]", "null", '"x"', "5", "true"):
            status, body = self.post(raw)
            self.assertEqual(status, 400, raw)
            self.assertIn("errors", body, raw)

    def test_unicode_digit_board_gets_400(self):
        text = (ROOT / "valid_book.txt").read_text(encoding="utf-8-sig")
        status, body = self.post(json.dumps({"board": "²" + text[1:]}))
        self.assertEqual(status, 400)
        self.assertTrue(any("тоо биш" in e["message"] for e in body["errors"]))

    def test_bad_mode_and_board_type_get_400(self):
        for payload in ({"board": "x", "mode": "abc"}, {"board": "x", "mode": 12}, {"board": 5}, {"board": "x", "mode": []}):
            status, _ = self.post(json.dumps(payload))
            self.assertEqual(status, 400, payload)

    def test_negative_content_length_gets_400(self):
        status, _ = self.post("{}", length=-1)
        self.assertEqual(status, 400)


if __name__ == "__main__":
    unittest.main(verbosity=2)
