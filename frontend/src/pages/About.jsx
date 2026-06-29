import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";

const NUMBERS = [
  { value: "2009", red: false, label: "ГОД ОСНОВАНИЯ" },
  { value: "15 лет", red: true, label: "НА РЫНКЕ" },
  { value: "2500+", red: false, label: "ПОЗИЦИЙ В КАТАЛОГЕ" },
  { value: "300+", red: false, label: "ПРЕДПРИЯТИЙ-КЛИЕНТОВ" },
];

const PRINCIPLES = [
  { accent: true, title: "Оригинальная продукция", text: "Только проверенные производители и контроль качества." },
  { accent: false, title: "Опыт поставок", text: "15 лет на рынке металлообработки." },
  { accent: false, title: "Индивидуальный подход", text: "Работаем вдолгую с каждым заказчиком." },
  { accent: false, title: "Прозрачность", text: "Договор и чёткие сроки поставки." },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ padding: "36px 56px 0", maxWidth: 1440, margin: "0 auto" }}>
        <Breadcrumb items={[{ label: "ГЛАВНАЯ", to: "/" }, { label: "О КОМПАНИИ" }]} />
      </div>

      {/* intro */}
      <section className="about-intro">
        <div className="about-intro__grid">
          <div>
            <div className="about-intro__eyebrow">О КОМПАНИИ · С 2009</div>
            <h1 className="about-intro__title">
              15 лет поставляем инструмент для металлообработки
            </h1>
            <p className="about-intro__p">
              ООО «КуПиТул» (QP&nbsp;Tool) — поставщик металлорежущего инструмента и
              оснащения станков из Екатеринбурга. С 2009 года помогаем предприятиям
              снижать издержки и работать стабильно.
            </p>
            <p className="about-intro__p">
              Мы знаем рынок и логистику изнутри, работаем напрямую с проверенными
              производителями и ценим каждого заказчика независимо от объёма заказа.
            </p>
          </div>
          <div className="ph-box hatch" style={{ aspectRatio: "3 / 4" }}>
            <div className="ph-label">ФОТО · ПРОИЗВОДСТВО</div>
            <div className="ph-center">
              <div className="gallery__plus" style={{ width: 50, height: 50 }}>
                +
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* numbers */}
      <div className="numbers">
        {NUMBERS.map((n, i) => (
          <div className="number" key={i}>
            <div className={`number__value${n.red ? " red" : ""}`}>{n.value}</div>
            <div className="number__label">{n.label}</div>
          </div>
        ))}
      </div>

      {/* principles */}
      <section className="section">
        <h2 className="h2" style={{ marginBottom: 44 }}>
          Наши принципы
        </h2>
        <div className="adv-grid">
          {PRINCIPLES.map((p, i) => (
            <div className={`adv${p.accent ? " adv--accent" : ""}`} key={i} style={{ borderTopWidth: 2 }}>
              <h4 className="adv__title">{p.title}</h4>
              <p className="adv__text">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="related">
        <div className="cta--bar">
          <div className="cta__bar" />
          <h2 className="cta__title" style={{ fontSize: 30, margin: 0, maxWidth: 600 }}>
            Хотите стать нашим клиентом?
          </h2>
          <button className="btn btn-red" style={{ fontSize: 16, padding: "17px 34px" }} onClick={() => navigate("/contacts")}>
            Связаться с нами
          </button>
        </div>
      </section>
    </div>
  );
}
