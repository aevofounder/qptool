import { useNavigate } from "react-router-dom";
import { useSettings } from "../lib/hooks.jsx";

export default function Footer() {
  const settings = useSettings();
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div>
            <img
              className="footer__logo"
              src="/assets/logo-light.svg"
              alt="QP Tool"
              onClick={() => navigate("/")}
            />
            <p className="footer__addr">{settings.address}</p>
          </div>
          <div>
            <div className="footer__h">КОМПАНИЯ</div>
            <div className="footer__links">
              <span onClick={() => navigate("/catalog")}>Продукция</span>
              <span onClick={() => navigate("/solutions")}>Решения</span>
              <span onClick={() => navigate("/about")}>О компании</span>
              <span onClick={() => navigate("/contacts")}>Контакты</span>
            </div>
          </div>
          <div>
            <div className="footer__h">КОНТАКТЫ</div>
            <div className="footer__links">
              <span>{settings.phone_primary}</span>
              {settings.phone_secondary && <span>{settings.phone_secondary}</span>}
              <span>{settings.email}</span>
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
          <span
            className="footer__manage"
            onClick={() => navigate("/manage")}
            style={{ cursor: "pointer", marginLeft: 16 }}
          >
            Управление
          </span>
        </div>
      </div>
    </footer>
  );
}
