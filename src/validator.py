"""Sudoku шийдийг олон урсгалаар шалгах модуль (OSC Бүлэг 4, Programming Project).

Горим 11: мөрийн 1, баганын 1, 3x3 дэд хүснэгт тус бүрийн 9 урсгал = 11 урсгал.
Горим 27: мөр, багана, дэд хүснэгт бүрт тусдаа урсгал = 27 урсгал.

Урсгал бүр эцэг урсгалаас өгсөн жагсаалтын өөрийн нүдэнд л үр дүнгээ бичнэ.
Тиймээс урсгалууд хоорондоо өгөгдөл хуваалцахгүй, түгжээ (lock) хэрэггүй.
"""

import sys
import threading
import time
from dataclasses import dataclass

from sudoku_io import SIZE, SudokuInputError, load_board

BOX = 3
MODES = (11, 27)


@dataclass
class Task:
    """Нэг урсгалд өгөх ажил: шалгах бүлгүүд (бүлэг бүр 9 нүд)."""

    name: str
    kind: str  # "row" | "col" | "box"
    groups: list  # [(шошго, [(мөр, багана), ...]), ...]


def _row_group(r):
    return (f"Мөр {r + 1}", [(r, c) for c in range(SIZE)])


def _col_group(c):
    return (f"Багана {c + 1}", [(r, c) for r in range(SIZE)])


def _box_group(b):
    br, bc = (b // BOX) * BOX, (b % BOX) * BOX
    cells = [(r, c) for r in range(br, br + BOX) for c in range(bc, bc + BOX)]
    return (f"Дэд хүснэгт {b + 1}", cells)


def build_tasks(mode=11):
    if mode not in MODES:
        raise ValueError(f"mode нь {MODES}-ийн аль нэг байх ёстой, {mode!r} өгөгдсөн.")
    rows = [_row_group(i) for i in range(SIZE)]
    cols = [_col_group(i) for i in range(SIZE)]
    boxes = [_box_group(i) for i in range(SIZE)]
    if mode == 27:
        return (
            [Task(f"T{i + 1} Мөр {i + 1}", "row", [g]) for i, g in enumerate(rows)]
            + [Task(f"T{i + 10} Багана {i + 1}", "col", [g]) for i, g in enumerate(cols)]
            + [Task(f"T{i + 19} Дэд хүснэгт {i + 1}", "box", [g]) for i, g in enumerate(boxes)]
        )
    return (
        [Task("T1 Бүх мөр", "row", rows), Task("T2 Бүх багана", "col", cols)]
        + [Task(f"T{i + 3} Дэд хүснэгт {i + 1}", "box", [g]) for i, g in enumerate(boxes)]
    )


def _check_group(board, cells):
    """Давхардсан утгатай нүднүүдийг буцаана (хоосон бол бүлэг зөв)."""
    seen = {}
    for r, c in cells:
        seen.setdefault(board[r][c], []).append((r, c))
    expected = set(range(1, SIZE + 1))
    bad = [cell for v, where in seen.items() if len(where) > 1 for cell in where]
    # 1..9-өөс гадуурх утга parse хийхэд баригдсан ч энд давхар хамгаална.
    bad += [cell for v, where in seen.items() if v not in expected and len(where) == 1 for cell in where]
    return sorted(bad)


def _worker(board, task, results, slot):
    start = time.perf_counter()
    groups = []
    for label, cells in task.groups:
        bad = _check_group(board, cells)
        groups.append({"label": label, "cells": cells, "bad": bad, "ok": not bad})
    results[slot] = {
        "name": task.name,
        "kind": task.kind,
        "thread": threading.current_thread().name,
        "ok": all(g["ok"] for g in groups),
        "groups": groups,
        "elapsed_ms": round((time.perf_counter() - start) * 1000, 3),
    }


def validate(board, mode=11):
    """board (9x9 тоо)-ыг шалгаж, урсгал бүрийн үр дүн болон нэгтгэсэн дүгнэлтийг буцаана."""
    tasks = build_tasks(mode)
    results = [None] * len(tasks)
    threads = [
        threading.Thread(target=_worker, args=(board, t, results, i), name=f"validator-{i + 1}")
        for i, t in enumerate(tasks)
    ]
    for th in threads:
        th.start()
    for th in threads:
        th.join()
    return {"valid": all(r["ok"] for r in results), "mode": mode, "threads": results}


def _print_report(path, report):
    print(f"{path}: {'ЗӨВ ШИЙД' if report['valid'] else 'БУРУУ ШИЙД'} ({len(report['threads'])} урсгал)")
    for t in report["threads"]:
        for g in t["groups"]:
            if not g["ok"]:
                cells = ", ".join(f"({r + 1},{c + 1})" for r, c in g["bad"])
                print(f"    - {t['name']}: {g['label']} давхардал: {cells}")


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8")  # Windows консол/файлд кирилл үсэг алдахгүй
    mode = 11
    paths = []
    for a in argv:
        if a.startswith("--mode="):
            mode = int(a.split("=", 1)[1])
        else:
            paths.append(a)
    if not paths:
        print("Хэрэглээ: python src/validator.py [--mode=11|27] файл.txt [файл2.txt ...]")
        return 2
    exit_code = 0
    for path in paths:
        try:
            _print_report(path, validate(load_board(path), mode))
        except SudokuInputError as e:
            print(f"{path}: ОРОЛТЫН АЛДАА")
            for line in str(e).splitlines():
                print(f"    - {line}")
            exit_code = 1
    return exit_code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
