// sudoku_io.py-ийн parse_board-ийн JavaScript хувилбар (ижил алдааны мессежтэй).
export const SIZE = 9;

/** Текстээс 9x9 хүснэгт үүсгэнэ. Амжилттай бол {board}, алдаатай бол {errors:[{row,col,message}]}. */
export function parseBoard(text) {
  const clean = String(text).replace(/^﻿/, '').trim();
  const lines = clean.split(/\r\n|\r|\n/).map((l) => l.trim()).filter(Boolean);
  const errors = [];

  if (lines.length !== SIZE) {
    errors.push({ row: null, col: null, message: `${SIZE} мөр байх ёстой, ${lines.length} мөр байна.` });
  }

  const board = [];
  lines.forEach((line, i) => {
    const r = i + 1;
    const tokens = line.replaceAll(',', ' ').split(/\s+/).filter(Boolean);
    if (tokens.length !== SIZE) {
      errors.push({ row: r, col: null, message: `${r}-р мөрөнд ${SIZE} утга байх ёстой, ${tokens.length} утга байна.` });
    }
    const row = [];
    tokens.forEach((tok, j) => {
      const c = j + 1;
      if (!/^\d+$/.test(tok)) {
        errors.push({ row: r, col: c, message: `${r}-р мөр, ${c}-р багана: '${tok}' нь тоо биш.` });
        row.push(0);
        return;
      }
      const val = Number(tok);
      if (val < 1 || val > SIZE) {
        errors.push({ row: r, col: c, message: `${r}-р мөр, ${c}-р багана: ${val} нь 1–${SIZE} хооронд биш.` });
      }
      row.push(val);
    });
    board.push(row);
  });

  return errors.length ? { errors } : { board };
}
