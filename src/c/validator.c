/*
 * Sudoku шийдийг олон урсгалаар шалгах (OSC Бүлэг 4, Programming Project) - C, POSIX Pthreads.
 *
 * Горим 11: мөр, багана тус бүрт 1 урсгал, 3x3 дэд хүснэгт бүрт 1 (нийт 11).
 * Горим 27: мөр, багана, дэд хүснэгт бүрт тусдаа урсгал (нийт 27).
 *
 * Эцэг урсгал (main) урсгал бүрийг pthread_create-ээр эхлүүлж, pthread_join-оор хүлээнэ.
 * Урсгал бүр хүснэгтийг зөвхөн уншиж, үр дүнгээ өөрийн result[i]-д бичдэг тул mutex хэрэггүй.
 *
 * Ашиглах: validator [--mode=11|27] файл.txt [файл2.txt ...]
 * Гаралт нь src/validator.py-тай ижил хэлбэртэй. Гарах код: 0 = амжилттай, 1 = оролтын алдаа, 2 = хэрэглээ.
 */

#include <ctype.h>
#include <errno.h>
#include <pthread.h>
#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define SIZE 9
#define BOX 3
#define MAX_TASKS 27
#define MAX_LINE_TOKENS 4096

typedef struct {
    char label[32];
    int cells[SIZE][2]; /* [мөр, багана], 0-ээс эхэлнэ */
    int bad[SIZE];      /* 1 бол энэ нүд давхардсан эсвэл муж хэтэрсэн */
    int ok;
} Group;

typedef struct {
    char name[64];
    int ngroups;
    Group groups[SIZE];
    int ok;
    int (*board)[SIZE]; /* зөвхөн уншина */
} Task;

/* ---------- Оролт унших ---------- */

typedef struct {
    char **msgs;
    size_t n, cap;
} ErrList;

static void err_add(ErrList *e, const char *fmt, ...) __attribute__((format(printf, 2, 3)));

static void err_add(ErrList *e, const char *fmt, ...) {
    char buf[256];
    va_list ap;
    va_start(ap, fmt);
    vsnprintf(buf, sizeof buf, fmt, ap);
    va_end(ap);
    if (e->n == e->cap) {
        e->cap = e->cap ? e->cap * 2 : 16;
        e->msgs = realloc(e->msgs, e->cap * sizeof *e->msgs);
        if (!e->msgs) { perror("realloc"); exit(1); }
    }
    e->msgs[e->n++] = strdup(buf);
}

static void err_free(ErrList *e) {
    for (size_t i = 0; i < e->n; i++) free(e->msgs[i]);
    free(e->msgs);
    e->msgs = NULL;
    e->n = e->cap = 0;
}

static char *read_file(const char *path, ErrList *errs) {
    FILE *f = fopen(path, "rb");
    if (!f) {
        if (errno == ENOENT) err_add(errs, "Файл олдсонгүй: %s", path);
        else err_add(errs, "Файл нээж чадсангүй: %s", path);
        return NULL;
    }
    size_t cap = 4096, len = 0;
    char *buf = malloc(cap);
    size_t n;
    while ((n = fread(buf + len, 1, cap - len - 1, f)) > 0) {
        len += n;
        if (len + 1 >= cap) { cap *= 2; buf = realloc(buf, cap); }
    }
    fclose(f);
    buf[len] = '\0';
    if (len >= 3 && (unsigned char)buf[0] == 0xEF && (unsigned char)buf[1] == 0xBB && (unsigned char)buf[2] == 0xBF)
        memmove(buf, buf + 3, len - 2); /* UTF-8 BOM (Windows Notepad) */
    return buf;
}

