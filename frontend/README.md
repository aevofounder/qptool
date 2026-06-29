# QP Tool — Frontend (Variant 1 «Чистая сетка»)

React + Vite SPA that implements the **QP Tool 1 - Clean** design from the
Claude Design export, wired to the Django REST API in `../backend`.

- **Stack:** React 18 · Vite 5 · React Router 6
- **Fonts:** Archivo / Archivo Expanded · Manrope · JetBrains Mono (Google Fonts)
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

For production, set `VITE_API_BASE` to the API origin (e.g. `https://api.qptool.ru/api`)
in `.env` before building — see `.env.example`.

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
