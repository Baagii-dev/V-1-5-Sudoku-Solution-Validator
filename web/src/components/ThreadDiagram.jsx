const LABEL = { wait: 'хүлээж буй', run: 'ажиллаж байна', ok: 'OK', err: 'АЛДАА' };

/** Эцэг урсгал руу холбогдсон ажилчин урсгалуудын диаграм (status: wait | run | ok | err). */
export default function ThreadDiagram({ threads, status, results }) {
  const running = status.some((s) => s === 'run');
  const finished = status.length > 0 && status.every((s) => s === 'ok' || s === 'err');
  const failed = status.some((s) => s === 'err');
  const parentState = running ? 'run' : finished ? (failed ? 'err' : 'ok') : 'wait';
  const parentText = { wait: 'Хүлээж байна', run: 'Ажил хуваарилж байна', ok: 'Бүх урсгал OK', err: 'Алдаа илэрсэн' }[parentState];

  return (
    <section className={`td ${parentState}`} aria-label="Урсгалын диаграм">
      <h2 className="td-title">УРСГАЛУУД</h2>
      <div className="td-parent">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2.2" /><circle cx="5" cy="19" r="2.2" /><circle cx="19" cy="19" r="2.2" />
            <path d="M12 7.2v4.3M12 11.5L5.6 16.9M12 11.5l6.4 5.4" />
          </g>
        </svg>
        <b>ЭЦЭГ УРСГАЛ</b>
        <span>{parentText} · {threads.length} ажил</span>
      </div>
      <div className="td-trunk" aria-hidden="true"><i /><i /><i /></div>
      <div className="td-grid">
        {threads.map((t, i) => {
          const [id, ...rest] = t.name.split(' ');
          const res = results?.[i];
          return (
            <div key={t.name} className={`td-card ${status[i]}`} aria-label={`${t.name}: ${LABEL[status[i]]}`}>
              <span className="td-drop" aria-hidden="true"><i /></span>
              <div className="td-head">
                <span className="td-id">{id}</span>
                <span className="td-led" aria-hidden="true" />
              </div>
              <div className="td-name">{rest.join(' ')}</div>
              <div className="td-bar" aria-hidden="true"><i /></div>
              <div className="td-state">{LABEL[status[i]]}</div>
              {res && status[i] !== 'wait' && (
                <div className="td-meta">{res.thread}{res.elapsed_ms !== undefined ? ` · ${res.elapsed_ms} мс` : ''}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
