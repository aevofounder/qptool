import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import { useSeo } from "../lib/seo.jsx";
import { activateOnKey } from "../lib/a11y.js";
import { FALLBACK_ARTICLES } from "../lib/fallback.js";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { Skeleton, EmptyState } from "../components/States.jsx";

function formatMeta(a) {
  const date = a.published_at
    ? new Date(a.published_at).toLocaleDateString("ru-RU")
    : "";
  const rubric = (a.category_label || "").toUpperCase();
  return [date, rubric].filter(Boolean).join(" · ");
}

export default function Articles() {
  const navigate = useNavigate();

  useSeo({
    title: "Полезные материалы",
    description:
      "Статьи и материалы QP Tool о выборе металлорежущего инструмента, оснащении станков и снижении затрат на производстве.",
  });

  const { data, loading, error } = useFetch(() => api.articles(), [], FALLBACK_ARTICLES);
  const articles = (data || []).filter((a) => a.slug);

  const go = (slug) => navigate(`/articles/${slug}`);

  return (
    <div>
      <div className="crumb-wrap">
        <Breadcrumb items={[{ label: "ГЛАВНАЯ", to: "/" }, { label: "МАТЕРИАЛЫ" }]} />
      </div>

      <section className="hero-page">
        <div className="hero-page__inner">
          <div className="hero-page__eyebrow">ЗНАНИЯ И ОПЫТ</div>
          <h1 className="hero-page__title">Полезные материалы</h1>
          <p className="hero-page__lead">
            Разбираем подбор инструмента под задачи производства, оснащение станков
            и способы снизить затраты на металлообработку.
          </p>
        </div>
      </section>

      <section className="section">
        {loading ? (
          <div className="articles">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div className="article" key={i} aria-hidden="true">
                <Skeleton style={{ aspectRatio: "16 / 9", borderRadius: 0 }} />
                <div className="article__body">
                  <Skeleton style={{ width: "40%", height: 11, marginBottom: 12 }} />
                  <Skeleton style={{ width: "90%", height: 18 }} />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState
            title="Материалов пока нет"
            text={
              error
                ? "Не удалось загрузить список. Проверьте соединение и попробуйте позже."
                : "Мы готовим полезные статьи — загляните чуть позже."
            }
            action={
              <button type="button" className="btn btn-outline-red" onClick={() => navigate("/")}>
                На главную
              </button>
            }
          />
        ) : (
          <div className="articles">
            {articles.map((a, i) => (
              <div
                className="article"
                key={a.id || i}
                role="link"
                tabIndex={0}
                aria-label={a.title}
                onClick={() => go(a.slug)}
                onKeyDown={activateOnKey(() => go(a.slug))}
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
                  {a.excerpt && <p className="article__excerpt">{a.excerpt}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
