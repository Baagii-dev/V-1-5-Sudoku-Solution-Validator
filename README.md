# V-1-5 – Sudoku Solution Validator

**Хичээл:** F.CSM302 Үйлдлийн систем – Бие даалт 1
**Хуваарилалтын код:** V-1-5
**Сурах бичиг:** Operating System Concepts (2018), Бүлэг 4 – Threads & Concurrency, Programming Project
**UI дүрслэл:** Sudoku board

## Гишүүд

| Оюутны код | Нэр | Хариуцах ажил |
|---|---|---|
| B241940010 | О.Батцэцэг | |
| B242270090| А.Пүрэвдэмбэрэл| |
| | | |
| | | |
| | |  |

## Зорилго

9x9 Sudoku хүснэгтийн шийд зөв эсэхийг олон урсгалаар шалгана. Мөр, багана,
3x3 дэд хүснэгт бүрийг тусдаа урсгал шалгаж, үр дүнг эцэг урсгал нэгтгэнэ.
Шалгалтын үр дүнг Sudoku самбар дээр мөр, багана, дэд хүснэгтээр ялган харуулна.

## Quick Start

**Шаардлага:** Python 3.9 эсвэл түүнээс дээш (гадны сан суулгахгүй), вэб хөтөч.
Python-ы version шалгах: `python3 --version` (Windows дээр `python --version`).

```bash
git clone https://github.com/Baagii-dev/V-1-5-Sudoku-Solution-Validator.git
cd V-1-5-Sudoku-Solution-Validator
python3 src/app.py
```

Хөтөч автоматаар нээгдэнэ. Нээгдэхгүй бол `http://127.0.0.1:8000` хаягийг гараар нээнэ.
Зогсоохдоо терминал дээр `Ctrl+C` дарна.

> Windows дээр `python3` олдохгүй бол `python` (эсвэл `py`) гэж бичнэ.

**UI хэрэглэх 3 алхам:** (1) тестийн өгөгдөл сонгох эсвэл хүснэгтээ бичих/файлаас ачаалах →
(2) **Ажиллуулах** дарах → (3) самбар болон баруун талын урсгалын төлвийг ажиглах.

**Командын мөрөөс шалгах (UI-гүй):**

```bash
python3 src/validator.py tests/valid_book.txt tests/invalid_row.txt
python3 src/validator.py --mode=27 tests/invalid_box.txt
```

**Хүснэгтийн формат:** 9 мөр, мөр бүрд 1–9 хүртэлх 9 тоо (зай эсвэл таслалаар тусгаарлана).
Жишээ нь `tests/valid_book.txt`-г нээж харна уу.

**Асуудал гарвал:**

| Асуудал | Шийдэл |
|---|---|
| `8000-р порт эзлэгдсэн` | `python3 src/app.py --port=8001` |
| Хөтөч нээгдэхгүй | `python3 src/app.py --no-browser` ажиллуулаад хаягийг гараар нээх |
| UI дээр "Сервертэй холбогдож чадсангүй" | Терминал дээр `python3 src/app.py` ажиллаж байгаа эсэхийг шалгах |

Дэлгэрэнгүйг [docs/Manual.md](docs/Manual.md)-ээс үзнэ.

## Хавтасны бүтэц

| Хавтас | Агуулга |
|---|---|
| `src/` | Эх код |
| `tests/` | Үндсэн ба нэмэлт тестийн өгөгдөл |
| `docs/` | Manual, тайлан, зураг |

## Туршилт

```bash
python3 tests/test_validator.py
```

`tests/` дотор: `valid_book.txt` (зөв), `invalid_row/col/box/cell.txt` (шийдийн алдаа),
`bad_letter/range/short.txt` (буруу оролт). Нэмэлт тестийг `tests/test_validator.py`-д нэмнэ.

## Дэлгэцийн зураг

![Буруу мөр илэрсэн байдал](docs/img/02_invalid_row.png)

Холбоосоор шууд нээх: `http://127.0.0.1:8000/?sample=invalid_row.txt&mode=11&autorun=1`

## Ашигласан сан, бэлэн код, AI

- **Сан:** Зөвхөн Python-ы стандарт сан (`threading`, `http.server`, `json`, `unittest`). Гадны сан суулгахгүй.
- **AI:** `src/validator.py`, `src/app.py`, `src/ui.html`, `tests/test_validator.py` болон `docs/` доторх Manual, Report-ийн эхийг Claude Code (Anthropic)-ийн тусламжтай бичсэн. Багийнхан кодыг уншиж, ажиллуулан шалгасан.
- **Бэлэн код:** Сурах бичгийн (OSC 2018) Бүлэг 4-ийн Sudoku төслийн тайлбараас бусад бэлэн код хуулаагүй.

