# QP Tool — Frontend (Variant 1 «Чистая сетка»)

React + Vite SPA that implements the **QP Tool 1 - Clean** design from the
Claude Design export, wired to the Django REST API in `../backend`.

- **Stack:** React 18 · Vite 5 · React Router 6
- **Fonts:** Montserrat · Manrope · JetBrains Mono (Google Fonts, грузятся
  неблокирующе; системный fallback работает при недоступности CDN)
- **Design tokens** ported 1:1 from the export (`src/styles.css`)

## Screens

Six screens with working navigation (header, footer, breadcrumbs, cards):

| Route | Screen | Data source |
|-------|--------|-------------|
| `/` | Главная — hero-ротатор, направления, преимущества, CTA, «нам доверяют», материалы | `hero-slides`, `advantages`, `articles`, `client-logos` (with static fallback) |
| `/catalog` | Каталог — фильтр по категориям, сетка товаров | `categories`, `products?category__slug=` |
| `/product/:slug` | Карточка товара — галерея, характеристики, похожие | `products/{slug}`, related by category |
| `/catalogs` | Каталоги — PDF-каталоги/прайсы: сетка с обложками, просмотр в браузере, скачивание | `catalogs` |
| `/solutions` | Решения — ценность, процесс, отрасли, CTA | static |
| `/about` | О компании — интро, цифры, принципы, CTA | static |
| `/contacts` | Контакты — реквизиты, карта, форма заявки | `settings`; form → `POST /leads/` |
| `/manage` | **Админ-панель** — логин, замена картинок с предпросмотром, управление каталогами | token auth; см. ниже |

The hero auto-rotates between service slides every 5s; clicking a tab jumps to it.
Header/footer contacts come from `GET /api/settings/` (shared via React context).
Загруженные через панель картинки заменяют «чертёжные» заглушки на сайте.

## Админ-панель (`/manage`)

Своя панель прямо на сайте (ссылка «Управление» в футере). Вход — под учётной
записью суперпользователя Django (`createsuperuser`). Токен хранится в
`localStorage`.

- **Картинки сайта** — вкладки: Hero-слайды, Логотипы клиентов, Фото товаров,
  Обложки статей. Выбираешь файл → виден мгновенный предпросмотр → «Сохранить»
  → «Открыть на сайте» (откроет нужную страницу в новой вкладке).
- **Каталоги (файлы)** — загрузка PDF-каталогов (название, описание, файл,
  обложка), список, удаление.

Код панели: `src/admin/*`, авторизация — `src/lib/auth.jsx`,
запросы с токеном/файлами — `src/lib/api.js`.

> Token-аутентификация по `localhost` достаточна для локального теста. Для
> публикации в интернет используйте HTTPS и более строгую защиту.

## Run

The backend must be running on `http://127.0.0.1:8000` (see `../backend/README.md`).
The Vite dev server proxies `/api` and `/media` to it — no CORS setup needed.

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Point the proxy at a different backend with `API_PROXY=http://host:port npm run dev`.

### Build

```bash
npm run build        # → dist/
npm run preview      # serve the production build locally
```

### Prerendering (SEO)

`npm run build` ships a normal SPA. For static, crawlable HTML per marketing
route, opt in to prerendering (install the two optional packages first):

```bash
npm i -D @prerenderer/rollup-plugin @prerenderer/renderer-puppeteer
npm run build:prerender   # PRERENDER=1 vite build → static /, /catalog, /about, …
```

Per-route `<title>`, meta description, Open Graph and JSON-LD are set at runtime
via `src/lib/seo.jsx` (`useSeo`), so even the plain SPA build gets correct tags
once JS runs; prerendering bakes them into the served HTML for crawlers.

For production, set `VITE_API_BASE` to the API origin (e.g. `https://api.qptool.ru/api`)
in `.env` before building — see `.env.example`.

## Production readiness

Проект подготовлен к продакшену. Ключевые механизмы:

