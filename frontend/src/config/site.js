/**
 * Единый источник правды по компании, контактам, навигации и SEO.
 *
 * Всё, что раньше дублировалось по index.html, Home.jsx, fallback.js,
 * Header.jsx и Footer.jsx, собрано здесь. Меняем данные компании в одном
 * месте — они применяются на всём сайте.
 *
 * Значения, приходящие с бэкенда (SiteSettings), имеют приоритет в рантайме
 * (см. SettingsProvider); эти константы — статический fallback и SEO-дефолты,
 * которыми пользуются краулеры и prerender до загрузки API.
 */

// Абсолютный адрес сайта — для canonical, sitemap, og:url, JSON-LD.
// Задаётся через VITE_SITE_URL; по умолчанию — прод-домен.
export const SITE_URL = (
  import.meta.env?.VITE_SITE_URL || "https://qptool.ru"
).replace(/\/+$/, "");

export const COMPANY = {
  brand: "QP Tool",
  legalName: "ООО «КуПиТул» (QP Tool)",
  foundingYear: 2009,
  city: "Екатеринбург",
  country: "RU",
  phonePrimary: "+7 (343) 302-00-96",
  phoneSecondary: "+7 (912) 051-82-21",
  email: "info@qptool.ru",
  address: "620144, г. Екатеринбург, ул. Московская, д. 195, офис 1026, 1037",
  postalCode: "620144",
  streetAddress: "ул. Московская, д. 195, офис 1026, 1037",
  workHours: "Пн–Пт: 9:00–18:00; Сб–Вс: выходной",
  tagline: "ОФИЦИАЛЬНЫЙ ПОСТАВЩИК · ЕКАТЕРИНБУРГ · С 2009",
};

// Главная навигация — используется в шапке и (частично) в подвале.
export const NAV = [
  { label: "Продукция", to: "/catalog" },
  { label: "Каталоги", to: "/catalogs" },
  { label: "Решения", to: "/solutions" },
  { label: "О компании", to: "/about" },
  { label: "Контакты", to: "/contacts" },
];

// SEO-дефолты.
export const SEO = {
  siteName: COMPANY.brand,
  titleSuffix: "QP Tool — металлорежущий инструмент и оснащение станков",
  defaultDescription:
    "QP Tool — официальный поставщик металлорежущего инструмента и оснащения станков в Екатеринбурге с 2009 года. Фрезы, свёрла, токарные пластины, метчики и резцы со склада и под заказ.",
  locale: "ru_RU",
  ogImage: "/assets/og-cover.svg",
  themeColor: "#0f0f10",
};

// Структурированные данные организации (Schema.org) — один источник для
// статического блока в index.html и рантайм-блока на главной.
export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY.legalName,
  url: SITE_URL,
  foundingDate: String(COMPANY.foundingYear),
  email: COMPANY.email,
  telephone: "+7-343-302-00-96",
  address: {
    "@type": "PostalAddress",
    addressLocality: COMPANY.city,
    addressCountry: COMPANY.country,
    streetAddress: COMPANY.streetAddress,
    postalCode: COMPANY.postalCode,
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+7-343-302-00-96",
    contactType: "sales",
    email: COMPANY.email,
  },
};

// Внешние идентификаторы аналитики (см. lib/analytics.js). Пусто → не грузим.
export const ANALYTICS = {
  // Яндекс.Метрика — основной счётчик для аудитории РФ.
  yandexMetrikaId: import.meta.env?.VITE_YANDEX_METRIKA_ID || "",
  // Google Analytics 4 — опционально (может быть недоступен в РФ).
  gaMeasurementId: import.meta.env?.VITE_GA_MEASUREMENT_ID || "",
};

// "+7 (343) 302-00-96" → "+73433020096" для tel:-ссылки.
export const telHref = (phone) => "tel:" + String(phone || "").replace(/[^\d+]/g, "");