/* Мөр бүрийг (хоосон мөрийг алгасаж) уншиж 9x9 хүснэгт бүтээнэ. Алдаа бүрийг цуглуулна. */
static int parse_board(char *text, int board[SIZE][SIZE], ErrList *errs) {
    char *lines[MAX_LINE_TOKENS];
    int nlines = 0;
    char *save = NULL;
    for (char *p = strtok_r(text, "\r\n", &save); p; p = strtok_r(NULL, "\r\n", &save)) {
        while (isspace((unsigned char)*p)) p++;
        char *end = p + strlen(p);
        while (end > p && isspace((unsigned char)end[-1])) *--end = '\0';
        if (*p && nlines < MAX_LINE_TOKENS) lines[nlines++] = p;
    }

    if (nlines != SIZE) err_add(errs, "%d мөр байх ёстой, %d мөр байна.", SIZE, nlines);

    for (int i = 0; i < nlines; i++) {
        int r = i + 1;
        for (char *q = lines[i]; *q; q++) if (*q == ',') *q = ' ';
        char *tokens[MAX_LINE_TOKENS];
        int nt = 0;
        char *s2 = NULL;
        for (char *t = strtok_r(lines[i], " \t\v\f", &s2); t; t = strtok_r(NULL, " \t\v\f", &s2))
            if (nt < MAX_LINE_TOKENS) tokens[nt++] = t;
        if (nt != SIZE) err_add(errs, "%d-р мөрөнд %d утга байх ёстой, %d утга байна.", r, SIZE, nt);
        for (int j = 0; j < nt; j++) {
            int c = j + 1;
            const char *tok = tokens[j];
            int digits = 1;
            for (const char *k = tok; *k; k++) if (!isdigit((unsigned char)*k)) { digits = 0; break; }
            if (!digits) {
                err_add(errs, "%d-р мөр, %d-р багана: '%s' нь тоо биш.", r, c, tok);
                if (r <= SIZE && c <= SIZE) board[r - 1][c - 1] = 0;
                continue;
            }
            /* Урт тоог хэт ачаалахгүйн тулд эхэлж урт, дараа нь утгыг шалгана. */
            const char *z = tok;
            while (*z == '0' && z[1]) z++;
            long long val = strlen(z) > 12 ? -1 : strtoll(z, NULL, 10);
            if (val < 1 || val > SIZE) {
                if (val < 0) err_add(errs, "%d-р мөр, %d-р багана: %s нь 1–%d хооронд биш.", r, c, z, SIZE);
                else err_add(errs, "%d-р мөр, %d-р багана: %lld нь 1–%d хооронд биш.", r, c, val, SIZE);
            }
            if (r <= SIZE && c <= SIZE) board[r - 1][c - 1] = (val >= 1 && val <= SIZE) ? (int)val : 0;
        }
    }
    return errs->n == 0;
}

/* ---------- Ажил үүсгэх ---------- */

static void fill_row(Group *g, int r) {
    snprintf(g->label, sizeof g->label, "Мөр %d", r + 1);
    for (int c = 0; c < SIZE; c++) { g->cells[c][0] = r; g->cells[c][1] = c; }
}
static void fill_col(Group *g, int c) {
    snprintf(g->label, sizeof g->label, "Багана %d", c + 1);
    for (int r = 0; r < SIZE; r++) { g->cells[r][0] = r; g->cells[r][1] = c; }
}
static void fill_box(Group *g, int b) {
    snprintf(g->label, sizeof g->label, "Дэд хүснэгт %d", b + 1);
    int br = (b / BOX) * BOX, bc = (b % BOX) * BOX, k = 0;
    for (int r = br; r < br + BOX; r++)
        for (int c = bc; c < bc + BOX; c++) { g->cells[k][0] = r; g->cells[k][1] = c; k++; }
}

static int build_tasks(Task *t, int mode, int (*board)[SIZE]) {
    int n = 0;
    memset(t, 0, sizeof(Task) * MAX_TASKS);
    if (mode == 27) {
        for (int i = 0; i < SIZE; i++, n++) {
            snprintf(t[n].name, sizeof t[n].name, "T%d Мөр %d", i + 1, i + 1);
            t[n].ngroups = 1; fill_row(&t[n].groups[0], i);
        }
        for (int i = 0; i < SIZE; i++, n++) {
            snprintf(t[n].name, sizeof t[n].name, "T%d Багана %d", i + 10, i + 1);
            t[n].ngroups = 1; fill_col(&t[n].groups[0], i);
        }
        for (int i = 0; i < SIZE; i++, n++) {
            snprintf(t[n].name, sizeof t[n].name, "T%d Дэд хүснэгт %d", i + 19, i + 1);
            t[n].ngroups = 1; fill_box(&t[n].groups[0], i);
        }
    } else {
        snprintf(t[n].name, sizeof t[n].name, "T1 Бүх мөр");
        t[n].ngroups = SIZE;
        for (int i = 0; i < SIZE; i++) fill_row(&t[n].groups[i], i);
        n++;
        snprintf(t[n].name, sizeof t[n].name, "T2 Бүх багана");
        t[n].ngroups = SIZE;
        for (int i = 0; i < SIZE; i++) fill_col(&t[n].groups[i], i);
        n++;
        for (int i = 0; i < SIZE; i++, n++) {
            snprintf(t[n].name, sizeof t[n].name, "T%d Дэд хүснэгт %d", i + 3, i + 1);
            t[n].ngroups = 1; fill_box(&t[n].groups[0], i);
        }
    }
    for (int i = 0; i < n; i++) t[i].board = board;
    return n;
}

