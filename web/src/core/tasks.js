// validator.py-ийн build_tasks, _check_group-ийн JavaScript хувилбар.
import { SIZE } from './parseBoard.js';

export const BOX = 3;
export const MODES = [11, 27];

const rowGroup = (r) => ({ label: `Мөр ${r + 1}`, cells: Array.from({ length: SIZE }, (_, c) => [r, c]) });
const colGroup = (c) => ({ label: `Багана ${c + 1}`, cells: Array.from({ length: SIZE }, (_, r) => [r, c]) });
const boxGroup = (b) => {
  const br = Math.floor(b / BOX) * BOX;
  const bc = (b % BOX) * BOX;
  const cells = [];
  for (let r = br; r < br + BOX; r++) for (let c = bc; c < bc + BOX; c++) cells.push([r, c]);
  return { label: `Дэд хүснэгт ${b + 1}`, cells };
};

/** Урсгал бүрт өгөх ажлын жагсаалт: 11 эсвэл 27 ажил. */
export function buildTasks(mode = 11) {
  if (!MODES.includes(mode)) throw new Error(`mode нь ${MODES.join(', ')}-ийн аль нэг байх ёстой, ${mode} өгөгдсөн.`);
  const idx = Array.from({ length: SIZE }, (_, i) => i);
  const rows = idx.map(rowGroup);
  const cols = idx.map(colGroup);
  const boxes = idx.map(boxGroup);
  if (mode === 27) {
    return [
      ...rows.map((g, i) => ({ name: `T${i + 1} Мөр ${i + 1}`, kind: 'row', groups: [g] })),
      ...cols.map((g, i) => ({ name: `T${i + 10} Багана ${i + 1}`, kind: 'col', groups: [g] })),
      ...boxes.map((g, i) => ({ name: `T${i + 19} Дэд хүснэгт ${i + 1}`, kind: 'box', groups: [g] })),
    ];
  }
  return [
    { name: 'T1 Бүх мөр', kind: 'row', groups: rows },
    { name: 'T2 Бүх багана', kind: 'col', groups: cols },
    ...boxes.map((g, i) => ({ name: `T${i + 3} Дэд хүснэгт ${i + 1}`, kind: 'box', groups: [g] })),
  ];
}

/** Нэг бүлгийн (9 нүд) давхардсан эсвэл 1–9-өөс гадуурх нүднүүд. */
export function checkGroup(board, cells) {
  const seen = new Map();
  for (const [r, c] of cells) {
    const v = board[r][c];
    if (!seen.has(v)) seen.set(v, []);
    seen.get(v).push([r, c]);
  }
  const bad = [];
  for (const [v, where] of seen) {
    if (where.length > 1 || v < 1 || v > SIZE) bad.push(...where);
  }
  return bad.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

/** Нэг ажлыг гүйцэтгэнэ. Worker болон туршилт хоёулаа үүнийг дууддаг. */
export function runTask(board, task, thread = 'main') {
  const groups = task.groups.map(({ label, cells }) => {
    const bad = checkGroup(board, cells);
    return { label, cells, bad, ok: bad.length === 0 };
  });
  return { name: task.name, kind: task.kind, thread, ok: groups.every((g) => g.ok), groups };
}
