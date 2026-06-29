# QP Tool — Backend & Admin

Backend for the QP Tool (КуПиТул) B2B metalworking-tools site: a Django + DRF
REST API plus a full Django admin panel for managing the catalog, articles,
leads and editable site content.

- **Stack:** Django 5.1 · Django REST Framework · django-filter · CORS headers · Pillow
- **Database:** SQLite for local dev, PostgreSQL for production (auto-selected via env)
- **Scope:** backend + admin only (the exported HTML designs are a separate frontend
  that can consume this API later)

## Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env            # adjust if needed (SQLite works out of the box)

python manage.py migrate
python manage.py seed_demo      # loads the catalog/articles/settings from the design
python manage.py createsuperuser
python manage.py runserver
```

- Admin panel: http://127.0.0.1:8000/admin/
- Browsable API: http://127.0.0.1:8000/api/

## Admin panel

Manages everything the design surfaces:

| Раздел | Что внутри |
|--------|-----------|
| **Каталог** | Товары (артикул, бренд, материал, наличие, характеристики-инлайн, фото-инлайн), Категории, Производители |
| **Статьи** | «Полезные материалы» — статьи с обложкой, рубрикой, датой; рубрики |
| **Каталоги (файлы)** | PDF-каталоги/прайсы: файл, обложка, описание, порядок, публикация |
| **Заявки** | Лиды с форм (имя, телефон, e-mail, источник, статус). Добавляются только через API; в админке — просмотр, смена статуса, фильтры |
| **Настройки сайта** | Контакты/адрес/график (синглтон), слайды hero, логотипы клиентов, преимущества, блоки контента страниц |

Помимо Django-админки (`/admin/`) есть **собственная панель на сайте** (`/manage`
на фронтенде) для замены картинок с предпросмотром и управления файлами-каталогами
— см. `../frontend/README.md`.

Admin niceties: inline specs & images on products, list filters, search,
`list_editable` toggles, bulk actions (publish/unpublish, lead statuses),
date hierarchies, autocomplete and image previews.

## API

Public reads (`GET`) are open; writes require auth except lead submission.

| Endpoint | Назначение |
|----------|-----------|
| `GET /api/categories/` | Категории + число товаров |
| `GET /api/products/` | Каталог. Фильтры: `?category__slug=`, `?brand__slug=`, `?availability=`, `?is_featured=`; `?search=`; `?ordering=` |
| `GET /api/products/{slug}/` | Карточка товара (характеристики, фото, бренд) |
| `GET /api/articles/` · `…/{slug}/` | Статьи |
| `GET /api/hero-slides/` · `/advantages/` · `/client-logos/` · `/page-content/` | Контент главной/страниц |
| `GET /api/catalogs/` | PDF-каталоги (публично — только опубликованные) |
| `GET /api/settings/` · `PATCH` | Глобальные контакты/настройки (PATCH — по токену) |
| `POST /api/leads/` | Приём заявок с форм (требует `consent: true`) |

**Авторизация и запись** (для своей админ-панели):

| Endpoint | Назначение |
|----------|-----------|
| `POST /api/auth/token/` | Логин: `{username, password}` → `{token}` |
| `GET /api/auth/me/` | Текущий пользователь (проверка токена) |
| `PATCH /api/hero-slides/{id}/` · `/client-logos/{id}/` · `/articles/{slug}/` | Загрузка картинок (multipart, по токену) |
| `POST/DELETE /api/product-images/` | Фото товаров (по токену) |
| `POST/PATCH/DELETE /api/catalogs/` | Управление файлами-каталогами (по токену) |

Запись требует заголовок `Authorization: Token <token>`. Чтение — открыто.
Pagination: `?page=` (12 per page). Browse interactively at `/api/`.

### Example: submit a lead

```bash
curl -X POST http://127.0.0.1:8000/api/leads/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Иван","phone":"+7 900 000-00-00","source":"consultation","consent":true}'
```

## Production (PostgreSQL)

Set these in `.env` and the app switches from SQLite to PostgreSQL automatically:

```env
DJANGO_DEBUG=0
DJANGO_SECRET_KEY=<long-random-string>
DJANGO_ALLOWED_HOSTS=your-domain.ru
POSTGRES_DB=qptool
POSTGRES_USER=qptool
POSTGRES_PASSWORD=<secret>
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Then run `python manage.py migrate` and `python manage.py collectstatic`.

## Project layout

```
backend/
├── config/          # settings, root urls, api router
├── catalog/         # Brand, Category, Product, ProductSpec, ProductImage + seed_demo
├── content/         # ArticleCategory, Article
├── leads/           # Lead (public create, admin manage)
└── siteconfig/      # SiteSettings (singleton), HeroSlide, ClientLogo, Advantage, PageContent
```
