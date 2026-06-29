import { useState } from "react";
import { api } from "../lib/api.js";
import { useSettings } from "../lib/hooks.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

const EMPTY = { name: "", phone: "", email: "", message: "" };

// Accept either a full Yandex embed snippet (<iframe src="…">) or a bare URL,
// and return a clean https URL to drop into our own iframe (avoids injecting
// raw HTML). Returns "" when nothing usable is configured.
function mapEmbedSrc(value) {
  if (!value) return "";
  const v = String(value).trim();
  const m = v.match(/src\s*=\s*["']([^"']+)["']/i);
  const url = m ? m[1] : v;
  return /^https?:\/\//i.test(url) ? url : "";
}

export default function Contacts() {
  const settings = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle", error: null });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", error: null });
    try {
      await api.createLead({ ...form, source: "contact_form", consent: true });
      setStatus({ state: "sent", error: null });
      setForm(EMPTY);
    } catch (err) {
      const msg =
        (err.detail && (err.detail.detail || JSON.stringify(err.detail))) ||
        "Не удалось отправить заявку. Попробуйте позже.";
      setStatus({ state: "error", error: msg });
    }
  };

  const workHours = (settings.work_hours || "").split(";").map((s) => s.trim());
  const mapSrc = mapEmbedSrc(settings.map_embed_url);

  return (
    <div>
      <div style={{ padding: "36px 56px 0", maxWidth: 1440, margin: "0 auto" }}>
        <Breadcrumb items={[{ label: "ГЛАВНАЯ", to: "/" }, { label: "КОНТАКТЫ" }]} />
      </div>

      <div className="contacts">
        <h1 className="contacts__title">Контакты</h1>
        <div className="contacts__grid">
          {/* left: info + map */}
          <div>
            <div className="contacts__info">
              <div>
                <div className="cinfo__label">ТЕЛЕФОНЫ</div>
                <div className="cinfo__value">
                  {settings.phone_primary}
                  {settings.phone_secondary && (
                    <>
                      <br />
                      {settings.phone_secondary}
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="cinfo__label">ПОЧТА</div>
                <div className="cinfo__value">{settings.email}</div>
              </div>
              <div>
                <div className="cinfo__label">АДРЕС</div>
                <div className="cinfo__value small">{settings.address}</div>
              </div>
              <div>
                <div className="cinfo__label">ГРАФИК</div>
                <div className="cinfo__value small">
                  {workHours.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="map">
              {mapSrc ? (
                <iframe
                  className="map__frame"
                  src={mapSrc}
                  title="Карта проезда"
                  loading="lazy"
                  allowFullScreen
                />
              ) : (
                <div className="map__pin">
                  <div className="map__dot" />
                  <div className="map__label">КАРТА · укажите в админ-панели</div>
                </div>
              )}
            </div>
          </div>

          {/* right: form */}
          <div className="form">
            <h2 className="form__title">Оставить заявку</h2>
            <p className="form__lead">
              Перезвоним в течение рабочего дня и поможем подобрать инструмент.
            </p>
            <form className="form__fields" onSubmit={submit}>
              <input placeholder="Ваше имя" value={form.name} onChange={update("name")} required />
              <input placeholder="Телефон" value={form.phone} onChange={update("phone")} required />
              <input placeholder="E-mail" type="email" value={form.email} onChange={update("email")} />
              <textarea
                placeholder="Комментарий или список позиций"
                rows={4}
                value={form.message}
                onChange={update("message")}
              />
              <button
                type="submit"
                className="btn btn-red form__submit"
                disabled={status.state === "sending"}
              >
                {status.state === "sending" ? "Отправляем…" : "Отправить заявку"}
              </button>
              {status.state === "sent" && (
                <p className="form__ok">Заявка отправлена — мы свяжемся с вами.</p>
              )}
              {status.state === "error" && (
                <p className="form__note" style={{ color: "var(--red)" }}>
                  {status.error}
                </p>
              )}
              <p className="form__note">
                Нажимая кнопку, вы соглашаетесь с политикой обработки персональных
                данных.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
