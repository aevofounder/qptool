import { useState } from "react";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.jsx";

const EMPTY = { title: "", description: "" };

export default function CatalogsPage() {
  const [reload, setReload] = useState(0);
  const { data: catalogs, loading } = useFetch(api.catalogs, [reload], []);

  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [status, setStatus] = useState({ state: "idle", error: null });

  const update = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ state: "error", error: "Выберите файл каталога (PDF)." });
      return;
    }
    setStatus({ state: "saving", error: null });
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("file", file);
      if (cover) fd.append("cover", cover);
      await api.createCatalog(fd);
      setForm(EMPTY);
      setFile(null);
      setCover(null);
      e.target.reset();
      setStatus({ state: "saved", error: null });
      setReload((x) => x + 1);
    } catch (err) {
      const d = err?.detail;
      const msg =
        typeof d === "string" ? d : d ? JSON.stringify(d) : "Не удалось загрузить.";
      setStatus({ state: "error", error: msg });
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Удалить каталог «${c.title}»?`)) return;
    await api.deleteCatalog(c.slug);
    setReload((x) => x + 1);
  };

  const list = catalogs || [];

  return (
    <div>
      <h1 className="admin__h1">Каталоги (файлы)</h1>
      <p className="admin__lead">
        Загрузите PDF-каталоги и прайсы — они появятся на странице «Каталоги» сайта.
      </p>

      {/* add form */}
      <form className="admin__card" onSubmit={submit}>
        <div className="admin__form-title">Добавить каталог</div>
        <div className="admin__field">
          <label>Название</label>
          <input value={form.title} onChange={update("title")} required placeholder="Например: Каталог фрез 2026" />
        </div>
        <div className="admin__field">
          <label>Описание</label>
          <textarea value={form.description} onChange={update("description")} rows={2} placeholder="Короткое описание (необязательно)" />
        </div>
        <div className="admin__field-row">
          <div className="admin__field">
            <label>Файл каталога (PDF) *</label>
            <input type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="admin__field">
            <label>Обложка (картинка, необязательно)</label>
            <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} />
          </div>
        </div>
        <div className="admin__form-actions">
          <button type="submit" className="btn btn-red" disabled={status.state === "saving"}>
            {status.state === "saving" ? "Загрузка…" : "Загрузить каталог"}
          </button>
          {status.state === "saved" && <span className="iu__ok">Загружено ✓</span>}
          {status.state === "error" && <span className="iu__err">{status.error}</span>}
        </div>
      </form>

      {/* list */}
      <div className="admin__list-title">Загруженные каталоги ({list.length})</div>
      {loading && list.length === 0 ? (
        <div className="loading">ЗАГРУЗКА…</div>
      ) : list.length === 0 ? (
        <div className="empty">ПОКА ПУСТО</div>
      ) : (
        <div className="admin__catalogs">
          {list.map((c) => (
            <div className="admin__catalog" key={c.id}>
              <div className="admin__catalog-cover hatch">
                {c.cover ? <img src={c.cover} alt={c.title} /> : <span className="mono">PDF</span>}
              </div>
              <div className="admin__catalog-info">
                <div className="admin__catalog-title">
                  {c.title}
                  {!c.is_published && <span className="admin__badge">черновик</span>}
                </div>
                <div className="mono admin__catalog-meta">
                  {c.file_name}
                  {c.size_label ? ` · ${c.size_label}` : ""}
                </div>
              </div>
              <div className="admin__catalog-actions">
                <a className="btn btn-outline" href={c.file} target="_blank" rel="noopener noreferrer">
                  Открыть
                </a>
                <button className="btn btn-ghost danger" onClick={() => remove(c)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
