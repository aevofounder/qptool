import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import { useSeo } from "../lib/seo.jsx";
import { activateOnKey } from "../lib/a11y.js";
import { ORGANIZATION_JSONLD, SEO } from "../config/site.js";
import {
  FALLBACK_ADVANTAGES,
  FALLBACK_ARTICLES,
  FALLBACK_HERO,
  HERO_TABS,
} from "../lib/fallback.js";

const SERVICES = [
  {
    num: "01",
    title: "Металлорежущий инструмент",
    text: "Фрезы, свёрла, токарные пластины, метчики и резцы от проверенных мировых производителей.",
    link: "В каталог →",
    to: "/catalog",
  },
  {
    num: "02",
    title: "Комплексное оснащение станков",
    text: "Полный комплект оснастки под конкретный парк оборудования вашего цеха со скидкой.",
    link: "Подробнее →",
    to: "/solutions",
  },
  {
    num: "03",
    title: "Инжиниринговые решения",
    text: "Разрабатываем технологию, подбираем инструмент по ТЗ и участвуем в запуске проекта.",
    link: "Подробнее →",
    to: "/solutions",
  },
];

function formatArticleMeta(a) {
  if (a.meta) return a.meta;
  const date = a.published_at
    ? new Date(a.published_at).toLocaleDateString("ru-RU")
    : "";
  const rubric = (a.category_label || "").toUpperCase();
  return [date, rubric].filter(Boolean).join(" · ");
}

export default function Home() {
  const navigate = useNavigate();

  useSeo({
    title: null, // home uses the full brand title
    description: SEO.defaultDescription,
    jsonLd: ORGANIZATION_JSONLD,
  });
  const { data: heroSlides } = useFetch(api.heroSlides, [], FALLBACK_HERO);
  const { data: advantages } = useFetch(api.advantages, [], FALLBACK_ADVANTAGES);
  const { data: articles } = useFetch(api.articles, [], FALLBACK_ARTICLES);
  const { data: logos } = useFetch(api.clientLogos, [], [1, 2, 3, 4, 5, 6]);

  const slides = heroSlides?.length ? heroSlides : FALLBACK_HERO;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = idx % slides.length;
  const s = slides[active];

  // Respect the user's reduced-motion preference — no auto-rotation then.
  const reducedMotion = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // auto-rotate every 5s, paused on hover/focus or when motion is reduced
  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  const tabLabel = (slide, i) =>
    slides.length === HERO_TABS.length ? HERO_TABS[i] : slide.tag;

  const articleList = articles?.length ? articles : FALLBACK_ARTICLES;
  const logoList = logos?.length ? logos : [1, 2, 3, 4, 5, 6];

  return (
    <div>
      {/* ---- hero ---- */}
      <section
        className="hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="hero__inner">
          <div>
            <div className="hero__eyebrow">
              <span>{s.number}</span>
              <span className="rule" />
              <span className="tag">{s.tag}</span>
            </div>
            <h1 className="hero__title">{s.title}</h1>
            <p className="hero__lead">{s.description}</p>
            <div className="hero__actions">
              <button className="btn btn-red" onClick={() => navigate("/contacts")}>
                Заказать консультацию
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/catalog")}>
                Каталог продукции
              </button>
            </div>
            <div className="hero__tabs">
              {slides.map((slide, i) => (
                <button
                  key={i}
                  className={`hero__tab${i === active ? " is-active" : ""}`}
                  onClick={() => setIdx(i)}
                >
                  {tabLabel(slide, i)}
                </button>
              ))}
              <div
                className="hero__ind"
                style={{ transform: `translateX(${active * 100}%)` }}
              />
            </div>
          </div>
          <div className="hero__media ph-box hatch" onClick={() => navigate("/catalog")}>
            {s.image ? (
              <img
                src={s.image}
                alt={s.tag}
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              />
            ) : (
              <>
                <div className="ph-label">ФОТО · {s.tag}</div>
                <div className="corner corner--tr" />
                <div className="corner corner--bl" />
                <div className="ph-center">
                  <div>
                    <div className="ph-plus">+</div>
                    <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--muted-2)" }}>
                      1440 × 1800 · JPG
                    </div>
                  </div>
                </div>
                <div className="hero__media-count">{s.number}/0{slides.length}</div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ---- services ---- */}
      <section className="section section--bordered">
        <div className="section__head">
          <h2 className="h2">Чем мы занимаемся</h2>
          <span className="eyebrow-mono">01 — НАПРАВЛЕНИЯ</span>
        </div>
        <div className="services">
          {SERVICES.map((sv) => (
            <div
              className="service"
              key={sv.num}
              role="link"
              tabIndex={0}
              aria-label={sv.title}
              onClick={() => navigate(sv.to)}
              onKeyDown={activateOnKey(() => navigate(sv.to))}
            >
              <div className="service__num">{sv.num}</div>
              <h3 className="service__title">{sv.title}</h3>
              <p className="service__text">{sv.text}</p>
              <span className="service__link">{sv.link}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- advantages ---- */}
      <section className="section--panel">
        <div className="section__inner">
          <h2 className="h2" style={{ marginBottom: 44 }}>
            Почему&nbsp;QP&nbsp;Tool
          </h2>
          <div className="adv-grid">
            {(advantages?.length ? advantages : FALLBACK_ADVANTAGES).map((a, i) => (
              <div className={`adv${a.accent ? " adv--accent" : ""}`} key={i}>
                <div className="adv__num">{a.number}</div>
                <h4 className="adv__title">{a.title}</h4>
                <p className="adv__text">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="section section--bordered">
        <div className="cta">
          <div className="cta__bar" />
          <div>
            <h2 className="cta__title">Сократите расходы на инструмент уже сегодня</h2>
            <p className="cta__text">
              Разработаем технологию, подберём режущий и вспомогательный инструмент по
              ТЗ и поможем с запуском проекта.
            </p>
          </div>
          <div className="cta__action">
            <button className="btn btn-red" onClick={() => navigate("/contacts")}>
              Заказать консультацию
            </button>
          </div>
        </div>
      </section>

      {/* ---- trust ---- */}
      <section className="trust">
        <div className="trust__h">НАМ ДОВЕРЯЮТ</div>
        <div className="trust__grid">
          {logoList.map((l, i) => (
            <div
              className={`trust__logo${l.logo ? " has-logo" : ""}`}
              key={l.id || i}
            >
              {l.logo ? (
                <img
                  className="trust__logo-img"
                  src={l.logo}
                  alt={l.name ? `Логотип: ${l.name}` : "Логотип клиента"}
                  loading="lazy"
                />
              ) : (
                "ЛОГО"
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---- materials ---- */}
      <section className="section--panel">
        <div className="section__inner">
          <div className="section__head" style={{ marginBottom: 36 }}>
            <h2 className="h2" style={{ fontSize: 30 }}>
              Полезные материалы
            </h2>
            <button type="button" className="link-red link-red--btn" onClick={() => navigate("/articles")}>
              Все статьи →
            </button>
          </div>
          <div className="articles">
            {articleList.map((a, i) => {
              const to = a.slug ? `/articles/${a.slug}` : "/articles";
              return (
              <div
                className="article"
                key={a.id || i}
                role="link"
                tabIndex={0}
                aria-label={a.title}
                onClick={() => navigate(to)}
                onKeyDown={activateOnKey(() => navigate(to))}
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
                  <div className="article__meta">{formatArticleMeta(a)}</div>
                  <h4 className="article__title">{a.title}</h4>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
