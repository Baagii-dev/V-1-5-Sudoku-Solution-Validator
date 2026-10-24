// Нэг урсгал (Web Worker) = нэг ажил. Эцэг урсгалаас board, task хүлээн авч үр дүнг буцаана.
import { runTask } from './tasks.js';

self.onmessage = ({ data: { board, task, thread } }) => {
  const start = performance.now();
  const result = runTask(board, task, thread);
  result.elapsed_ms = Math.round((performance.now() - start) * 1000) / 1000;
  self.postMessage(result);
};
