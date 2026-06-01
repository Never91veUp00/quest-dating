# Архитектура проекта

Quest Dating — сервис персональных романтических свиданий-квестов от Лизы Петри (questdating.ru). Архитектура построена под SEO-трафик через Nuxt 4 SSR.

## Оглавление

- [Общий обзор](#общий-обзор)
- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [Frontend архитектура (Nuxt 4)](#frontend-архитектура-nuxt-4)
- [Backend архитектура](#backend-архитектура)
- [База данных](#база-данных)
- [SEO архитектура](#seo-архитектура)
- [Безопасность](#безопасность)

---

## Общий обзор

```
┌─────────────────────────────────────────┐
│           Браузер (Client)              │
└───────────────┬─────────────────────────┘
                │ HTTPS (443)
                ▼
┌─────────────────────────────────────────┐
│         Nginx (host, не Docker)         │
│  questdating.ru → Nuxt 4 (port 3000)    │
│  /uploads       → volume (напрямую)     │
└───────┬─────────────────────────────────┘
        │
        ▼
┌──────────────┐     ┌────────────────┐
│   Nuxt 4     │────►│  Express API   │
│  SSR+CSR     │     │  (port 5000)  │
│  (port 3000) │     └───────┬────────┘
└──────────────┘             │
                             ▼
                      ┌──────────────┐
                      │  PostgreSQL  │
                      │  (port 5432) │
                      └──────────────┘
```

### Инфраструктура

VPS на VDSina (vdsina.com), домен `questdating.ru` зарегистрирован на рег.ру и указывает A-записями на IP VPS. Развёрнуто через Docker Compose — **3 контейнера**: `postgres`, `server`, `client`. **Nginx** работает на хосте как обычный systemd-сервис (не в Docker) и проксирует HTTPS-трафик в контейнер `client` на `127.0.0.1:3000`. Telegram-бот: уведомления администратору + вебхук для клиентов (по ссылке из письма). Resend — email клиентам при оформлении заказа.

---

## Технологический стек

### Frontend (client-nuxt/)

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Nuxt | 4.3+ | SSR/CSR фреймворк |
| Vue | 3.5+ | UI Framework |
| Pinia | 2.x | State Management (auth) |
| @nuxtjs/seo | 5.x | sitemap, robots, og-tags |
| Playwright | 1.44+ | E2E тесты |
| Vitest | 4.x | Unit тесты |

### Backend (server/)

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Node.js | 22 LTS | Runtime (Docker `node:22-alpine`, хост — nvm 22) |
| Express | 4.18+ | Web Framework |
| PostgreSQL | 15 | База данных |
| pg | 8.11+ | PostgreSQL драйвер |
| JWT | 9.0+ | Аутентификация |
| express-rate-limit | latest | Rate limiting |
| DOMPurify | latest | XSS защита |

---

## Структура проекта

```
quest-dating/
├── client-nuxt/                 # Frontend (Nuxt 4)
│   ├── app/
│   │   ├── app.vue              # Root — isFullscreen для quest player
│   │   ├── error.vue            # Страница ошибок (404, 500)
│   │   ├── pages/
│   │   │   ├── index.vue        # / (SSR + SWR 300s)
│   │   │   ├── catalog.vue      # /catalog (SSR + SWR 300s)
│   │   │   ├── about.vue        # /about (SSR + SWR 3600s)
│   │   │   ├── date/[slug].vue  # /date/:slug (SSR + SWR 600s)
│   │   │   ├── categories/[slug].vue  # /categories/:slug (SSR)
│   │   │   ├── blog/            # /blog, /blog/:slug (SSR + SWR 3600s)
│   │   │   ├── order/[templateSlug].vue  # /order/:slug (CSR)
│   │   │   ├── my-order/[token].vue      # /my-order/:token (CSR, noindex)
│   │   │   ├── quest/[slug].vue          # /quest/:slug (CSR)
│   │   │   └── admin/           # /admin/** (CSR)
│   │   ├── components/
│   │   │   ├── common/          # Header, Footer, Loader, Toast, StickyCTA
│   │   │   ├── marketplace/     # TemplateCard, MagazineGrid, OccasionFilters, LizaPick
│   │   │   ├── template/        # TemplateAuthor, TemplateReviews, SimilarTemplates
│   │   │   ├── order/           # OrderForm (3 шага)
│   │   │   └── quest/           # QuestSplash, QuestBlock, QuestTimer...
│   │   ├── composables/
│   │   │   ├── useApi.js        # Все API вызовы (useDatesApi, useAdminApi)
│   │   │   ├── useFilters.js    # Фильтры каталога
│   │   │   ├── useQuestEditor.js    # Редактор квестов (блоки, шаблоны, applyTemplate)
│   │   │   └── useImageFallback.js  # Fallback для изображений
│   │   ├── stores/
│   │   │   └── auth.js          # JWT через useCookie
│   │   └── data/
│   │       └── blogPosts.js     # Статические статьи блога
│   ├── server/
│   │   └── routes/
│   │       ├── sitemap-urls.get.ts  # Динамические URL для sitemap (Nitro route /sitemap-urls)
│   │       └── uploads/[...path].js # Nitro proxy /uploads → Express
│   └── nuxt.config.ts
│
├── server/                      # Backend (Express)
│   └── src/
│       ├── app.js
│       ├── routes/
│       │   ├── api.js           # Подключение всех роутов
│       │   ├── templates.js     # /templates/**
│       │   ├── categories.js    # /categories
│       │   ├── orders.js        # /orders
│       │   ├── quests.js        # /quests/**
│       │   ├── reviews.js       # /reviews
│       │   ├── admin.js         # /admin/** (все админ-эндпоинты)
│       │   └── auth.js          # /auth
│       ├── controllers/
│       ├── middleware/
│       │   ├── rateLimiter.js
│       │   ├── auth.js          # JWT requireAdmin
│       │   └── sanitize.js      # DOMPurify
│       ├── services/
│       │   ├── notificationService.js  # Email (Resend) + Telegram уведомления
│       │   └── statsService.js
│       └── config/
│           └── database.js      # pg pool
│
├── database/                    # SQL миграции и схема
├── nginx/                       # nginx.conf (серты — Let's Encrypt в /etc/letsencrypt/)
├── docs/                        # Документация
└── docker-compose.yml
```

---

## Frontend архитектура (Nuxt 4)

### Стратегии рендеринга (routeRules)

```
/                → SSR + SWR 300s    (главная)
/catalog         → SSR + SWR 300s    (каталог)
/date/**         → SSR + SWR 600s    (страницы квестов — приоритет SEO)
/categories/**   → SSR               (категории)
/about           → SSR + SWR 3600s
/blog/**         → SSR + SWR 3600s
/terms, /privacy → SSR
/order/**        → CSR               (форма заказа)
/my-order/**     → CSR               (страница отслеживания заказа, noindex)
/quest/**        → CSR               (quest player)
/admin/**        → CSR               (защищённая зона)
```

### 301-редиректы

```
/templates    → /catalog
/template/**  → /date/**
/authors      → /about
```

### API слой (useApi.js)

`apiBase` зависит от контекста выполнения:
- **SSR:** `NUXT_API_BASE_INTERNAL` → `http://server:5000/api` (Docker internal)
- **CSR:** `NUXT_PUBLIC_API_BASE` → `/api` → Nginx проксирует на Express

### Аутентификация

JWT хранится в `useCookie('auth_token')` — SSR-совместимо. `localStorage` не используется.

### Quest Player

`app.vue` скрывает Header/Footer при маршруте `/quest/**` через `isFullscreen` computed.

---

## Backend архитектура

### Все админ-эндпоинты — в admin.js

В отличие от старой архитектуры, все `/admin/*` роуты объединены в `routes/admin.js` (не разбросаны по файлам). Это включает: orders, quests, templates, categories, upload.

### Rate Limiting

```
generalLimiter  → /api/*      → 300 req/15min (prod)
orderLimiter    → /orders     → 5 req/hour
contactLimiter  → /contact    → 3 req/hour
loginLimiter    → /auth/login → 5 попыток/15min
```

Dev-режим: запросы с `localhost` не ограничиваются (`skipLocalhost`).

### Express route ordering

Специфичные роуты объявляются **до** параметрических:
```javascript
router.get('/featured', ...)  // ← сначала
router.get('/all', ...)       // ← сначала
router.get('/:id', ...)       // ← потом
```

---

## База данных

### Основные таблицы

**quest_templates** — сценарии квестов (`slug`, `title`, `base_price` в копейках, `category_id`, `difficulty`, `features[]`, `structure{}`, `orders_count`, `status`, `default_theme`, `default_player_version`, `default_show_intro`)

**created_quests** — квесты созданные по заказу (`slug`, `template_id`, `client_name`, `access_code`, `blocks[]`, `is_public`)

**orders** — заказы (`template_id`, `client_name`, `client_email`, `status`, `total_price`, `description`, `view_token` UUID — публичный токен для страницы отслеживания)

**categories** — категории (`name`, `slug`, `description`, `icon`, `color`)

**tags** / **template_tags** — теги и связи с квестами

**authors** — авторы (единственный: Лиза Петри)

**quest_sessions** — сессии прохождения

**reviews** — отзывы (`template_id`, `rating`, `client_name`, `comment`)

### Важные нюансы

- `base_price` хранится в **копейках** — делить на 100 при отображении
- `COUNT()` возвращает строку — всегда `parseInt()`
- Массивы параметров: `ANY($1::int[])`

---

## SEO архитектура

### JSON-LD схемы

| Страница | Схемы |
|----------|-------|
| `/` | `Organization` + `FAQPage` |
| `/date/:slug` | `Product` + `BreadcrumbList` + `FAQPage` |
| `/catalog` | `ItemList` |
| `/categories/:slug` | `BreadcrumbList` |
| `/about` | `Person` |

**Правило:** все `useServerHead` с JSON-LD используют `innerHTML: () => JSON.stringify(...)` (геттер-функция), не прямой `JSON.stringify`. Это предотвращает ошибку devalue сериализатора при prefetch `_payload.json`.

### Sitemap

Динамический через `@nuxtjs/seo`. Источник динамических URL: `client-nuxt/server/routes/sitemap-urls.get.ts` (Nitro route `/sitemap-urls`) — запрашивает Express API и возвращает все `/date/:slug` и `/categories/:slug`.

### og:image

`/public/og-image.jpg` (1200×630) — брендированное изображение для шаринга. Страницы квестов используют `cover_image` квеста если есть.

---

## Безопасность

- **JWT:** `useCookie` (httpOnly), передаётся в `Authorization: Bearer`
- **SQL:** параметризованные запросы (`$1, $2, ...`)
- **XSS:** DOMPurify на сервере
- **Access codes:** только в теле POST, никогда в URL
- **Rate limiting:** многоуровневый
- **Uploads:** сохраняются в Docker volume, отдаются через Nginx напрямую
- **Telegram webhook:** проверка заголовка `X-Telegram-Bot-Api-Secret-Token` против `TELEGRAM_WEBHOOK_SECRET` из env. При несовпадении — 401. Если переменная не задана — пропуск проверки + warning в логе (backward compatibility).

## Health & мониторинг

`GET /health` — реально проверяет БД через `pool.query('SELECT 1')`:
- БД отвечает → `200 OK`, тело `{ status: "OK", db: "connected", uptime }`
- БД не отвечает → `503`, тело `{ status: "DEGRADED", db: "disconnected", error }`

Заголовок `Cache-Control: no-store`. Endpoint вызывается напрямую на backend (`127.0.0.1:5001/health`), минуя nginx, Nuxt-прокси и in-memory кэш в `cache.js` — это даёт настоящий сигнал о состоянии системы.

`monitor.sh` (на хосте, в cron) бьёт `127.0.0.1:5001/health`, парсит JSON, шлёт Telegram-алерт с конкретной причиной (главная упала, health не отвечает, или `db:disconnected`).

История появления этих защит — см. `docs/incidents.md` (INC-001).

---

## Уведомления о заказах

При создании заказа (`POST /orders`) отправляются **два потока уведомлений**:

### Администратору
- Telegram-сообщение в чат (`TELEGRAM_CHAT_ID`) с деталями заказа
- Email на `NOTIFY_EMAIL` через Resend

> `NOTIFY_EMAIL` — **обязательная** переменная. Если не задана, email админу не отправляется (раньше был fallback на личный адрес `vp.vlad00@mail.ru` — убран в рамках Фазы 1).

### Клиенту
- Email на `client_email` с деталями, ссылкой `/my-order/<view_token>` и кнопкой Telegram-бота
- Telegram: клиент переходит по ссылке `t.me/questdating_bot?start=<view_token>` из письма → бот присылает детали заказа в чат

### Страница отслеживания `/my-order/[token]`
Публичная CSR-страница. Данные загружаются через `GET /api/orders/by-token/:token`.
Показывает: статус, шаблон, дату, город, сумму, email, дополнения, кнопку Telegram-бота.
Не индексируется (`robots: noindex,nofollow` + исключена из sitemap).

### Telegram Webhook
`POST /api/telegram/webhook` — зарегистрирован через `setWebhook` с параметром `secret_token`. Каждый запрос проверяется на наличие заголовка `X-Telegram-Bot-Api-Secret-Token` равного `TELEGRAM_WEBHOOK_SECRET`; при несовпадении — `401`.

Обрабатывает команду `/start <view_token>`: находит заказ по токену, отправляет сводку в чат клиента. Всегда отвечает HTTP 200 немедленно (требование Telegram API), обработка идёт асинхронно.