import { useNavigate, useParams } from "react-router-dom";
import { marked } from "marked";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import { useSeo } from "../lib/seo.jsx";
import { activateOnKey } from "../lib/a11y.js";
import { SITE_URL } from "../config/site.js";
import { FALLBACK_ARTICLES } from "../lib/fallback.js";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { PageLoader, EmptyState } from "../components/States.jsx";

function formatMeta(a) {
  const date = a.published_at
    ? new Date(a.published_at).toLocaleDateString("ru-RU")
    : "";
  const rubric = (a.category_label || "").toUpperCase();
  return [date, rubric].filter(Boolean).join(" · ");
}

marked.setOptions({ gfm: true, breaks: false });

// Рендер тела статьи из Markdown. Текст пишет сотрудник через админку
// (доверенный источник), поэтому HTML из marked отдаём как есть.
// Ведущий заголовок H1 убираем — он дублировал бы заголовок статьи (отд. поле).
// Таблицы оборачиваем в скролл-контейнер, чтобы не ломали вёрстку на телефоне.
function renderBody(body) {
  let src = String(body || "");
  if (src.charCodeAt(0) === 0xfeff) src = src.slice(1); // отбрасываем BOM, если есть
  src = src.trim();
  if (!src) return "";
  const withoutTitle = src.replace(/^#\s+.*(?:\r?\n)+/, "");
  const html = marked.parse(withoutTitle);
  return html
    .replace(/<table>/g, '<div class="md-table"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

export default function Article() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Static fallback for this slug so the page still renders if the API is down,
  // consistent with the rest of the site's fallback behaviour.
  const fallback = FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;

  const { data: article, loading, error } = useFetch(
    () => api.article(slug),
    [slug],
    fallback
  );

  const { data: allArticles } = useFetch(() => api.articles(), [], FALLBACK_ARTICLES);

  useSeo({
    title: article ? article.title : "Материал",
    description: article
      ? (article.excerpt || article.title).slice(0, 300)
      : "Полезные материалы QP Tool о металлорежущем инструменте и оснащении станков.",
    type: "article",
    noindex: !article,
    jsonLd: article
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          ...(article.excerpt ? { description: article.excerpt } : {}),
          ...(article.cover ? { image: article.cover } : {}),
          ...(article.published_at ? { datePublished: article.published_at } : {}),
          ...(article.updated_at ? { dateModified: article.updated_at } : {}),
          ...(article.category_label
            ? { articleSection: article.category_label }
            : {}),
          mainEntityOfPage: `${SITE_URL}/articles/${slug}`,
          author: { "@type": "Organization", name: "QP Tool" },
          publisher: { "@type": "Organization", name: "QP Tool" },
        }
      : null,
  });

  if (loading) return <PageLoader label="Загрузка материала…" />;
  if (error && !article)
    return (
      <EmptyState
        title="Материал не найден"
        text="Возможно, статья снята с публикации или ссылка устарела. Вернитесь к списку полезных материалов."
        action={
          <button type="button" className="btn btn-red" onClick={() => navigate("/articles")}>
            Все материалы
          </button>
        }
      />
    );

  const bodyHtml = renderBody(article.body);
  const related = (allArticles || [])
    .filter((a) => a.slug && a.slug !== slug)
    .slice(0, 3);

  return (
    <div>
      <div className="crumb-wrap">
        <Breadcrumb
          items={[
            { label: "ГЛАВНАЯ", to: "/" },
            { label: "МАТЕРИАЛЫ", to: "/articles" },
            { label: (article.category_label || "СТАТЬЯ").toUpperCase() },
          ]}
        />
      </div>

      <article className="article-page">
        <header className="article-page__head">
          <div className="article-page__meta">{formatMeta(article)}</div>
          <h1 className="article-page__title">{article.title}</h1>
          {article.excerpt && <p className="article-page__lead">{article.excerpt}</p>}
        </header>

        <div className="article-page__cover ph-box hatch">
          {article.cover ? (
            <img
              src={article.cover}
              alt={article.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
            />
          ) : (
            <div className="ph-label">ОБЛОЖКА</div>
          )}
        </div>

        {bodyHtml ? (
          <div
            className="article-page__body md"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : (
          <div className="article-page__body">
            <p className="article-page__empty">
              Полный текст материала скоро появится. По вопросам подбора инструмента
              свяжитесь с нашими специалистами.
            </p>
          </div>
        )}

        <div className="article-page__cta">
          <button className="btn btn-red" onClick={() => navigate("/contacts")}>
            Получить консультацию
          </button>
          <button className="btn btn-outline" onClick={() => navigate("/catalog")}>
            Каталог продукции
          </button>
        </div>
      </article>

      {related.length > 0 && (
        <div className="related">
          <div className="related__inner">
            <h2 className="h2" style={{ fontSize: 26, marginBottom: 28 }}>
              Ещё материалы
            </h2>
            <div className="articles">
              {related.map((a, i) => (
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
        </div>
      )}
    </div>
  );
}
