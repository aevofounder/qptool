import { useState } from "react";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import { useSeo } from "../lib/seo.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Modal from "../components/Modal.jsx";
import { PageLoader, EmptyState } from "../components/States.jsx";

export default function Catalogs() {
  const { data: catalogs, loading } = useFetch(api.catalogs, [], []);
  const [viewing, setViewing] = useState(null); // catalog being previewed

  useSeo({
    title: "Каталоги и прайсы",
    description:
      "PDF-каталоги и прайс-листы QP Tool: просмотр в браузере и скачивание каталогов металлорежущего инструмента и оснастки.",
  });

  const list = catalogs || [];

  // Для встроенного просмотра PDF iframe должен грузиться с того же origin, что
  // и сайт — иначе X-Frame-Options: SAMEORIGIN заблокирует кадр. Приводим
  // абсолютный URL бэкенда (http://host:port/media/…) к относительному пути,
  // который в dev идёт через Vite-прокси, а в prod — с того же домена.
  const sameOriginSrc = (url) => (url || "").replace(/^https?:\/\/[^/]+/i, "");

  return (
    <div>
      <div className="catalog-head">
        <Breadcrumb items={[{ label: "ГЛАВНАЯ", to: "/" }, { label: "КАТАЛОГИ" }]} />
        <div className="catalog-head__row">
          <h1 className="page-title">Каталоги и прайсы</h1>
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
            {list.length} файлов
          </span>
        </div>
      </div>

      <div className="section">
        {loading && list.length === 0 ? (
          <PageLoader label="Загрузка каталогов…" />
        ) : list.length === 0 ? (
          <EmptyState
            title="Каталоги пока не загружены"
            text="Скоро здесь появятся PDF-каталоги и прайс-листы. Пока вы можете перейти в каталог продукции или оставить заявку."
          />
        ) : (
          <div className="cat-grid">
            {list.map((c) => (
              <div className="cat-card" key={c.id}>
                <div className="cat-card__cover hatch">
                  {c.cover ? (
                    <img src={c.cover} alt={c.title} />
                  ) : (
                    <div className="cat-card__badge mono">PDF</div>
                  )}
                </div>
                <div className="cat-card__body">
                  <h3 className="cat-card__title">{c.title}</h3>
                  {c.description && <p className="cat-card__desc">{c.description}</p>}
                  <div className="cat-card__meta mono">
                    {c.file_name}
                    {c.size_label ? ` · ${c.size_label}` : ""}
                  </div>
                  <div className="cat-card__actions">
                    <button className="btn btn-red" onClick={() => setViewing(c)}>
                      Смотреть
                    </button>
                    <a
                      className="btn btn-outline"
                      href={sameOriginSrc(c.file)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Скачать
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* in-browser viewer */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        label={viewing ? `Просмотр каталога: ${viewing.title}` : "Просмотр каталога"}
      >
        {viewing && (
          <>
            <div className="viewer__bar">
              <span className="viewer__title">{viewing.title}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <a className="btn btn-outline" href={sameOriginSrc(viewing.file)} download target="_blank" rel="noopener noreferrer">
                  Скачать
                </a>
                <button className="btn btn-red" onClick={() => setViewing(null)}>
                  Закрыть
                </button>
              </div>
            </div>
            <iframe
              className="viewer__frame"
              src={sameOriginSrc(viewing.file)}
              title={viewing.title}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
