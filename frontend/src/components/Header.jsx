import { NavLink, useNavigate } from "react-router-dom";
import { useSettings } from "../lib/hooks.jsx";

const NAV = [
  { label: "Продукция", to: "/catalog" },
  { label: "Каталоги", to: "/catalogs" },
  { label: "Решения", to: "/solutions" },
  { label: "О компании", to: "/about" },
  { label: "Контакты", to: "/contacts" },
];

export default function Header() {
  const settings = useSettings();
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header__util">
        <span>{settings.tagline}</span>
        <div className="header__util-right">
          <span>{settings.phone_primary}</span>
          <span>{settings.email}</span>
        </div>
      </div>
      <div className="header__main">
        <img
          className="header__logo"
          src="/assets/logo.svg"
          alt="QP Tool"
          onClick={() => navigate("/")}
        />
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
        <button
          className="btn btn-outline-red"
          style={{ fontSize: 14, padding: "11px 22px" }}
          onClick={() => navigate("/contacts")}
        >
          Связаться
        </button>
      </div>
    </header>
  );
}
