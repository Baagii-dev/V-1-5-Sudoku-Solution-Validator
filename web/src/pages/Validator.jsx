import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Board from '../components/Board.jsx';
import ThreadDiagram from '../components/ThreadDiagram.jsx';
import { parseBoard, SIZE } from '../core/parseBoard.js';
import { buildTasks } from '../core/tasks.js';
import { validate } from '../core/validate.js';
import { DEFAULT_SAMPLE, SAMPLES } from '../samples.js';

const SPEEDS = [
  ['900', 'удаан'],
  ['450', 'дунд'],
  ['120', 'хурдан'],
  ['0', 'шууд'],
];
const key = ([r, c]) => r * SIZE + c;

function initialState() {
  const q = new URLSearchParams(location.search);
  const sample = SAMPLES.find((s) => s.name === q.get('sample')) || SAMPLES.find((s) => s.name === DEFAULT_SAMPLE) || SAMPLES[0];
  return {
    text: sample?.text ?? '',
    mode: ['11', '27'].includes(q.get('mode')) ? Number(q.get('mode')) : 11,
    speed: SPEEDS.some(([v]) => v === q.get('speed')) ? q.get('speed') : '450',
    autorun: q.get('autorun') === '1',
  };
}

export default function Validator() {
  const init = useMemo(initialState, []);
  const [text, setText] = useState(init.text);
  const [mode, setMode] = useState(init.mode);
  const [speed, setSpeed] = useState(init.speed);
  const [run, setRun] = useState(null); // {board, threads, valid}
  const [step, setStep] = useState(0); // хэдэн бүлэг шалгагдсан бэ
  const [errors, setErrors] = useState([]); // оролтын алдаа
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  const stop = () => {
    clearInterval(timer.current);
    timer.current = null;
  };

  const reset = useCallback(() => {
    stop();
    setRun(null);
    setStep(0);
    setErrors([]);
    setBusy(false);
  }, []);

  // Бүлэг бүр (урсгал, бүлгийн индекс) нэг алхам болно.
  const steps = useMemo(
    () => (run ? run.threads.flatMap((t, ti) => t.groups.map((g, gi) => ({ ti, gi, last: gi === t.groups.length - 1 }))) : []),
    [run],
  );
  const done = run && step >= steps.length;

  const start = useCallback(async () => {
    stop();
    setRun(null);
    setStep(0);
    const parsed = parseBoard(text);
    if (parsed.errors) {
      setErrors(parsed.errors);
      return;
    }
    setErrors([]);
    setBusy(true);
    let result;
    try {
      result = await validate(parsed.board, mode);
    } catch (e) {
      setErrors([{ row: null, col: null, message: `Шалгалт амжилтгүй: ${e.message}` }]);
      setBusy(false);
      return;
    }
    setBusy(false);
    setRun({ board: parsed.board, threads: result.threads, valid: result.valid });
    const total = result.threads.reduce((n, t) => n + t.groups.length, 0);
    const delay = Number(speed);
    if (delay === 0) {
      setStep(total);
    } else {
      setStep(1);
      timer.current = setInterval(() => {
        setStep((s) => {
          if (s + 1 >= total) stop();
          return s + 1;
        });
      }, delay);
    }
  }, [text, mode, speed]);

  useEffect(() => {
    if (init.autorun) start();
    return stop;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Дүрслэлийн төлөв нь step-ээс гарна.
  const placeholder = useMemo(() => buildTasks(mode), [mode]);
  const threads = run ? run.threads : placeholder;
  const status = useMemo(() => {
    if (!run) return placeholder.map(() => 'wait');
    return run.threads.map((t, ti) => {
      const idx = steps.map((s, i) => (s.ti === ti ? i : -1)).filter((i) => i >= 0);
      if (step > idx[idx.length - 1]) return t.ok ? 'ok' : 'err';
      return step > idx[0] ? 'run' : 'wait';
    });
  }, [run, steps, step, placeholder]);

  const bad = useMemo(() => {
    const set = new Set();
    steps.slice(0, step).forEach(({ ti, gi }) => run.threads[ti].groups[gi].bad.forEach((c) => set.add(key(c))));
    return set;
  }, [run, steps, step]);

  const cur = useMemo(() => {
    if (!run || done || step < 1) return null;
    const { ti, gi } = steps[step - 1];
    return { kind: run.threads[ti].kind, cells: new Set(run.threads[ti].groups[gi].cells.map(key)) };
  }, [run, steps, step, done]);

  const errCells = useMemo(() => new Set(errors.filter((e) => e.row && e.col).map((e) => key([e.row - 1, e.col - 1]))), [errors]);
  const preview = useMemo(() => (run ? run.board : parseBoard(text).board ?? null), [run, text]);

  const onFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setText(await f.text());
    e.target.value = '';
    reset();
  };

  let message = '';
  let messageClass = '';
  if (errors.length) [message, messageClass] = ['Оролтын алдаа', 'err'];
  else if (busy) [message, messageClass] = ['Шалгаж байна…', 'run'];
  else if (done) [message, messageClass] = run.valid ? ['Зөв шийд', 'ok'] : ['Буруу шийд', 'err'];

  return (
    <div>
      <h1>Шалгагчийг ажиллуулах</h1>
      <ol className="steps">
        <li><b>Өгөгдөл сонгох:</b> жагсаалтаас тест сонгох, хүснэгтээ текст талбарт бичих эсвэл <i>Файл ачаалах</i>-аар .txt оруулах.</li>
        <li><b>Горим сонгох:</b> 11 урсгал (мөр, багана, 9 дэд хүснэгт) эсвэл 27 урсгал (бүлэг бүрт тусдаа). Хурдыг тохируулна.</li>
        <li><b>Ажиллуулах</b> дарах: ажил бүрийг хөтөчийн Web Worker урсгал гүйцэтгэнэ.</li>
        <li><b>Ажиглах:</b> самбар дээр шалгаж буй бүлэг өнгөөр тодорч, давхардсан нүд улаан болно. Доор урсгал бүрийн төлөв <i>хүлээж буй → ажиллаж байна → OK/АЛДАА</i> өөрчлөгдөнө. Дээд талд эцсийн дүгнэлт гарна.</li>
      </ol>
      <div className="bar">
        <select
          aria-label="Тестийн өгөгдөл"
          value={SAMPLES.find((s) => s.text === text)?.name ?? ''}
          onChange={(e) => {
            setText(SAMPLES.find((s) => s.name === e.target.value).text);
            reset();
          }}
        >
          <option value="" disabled>Өөрийн өгөгдөл</option>
          {SAMPLES.map((s) => (
            <option key={s.name} value={s.name}>{s.label}</option>
          ))}
        </select>
        <select aria-label="Урсгалын горим" value={mode} onChange={(e) => { setMode(Number(e.target.value)); reset(); }}>
          <option value={11}>11 урсгал (мөр, багана, 9 дэд хүснэгт)</option>
          <option value={27}>27 урсгал (мөр, багана, дэд хүснэгт бүр)</option>
        </select>
        <label>
          Хурд{' '}
          <select value={speed} onChange={(e) => setSpeed(e.target.value)}>
            {SPEEDS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
        <label className="filebtn" title="9 мөртэй .txt файл">
          Файл ачаалах
          <input type="file" accept=".txt,text/plain" hidden onChange={onFile} />
        </label>
        <button onClick={start} disabled={busy}>▶ Ажиллуулах</button>
        <button onClick={reset}>⟲ Reset</button>
        <span className={`msg ${messageClass}`}>{message}</span>
      </div>
      <div className="wrap">
        <div>
          <textarea
            spellCheck="false"
            aria-label="Sudoku хүснэгт"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              reset();
            }}
          />
          <div className="note">
            9 мөр, мөр бүрд 9 тоо (1–9).
            <br />
            Өөрөө засаж болно.
          </div>
        </div>
        <div>
          <Board board={preview} bad={bad} errCells={errCells} cur={cur} />
          {errors.length > 0 && (
            <ul className="errs">
              {errors.map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <ThreadDiagram threads={threads} status={status} results={run?.threads} />
    </div>
  );
}
