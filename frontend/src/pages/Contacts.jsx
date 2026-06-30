import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useSettings } from "../lib/hooks.jsx";
import { useInquiry, buildInquiryMessage } from "../lib/inquiry.jsx";
import { useSeo } from "../lib/seo.jsx";
import { telHref } from "../components/Header.jsx";
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
  const inquiry = useInquiry();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle", error: null });

  useSeo({
    title: "Контакты",
    description:
      "Контакты QP Tool в Екатеринбурге: телефоны, почта, адрес, график работы и форма заявки на подбор инструмента.",
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", error: null });
    // Compose the message: the inquiry list (спецификация) as tidy paragraphs,
    // with the typed comment treated as the buyer's note.
    const message = inquiry.items.length
      ? buildInquiryMessage(inquiry.items, form.message)
      : form.message || "";
    try {
      await api.createLead({
        ...form,
        message,
        source: inquiry.items.length ? "inquiry_spec" : "contact_form",
        consent: true,
      });
      setStatus({ state: "sent", error: null });
      setForm(EMPTY);
      inquiry.clear();
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
      <div className="crumb-wrap">
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
                  <a href={telHref(settings.phone_primary)}>{settings.phone_primary}</a>
                  {settings.phone_secondary && (
                    <>
                      <br />
                      <a href={telHref(settings.phone_secondary)}>{settings.phone_secondary}</a>
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="cinfo__label">ПОЧТА</div>
                <div className="cinfo__value"><a href={`mailto:${settings.email}`}>{settings.email}</a></div>
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

            {inquiry.count > 0 && (
              <div className="spec">
                <div className="spec__head">
                  <span className="spec__h">Спецификация · {inquiry.count}</span>
                  <button type="button" className="spec__clear" onClick={inquiry.clear}>
                    Очистить
                  </button>
                </div>
                <ul className="spec__list">
                  {inquiry.items.map((it) => (
                    <li className="spec__item" key={it.code}>
                      <span className="spec__code mono">{it.code}</span>
                      <span className="spec__name">{it.name}</span>
                      <span className="spec__qty">{it.qty} шт.</span>
                      <button
                        type="button"
                        className="spec__remove"
                        aria-label={`Убрать ${it.code} из спецификации`}
                        onClick={() => inquiry.remove(it.code)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="spec__note">Список позиций отправится вместе с заявкой.</p>
                <button
                  type="button"
                  className="spec__link"
                  onClick={() => navigate("/specification")}
                >
                  Открыть полную спецификацию →
                </button>
              </div>
            )}

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
