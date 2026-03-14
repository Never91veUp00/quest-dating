# Руководство по установке

Пошаговое руководство по установке и запуску Quest Dating.

## Оглавление

- [Требования](#требования)
- [Локальная разработка](#локальная-разработка)
- [Docker (рекомендуется)](#docker-рекомендуется)
- [Переменные окружения](#переменные-окружения)
- [Production (Orange Pi / VPS)](#production)
- [Решение проблем](#решение-проблем)

---

## Требования

- **Node.js** 18+ (рекомендуется 20 LTS)
- **npm** 9+
- **PostgreSQL** 14+
- **Docker + Docker Compose** (для контейнерного запуска)

---

## Локальная разработка

### 1. Клонировать репозиторий

```bash
git clone git@github.com:Never91veUp00/quest-dating.git
cd quest-dating
git checkout feature/nuxt3-migration
```

### 2. Установить зависимости

```bash
# Backend
cd server && npm install && cd ..

# Frontend (Nuxt 4)
cd client-nuxt && npm install && cd ..
```

### 3. Настроить базу данных

```bash
# Создать БД
createdb quest_dating

# Применить схему
psql -d quest_dating -f database/schema.sql

# Сиды (тестовые данные)
psql -d quest_dating -f database/seeds.sql
```

### 4. Настроить переменные окружения

```bash
# Backend
cp server/.env.example server/.env
# Отредактируй server/.env (см. раздел ниже)

# Frontend (опционально — по умолчанию работает без .env в dev)
# client-nuxt/.env.local создаётся при необходимости
```

### 5. Запустить сервисы

```bash
# Terminal 1 — Backend (порт 5000)
cd server && npm run dev

# Terminal 2 — Frontend Nuxt 4 (порт 3000)
cd client-nuxt && npm run dev
```

Открыть: http://localhost:3000

---

## Docker (рекомендуется)

```bash
# Запустить все сервисы
docker-compose up -d

# Посмотреть логи
docker-compose logs -f

# Остановить
docker-compose down
```

Сервисы:
- `postgres` — PostgreSQL (порт 5432)
- `server` — Express API (порт 5000)
- `client` — Nuxt 4 (порт 3000)

### Первый запуск с Docker

```bash
# Дождаться старта postgres, затем применить схему
docker-compose exec server npm run db:init
```

---

## Переменные окружения

### server/.env

```env
NODE_ENV=development
PORT=5000

# PostgreSQL
DB_HOST=localhost       # в Docker: postgres
DB_PORT=5432
DB_NAME=quest_dating
DB_USER=quest_user
DB_PASSWORD=quest_password

# JWT
JWT_SECRET=минимум-32-символа-замени-в-production
JWT_EXPIRES_IN=7d

# Telegram бот (уведомления о заказах)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Uploads
MAX_FILE_SIZE=5242880
```

### client-nuxt/.env.local (dev, опционально)

```env
# По умолчанию в dev: apiBase = '/api' через Nuxt devProxy
# Менять только если бэкенд на нестандартном порту
NUXT_PUBLIC_API_BASE=http://localhost:5000/api

# Только если Nuxt запущен в Docker и обращается к серверу напрямую
NUXT_API_BASE_INTERNAL=http://server:5000/api
```

### client-nuxt/.env (production)

```env
NUXT_PUBLIC_API_BASE=https://questdating.ru/api
NUXT_API_BASE_INTERNAL=http://server:5000/api
```

---

## Production

Сервер — Orange Pi 5 Pro, Ubuntu, Docker Compose.

### Деплой

```bash
# На сервере
cd /opt/quest-dating
git pull origin feature/nuxt3-migration

# Пересобрать и перезапустить изменённые сервисы
docker-compose build client server
docker-compose up -d client server

# Проверить
docker-compose ps
docker-compose logs -f --tail=50
```

### Nginx (обратный прокси)

```nginx
server {
    server_name questdating.ru www.questdating.ru;

    # Nuxt 4 SSR
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Загруженные файлы (статика с сервера)
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

SSL через Let's Encrypt: `certbot --nginx -d questdating.ru -d www.questdating.ru`

---

## Решение проблем

### `Cannot connect to database`
```bash
# Проверить статус
pg_isready -h localhost -p 5432

# Проверить параметры подключения
cat server/.env | grep DB_
```

### `Port 3000 already in use`
```bash
# Найти и убить процесс
lsof -i :3000
kill -9 <PID>
```

### `[NuxtLink] You can't nest one <a> inside another <a>`
Это предупреждение о вложенных ссылках. В `TemplateCard.vue` внешний элемент — `<article>` с `@click`, внутри — отдельные `<NuxtLink>`. Если видишь это предупреждение в другом компоненте — замени внешний `<NuxtLink>` на семантический HTML-элемент с `useRouter().push()`.

### `429 Too Many Requests` при тестах
Rate limiter срабатывает на повторных тестовых запросах. В dev-режиме запросы с localhost автоматически пропускаются (см. `rateLimiter.js`). Если проблема сохраняется — перезапусти сервер.

### Nuxt devProxy не работает
После изменения `nuxt.config.ts` обязательно перезапустить dev-сервер (`npm run dev`). devProxy применяется только при старте.

### `hydration mismatch` в консоли
Обычно вызвано контентом зависящим от клиента (дата, localStorage). Оберни в `<ClientOnly>` или используй `onMounted`.

### Module not found после `git pull`
```bash
cd client-nuxt && npm install
cd ../server && npm install
```