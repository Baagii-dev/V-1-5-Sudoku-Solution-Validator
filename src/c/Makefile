# Хэрэглээ: make (build), make test (Python хувилбартай тулгах), make clean
CC      ?= cc
CFLAGS  ?= -O2 -Wall -Wextra -pedantic -std=c11 -D_POSIX_C_SOURCE=200809L
LDFLAGS ?= -pthread

validator: validator.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

test: validator
	sh ../../tests/compare_c_python.sh ./validator

clean:
	rm -f validator

.PHONY: test clean
