export default function Home() {
  return (
    <div className="wide">
      <section className="hero">
        <div>
          <p className="eyebrow">F.CSM302 · Бие даалт 1 · V-1-5</p>
          <h1>Sudoku Solution Validator</h1>
          <p className="lead">9x9 Sudoku хүснэгтийн шийд зөв эсэхийг олон урсгалаар шалгадаг хичээлийн бие даалтын төсөл. Мөр, багана, 3x3 дэд хүснэгт бүрийг тусдаа урсгал шалгаж, эцэг урсгал үр дүнг нэгтгэнэ.</p>
          <div className="hero-actions">
            <a className="cta" href="#/validator">Шалгагчийг ажиллуулах →</a>
            <a className="ghost" href="https://github.com/Baagii-dev/V-1-5-Sudoku-Solution-Validator" target="_blank" rel="noreferrer">GitHub эх код</a>
          </div>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="hc-top">ЭЦЭГ УРСГАЛ</div>
          <div className="hc-row"><i>T1 Мөр</i><i>T2 Багана</i><i>T3 Дэд 1</i><i className="bad">T4 Дэд 2</i><i>T5 Дэд 3</i><i>T6 Дэд 4</i><i>T7 Дэд 5</i></div>
          <div className="hc-note">11 эсвэл 27 урсгал зэрэг ажиллана</div>
        </div>
      </section>

      <section className="sec">
        <h2>Даалгавар</h2>
        <div className="cards">
          <div className="card"><div className="k">Хичээл</div><div className="v">F.CSM302 Үйлдлийн систем, Бие даалт 1</div></div>
          <div className="card"><div className="k">Хуваарилалтын код</div><div className="v">V-1-5</div></div>
          <div className="card"><div className="k">Сурах бичиг</div><div className="v">Operating System Concepts (2018), Бүлэг 4 – Threads &amp; Concurrency, Programming Project</div></div>
          <div className="card"><div className="k">UI дүрслэл</div><div className="v">Sudoku board</div></div>
        </div>
      </section>

      <section className="sec">
        <h2>Шаардлага</h2>
        <div className="cards">
          <div className="card"><div className="big">11</div><div className="v">урсгалтай горим</div><p>Мөр бүрийг шалгах 1, багана бүрийг шалгах 1, 3x3 дэд хүснэгт бүрийг шалгах 9 урсгал.</p></div>
          <div className="card"><div className="big">27</div><div className="v">урсгалтай горим</div><p>Мөр, багана, дэд хүснэгт тус бүрт тусдаа урсгал (сонголтоор). Хоёр горимыг хоёуланг нь дэмжинэ.</p></div>
          <div className="card"><div className="big">join</div><div className="v">Эцэг урсгал нэгтгэнэ</div><p>Эцэг урсгал хүснэгтийг дамжуулж, бүх урсгалыг хүлээн үр дүнг нэгтгэнэ.</p></div>
        </div>
      </section>

      <section className="sec">
        <h2>Хэрхэн ажилладаг вэ</h2>
        <ol className="flow">
          <li>Оролтын текстийг 9x9 хүснэгт болгон уншиж, алдааг мөр, баганаар нь тэмдэглэнэ.</li>
          <li>Бүлэг бүрийн 9 нүдэнд давхардал эсвэл 1–9-өөс гадуур утга байгааг шалгана.</li>
          <li>Урсгал бүр хүснэгтийг зөвхөн уншиж, үр дүнгээ өөрийн нүдэнд бичдэг тул lock хэрэггүй.</li>
          <li>Эцэг урсгал бүгдийг хүлээж, нэгтгэсэн дүгнэлт (Зөв / Буруу шийд) гаргана.</li>
        </ol>
      </section>

      <section className="sec">
        <h2>Гурван хувилбар</h2>
        <div className="compare">
          <div className="card"><h3>Python хувилбар</h3><p>Python-ы <code>threading</code> буюу үйлдлийн системийн жинхэнэ урсгал ашиглана. Сервер (<code>python3 src/app.py</code>) дээр шалгалт хийгдэнэ. Даалгаварт тавигдсан үндсэн хэрэгжүүлэлт.</p></div>
          <div className="card"><h3>C хувилбар</h3><p>Сурах бичгийн Programming Project-ийн адил POSIX Pthreads (<code>pthread_create</code>/<code>pthread_join</code>) ашиглана. Linux, macOS дээр <code>cd src/c &amp;&amp; make</code> гэж build хийж командын мөрөөс ажиллуулна.</p></div>
          <div className="card"><h3>Онлайн хувилбар</h3><p>React болон хөтчийн Web Worker урсгал ашиглана. Суулгах, татах шаардлагагүй, линкээр шууд нээгдэнэ (GitHub Pages).</p></div>
        </div>
      </section>

    </div>
  );
}
