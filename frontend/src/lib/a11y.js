/**
 * Клавиатурная активация для кликабельных контейнеров (div с ролью ссылки/кнопки).
 * Делает элемент доступным с клавиатуры: Enter и Space вызывают действие.
 *
 * Использование:
 *   <div role="link" tabIndex={0} onClick={go} onKeyDown={activateOnKey(go)} />
 */
export const activateOnKey = (handler) => (e) => {
  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    handler(e);
  }
};
