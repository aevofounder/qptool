import { Component } from "react";

/**
 * ErrorBoundary — ловит ошибки рендера в дереве компонентов, чтобы одна
 * упавшая страница не «убивала» весь SPA белым экраном. Показывает
 * аккуратный экран восстановления с кнопками «обновить» и «на главную».
 *
 * React не предоставляет хук-аналог, поэтому это классовый компонент.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // В проде это место для отправки в систему мониторинга (Sentry/аналог).
    // Логируем, чтобы ошибка не терялась молча.
    if (import.meta.env?.DEV) {
      console.error("ErrorBoundary поймал ошибку:", error, info);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fallback-screen" role="alert">
          <div className="fallback-screen__code mono">500</div>
          <h1 className="fallback-screen__title">Что-то пошло не так</h1>
          <p className="fallback-screen__text">
            Произошла непредвиденная ошибка. Попробуйте обновить страницу — если
            это не поможет, вернитесь на главную.
          </p>
          <div className="fallback-screen__actions">
            <button className="btn btn-red" onClick={this.handleReload}>
              Обновить страницу
            </button>
            <a className="btn btn-outline" href="/">
              На главную
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
