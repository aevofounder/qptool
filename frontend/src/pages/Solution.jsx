import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import { useSeo } from "../lib/seo.jsx";
import { activateOnKey } from "../lib/a11y.js";
import { SITE_URL } from "../config/site.js";
import { FALLBACK_ARTICLES } from "../lib/fallback.js";
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

// Конкретный состав решения — на основе шагов и ценностей выше.
const INCLUDED = [
  "Аудит парка оборудования и текущей номенклатуры инструмента",
  "Спецификация инструмента и оснастки с расчётом режимов резания",
  "Подбор режущего и вспомогательного инструмента под задачи цеха",
  "Поставка со склада и под заказ в согласованные сроки",
  "Сопровождение технологом при запуске и в работе",
  "Оптимизация номенклатуры и снижение затрат на инструмент",
  "Работа по договору через одного поставщика — «одно окно»",
  "Консультации по подбору режимов и решению проблем у станка",
];

// Группы инструмента, которые закрываем в рамках оснащения (ведут в каталог).
const SUPPLIED = [
  "Фрезы",
  "Свёрла",
  "Токарные пластины",
  "Метчики",
  "Резцы",
  "Оснастка и вспомогательный инструмент",
];

const INDUSTRIES = ["Машиностроение", "Металлообработка", "Инструментальное пр-во", "Ремонтные службы"];

function formatMeta(a) {
  const date = a.published_at
    ? new Date(a.published_at).toLocaleDateString("ru-RU")
    : "";
  const rubric = (a.category_label || "").toUpperCase();
  return [date, rubric].filter(Boolean).join(" · ");
}

export default function Solution() {
  const navigate = useNavigate();

  const { data: articles } = useFetch(() => api.articles(), [], FALLBACK_ARTICLES);
  const articleList = (articles || []).filter((a) => a.slug).slice(0, 3);

  useSeo({
    title: "Решения — оснащение станков под ключ",
    description:
      "Комплексное оснащение станков от QP Tool: подбор по ТЗ, поставка и сопровождение режущего инструмента. Снижение затрат до 20%.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Комплексное оснащение станков под ключ",
      serviceType: "Оснащение станков режущим инструментом",
      provider: { "@type": "Organization", name: "QP Tool", url: SITE_URL },
      areaServed: { "@type": "Country", name: "Россия" },
      description:
        "Подбор по ТЗ, поставка и сопровождение режущего и вспомогательного инструмента под конкретный парк оборудования вашего цеха.",
      url: `${SITE_URL}/solutions`,
    },
  });
  return (
    <div>
      <div className="crumb-wrap">
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

      {/* what's included */}
      <section className="section">
        <div className="section__head" style={{ marginBottom: 28 }}>
          <h2 className="h2" style={{ fontSize: 30 }}>Что входит в решение</h2>
          <span className="eyebrow-mono">ПОД КЛЮЧ</span>
        </div>
        <ul className="included-grid">
          {INCLUDED.map((item) => (
            <li className="included-item" key={item}>
              <span className="included-item__check" aria-hidden="true">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* supplied tools → catalog */}
      <section className="section--panel">
        <div className="section__inner">
          <div className="supplied">
            <div className="supplied__text">
              <h2 className="h2" style={{ fontSize: 30, marginBottom: 16 }}>
                Инструмент, который мы поставляем
              </h2>
              <p className="supplied__lead">
                В рамках оснащения закрываем весь режущий и вспомогательный инструмент —
                со склада и под заказ от проверенных производителей.
              </p>
              <div className="supplied__tags">
                {SUPPLIED.map((t) => (
                  <span className="supplied__tag" key={t}>{t}</span>
                ))}
              </div>
              <button className="btn btn-red" style={{ marginTop: 8 }} onClick={() => navigate("/catalog")}>
                Перейти в каталог
              </button>
            </div>
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

      {/* related materials */}
      {articleList.length > 0 && (
        <section className="section--panel">
          <div className="section__inner">
            <div className="section__head" style={{ marginBottom: 36 }}>
              <h2 className="h2" style={{ fontSize: 30 }}>Полезные материалы</h2>
              <button type="button" className="link-red link-red--btn" onClick={() => navigate("/articles")}>
                Все статьи →
              </button>
            </div>
            <div className="articles">
              {articleList.map((a, i) => (
                <div
                  className="article"
                  key={a.id || i}
                  role="link"
                  tabIndex={0}
                  aria-label={a.title}
                  onClick={() => navigate(`/articles/${a.slug}`)}
                  onKeyDown={activateOnKey(() => navigate(`/articles/${a.slug}`))}
                >
                  <div className="article__cover hatch">
                    {a.cover ? (
                      <img
                        src={a.cover}
                        alt={a.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      "ОБЛОЖКА"
                    )}
                  </div>
                  <div className="article__body">
                    <div className="article__meta">{formatMeta(a)}</div>
                    <h4 className="article__title">{a.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
