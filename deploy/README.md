# Деплой QP Tool на VDS (Ubuntu)

Ставим на чистый сервер. Архитектура:

```
        Интернет
           │  https://qptool.ru
        ┌──▼───────── Nginx ─────────────────────────┐
        │  /            → фронтенд (React, dist/)     │
        │  /api, /admin → Gunicorn (Django) :8001     │
        │  /media       → загруженные файлы с диска    │
        └────────────────────────────────────────────┘
```

- **Nginx** — веб-сервер: отдаёт сайт и проксирует API.
- **Gunicorn + systemd** — держит Django запущенным и перезапускает при сбоях.
- **SQLite** — база (простая и надёжная для такого сайта; данные переносим со
  своего компьютера).

Всё на одном домене, поэтому HTTPS и данные работают из коробки.

---

## Шаг 0. Домен (DNS)

В панели, где куплен домен `qptool.ru`, создай **A-запись**:

```
@     A     80.87.110.199
www   A     80.87.110.199
```

Обновление DNS занимает от минут до пары часов. Можно начинать ставить сервер
сразу — HTTPS подключим, когда домен «доедет».

## Шаг 1. Подключиться к серверу

На Mac в терминале (или через кнопку «Терминал» в панели NetAngels):

```bash
ssh root@80.87.110.199
```

Введи пароль root (он в панели / письме от NetAngels).

## Шаг 2. Стереть старый сайт

> Убедись, что со старого сайта ничего не нужно. Если нужно — сначала скачай.

```bash
systemctl stop nginx 2>/dev/null || true
rm -rf /var/www/*                 # старые файлы сайтов
rm -f /etc/nginx/sites-enabled/*  # старые конфиги nginx
mkdir -p /var/www/qptool
```

## Шаг 3. Загрузить проект на сервер

Возьми присланный `qptool-project.zip`. Два способа:

**A. Через файловый менеджер NetAngels** — загрузи zip в `/var/www/qptool`,
распакуй прямо там (кнопкой в файловом менеджере). Внутри должны оказаться
папки `backend/`, `frontend/`, `deploy/`.

**B. Через терминал (scp с Mac).** В НОВОМ окне терминала на Mac:

```bash
scp ~/Downloads/qptool-project.zip root@80.87.110.199:/var/www/qptool/
```

Затем на сервере:

```bash
cd /var/www/qptool
apt install -y unzip
unzip -o qptool-project.zip
# архив распакуется в подпапку qptool/ — поднимем содержимое на уровень выше:
cp -rn qptool/* . && rm -rf qptool qptool-project.zip
ls   # проверь: должны быть backend, frontend, deploy
```

## Шаг 4. Перенести свои товары и фото

Твои данные (товары в `db.sqlite3`, фото в `media/`) — на компьютере, где ты
работал локально. Загрузи их в `backend/` на сервере.

С Mac (в терминале):

```bash
scp ~/Downloads/qptoolsitev2/backend/db.sqlite3 root@80.87.110.199:/var/www/qptool/backend/
scp -r ~/Downloads/qptoolsitev2/backend/media   root@80.87.110.199:/var/www/qptool/backend/
```

(если данных пока нет — пропусти шаг, каталог наполнишь потом через админку;
демо-данные можно залить командой `manage.py seed_demo`.)

## Шаг 5. Создать .env

На сервере:

```bash
cd /var/www/qptool/backend
cp ../deploy/env.production.example .env
python3 -c "import secrets; print(secrets.token_urlsafe(64))"   # скопируй вывод
nano .env
```

В `nano` вставь сгенерированный ключ в `DJANGO_SECRET_KEY`, проверь домен/IP.
Сохрани: `Ctrl+O`, `Enter`, выйди: `Ctrl+X`.

## Шаг 6. Запустить автоустановку

Скрипт установит пакеты, соберёт фронтенд, настроит Gunicorn и Nginx:

```bash
# при необходимости поправь домен в первой строке параметров:
nano /var/www/qptool/deploy/setup.sh
bash /var/www/qptool/deploy/setup.sh
```

По окончании открой в браузере **http://qptool.ru** (или `http://80.87.110.199`).

## Шаг 7. Админ + HTTPS

```bash
# 1) администратор для входа в /admin и /manage:
cd /var/www/qptool/backend && .venv/bin/python manage.py createsuperuser

# 2) бесплатный SSL-сертификат (после того как домен «доехал»):
apt install -y certbot python3-certbot-nginx
certbot --nginx -d qptool.ru -d www.qptool.ru

# 3) включить принудительный HTTPS:
nano /var/www/qptool/backend/.env      # DJANGO_SECURE_SSL_REDIRECT=1
systemctl restart qptool
```

Готово — сайт на `https://qptool.ru`.

---

## Как обновлять сайт потом

Загрузил новую версию файлов в `/var/www/qptool` (тем же способом), затем:

```bash
cd /var/www/qptool/backend && .venv/bin/python manage.py migrate --noinput
.venv/bin/python manage.py collectstatic --noinput
cd /var/www/qptool/frontend && npm ci && VITE_SITE_URL="https://qptool.ru" npm run build
chown -R www-data:www-data /var/www/qptool
systemctl restart qptool && systemctl reload nginx
```

## Если что-то не работает

```bash
systemctl status qptool          # статус Django-сервиса
journalctl -u qptool -n 50       # логи Django (последние 50 строк)
nginx -t                         # проверка конфига nginx
tail -n 50 /var/log/nginx/error.log
```

Пришли вывод этих команд — помогу разобраться.

## Резервные копии

У тебя в панели включён бэкап диска (108 ₽/мес) — это уже страховка всего
сервера. Дополнительно данные сайта — это всего два объекта:
`backend/db.sqlite3` и папка `backend/media/`. Их периодически стоит скачивать
себе на компьютер.
