import { NavLink, useNavigate } from "react-router-dom";
import { useSettings } from "../lib/hooks.jsx";
import { useInquiry } from "../lib/inquiry.jsx";

const NAV = [
  { label: "Продукция", to: "/catalog" },
  { label: "Каталоги", to: "/catalogs" },
  { label: "Решения", to: "/solutions" },
  { label: "О компании", to: "/about" },
  { label: "Контакты", to: "/contacts" },
];

// "+7 (343) 302-00-96" → "+73433020096" for a tel: href.
export const telHref = (phone) => "tel:" + String(phone || "").replace(/[^\d+]/g, "");

export default function Header() {
  const settings = useSettings();
  const navigate = useNavigate();
  const inquiry = useInquiry();

  return (
    <header className="header">
      <div className="header__util">
        <span>{settings.tagline}</span>
        <div className="header__util-right">
          <a href={telHref(settings.phone_primary)}>{settings.phone_primary}</a>
          <a href={`mailto:${settings.email}`}>{settings.email}</a>
        </div>
      </div>
      <div className="header__main">
        <button
          type="button"
          className="header__logo-btn"
          aria-label="QP Tool — на главную"
          onClick={() => navigate("/")}
        >
          <img className="header__logo" src="/assets/logo.svg" alt="QP Tool" />
        </button>
        <nav className="header__nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => (isActive ? "is-active" : "")}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="header__actions">
          <button
            type="button"
            className="header__spec"
            onClick={() => navigate("/specification")}
            aria-label={`Спецификация: ${inquiry.count} позиций`}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
              <path d="M2 2h2l1.2 8.5a1.4 1.4 0 0 0 1.4 1.2h6.1a1.4 1.4 0 0 0 1.4-1.1L15.4 5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6.8" cy="14.4" r="1" fill="currentColor" />
              <circle cx="13" cy="14.4" r="1" fill="currentColor" />
            </svg>
            <span>Спецификация</span>
            {inquiry.count > 0 && <span className="header__spec-badge">{inquiry.count}</span>}
          </button>
          <button
            className="btn btn-outline-red"
            style={{ fontSize: 14, padding: "11px 22px" }}
            onClick={() => navigate("/contacts")}
          >
            Связаться
          </button>
        </div>
      </div>
    </header>
  );
}
