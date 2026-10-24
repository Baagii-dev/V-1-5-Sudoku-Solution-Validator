const LABEL = { wait: 'хүлээж буй', run: 'ажиллаж байна', ok: 'OK', err: 'АЛДАА' };

/** Урсгал бүрийн нэр ба төлөв. */
export default function ThreadList({ threads, status }) {
  return (
    <div className="threads" aria-label="Урсгалын төлөв">
      {threads.map((t, i) => (
        <div className="tr" key={t.name}>
          <span>{t.name}</span>
          <span className={status[i]}>{LABEL[status[i]]}</span>
        </div>
      ))}
    </div>
  );
}
