"""
Django settings for the QP Tool backend.

Reads configuration from environment variables (see .env.example).
Defaults are tuned for local development with SQLite; production runs on
PostgreSQL by setting DATABASE_URL / POSTGRES_* and DJANGO_DEBUG=0.
"""

from pathlib import Path
import os

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from the backend root if present.
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default=None):
    val = os.environ.get(name)
    if not val:
        return default or []
    return [item.strip() for item in val.split(",") if item.strip()]


# --------------------------------------------------------------------------- #
# Core
# --------------------------------------------------------------------------- #
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-dev-only-key-change-me-in-production",
)

DEBUG = env_bool("DJANGO_DEBUG", default=True)

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS", default=[])


# --------------------------------------------------------------------------- #
# Applications
# --------------------------------------------------------------------------- #
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sitemaps",
    # Third party
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "corsheaders",
    # Local
    "siteconfig",
    "catalog",
    "content",
    "leads",
    "catalogs",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# --------------------------------------------------------------------------- #
# Database — SQLite by default, PostgreSQL when POSTGRES_DB is configured.
# --------------------------------------------------------------------------- #
if os.environ.get("POSTGRES_DB"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ["POSTGRES_DB"],
            "USER": os.environ.get("POSTGRES_USER", "postgres"),
            "PASSWORD": os.environ.get("POSTGRES_PASSWORD", ""),
            "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
            "PORT": os.environ.get("POSTGRES_PORT", "5432"),
            "CONN_MAX_AGE": int(os.environ.get("DB_CONN_MAX_AGE", "60")),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# --------------------------------------------------------------------------- #
# Auth
# --------------------------------------------------------------------------- #
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# --------------------------------------------------------------------------- #
# Internationalization — the site is Russian-language.
# --------------------------------------------------------------------------- #
LANGUAGE_CODE = os.environ.get("DJANGO_LANGUAGE_CODE", "ru-ru")
TIME_ZONE = os.environ.get("DJANGO_TIME_ZONE", "Asia/Yekaterinburg")
USE_I18N = True
USE_TZ = True


# --------------------------------------------------------------------------- #
# Static & media
# --------------------------------------------------------------------------- #
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# WhiteNoise — отдаём статику Django (в т.ч. админку) прямо приложением, со
# сжатием и кэш-хешированием, без отдельного веб-сервера. Подключаем, только
# если пакет установлен, чтобы не ломать окружения без него.
try:
    import whitenoise  # noqa: F401

    # Сразу после SecurityMiddleware, до остальных.
    MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
    if not DEBUG:
        STORAGES = {
            "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
            "staticfiles": {
                "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
            },
        }
except ImportError:
    pass


# --------------------------------------------------------------------------- #
# Django REST Framework
# --------------------------------------------------------------------------- #
REST_FRAMEWORK = {
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.MultiPartParser",
        "rest_framework.parsers.FormParser",
    ],
    # Rate limits — the public lead endpoint is the only anonymous write path,
    # so cap how often a single client can submit to blunt spam/abuse.
    "DEFAULT_THROTTLE_RATES": {
        "leads": os.environ.get("DJANGO_LEADS_THROTTLE", "20/hour"),
    },
}


# --------------------------------------------------------------------------- #
# CORS — allow the frontend origin(s) to call the API.
# --------------------------------------------------------------------------- #
CORS_ALLOWED_ORIGINS = env_list("DJANGO_CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_ALL_ORIGINS = env_bool("DJANGO_CORS_ALLOW_ALL", default=DEBUG)


# --------------------------------------------------------------------------- #
# Security — базовые заголовки применяются всегда; жёсткие HTTPS-настройки
# включаются только в продакшене (DEBUG=0), чтобы не мешать локальной разработке.
# --------------------------------------------------------------------------- #
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
# SAMEORIGIN (а не DENY): защищает от кликджекинга с чужих сайтов, но позволяет
# нашему сайту показывать свои же файлы (PDF-каталоги) во встроенном iframe.
X_FRAME_OPTIONS = "SAMEORIGIN"
# W019 предупреждает, что X_FRAME_OPTIONS не DENY — это осознанное решение
# (просмотр PDF-каталогов в iframe), поэтому проверку глушим.
SILENCED_SYSTEM_CHECKS = ["security.W019"]

if not DEBUG:
    # Не даём случайно уехать в прод с дефолтным небезопасным ключом.
    if SECRET_KEY.startswith("django-insecure"):
        raise ImproperlyConfigured(
            "DJANGO_SECRET_KEY должен быть задан надёжным значением в продакшене."
        )

    # За обратным прокси (nginx/traefik) доверяем заголовку протокола.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", default=True)

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True

    # HSTS — год, с поддоменами и preload (переопределяется через env).
    SECURE_HSTS_SECONDS = int(os.environ.get("DJANGO_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True


# --------------------------------------------------------------------------- #
# Admin branding
# --------------------------------------------------------------------------- #
ADMIN_SITE_HEADER = "QP Tool — администрирование"
ADMIN_SITE_TITLE = "QP Tool"
ADMIN_INDEX_TITLE = "Управление сайтом"
