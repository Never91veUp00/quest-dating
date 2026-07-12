# Руководство по установке

Как поднять Quest Dating локально для разработки, и краткий путь
первого деплоя. Регулярный рабочий процесс (ветки, PR, обновление
прода, откат) — в `docs/DEPLOY.md`.

## Требования

- **Node.js 22 LTS** (через nvm, не через apt — см. почему в `docs/incidents.md` INC-001)
- npm 9+
- PostgreSQL 15 (или поднять через Docker — см. ниже)
- Docker + Docker Compose plugin

```bash
# Node 22 через nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22 --lts
nvm use 22
```

---

## Вариант 1. Локальная разработка (без Docker для приложения)

Удобно для активной разработки — hot reload, быстрые перезапуски.
PostgreSQL при этом проще поднять в Docker, а server и client запускать
нативно.

```bash
git clone https://github.com/Never91veUp00/quest-dating.git
cd quest-dating
git checkout production        # основная ветка (не feature/nuxt3-migration!)

# Зависимости
cd server && npm install && cd ..
cd client-nuxt && npm install && cd ..
```

### База данных

Самый простой путь — поднять только Postgres-контейнер и применить
канонический dump:

```bash
# Поднять только postgres из docker-compose
docker compose up -d postgres

# При первом старте контейнера dump.sql применяется автоматически
# (bind-mount ./database/dump.sql → /docker-entrypoint-initdb.d/init.sql).
# Проверить, что схема и сиды на месте:
docker compose exec postgres psql -U quest_user -d quest_dating -c '\dt'
# Должно показать 9 таблиц

docker compose exec postgres psql -U quest_user -d quest_dating \
  -c 'SELECT count(*) FROM categories;'
# Должно: 7
```

> Если поднимаешь Postgres нативно (не в Docker), применить дамп вручную:
> ```bash
> createdb quest_dating
> psql -d quest_dating -f database/dump.sql
> ```
>
> Если Postgres в Docker, а psql запускаешь с хоста — порт **5433**
> (docker-compose пробрасывает 127.0.0.1:5433:5432):
> ```bash
> psql -h localhost -p 5433 -U quest_user -d quest_dating -f database/dump.sql
> ```

### Запуск приложения

```bash
# Terminal 1 — Express API
cd server && npm run dev        # http://localhost:5000

# Terminal 2 — Nuxt
cd client-nuxt && npm run dev   # http://localhost:3000
```

Nuxt devProxy сам проксирует `/api/*` → `localhost:5000/api`.

---

## Вариант 2. Полностью в Docker

Ближе к продакшену — все три сервиса (postgres, server, client) в контейнерах.

Создать `.env` в корне (для docker-compose):

```env
DB_NAME=quest_dating
DB_USER=quest_user
DB_PASSWORD=придумай_надёжный_пароль
JWT_SECRET=случайная_строка_64_символа
JWT_EXPIRES_IN=7d
```

```bash
docker compose up -d
docker compose ps               # все три healthy/running

# При первом старте postgres БД создаётся из database/dump.sql автоматически.
```

> **Развёртывание БД с нуля.** При первом старте на пустом volume
> Postgres применяет `database/dump.sql` (схема + сиды: 7 категорий,
> 23 тега, 7 шаблонов; без PII клиентов). На существующей БД mount
> игнорируется. Чтобы пересоздать с нуля локально:
> ```bash
> docker compose down -v        # ВНИМАНИЕ: -v удаляет данные!
> docker compose up -d
> ```
> Никогда не запускай `down -v` на проде.

---

## Переменные окружения

### server/.env

Полный актуальный список — в `server/.env.example` (копируй оттуда).
Ключевые:

```env
NODE_ENV=development
PORT=5000

# БД — localhost при нативном запуске, postgres при запуске server в Docker.
# ВАЖНО: docker-compose пробрасывает postgres на хост как 127.0.0.1:5433
# (не 5432!). Поэтому при нативном server + Postgres-в-Docker:
#   DB_HOST=localhost, DB_PORT=5433
# При полностью Docker-варианте (server тоже в контейнере):
#   DB_HOST=postgres, DB_PORT=5432 (внутри Docker-сети)
DB_HOST=localhost
DB_PORT=5433
DB_NAME=quest_dating
DB_USER=quest_user
DB_PASSWORD=your_password_here

# JWT — node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_random_secret
JWT_EXPIRES_IN=7d

# Admin (для входа в /admin) — пароль хранится bcrypt-хешем
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
# secret_token для верификации webhook (см. ниже регистрацию)
TELEGRAM_WEBHOOK_SECRET=

# Email (Resend) — обязательно для admin-уведомлений о заказах
RESEND_API_KEY=re_...
NOTIFY_EMAIL=admin@example.com
```

> `NOTIFY_EMAIL` — обязательная. Без неё email админу о новых заказах
> не отправляется (раньше был fallback на личный адрес — убран, см.
> `docs/audit.md` и PR #1).

> Опциональные `SMTP_*`, `UPLOADS_DIR`, `FRONTEND_URL` — закомментированы
> в `.env.example`, сейчас не используются.

> `RATE_LIMIT_*` переменных НЕТ — лимиты захардкожены в
> `server/src/middleware/rateLimiter.js` (см. `docs/API.md`).

---

## Первый деплой на VPS (кратко)

Полная пошаговая инструкция со всеми нюансами (nvm, SSL, nginx, cron,
webhook) — в **`docs/DEPLOY.md`**, раздел «Первичная установка».
Здесь — только общая канва:

1. VPS на VDSina, домен `questdating.ru` через рег.ру (A-запись на IP VPS).
2. Установить Docker + nginx (nginx на хосте, **не** в Docker).
3. `git clone ... /home/questdating && git checkout production`.
4. Создать `.env` (корень) и `server/.env` (по `.env.example`).
5. SSL — **Let's Encrypt через certbot** (НЕ из панели рег.ру).
6. Подключить `nginx/nginx.conf` в `/etc/nginx/sites-enabled/`.
7. `docker compose build --no-cache && docker compose up -d`.
8. Зарегистрировать Telegram webhook с `secret_token`:
   ```bash
   curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?\
   url=https://questdating.ru/api/telegram/webhook&\
   secret_token=${TELEGRAM_WEBHOOK_SECRET}&\
   drop_pending_updates=true"
   ```
9. Cron для `monitor.sh` (проверка `/health` каждые 5 мин).

> SSL, пути, ветка, процедура деплоя nginx-конфига и откат — всё
> подробно в `docs/DEPLOY.md`. Не дублируем здесь, чтобы не разошлось.

---

## Решение проблем (локальная разработка)

| Проблема | Решение |
|---------|---------|
| `Cannot connect to DB` | `docker compose ps postgres` — healthy? `DB_HOST` верный (localhost vs postgres)? |
| `/api/*` → 404 локально | Запущен ли `server` на :5000? Nuxt devProxy смотрит на localhost:5000 |
| `_payload.json 500` | `innerHTML` в `useServerHead` должен быть `() => JSON.stringify(...)`, см. `docs/DEVELOPMENT.md` |
| Hydration mismatch | Обернуть проблемный блок в `<ClientOnly>` |
| `Module not found` | `npm install` в `client-nuxt/` и `server/` |
| `EBADENGINE` warning | Node не 22? `nvm use 22` |
| Пустая БД после `up` | dump.sql применяется только на пустой volume. `docker compose down -v && up -d` пересоздаст (локально!) |