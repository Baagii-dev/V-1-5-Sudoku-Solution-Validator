// tests/ хавтасны жишээ өгөгдлийг build хийхэд багтаана (сервергүй тул).
const files = import.meta.glob('../../tests/*.txt', { query: '?raw', import: 'default', eager: true });

const DESC = {
  'valid_book.txt': 'Зөв шийд (номын жишээ)',
  'invalid_row.txt': 'Мөрт давхардал',
  'invalid_col.txt': 'Баганад давхардал',
  'invalid_box.txt': '3x3 дэд хүснэгтэд давхардал',
  'invalid_cell.txt': 'Нэг нүд мөр, багана, дэд хүснэгтэд зэрэг буруу',
  'bad_letter.txt': 'Оролтын алдаа: тоо биш тэмдэгт',
  'bad_range.txt': 'Оролтын алдаа: 1–9-өөс гадуур',
  'bad_short.txt': 'Оролтын алдаа: мөр дутуу',
};

export const SAMPLES = Object.entries(files)
  .map(([path, text]) => {
    const name = path.split('/').pop();
    return { name, label: DESC[name] ? `${DESC[name]} (${name})` : name, text };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_SAMPLE = 'valid_book.txt';
