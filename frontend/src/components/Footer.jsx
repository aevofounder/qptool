import { useNavigate } from "react-router-dom";
import { useSettings } from "../lib/hooks.jsx";
import { telHref } from "./Header.jsx";

export default function Footer() {
  const settings = useSettings();
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div>
            <button
              type="button"
              className="footer__logo-btn"
              aria-label="QP Tool — на главную"
              onClick={() => navigate("/")}
            >
              <img className="footer__logo" src="/assets/logo-light.svg" alt="QP Tool" />
            </button>
            <p className="footer__addr">{settings.address}</p>
          </div>
          <div>
            <div className="footer__h">КОМПАНИЯ</div>
            <nav className="footer__links">
              <button type="button" onClick={() => navigate("/catalog")}>Продукция</button>
              <button type="button" onClick={() => navigate("/solutions")}>Решения</button>
              <button type="button" onClick={() => navigate("/about")}>О компании</button>
              <button type="button" onClick={() => navigate("/contacts")}>Контакты</button>
            </nav>
          </div>
          <div>
            <div className="footer__h">КОНТАКТЫ</div>
            <div className="footer__links">
              <a href={telHref(settings.phone_primary)}>{settings.phone_primary}</a>
              {settings.phone_secondary && (
                <a href={telHref(settings.phone_secondary)}>{settings.phone_secondary}</a>
              )}
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
          </div>
          <div>
            <div className="footer__h">ЗАЯВКА</div>
            <p className="footer__addr" style={{ marginBottom: 16 }}>
              Перезвоним в течение рабочего дня.
            </p>
            <button
              className="btn btn-white"
              style={{ padding: "13px 24px", fontSize: 14 }}
              onClick={() => navigate("/contacts")}
            >
              Оставить заявку
            </button>
          </div>
        </div>
        <div className="footer__copy">
          © 2009 {settings.company_name} · Все права защищены
          <button
            type="button"
            className="footer__manage"
            onClick={() => navigate("/manage")}
          >
            Управление
          </button>
        </div>
      </div>
    </footer>
  );
}
