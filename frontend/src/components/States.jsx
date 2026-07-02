/**
 * Переиспользуемые UX-состояния: загрузка, пусто, ошибка.
 * Единый визуальный язык вместо разрозненных строк «ЗАГРУЗКА…» по страницам.
 */

// Небольшой крутящийся индикатор (уважает prefers-reduced-motion через CSS).
export function Spinner({ size = 22, label = "Загрузка" }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  );
}

// Полноэкранный лоадер маршрута — используется как Suspense fallback.
export function PageLoader({ label = "Загрузка…" }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <Spinner size={30} label={label} />
      <span className="page-loader__text mono">{label}</span>
    </div>
  );
}

// Скелетон-плейсхолдер для карточек контента.
export function Skeleton({ className = "", style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

// Пустое состояние — когда данных нет (нет позиций, пустой список).
export function EmptyState({ title = "Ничего не найдено", text, action }) {
  return (
    <div className="state state--empty" role="status">
      <div className="state__title">{title}</div>
      {text && <p className="state__text">{text}</p>}
      {action}
    </div>
  );
}

// Состояние ошибки — с возможностью повторить действие.
export function ErrorState({
  title = "Не удалось загрузить данные",
  text = "Проверьте соединение и попробуйте ещё раз.",
  onRetry,
}) {
  return (
    <div className="state state--error" role="alert">
      <div className="state__title">{title}</div>
      <p className="state__text">{text}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline-red" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}
