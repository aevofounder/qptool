#!/usr/bin/env bash
# Разворачивает QP Tool на чистом Ubuntu-сервере.
# Предполагается, что проект уже лежит в /var/www/qptool, а backend/.env создан.
# Запуск от root:  bash /var/www/qptool/deploy/setup.sh
set -euo pipefail

# ============ параметры (поменяй под себя) ============
DOMAIN="qptool.ru"
APP_DIR="/var/www/qptool"
# =====================================================

echo ">>> [1/8] Обновление системы и базовые пакеты"
export DEBIAN_FRONTEND=noninteractive
apt update && apt -y upgrade
apt install -y nginx python3 python3-venv python3-pip git curl ufw

echo ">>> [2/8] Node.js 20 (для сборки фронтенда)"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v//;s/\..*//')" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

echo ">>> [3/8] Backend: виртуальное окружение + зависимости"
cd "$APP_DIR/backend"
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install --upgrade pip wheel
.venv/bin/pip install -r requirements.txt

if [ ! -f .env ]; then
  echo "!!! Нет $APP_DIR/backend/.env — создай его (см. deploy/env.production.example) и запусти скрипт снова."
  exit 1
fi

echo ">>> [4/8] Миграции БД + сбор статики Django"
.venv/bin/python manage.py migrate --noinput
.venv/bin/python manage.py collectstatic --noinput

echo ">>> [5/8] Frontend: установка и сборка"
cd "$APP_DIR/frontend"
npm ci
VITE_SITE_URL="https://$DOMAIN" npm run build

echo ">>> [6/8] Права доступа"
chown -R www-data:www-data "$APP_DIR"

echo ">>> [7/8] systemd-сервис Gunicorn"
cp "$APP_DIR/deploy/qptool.service" /etc/systemd/system/qptool.service
systemctl daemon-reload
systemctl enable qptool
systemctl restart qptool

echo ">>> [8/8] Nginx + firewall"
sed "s/__DOMAIN__/$DOMAIN/g" "$APP_DIR/deploy/nginx-qptool.conf" > /etc/nginx/sites-available/qptool
ln -sf /etc/nginx/sites-available/qptool /etc/nginx/sites-enabled/qptool
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true

echo ""
echo "============================================================"
echo " Готово. Проверь сайт: http://$DOMAIN  (или http://IP)"
echo ""
echo " Дальше:"
echo "  1) Создай админа:  cd $APP_DIR/backend && .venv/bin/python manage.py createsuperuser"
echo "  2) HTTPS:          apt install -y certbot python3-certbot-nginx && \\"
echo "                     certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "  3) После HTTPS:    в backend/.env поставь DJANGO_SECURE_SSL_REDIRECT=1,"
echo "                     затем: systemctl restart qptool"
echo "============================================================"
