import { useState } from "react";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function Catalogs() {
  const { data: catalogs, loading } = useFetch(api.catalogs, [], []);
  const [viewing, setViewing] = useState(null); // catalog being previewed

  const list = catalogs || [];

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
          <div className="loading">ЗАГРУЗКА…</div>
        ) : list.length === 0 ? (
          <div className="empty">КАТАЛОГИ ПОКА НЕ ЗАГРУЖЕНЫ</div>
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
                      href={c.file}
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
      {viewing && (
        <div className="viewer" onClick={() => setViewing(null)}>
          <div className="viewer__panel" onClick={(e) => e.stopPropagation()}>
            <div className="viewer__bar">
              <span className="viewer__title">{viewing.title}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <a className="btn btn-outline" href={viewing.file} download target="_blank" rel="noopener noreferrer">
                  Скачать
                </a>
                <button className="btn btn-red" onClick={() => setViewing(null)}>
                  Закрыть
                </button>
              </div>
            </div>
            <iframe className="viewer__frame" src={viewing.file} title={viewing.title} />
          </div>
        </div>
      )}
    </div>
  );
}
