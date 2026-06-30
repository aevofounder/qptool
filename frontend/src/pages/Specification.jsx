import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import {
  useInquiry,
  buildSpecText,
  buildInquiryMessage,
  pluralRu,
} from "../lib/inquiry.jsx";
import { useSeo } from "../lib/seo.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

const EMPTY = { name: "", phone: "", email: "", comment: "" };

export default function Specification() {
  const navigate = useNavigate();
  const inquiry = useInquiry();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle", error: null });
  const [copied, setCopied] = useState(false);

  useSeo({
    title: "Спецификация",
    description:
      "Спецификация QP Tool: соберите список позиций металлорежущего инструмента, укажите количество и отправьте заявку на расчёт цены одним сообщением.",
    noindex: true,
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Live preview of exactly what will be sent — positions as paragraphs + comment.
  const previewText = useMemo(
    () => buildInquiryMessage(inquiry.items, form.comment),
    [inquiry.items, form.comment]
  );

  const copySpec = async () => {
    const text = buildSpecText(inquiry.items);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable (insecure context) — ignore silently */
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!inquiry.count) return;
    setStatus({ state: "sending", error: null });
    try {
      await api.createLead({
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: buildInquiryMessage(inquiry.items, form.comment),
        source: "inquiry_spec",
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

  const countLabel =
    `${inquiry.count} ` + pluralRu(inquiry.count, ["позиция", "позиции", "позиций"]);

  return (
    <div>
      <div className="crumb-wrap">
        <Breadcrumb items={[{ label: "ГЛАВНАЯ", to: "/" }, { label: "СПЕЦИФИКАЦИЯ" }]} />
      </div>

      <div className="specpage">
        <div className="specpage__head">
          <h1 className="page-title">Спецификация</h1>
          {inquiry.count > 0 && (
            <span className="specpage__count mono">{countLabel}</span>
          )}
        </div>

        {status.state === "sent" ? (
          <div className="specpage__done">
            <div className="specpage__done-mark" aria-hidden="true">✓</div>
            <h2 className="specpage__done-title">Заявка отправлена</h2>
            <p className="specpage__done-text">
              Спасибо! Мы получили вашу спецификацию и свяжемся с вами в течение
              рабочего дня для расчёта цены.
            </p>
            <div className="specpage__done-actions">
              <button className="btn btn-red" onClick={() => navigate("/catalog")}>
                Вернуться в каталог
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/")}>
                На главную
              </button>
            </div>
          </div>
        ) : inquiry.count === 0 ? (
          <div className="specpage__empty">
            <div className="specpage__empty-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 17 17" fill="none">
                <path d="M2 2h2l1.2 8.5a1.4 1.4 0 0 0 1.4 1.2h6.1a1.4 1.4 0 0 0 1.4-1.1L15.4 5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6.8" cy="14.4" r="1" fill="currentColor" />
                <circle cx="13" cy="14.4" r="1" fill="currentColor" />
              </svg>
            </div>
            <h2 className="specpage__empty-title">Спецификация пуста</h2>
            <p className="specpage__empty-text">
              Добавляйте позиции кнопкой «В спецификацию» в каталоге или на странице
              товара — затем соберите их в одну заявку и отправьте на расчёт цены.
            </p>
            <button className="btn btn-red" onClick={() => navigate("/catalog")}>
              Перейти в каталог
            </button>
          </div>
        ) : (
          <div className="specpage__grid">
            {/* left: positions + composed text */}
            <div className="specpage__main">
              <div className="speclist">
                <div className="speclist__head">
                  <span className="speclist__h mono">ПОЗИЦИИ</span>
                  <button type="button" className="speclist__clear" onClick={inquiry.clear}>
                    Очистить всё
                  </button>
                </div>
                <ul className="speclist__items">
                  {inquiry.items.map((it, i) => (
                    <li className="specrow" key={it.code}>
                      <span className="specrow__num mono">{i + 1}</span>
                      <div className="specrow__info">
                        <button
                          type="button"
                          className="specrow__name"
                          onClick={() => it.slug && navigate(`/product/${it.slug}`)}
                          disabled={!it.slug}
                        >
                          {it.name}
                        </button>
                        <span className="specrow__code mono">{it.code}</span>
                      </div>
                      <div className="qty" role="group" aria-label={`Количество: ${it.name}`}>
                        <button
                          type="button"
                          className="qty__btn"
                          aria-label="Уменьшить количество"
                          onClick={() => inquiry.decrement(it.code)}
                          disabled={it.qty <= 1}
                        >
                          −
                        </button>
                        <input
                          className="qty__input mono"
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={it.qty}
                          aria-label="Количество"
                          onChange={(e) => inquiry.setQty(it.code, e.target.value)}
                        />
                        <button
                          type="button"
                          className="qty__btn"
                          aria-label="Увеличить количество"
                          onClick={() => inquiry.increment(it.code)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="specrow__remove"
                        aria-label={`Убрать ${it.code} из спецификации`}
                        onClick={() => inquiry.remove(it.code)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="specpreview">
                <div className="specpreview__head">
                  <span className="specpreview__h mono">ТЕКСТ СПЕЦИФИКАЦИИ</span>
                  <button
                    type="button"
                    className="specpreview__copy"
                    onClick={copySpec}
                  >
                    {copied ? "Скопировано ✓" : "Скопировать"}
                  </button>
                </div>
                <pre className="specpreview__body">{previewText}</pre>
                <p className="specpreview__note">
                  Этот текст уйдёт вместе с заявкой — менеджеру не придётся ничего
                  переписывать.
                </p>
              </div>
            </div>

            {/* right: send as a request */}
            <aside className="specpage__aside">
              <form className="specform" onSubmit={submit}>
                <h2 className="specform__title">Отправить как заявку</h2>
                <p className="specform__lead">
                  Перезвоним в течение рабочего дня и пришлём расчёт стоимости.
                </p>
                <div className="specform__fields">
                  <input
                    placeholder="Ваше имя"
                    value={form.name}
                    onChange={update("name")}
                    required
                  />
                  <input
                    placeholder="Телефон"
                    value={form.phone}
                    onChange={update("phone")}
                    required
                  />
                  <input
                    placeholder="E-mail"
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                  />
                  <textarea
                    placeholder="Комментарий покупателя: сроки, условия поставки, пожелания…"
                    rows={4}
                    value={form.comment}
                    onChange={update("comment")}
                  />
                  <button
                    type="submit"
                    className="btn btn-red specform__submit"
                    disabled={status.state === "sending"}
                  >
                    {status.state === "sending"
                      ? "Отправляем…"
                      : `Отправить заявку · ${countLabel}`}
                  </button>
                  {status.state === "error" && (
                    <p className="form__note" style={{ color: "var(--red)" }}>
                      {status.error}
                    </p>
                  )}
                  <p className="form__note">
                    Нажимая кнопку, вы соглашаетесь с политикой обработки
                    персональных данных.
                  </p>
                </div>
              </form>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
