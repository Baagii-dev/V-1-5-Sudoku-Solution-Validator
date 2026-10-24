const MEMBERS = [
  { id: 'B241940010', name: 'О.Батцэцэг' },
  { id: 'B242270090', name: 'А.Пүрэвдэмбэрэл' },
];

export default function About() {
  return (
    <div className="prose">
      <h1>Бидний тухай</h1>
      <p className="lead">F.CSM302 Үйлдлийн систем хичээлийн Бие даалт 1, хуваарилалтын код V-1-5.</p>

      <h2>Багийн гишүүд</h2>
      <ul className="members">
        {MEMBERS.map((m) => (
          <li key={m.id}>
            <span className="avatar" aria-hidden="true">{m.name[0]}</span>
            <span>
              <b>{m.name}</b>
              <br />
              <span className="muted">{m.id}</span>
            </span>
          </li>
        ))}
      </ul>

      <h2>Төслийн тухай</h2>
      <p>
        Sudoku шийдийг олон урсгалаар шалгах программыг Python (үйлдлийн системийн урсгал) болон энэ онлайн хувилбар
        (React, Web Worker) гэсэн хоёр хэлбэрээр хэрэгжүүлсэн.
      </p>
      <p>
        <a href="https://github.com/Baagii-dev/V-1-5-Sudoku-Solution-Validator" target="_blank" rel="noreferrer">GitHub репозитори</a>
      </p>
    </div>
  );
}
