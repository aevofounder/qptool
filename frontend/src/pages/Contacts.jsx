import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../lib/hooks.jsx";
import { useInquiry, buildInquiryMessage } from "../lib/inquiry.jsx";
import { useLeadForm } from "../lib/useLeadForm.js";
import { useSeo } from "../lib/seo.jsx";
import { telHref } from "../config/site.js";
import Breadcrumb from "../components/Breadcrumb.jsx";
import ConsentField from "../components/ConsentField.jsx";

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
  const [consent, setConsent] = useState(false);
  const { submit, sending, sent, error } = useLeadForm();

  useSeo({
    title: "Контакты",
    description:
      "Контакты QP Tool в Екатеринбурге: телефоны, почта, адрес, график работы и форма заявки на подбор инструмента.",
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!consent) return; // согласие обязательно (152-ФЗ)
    // Compose the message: the inquiry list (спецификация) as tidy paragraphs,
    // with the typed comment treated as the buyer's note.
    const message = inquiry.items.length
      ? buildInquiryMessage(inquiry.items, form.message)
      : form.message || "";
    const ok = await submit({
      ...form,
      message,
      source: inquiry.items.length ? "inquiry_spec" : "contact_form",
      consent: true,
      page_url: window.location.href,
    });
    if (ok) {
      setForm(EMPTY);
      setConsent(false);
      inquiry.clear();
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

            <form className="form__fields" onSubmit={onSubmit} noValidate>
              <input
                name="name"
                autoComplete="name"
                aria-label="Ваше имя"
                placeholder="Ваше имя"
                value={form.name}
                onChange={update("name")}
                required
              />
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-label="Телефон"
                placeholder="Телефон"
                value={form.phone}
                onChange={update("phone")}
                required
              />
              <input
                name="email"
                type="email"
                autoComplete="email"
                aria-label="E-mail"
                placeholder="E-mail"
                value={form.email}
                onChange={update("email")}
              />
              <textarea
                name="message"
                aria-label="Комментарий или список позиций"
                placeholder="Комментарий или список позиций"
                rows={4}
                value={form.message}
                onChange={update("message")}
              />
              <ConsentField checked={consent} onChange={setConsent} />
              <button
                type="submit"
                className="btn btn-red form__submit"
                disabled={sending || !consent}
              >
                {sending ? "Отправляем…" : "Отправить заявку"}
              </button>
              {sent && (
                <p className="form__ok" role="status">
                  Заявка отправлена — мы свяжемся с вами.
                </p>
              )}
              {error && (
                <p className="form__note" role="alert" style={{ color: "var(--red)" }}>
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
