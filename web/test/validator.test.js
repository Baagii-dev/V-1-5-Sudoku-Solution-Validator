import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseBoard } from '../src/core/parseBoard.js';
import { buildTasks, runTask } from '../src/core/tasks.js';
import { boardPreview, boardToText } from '../src/core/boardText.js';

const dir = fileURLToPath(new URL('../../tests/', import.meta.url));
const load = (name) => parseBoard(readFileSync(dir + name, 'utf8'));
const check = (name, mode = 11) => {
  const { board } = load(name);
  const threads = buildTasks(mode).map((t, i) => runTask(board, t, `t${i}`));
  return { valid: threads.every((t) => t.ok), badKinds: new Set(threads.filter((t) => !t.ok).map((t) => t.kind)) };
};

test('урсгалын тоо', () => {
  assert.equal(buildTasks(11).length, 11);
  assert.equal(buildTasks(27).length, 27);
  assert.throws(() => buildTasks(5));
});

test('зөв шийд', () => {
  for (const mode of [11, 27]) assert.equal(check('valid_book.txt', mode).valid, true);
});

test('мөр, багана, дэд хүснэгтийн алдаа', () => {
  assert.ok(check('invalid_row.txt').badKinds.has('row'));
  assert.ok(check('invalid_col.txt').badKinds.has('col'));
  assert.ok(check('invalid_box.txt').badKinds.has('box'));
  assert.deepEqual([...check('invalid_cell.txt').badKinds].sort(), ['box', 'col', 'row']);
});

test('буруу оролт', () => {
  for (const name of ['bad_letter.txt', 'bad_range.txt', 'bad_short.txt']) {
    assert.ok(load(name).errors?.length > 0, name);
  }
});

test('Windows BOM ба CRLF', () => {
  const text = '﻿' + readFileSync(dir + 'valid_book.txt', 'utf8').replace(/\r?\n/g, '\r\n');
  assert.ok(parseBoard(text).board);
});

test('тестийн бүх файл зөв ангилагдана', () => {
  const expectValid = new Set(['valid_book.txt']);
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.txt'))) {
    const parsed = load(name);
    const valid = parsed.board ? check(name).valid : false;
    assert.equal(valid, expectValid.has(name), name);
  }
});

test('самбарын нүд засах: текст рүү хөрвүүлэх', () => {
  const rows = boardPreview(readFileSync(dir + 'valid_book.txt', 'utf8'));
  assert.equal(rows[0][0], '6');
  rows[0][4] = ''; // нүд цэвэрлэв
  const text = boardToText(rows);
  assert.equal(text.split('\n')[0], '6 2 4 5 0 9 1 8 7');
  const parsed = parseBoard(text);
  assert.equal(parsed.errors.length, 1);
  assert.match(parsed.errors[0].message, /1-р мөр, 5-р багана/);
  assert.equal(boardPreview(text)[0][4], '');
});

test('самбарын урьдчилсан харагдац: муу өгөгдөлд тэсвэртэй', () => {
  const rows = boardPreview('x 2\n1 2 3');
  assert.equal(rows.length, 9);
  assert.equal(rows[0][0], '');
  assert.equal(rows[0][1], '2');
});
