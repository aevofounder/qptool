import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  const close = () => setOpen(false);

  // Close on Escape + lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (to) => {
    close();
    navigate(to);
  };

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
          onClick={() => go("/")}
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
            <span className="header__spec-label">Спецификация</span>
            {inquiry.count > 0 && <span className="header__spec-badge">{inquiry.count}</span>}
          </button>
          <button
            className="btn btn-outline-red header__contact"
            style={{ fontSize: 14, padding: "11px 22px" }}
            onClick={() => navigate("/contacts")}
          >
            Связаться
          </button>

          {/* Hamburger — visible only on mobile via CSS */}
          <button
            ref={toggleRef}
            type="button"
            className={`header__burger${open ? " is-open" : ""}`}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="header__burger-box" aria-hidden="true">
              <span className="header__burger-line" />
              <span className="header__burger-line" />
              <span className="header__burger-line" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer + backdrop */}
      <div
        className={`mobile-menu${open ? " is-open" : ""}`}
        onClick={(e) => {
          // close when the backdrop (not the panel) is clicked
          if (!panelRef.current || !panelRef.current.contains(e.target)) close();
        }}
        aria-hidden={!open}
      >
        <nav
          id="mobile-menu"
          ref={panelRef}
          className="mobile-menu__panel"
          aria-label="Основная навигация"
        >
          <div className="mobile-menu__links">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  "mobile-menu__link" + (isActive ? " is-active" : "")
                }
                onClick={close}
              >
                {n.label}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            className="mobile-menu__spec"
            onClick={() => go("/specification")}
          >
            <svg width="18" height="18" viewBox="0 0 17 17" fill="none" aria-hidden="true">
              <path d="M2 2h2l1.2 8.5a1.4 1.4 0 0 0 1.4 1.2h6.1a1.4 1.4 0 0 0 1.4-1.1L15.4 5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6.8" cy="14.4" r="1" fill="currentColor" />
              <circle cx="13" cy="14.4" r="1" fill="currentColor" />
            </svg>
            <span>Спецификация</span>
            {inquiry.count > 0 && <span className="header__spec-badge">{inquiry.count}</span>}
          </button>

          <button
            className="btn btn-red mobile-menu__cta"
            onClick={() => go("/contacts")}
          >
            Связаться
          </button>

          <div className="mobile-menu__contacts">
            <a href={telHref(settings.phone_primary)}>{settings.phone_primary}</a>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
