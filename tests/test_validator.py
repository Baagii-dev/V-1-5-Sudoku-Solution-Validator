"""Ажиллуулах: python -m unittest discover -s tests -t . -v  (эсвэл: python tests/test_validator.py)"""

import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent / "src"))

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


if __name__ == "__main__":
    unittest.main(verbosity=2)
