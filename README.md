# V-1-5 – Sudoku Solution Validator

**Хичээл:** F.CSM302 Үйлдлийн систем – Бие даалт 1
**Хуваарилалтын код:** V-1-5
**Сурах бичиг:** Operating System Concepts (2018), Бүлэг 4 – Threads & Concurrency, Programming Project
**UI дүрслэл:** Sudoku board

## Гишүүд

| Оюутны код | Нэр |
|---|---|
| B241940010 | О. Батцэцэг |
| B242270090 | А. Пүрэвдэмбэрэл |
| B241910002 | Г. Ундрам |
| B222270837 | А. Дөлгөөн |
| B241910025 | Т. Цэрэндулам |
| B190910811 | Э. Өлзийсүрэн |

## Зорилго

9x9 Sudoku хүснэгтийн шийд зөв эсэхийг олон урсгалаар шалгана. Мөр, багана,
3x3 дэд хүснэгт бүрийг тусдаа урсгал шалгаж, үр дүнг эцэг урсгал нэгтгэнэ.
Шалгалтын үр дүнг Sudoku самбар дээр мөр, багана, дэд хүснэгтээр ялган харуулна.

## Онлайн хувилбар (татах шаардлагагүй)

Вэб хувилбар GitHub Pages дээр ажиллана: https://baagii-dev.github.io/V-1-5-Sudoku-Solution-Validator/

Энэ хувилбарт шалгалтыг хөтөч дээр **Web Worker** урсгалууд (11 эсвэл 27) гүйцэтгэнэ.
Web Worker нь хөтчийн урсгал, харин доорх Python хувилбар нь үйлдлийн системийн жинхэнэ
урсгал (`threading`) ашигладаг бөгөөд даалгаварт тавигдсан үндсэн хэрэгжүүлэлт нь тэр юм.
Вэб хувилбарын эх код `web/` хавтастай (React + Vite). Локал дээр ажиллуулах: `cd web && npm ci && npm run dev`.

## Quick Start (Python хувилбар)

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

**C хувилбар (POSIX Pthreads, Linux/macOS):** сурах бичгийн Programming Project-ийн нэгэн адил
`pthread_create`/`pthread_join`-оор жинхэнэ OS урсгал ашиглана. Шаардлага: `cc` (gcc/clang), `make`.

```bash
cd src/c
make                                    # build
./validator ../../tests/valid_book.txt  # 11 урсгал
./validator --mode=27 ../../tests/invalid_box.txt
make test                               # Python хувилбартай гаралтыг тулгана
```

Windows дээр C хувилбарыг WSL (Ubuntu) дотор ажиллуулна, эсвэл Python/онлайн хувилбарыг хэрэглэнэ.

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
| `src/` | Python эх код (`threading`) болон `src/c/` дахь C эх код (Pthreads) |
| `web/` | React + Web Worker вэб хувилбар (GitHub Pages) |
| `tests/` | Үндсэн ба нэмэлт тестийн өгөгдөл |
| `docs/` | Manual, тайлан, зураг |

## Туршилт

```bash
python3 tests/test_validator.py
```

Вэб хувилбарын туршилт (Node 22): `cd web && npm test`

`tests/` дотор: `valid_book.txt` (зөв), `invalid_row/col/box/cell.txt` (шийдийн алдаа),
`bad_letter/range/short.txt` (буруу оролт). Нэмэлт тестийг `tests/test_validator.py`-д нэмнэ.

## Дэлгэцийн зураг

![Буруу мөр илэрсэн байдал](docs/img/02_invalid_row.png)

Холбоосоор шууд нээх: `http://127.0.0.1:8000/?sample=invalid_row.txt&mode=11&autorun=1`

## Ашигласан сан, бэлэн код, AI

- **Сан:** Python хувилбар: зөвхөн стандарт сан (`threading`, `http.server`, `json`, `unittest`). Вэб хувилбар: React, Vite (`web/package.json`).
- **AI:** `src/validator.py`, `src/app.py`, `src/ui.html`, `tests/test_validator.py`, `web/` (React онлайн хувилбар), `.github/workflows/` болон `docs/` доторх Manual, Report-ийн эхийг Claude Code (Anthropic)-ийн тусламжтай бичсэн. Багийнхан кодыг уншиж, ажиллуулан шалгасан.
- **Бэлэн код:** Сурах бичгийн (OSC 2018) Бүлэг 4-ийн Sudoku төслийн тайлбараас бусад бэлэн код хуулаагүй.

