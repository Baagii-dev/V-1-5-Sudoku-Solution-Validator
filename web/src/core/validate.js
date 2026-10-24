// Эцэг урсгал: ажил бүрт тусдаа Web Worker үүсгээд бүгдийг нь хүлээнэ (validator.py-ийн validate).
import { buildTasks } from './tasks.js';

export async function validate(board, mode = 11) {
  const tasks = buildTasks(mode);
  const threads = await Promise.all(
    tasks.map(
      (task, i) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
          worker.onmessage = ({ data }) => {
            worker.terminate();
            resolve(data);
          };
          worker.onerror = (e) => {
            worker.terminate();
            reject(new Error(e.message || 'Worker алдаа'));
          };
          worker.postMessage({ board, task, thread: `worker-${i + 1}` });
        }),
    ),
  );
  return { valid: threads.every((t) => t.ok), mode, threads };
}
