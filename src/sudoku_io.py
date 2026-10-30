"""Sudoku хүснэгтийг унших ба оролтыг шалгах модуль."""

SIZE = 9


class SudokuInputError(ValueError):
    """Оролтын алдаа. errors нь (мөр, багана, мессеж) жагсаалт."""

    def __init__(self, errors):
        self.errors = errors
        super().__init__("\n".join(msg for _, _, msg in errors))


def parse_board(text):
    """Текстээс 9x9 хүснэгт үүсгэнэ. Алдаа бүрийг цуглуулж нэг дор мэдээлнэ."""
    lines = [ln.strip() for ln in text.strip().splitlines() if ln.strip()]
    errors = []

    if len(lines) != SIZE:
        errors.append((None, None, f"{SIZE} мөр байх ёстой, {len(lines)} мөр байна."))

    board = []
    for r, line in enumerate(lines, start=1):
        tokens = line.replace(",", " ").split()
        if len(tokens) != SIZE:
            errors.append((r, None, f"{r}-р мөрөнд {SIZE} утга байх ёстой, {len(tokens)} утга байна."))
        row = []
        for c, tok in enumerate(tokens, start=1):
            if not (tok.isascii() and tok.isdigit()):  # '²', '٣' зэрэг Unicode цифр int()-д унана
                errors.append((r, c, f"{r}-р мөр, {c}-р багана: '{tok}' нь тоо биш."))
                row.append(0)
                continue
            val = int(tok)
            if not 1 <= val <= SIZE:
                errors.append((r, c, f"{r}-р мөр, {c}-р багана: {val} нь 1–{SIZE} хооронд биш."))
            row.append(val)
        board.append(row)

    if errors:
        raise SudokuInputError(errors)
    return board


def load_board(path):
    """Файлаас хүснэгт уншина."""
    try:
        with open(path, encoding="utf-8-sig") as f:
            return parse_board(f.read())
    except FileNotFoundError:
        raise SudokuInputError([(None, None, f"Файл олдсонгүй: {path}")]) from None
    except UnicodeDecodeError:
        raise SudokuInputError([(None, None, f"Текст файл биш байна: {path}")]) from None


if __name__ == "__main__":
    import sys

    sys.stdout.reconfigure(encoding="utf-8")
    for path in sys.argv[1:]:
        try:
            load_board(path)
            print(f"{path}: уншигдлаа")
        except SudokuInputError as e:
            print(f"{path}: ОРОЛТЫН АЛДАА")
            for line in str(e).splitlines():
                print(f"    - {line}")