import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const FIELDS = [
  { key: "phone_primary", label: "Основной телефон" },
  { key: "phone_secondary", label: "Доп. телефон" },
  { key: "email", label: "E-mail" },
  { key: "address", label: "Адрес", textarea: true },
  { key: "work_hours", label: "График работы" },
];

export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [load, setLoad] = useState({ state: "loading", error: null });
  const [status, setStatus] = useState({ state: "idle", error: null });

  useEffect(() => {
    api
      .settings()
      .then((d) => {
        setForm(d);
        setLoad({ state: "ok", error: null });
      })
      .catch((err) => {
        setLoad({
          state: "error",
          error:
            err?.status >= 500
              ? "Сервер вернул ошибку. Скорее всего, не применена миграция базы — выполните в папке backend: python manage.py migrate, затем перезапустите сервер."
              : "Не удалось загрузить настройки. Проверьте, что бэкенд запущен.",
        });
      });
  }, []);

  if (load.state === "loading") {
    return (
      <div>
        <h1 className="admin__h1">Контакты и карта</h1>
        <div className="loading">ЗАГРУЗКА…</div>
      </div>
    );
  }

  if (load.state === "error") {
    return (
      <div>
        <h1 className="admin__h1">Контакты и карта</h1>
        <div className="admin__card">
          <div className="iu__err" style={{ marginTop: 0 }}>
            {load.error}
          </div>
        </div>
      </div>
    );
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setStatus({ state: "saving", error: null });
    try {
      const payload = {
        phone_primary: form.phone_primary || "",
        phone_secondary: form.phone_secondary || "",
        email: form.email || "",
        address: form.address || "",
        work_hours: form.work_hours || "",
        map_embed_url: form.map_embed_url || "",
      };
      await api.updateSettings(payload);
      setStatus({ state: "saved", error: null });
    } catch (err) {
      const d = err?.detail;
      const msg = typeof d === "string" ? d : d ? JSON.stringify(d) : "Ошибка сохранения.";
      setStatus({ state: "error", error: msg });
    }
  };

  return (
    <div>
      <h1 className="admin__h1">Контакты и карта</h1>
      <p className="admin__lead">
        Эти данные показываются в шапке, подвале и на странице «Контакты».
      </p>

      <form className="admin__card" onSubmit={save}>
        {FIELDS.map((f) => (
          <div className="admin__field" key={f.key}>
            <label>{f.label}</label>
            {f.textarea ? (
              <textarea rows={2} value={form[f.key] || ""} onChange={update(f.key)} />
            ) : (
              <input value={form[f.key] || ""} onChange={update(f.key)} />
            )}
          </div>
        ))}

        <div className="admin__field">
          <label>Яндекс.Карта — код вставки (iframe) или ссылка</label>
          <textarea
            rows={4}
            value={form.map_embed_url || ""}
            onChange={update("map_embed_url")}
            placeholder='Вставьте код из Яндекс.Конструктора: <iframe src="https://yandex.ru/map-widget/v1/...">'
          />
          <span className="admin__hint mono">
            Конструктор: yandex.ru/map-constructor → поставьте точку → «Код карты» →
            скопируйте и вставьте сюда. Чтобы убрать карту, очистите поле.
          </span>
        </div>

        <div className="admin__form-actions">
          <button type="submit" className="btn btn-red" disabled={status.state === "saving"}>
            {status.state === "saving" ? "Сохраняем…" : "Сохранить"}
          </button>
          <a className="iu__link" href="/contacts" target="_blank" rel="noopener noreferrer">
            Открыть на сайте ↗
          </a>
          {status.state === "saved" && <span className="iu__ok">Сохранено ✓</span>}
          {status.state === "error" && <span className="iu__err">{status.error}</span>}
        </div>
      </form>
    </div>
  );
}
