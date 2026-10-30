"""Sudoku validator-ын вэб UI-г ажиллуулах локал сервер (зөвхөн стандарт сан).

Ажиллуулах: python src/app.py [--port=8000] [--no-browser]
Хөтөч автоматаар нээгдэнэ. Нээгдэхгүй бол http://127.0.0.1:8000 хаягийг гараар нээнэ.
"""

import json
import sys
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from sudoku_io import SudokuInputError, parse_board
from validator import MODES, validate

HERE = Path(__file__).resolve().parent
TESTS = HERE.parent / "tests"
MAX_BODY = 64 * 1024


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, body, ctype="application/json; charset=utf-8"):
        data = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ("/", "/index.html"):
            self._send(200, (HERE / "ui.html").read_bytes(), "text/html; charset=utf-8")
        elif path == "/api/samples":
            samples = [{"name": p.name, "text": p.read_text(encoding="utf-8-sig")} for p in sorted(TESTS.glob("*.txt"))]
            self._send(200, samples)
        else:
            self._send(404, {"error": "Олдсонгүй"})

    def do_POST(self):
        if urlsplit(self.path).path != "/api/validate":
            return self._send(404, {"error": "Олдсонгүй"})
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > MAX_BODY:
                return self._send(413, {"errors": [{"row": None, "col": None, "message": "Оролт хэт том байна."}]})
            if length < 0:
                raise ValueError("Content-Length сөрөг байж болохгүй.")
            payload = json.loads(self.rfile.read(length) or b"{}")
            if not isinstance(payload, dict):
                raise ValueError("JSON нь объект байх ёстой.")
            text = payload.get("board", "")
            mode = int(payload.get("mode", 11))
            if mode not in MODES:
                raise ValueError(f"Урсгалын горим {MODES}-ийн аль нэг байх ёстой.")
            if not isinstance(text, str):
                raise ValueError("board нь текст байх ёстой.")
        except (ValueError, TypeError) as e:
            return self._send(400, {"errors": [{"row": None, "col": None, "message": f"Хүсэлт буруу: {e}"}]})
        try:
            board = parse_board(text)
        except SudokuInputError as e:
            errs = [{"row": r, "col": c, "message": m} for r, c, m in e.errors]
            return self._send(400, {"errors": errs})
        report = validate(board, mode)
        report["board"] = board
        self._send(200, report)

    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8")
    port = 8000
    open_browser = True
    for a in argv:
        if a.startswith("--port="):
            try:
                port = int(a.split("=", 1)[1])
            except ValueError:
                print(f"Порт нь тоо байх ёстой: {a}")
                return 2
        elif a == "--no-browser":
            open_browser = False
    try:
        server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    except OSError:
        print(f"{port}-р порт эзлэгдсэн байна. Өөр порт сонгоно уу, жишээ нь: python3 src/app.py --port={port + 1}")
        return 1
    url = f"http://127.0.0.1:{port}"
    print(f"Сервер ажиллаж байна: {url}  (зогсоох: Ctrl+C)")
    if open_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nЗогслоо.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
