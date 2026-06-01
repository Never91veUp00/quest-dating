# Quest Dating

Персональный сервис романтических свиданий-квестов от Лизы Петри — [questdating.ru](https://questdating.ru)

Клиент выбирает сценарий, рассказывает о своей паре — Лиза создаёт персональный квест за 24 часа. Партнёр проходит его прямо в браузере: задания, подсказки, локации.

> **Основная ветка — `production`.** Вся разработка идёт через PR в неё;
> прямой push закрыт branch protection (требуются зелёные CI-проверки
> unit + integration). Прод деплоится с `production`.

---

## Стек

| Слой | Технологии |
|---|---|
| Frontend | Nuxt 4.x, Vue 3, `@nuxtjs/seo` 5.x, Vitest 4.x, Playwright |
| Backend | Node.js 22 LTS, Express, PostgreSQL 15, JWT |
| Инфраструктура | Docker Compose, Nginx, VPS на VDSina (vdsina.com) |
| Интеграции | Telegram Bot (уведомления + вебхук), Resend (email), DOMPurify (XSS) |

---

## Структура репозитория

```
quest-dating/
├── client-nuxt/          # Nuxt 4 — SSR/SSG/CSR фронтенд
├── server/               # Express API
├── database/             # SQL схема и миграции
├── nginx/                # nginx.conf для production
├── docs/                 # Документация
│   ├── SETUP.md          # Установка и запуск
│   ├── DEVELOPMENT.md    # Руководство разработчика
│   ├── TESTING.md        # Тестирование
│   └── API.md            # API документация
└── docker-compose.yml
```

---

## Быстрый старт

### Требования

- Node.js 22 LTS
- PostgreSQL 15
- Docker + Docker Compose (для контейнерного запуска)

### Локальная разработка

```bash
git clone git@github.com:Never91veUp00/quest-dating.git
cd quest-dating

# Backend
cd server && npm install
cp .env.example .env   # заполни DB_*, JWT_SECRET, TELEGRAM_*

# Frontend
cd ../client-nuxt && npm install

# Terminal 1
cd server && npm run dev        # Express :5000

# Terminal 2
cd client-nuxt && npm run dev   # Nuxt :3000
```

Открыть: http://localhost:3000

### Docker

```bash
# Создать .env в корне (см. раздел ниже)
docker compose up -d
```

Сервисы:

| Контейнер | Порт | Описание |
|---|---|---|
| `postgres` | 5432 | PostgreSQL |
| `server` | 5000 | Express API |
| `client` | 3000 | Nuxt 4 SSR |
| `nginx` | 80/443 | Обратный прокси |

---

## Переменные окружения

### server/.env

```env
NODE_ENV=production
PORT=5000

DB_HOST=postgres        # localhost в dev, postgres в Docker
DB_PORT=5432
DB_NAME=quest_dating
DB_USER=quest_user
DB_PASSWORD=            # задать

JWT_SECRET=             # минимум 32 символа
JWT_EXPIRES_IN=7d

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

RESEND_API_KEY=         # Resend.com — email клиентам
NOTIFY_EMAIL=           # куда приходят уведомления администратору

ALLOWED_ORIGINS=https://questdating.ru
MAX_FILE_SIZE=5242880
```

### client-nuxt/.env (production)

```env
NUXT_PUBLIC_API_BASE=https://questdating.ru/api
NUXT_API_BASE_INTERNAL=http://server:5000/api
```

---

## Деплой на VPS

```bash
cd /opt/quest-dating
git pull origin main

docker compose build client server
docker compose up -d

# Применить SEO-описания категорий (первый деплой)
docker compose exec postgres psql -U quest_user -d quest_dating \
  -f /docker-entrypoint-initdb.d/update_categories.sql

# Проверить
docker compose ps
docker compose logs -f --tail=50
```

SSL через Let's Encrypt (на хосте):
```bash
certbot certonly --standalone -d questdating.ru -d www.questdating.ru
# Сертификаты монтируются в nginx контейнер через nginx/ssl/
```

---

## Типы заданий в квестах

| Тип | Описание |
|---|---|
| `simple` | Текст — прочитать и идти дальше |
| `riddle` | Загадка с автопроверкой ответа |
| `text_answer` | Открытый вопрос без правильного ответа |
| `code_physical` | Собрать код из предметов вокруг |
| `location` | Найти конкретное место |
| `selfie` | Сделать селфи с условием |
| `photo` | Сфотографировать место или объект |
| `media` | Видео/аудио (Telegram или YouTube) |
| `qr` | Найти и отсканировать QR-код |
| `mini_game` | Угадайка, пары или пазл из фото |

---

## Документация

- [Установка и запуск](docs/SETUP.md)
- [Руководство разработчика](docs/DEVELOPMENT.md)
- [Архитектура](docs/ARCHITECTURE.md)
- [Тестирование](docs/TESTING.md)
- [API](docs/API.md)
- [Деплой на VPS](docs/DEPLOY.md)

---

## Контакты

Email: vp.vlad00@mail.ru · Telegram: [@vinatian00](https://t.me/vinatian00) · Сайт: [questdating.ru](https://questdating.ru)