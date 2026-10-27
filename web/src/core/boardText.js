// Самбарын нүд ба текст талбарын хоорондын хөрвүүлэлт (засварлаж болдог самбарт).
import { SIZE } from './parseBoard.js';

/** Текстээс 9x9 нүдний харагдах утга. Буруу тэмдэгт, "0" нь хоосон нүд болж харагдана. */
export function boardPreview(text) {
  const lines = String(text).replace(/^\uFEFF/, '').trim().split(/\r\n|\r|\n/);
  return Array.from({ length: SIZE }, (_, r) => {
    const cells = (lines[r] || '').trim().replaceAll(',', ' ').split(/\s+/).filter(Boolean);
    return Array.from({ length: SIZE }, (_, c) => (/^[1-9]\d?$/.test(cells[c] || '') ? cells[c] : ''));
  });
}

/** Нүднүүдээс текст. Хоосон нүдийг "0" гэж бичиж, шалгагч яг тэр нүдийг алдаа гэж заана. */
export function boardToText(rows) {
  return rows.map((row) => row.map((v) => (v === '' ? '0' : v)).join(' ')).join('\n');
}