/* ---------- Урсгал ---------- */

static void *worker(void *arg) {
    Task *t = arg;
    t->ok = 1;
    for (int gi = 0; gi < t->ngroups; gi++) {
        Group *g = &t->groups[gi];
        g->ok = 1;
        for (int a = 0; a < SIZE; a++) {
            int va = t->board[g->cells[a][0]][g->cells[a][1]];
            if (va < 1 || va > SIZE) g->bad[a] = 1;
            for (int b = a + 1; b < SIZE; b++)
                if (va == t->board[g->cells[b][0]][g->cells[b][1]]) g->bad[a] = g->bad[b] = 1;
        }
        for (int a = 0; a < SIZE; a++) if (g->bad[a]) g->ok = 0;
        if (!g->ok) t->ok = 0;
    }
    return NULL;
}

static int cell_cmp(const void *a, const void *b) {
    const int *x = a, *y = b;
    return x[0] != y[0] ? x[0] - y[0] : x[1] - y[1];
}

static int validate_and_print(const char *path, int board[SIZE][SIZE], int mode) {
    Task tasks[MAX_TASKS];
    pthread_t th[MAX_TASKS];
    int n = build_tasks(tasks, mode, board);
    for (int i = 0; i < n; i++)
        if (pthread_create(&th[i], NULL, worker, &tasks[i]) != 0) { perror("pthread_create"); exit(1); }
    for (int i = 0; i < n; i++) pthread_join(th[i], NULL);

    int valid = 1;
    for (int i = 0; i < n; i++) if (!tasks[i].ok) valid = 0;
    printf("%s: %s (%d урсгал)\n", path, valid ? "ЗӨВ ШИЙД" : "БУРУУ ШИЙД", n);
    for (int i = 0; i < n; i++) {
        for (int gi = 0; gi < tasks[i].ngroups; gi++) {
            Group *g = &tasks[i].groups[gi];
            if (g->ok) continue;
            int bad[SIZE][2], nb = 0;
            for (int a = 0; a < SIZE; a++) if (g->bad[a]) { bad[nb][0] = g->cells[a][0]; bad[nb][1] = g->cells[a][1]; nb++; }
            qsort(bad, nb, sizeof bad[0], cell_cmp);
            printf("    - %s: %s давхардал: ", tasks[i].name, g->label);
            for (int k = 0; k < nb; k++) printf("%s(%d,%d)", k ? ", " : "", bad[k][0] + 1, bad[k][1] + 1);
            printf("\n");
        }
    }
    return valid;
}

int main(int argc, char **argv) {
    int mode = 11, npaths = 0, exit_code = 0;
    const char **paths = malloc(sizeof(char *) * (argc > 0 ? argc : 1));
    for (int i = 1; i < argc; i++) {
        if (strncmp(argv[i], "--mode=", 7) == 0) {
            mode = atoi(argv[i] + 7);
            if (mode != 11 && mode != 27) {
                fprintf(stderr, "mode нь 11 эсвэл 27 байх ёстой, %s өгөгдсөн.\n", argv[i] + 7);
                return 2;
            }
        } else {
            paths[npaths++] = argv[i];
        }
    }
    if (npaths == 0) {
        puts("Хэрэглээ: validator [--mode=11|27] файл.txt [файл2.txt ...]");
        return 2;
    }
    for (int i = 0; i < npaths; i++) {
        ErrList errs = {0};
        int board[SIZE][SIZE] = {{0}};
        char *text = read_file(paths[i], &errs);
        int ok = text && parse_board(text, board, &errs);
        free(text);
        if (ok) {
            validate_and_print(paths[i], board, mode);
        } else {
            printf("%s: ОРОЛТЫН АЛДАА\n", paths[i]);
            for (size_t k = 0; k < errs.n; k++) printf("    - %s\n", errs.msgs[k]);
            exit_code = 1;
        }
        err_free(&errs);
    }
    free(paths);
    return exit_code;
}
