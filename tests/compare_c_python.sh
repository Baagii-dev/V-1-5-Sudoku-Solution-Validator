#!/bin/sh
# C ба Python validator нэг өгөгдөлд яг ижил гаралт өгч байгааг шалгана.
# Ажиллуулах: cd src/c && make test
BIN="${1:-./validator}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PY="${PYTHON:-python3}"
fail=0
# Нэмэлт захын тохиолдол: Windows BOM + CRLF, хоосон файл, маш том тоо, таслал, тэг эхэлсэн тоо.
EDGE="$(mktemp -d)"
trap 'rm -rf "$EDGE"' EXIT
printf '\357\273\277' > "$EDGE/bom_crlf.txt"
sed 's/$/\r/' "$ROOT/tests/valid_book.txt" >> "$EDGE/bom_crlf.txt"
: > "$EDGE/empty.txt"
printf '1 2 3 4 5 6 7 8 99999999999999999999\n' > "$EDGE/huge.txt"
for i in 1 2 3 4 5 6 7 8 9; do echo '1,2,3,4,5,6,7,8,9'; done > "$EDGE/commas.txt"
printf '007 2 3 4 5 6 7 8 9\n1 2 3\n' > "$EDGE/zeros.txt"
for mode in 11 27; do
  for f in "$ROOT"/tests/*.txt "$EDGE"/*.txt; do
    c_out="$("$BIN" --mode=$mode "$f" 2>&1)"; c_code=$?
    p_out="$("$PY" "$ROOT/src/validator.py" --mode=$mode "$f" 2>&1)"; p_code=$?
    if [ "$c_out" != "$p_out" ] || [ "$c_code" != "$p_code" ]; then
      echo "ЗӨРСӨН: mode=$mode $(basename "$f") (C код=$c_code, Python код=$p_code)"
      echo "--- C:"; echo "$c_out"; echo "--- Python:"; echo "$p_out"
      fail=1
    fi
  done
done
[ $fail -eq 0 ] && echo "OK: C ба Python бүх тестэд ижил гаралттай"
exit $fail
