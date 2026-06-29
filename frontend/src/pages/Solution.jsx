import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";

const VALUES = [
  { num: "−20%", red: true, title: "Снижение затрат на инструмент", text: "Оптимизируем номенклатуру и режимы — за счёт правильного подбора уходит переплата за нецелевой инструмент." },
  { num: "1 окно", red: false, title: "Один поставщик на всё", text: "Закрываем весь инструмент и оснастку через один договор — меньше согласований и логистики." },
  { num: "24/7", red: false, title: "Поддержка технолога", text: "Сопровождаем запуск, помогаем подобрать режимы и решить проблемы прямо у станка." },
];

const STEPS = [
  { num: "01", red: true, title: "Аудит парка", text: "Изучаем оборудование, задачи и текущую номенклатуру инструмента." },
  { num: "02", red: false, title: "Подбор по ТЗ", text: "Готовим спецификацию инструмента и оснастки с расчётом режимов." },
  { num: "03", red: false, title: "Поставка", text: "Поставляем комплект со склада и под заказ, в согласованные сроки." },
  { num: "04", red: false, title: "Сопровождение", text: "Поддерживаем при запуске и оптимизируем процесс в работе." },
];

const INDUSTRIES = ["Машиностроение", "Металлообработка", "Инструментальное пр-во", "Ремонтные службы"];

export default function Solution() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ padding: "36px 56px 0", maxWidth: 1440, margin: "0 auto" }}>
        <Breadcrumb items={[{ label: "ГЛАВНАЯ", to: "/" }, { label: "РЕШЕНИЯ" }]} />
      </div>

      {/* hero */}
      <section className="hero-page">
        <div className="hero-page__inner">
          <div className="hero-page__eyebrow">КОМПЛЕКСНОЕ ОСНАЩЕНИЕ</div>
          <h1 className="hero-page__title">
            Оснащение станков под ключ для вашего производства
          </h1>
          <p className="hero-page__lead">
            Берём на себя подбор, поставку и сопровождение всего режущего и
            вспомогательного инструмента под конкретный парк оборудования вашего цеха.
          </p>
          <button className="btn btn-red" style={{ fontSize: 15, padding: "16px 30px" }} onClick={() => navigate("/contacts")}>
            Обсудить проект
          </button>
        </div>
      </section>

      {/* value */}
      <section className="section">
        <div className="value-grid">
          {VALUES.map((v, i) => (
            <div className="value" key={i}>
              <div className={`value__num${v.red ? " red" : ""}`}>{v.num}</div>
              <h3 className="value__title">{v.title}</h3>
              <p className="value__text">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* process */}
      <section className="section--panel">
        <div className="section__inner">
          <div className="section__head">
            <h2 className="h2">Как мы работаем</h2>
            <span className="eyebrow-mono">4 ШАГА</span>
          </div>
          <div className="steps">
            {STEPS.map((st, i) => (
              <div className="step" key={i}>
                <div className={`step__num${st.red ? " red" : ""}`}>{st.num}</div>
                <h4 className="step__title">{st.title}</h4>
                <p className="step__text">{st.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* industries */}
      <section className="section">
        <h2 className="h2" style={{ fontSize: 30, marginBottom: 28 }}>
          Отрасли
        </h2>
        <div className="tiles">
          {INDUSTRIES.map((t) => (
            <div className="tile" key={t}>
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="related">
        <div className="cta-dark">
          <h2 className="cta-dark__title">Готовы рассчитать оснащение вашего цеха?</h2>
          <button className="btn btn-white" onClick={() => navigate("/contacts")}>
            Оставить заявку
          </button>
        </div>
      </section>
    </div>
  );
}
