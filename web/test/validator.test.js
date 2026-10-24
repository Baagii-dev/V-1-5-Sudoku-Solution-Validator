import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseBoard } from '../src/core/parseBoard.js';
import { buildTasks, runTask } from '../src/core/tasks.js';

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
