import { SIZE } from '../core/parseBoard.js';

/** 9x9 самбар. bad: давхардсан нүд, errCells: оролтын алдаатай нүд, cur: одоо шалгаж буй бүлэг. */
export default function Board({ board, bad, errCells, cur }) {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const k = r * SIZE + c;
      let cls = 'c';
      if (bad.has(k)) cls += ' bad';
      else if (errCells.has(k)) cls += ' inerr';
      else if (cur?.cells.has(k)) cls += ` ${cur.kind}`;
      if (c % 3 === 2 && c < SIZE - 1) cls += ' br';
      if (r % 3 === 2 && r < SIZE - 1) cls += ' bb';
      cells.push(
        <div key={k} className={cls}>
          {board ? board[r][c] : ''}
        </div>,
      );
    }
  }
  return (
    <div>
      <div className="g" role="grid" aria-label="Sudoku самбар">
        {cells}
      </div>
      <div className="legend">
        <span className="lg"><span className="sw" style={{ background: 'var(--row)' }} />Мөр шалгаж байна</span>
        <span className="lg"><span className="sw" style={{ background: 'var(--col)' }} />Багана</span>
        <span className="lg"><span className="sw" style={{ background: 'var(--box)' }} />Дэд хүснэгт</span>
        <span className="lg"><span className="sw" style={{ background: 'var(--bad-bg)' }} />Давхардсан / алдаатай</span>
      </div>
    </div>
  );
}
