import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ state: "idle", error: null });

  const update = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", error: null });
    try {
      await login(form.username, form.password);
      navigate("/manage");
    } catch (err) {
      const msg =
        err.status === 400
          ? "Неверный логин или пароль."
          : "Не удалось войти. Проверьте, что бэкенд запущен.";
      setStatus({ state: "error", error: msg });
    }
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <img className="login__logo" src="/assets/logo.svg" alt="QP Tool" />
        <div className="login__title">Панель управления</div>
        <div className="login__sub mono">Войдите под учётной записью администратора</div>
        <input
          placeholder="Логин"
          value={form.username}
          onChange={update("username")}
          autoFocus
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={update("password")}
          required
        />
        <button type="submit" className="btn btn-red" disabled={status.state === "sending"}>
          {status.state === "sending" ? "Вход…" : "Войти"}
        </button>
        {status.state === "error" && <div className="iu__err">{status.error}</div>}
        <a className="login__back" href="/">
          ← на сайт
        </a>
      </form>
    </div>
  );
}
