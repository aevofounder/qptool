/**
 * Аналитика через адаптер.
 *
 * Провайдеры подключаются ТОЛЬКО если задан их идентификатор в env
 * (см. .env.example и config/site.js). Приоритет для аудитории РФ —
 * Яндекс.Метрика (счётчик грузится с mc.yandex.ru, стабильно доступен в РФ).
 * Google Analytics оставлен как опциональный провайдер (может быть недоступен
 * в РФ) — подключается тем же интерфейсом, без изменения кода приложения.
 *
 * Публичный интерфейс:
 *   initAnalytics()        — один раз на старте приложения
 *   trackPageview(url)     — при смене SPA-маршрута
 *   trackEvent(name, params) — произвольные цели/события
 *
 * Абстракция позволяет заменить/добавить провайдера (VK Пиксель, Top.Mail.ru
 * и т.п.) в одном месте, не трогая страницы.
 */
import { ANALYTICS } from "../config/site.js";

let initialized = false;

// ---- Яндекс.Метрика ------------------------------------------------------
function initYandexMetrika(id) {
  if (window.ym) return;
  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    for (var j = 0; j < e.length; j++) {
      if (e[j].src === r) return;
    }
    k = document.createElement("script");
    a = document.getElementsByTagName("script")[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document.scripts, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  window.ym(id, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    defer: true,
  });
}

// ---- Google Analytics 4 (опционально) ------------------------------------
function initGA(id) {
  if (window.gtag) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // SPA сами отправляют page_view при смене маршрута.
  window.gtag("config", id, { send_page_view: false });
}

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const { yandexMetrikaId, gaMeasurementId } = ANALYTICS;
  if (yandexMetrikaId) initYandexMetrika(yandexMetrikaId);
  if (gaMeasurementId) initGA(gaMeasurementId);
}

export function trackPageview(url) {
  const { yandexMetrikaId, gaMeasurementId } = ANALYTICS;
  const path = url || window.location.pathname + window.location.search;
  if (yandexMetrikaId && window.ym) window.ym(yandexMetrikaId, "hit", path);
  if (gaMeasurementId && window.gtag) {
    window.gtag("event", "page_view", { page_path: path });
  }
}

export function trackEvent(name, params = {}) {
  const { yandexMetrikaId, gaMeasurementId } = ANALYTICS;
  if (yandexMetrikaId && window.ym) window.ym(yandexMetrikaId, "reachGoal", name, params);
  if (gaMeasurementId && window.gtag) window.gtag("event", name, params);
}

// Активна ли аналитика (задан хотя бы один провайдер).
export const analyticsEnabled = () =>
  Boolean(ANALYTICS.yandexMetrikaId || ANALYTICS.gaMeasurementId);