- **Конфигурация** централизована в `src/config/site.js` (данные компании,
  навигация, SEO, ID аналитики). Меняем в одном месте.
- **Code splitting** — каждая страница и админ-панель грузятся отдельными
  чанками (`React.lazy` + `Suspense`); главный бандл ≈ 61 КБ gzip.
- **Ошибки/состояния** — `ErrorBoundary` ловит сбои рендера; есть страница
  404, skeleton-загрузка, empty/error-состояния (`src/components/States.jsx`).
- **SEO/PWA** — `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, favicon,
  per-route `<title>/OG/JSON-LD` (`useSeo`).
- **Доступность** — skip-link, `<main>`-landmark, focus-trap в модалках,
  клавиатурная навигация карточек, `aria-*`, видимый фокус.
- **Формы** — единый хук `useLeadForm`, явное согласие 152-ФЗ (`ConsentField`),
  защита от повторной отправки, корректные типы полей.
- **Линт** — `npm run lint` (ESLint 9, flat config), сборка проходит чисто.

### Аналитика (РФ)

Подключается через адаптер `src/lib/analytics.js` **только если задан ID** в
`.env` (иначе — no-op). Приоритет для РФ — **Яндекс.Метрика** (грузится с
`mc.yandex.ru`, стабильно доступна в РФ). Google Analytics — опционально.

```
VITE_YANDEX_METRIKA_ID=12345678
VITE_GA_MEASUREMENT_ID=G-XXXXXXX   # необязательно
```

Добавить провайдера (VK Пиксель, Top.Mail.ru) можно в одном файле-адаптере,
не трогая страницы.

### Ручные шаги перед публичным запуском

- [ ] **Домен** — если не `qptool.ru`, задать `VITE_SITE_URL` и поправить
      абсолютные URL в `index.html`, `public/robots.txt`, `public/sitemap.xml`.
- [ ] **Растровые иконки** — сгенерировать из `public/favicon.svg`:
      `apple-touch-icon.png` (180×180) и, при желании, PNG 192/512 для манифеста
      (SVG-иконки уже работают в Chrome/Android).
- [ ] **og-image** — заменить `public/assets/og-cover.svg` на растровый
      **1200×630 PNG/JPG** для корректных превью в Telegram/VK.
- [ ] **Шрифты** — для полной независимости от Google в РФ рекомендуется
      self-hosting (положить `.woff2` в `public/fonts`, заменить `<link>` на
      `@font-face`). Сейчас при блокировке CDN сайт остаётся читаемым на
      системных шрифтах.
- [ ] **Политика конфиденциальности** (`src/pages/Privacy.jsx`) — выверить
      формулировки под реальные процессы (желательно с юристом).
- [ ] **Аналитика** — вписать ID Яндекс.Метрики; подключить сайт в Яндекс.Вебмастер.

## Resilience

Each marketing section has a static fallback (`src/lib/fallback.js`) mirroring the
backend seed, so the home page renders fully even if the API is briefly unavailable.
Catalog and product pages show explicit loading / empty / not-found states.

## Layout

```
frontend/
├── index.html              # font links, root mount
├── vite.config.js          # dev proxy → Django
└── src/
    ├── main.jsx            # router bootstrap
    ├── App.jsx             # routes + layout + scroll-to-top
    ├── styles.css          # design tokens + all screen styles
    ├── lib/
    │   ├── api.js          # fetch wrapper (token auth + file upload) over the DRF API
    │   ├── hooks.jsx       # useFetch + SettingsProvider/useSettings
    │   ├── auth.jsx        # AuthProvider/useAuth (token in localStorage)
    │   └── fallback.js     # static seed-mirror content
    ├── components/         # Header, Footer, Breadcrumb
    ├── pages/              # Home, Catalog, Catalogs, Product, Solution, About, Contacts
    └── admin/              # AdminApp, Login, AdminLayout, ImagesPage, CatalogsPage, ImageUploader
```
