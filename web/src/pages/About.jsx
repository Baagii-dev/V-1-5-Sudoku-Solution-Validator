export default function About() {
  return (
    <div className="wide">
      <section className="hero">
        <div>
          <p className="eyebrow">Бидний тухай</p>
          <h1>Баг ба төсөл</h1>
          <p className="lead">F.CSM302 Үйлдлийн систем хичээлийн Бие даалт 1, хуваарилалтын код V-1-5. Sudoku шийдийг олон урсгалаар шалгах программыг хоёр хэлбэрээр хэрэгжүүлсэн.</p>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="hc-top">V-1-5</div>
          <div className="hc-row"><i>Python threading</i><i>Web Worker</i><i>11 урсгал</i><i>27 урсгал</i></div>
          <div className="hc-note">Operating System Concepts, Бүлэг 4</div>
        </div>
      </section>

      <section className="sec">
        <h2>Багийн гишүүд</h2>
        <div className="team">
    <div className="member"><span className="avatar" aria-hidden="true">О</span><span><b>О.Батцэцэг</b><br /><span className="muted">B241940010</span></span></div>
    <div className="member"><span className="avatar" aria-hidden="true">А</span><span><b>А.Пүрэвдэмбэрэл</b><br /><span className="muted">B242270090</span></span></div>
    <div className="member"><span className="avatar" aria-hidden="true">Г</span><span><b>Г.Ундрам</b><br /><span className="muted">B241910002</span></span></div>
    <div className="member"><span className="avatar" aria-hidden="true">А</span><span><b>А.Дөлгөөн</b><br /><span className="muted">B222270837</span></span></div>
    <div className="member"><span className="avatar" aria-hidden="true">Т</span><span><b>Т.Цэрэндулам</b><br /><span className="muted">B241910025</span></span></div>
    <div className="member"><span className="avatar" aria-hidden="true">Э</span><span><b>Э.Өлзийсүрэн</b><br /><span className="muted">B190910811</span></span></div>
      </div>
    </section>

      <section className="sec">
        <h2>Төслийн тоон үзүүлэлт</h2>
        <div className="cards">
          <div className="card"><div className="big">2</div><div className="v">хувилбар</div><p>Python (OS урсгал) ба онлайн (Web Worker).</p></div>
          <div className="card"><div className="big">11 / 27</div><div className="v">урсгалын горим</div><p>Хоёр горим ижил дүгнэлт өгдөг.</p></div>
          <div className="card"><div className="big">17</div><div className="v">автомат тест</div><p>Python 11, JavaScript 6. Windows, macOS, Linux дээр CI-аар шалгагддаг.</p></div>
          <div className="card"><div className="big">8</div><div className="v">тестийн өгөгдөл</div><p>Зөв, мөр/багана/дэд хүснэгтийн алдаа, буруу оролт.</p></div>
        </div>
      </section>

      <section className="sec">
        <h2>Ашигласан технологи</h2>
        <div className="tags">
          <span className="tag">Python 3 · threading</span><span className="tag">http.server</span><span className="tag">unittest</span>
          <span className="tag">React</span><span className="tag">Vite</span><span className="tag">Web Worker</span>
          <span className="tag">GitHub Actions</span><span className="tag">GitHub Pages</span>
        </div>
      </section>

      <section className="sec">
        <h2>Холбоосууд</h2>
        <div className="linkgrid">
          <a href="https://github.com/Baagii-dev/V-1-5-Sudoku-Solution-Validator" target="_blank" rel="noreferrer"><b>GitHub репозитори</b><span>Эх код, Python хувилбар, тест</span></a>
          <a href="https://baagii-dev.github.io/V-1-5-Sudoku-Solution-Validator/" target="_blank" rel="noreferrer"><b>Онлайн хувилбар</b><span>Суулгахгүйгээр шууд ажиллуулах</span></a>
          <a href="https://github.com/Baagii-dev/V-1-5-Sudoku-Solution-Validator/blob/main/docs/Manual.md" target="_blank" rel="noreferrer"><b>Manual</b><span>Хэрэглэгчийн ба operational заавар</span></a>
          <a href="https://github.com/Baagii-dev/V-1-5-Sudoku-Solution-Validator/blob/main/docs/Report.md" target="_blank" rel="noreferrer"><b>Тайлан</b><span>Зохиомж, туршилт, дүгнэлт</span></a>
        </div>
      </section>
    </div>
  );
}
