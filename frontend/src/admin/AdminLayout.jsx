import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/manage/login");
  };

  return (
    <div className="admin">
      <aside className="admin__side">
        <img className="admin__logo" src="/assets/logo-light.svg" alt="QP Tool" />
        <nav className="admin__nav">
          <NavLink to="/manage" end className={({ isActive }) => (isActive ? "is-active" : "")}>
            Картинки сайта
          </NavLink>
          <NavLink to="/manage/catalogs" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Каталоги (файлы)
          </NavLink>
          <NavLink to="/manage/settings" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Контакты и карта
          </NavLink>
        </nav>
        <a className="admin__site-link" href="/" target="_blank" rel="noopener noreferrer">
          Открыть сайт ↗
        </a>
      </aside>
      <div className="admin__main">
        <div className="admin__topbar">
          <span className="mono admin__user">{user ? `Вы вошли как ${user.username}` : ""}</span>
          <button className="btn btn-outline" onClick={onLogout}>
            Выйти
          </button>
        </div>
        <div className="admin__content">{children}</div>
      </div>
    </div>
  );
}
