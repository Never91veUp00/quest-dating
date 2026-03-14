# Архитектура проекта

Документация по архитектуре Quest Dating платформы.

## Оглавление

- [Общий обзор](#общий-обзор)
- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [Frontend архитектура (Nuxt 4)](#frontend-архитектура-nuxt-4)
- [Backend архитектура](#backend-архитектура)
- [База данных](#база-данных)
- [Рендеринг и SEO](#рендеринг-и-seo)
- [Безопасность](#безопасность)

---

## Общий обзор

Quest Dating — сервис персональных романтических квестов от Лизы Петри (бренд questdating.ru). Архитектура построена под SEO-трафик и персональный сервис без мультивендора.

```
┌─────────────────────────────────────────┐
│           Браузер (Client)              │
└───────────────┬─────────────────────────┘
                │ HTTP/HTTPS
                ▼
┌─────────────────────────────────────────┐
│              Nginx                       │
│  questdating.ru → Nuxt 4 (port 3000)   │
│  /uploads      → Express (port 5000)   │
└───────┬───────────────────┬─────────────┘
        │                   │
        ▼                   ▼
┌──────────────┐   ┌────────────────┐
│   Nuxt 4     │   │  Express API   │
│  SSR+SSG+CSR │   │  (port 5000)  │
│  (port 3000) │   └───────┬────────┘
└──────┬───────┘           │
       │ SSR: internal     ▼
       │ $fetch      ┌──────────────┐
       └────────────►│  PostgreSQL  │
                     └──────────────┘
```

### Инфраструктура

Сервер — Orange Pi 5 Pro, развёрнуто через Docker Compose. Telegram-бот для уведомлений о новых заказах.

---

## Технологический стек

### Frontend (client-nuxt/)

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Nuxt | 4.x | SSR/SSG/CSR фреймворк |
| Vue | 3.4+ | UI Framework |
| Pinia | 2.x | State Management |
| @nuxtjs/seo | latest | sitemap, robots, og-tags |
| Playwright | 1.44+ | E2E тесты |
| Vitest | 2.x | Unit тесты |

### Backend (server/)

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Node.js | 18+ | Runtime |
| Express | 4.18+ | Web Framework |
| PostgreSQL | 14+ | База данных |
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
│   │   ├── app.vue              # Root с isFullscreen для quest player
│   │   ├── pages/               # Файловый роутинг Nuxt
│   │   │   ├── index.vue        # / — главная (SSR + SWR 300s)
│   │   │   ├── catalog.vue      # /catalog (SSR + SWR 300s)
│   │   │   ├── about.vue        # /about (SSR + SWR 3600s)
│   │   │   ├── date/[slug].vue  # /date/:slug (SSR + SWR 600s)
│   │   │   ├── order/[templateSlug].vue  # /order/:slug (CSR)
│   │   │   ├── quest/[slug].vue          # /quest/:slug (CSR)
│   │   │   └── admin/           # /admin/** (CSR, без SSR)
│   │   ├── components/
│   │   │   ├── common/          # Header, Footer, Modal, Loader...
│   │   │   ├── marketplace/     # TemplateCard, TemplateGrid...
│   │   │   ├── order/           # OrderForm, OrderSummary
│   │   │   └── quest/           # QuestSplash, QuestBlock...
│   │   ├── composables/
│   │   │   └── useApi.js        # $fetch обёртка, все API методы
│   │   └── assets/styles/       # variables.css, main.css...
│   ├── tests/
│   │   ├── e2e/                 # Playwright тесты
│   │   │   ├── fixtures/        # mockApi.ts, api.ts
│   │   │   └── *.spec.ts
│   │   └── unit/                # Vitest тесты
│   ├── nuxt.config.ts
│   ├── playwright.config.ts
│   └── vitest.config.ts
│
├── server/                      # Backend (Express)
│   └── src/
│       ├── app.js               # Express app init
│       ├── routes/              # API роуты
│       │   ├── api.js           # /stats, подключение роутов
│       │   ├── templates.js     # /templates/**
│       │   ├── categories.js    # /categories
│       │   ├── orders.js        # /orders
│       │   ├── quests.js        # /quests/**
│       │   ├── reviews.js       # /reviews
│       │   ├── contact.js       # /contact
│       │   └── auth.js          # /auth
│       ├── controllers/         # Бизнес-логика
│       ├── middleware/
│       │   ├── rateLimiter.js   # generalLimiter, orderLimiter...
│       │   ├── auth.js          # JWT проверка
│       │   └── sanitize.js      # DOMPurify XSS защита
│       └── config/
│           └── db.js            # pg pool
│
├── database/                    # SQL миграции
├── docs/                        # Документация
├── nginx/                       # Nginx конфиги
└── docker-compose.yml
```

---

## Frontend архитектура (Nuxt 4)

### Стратегии рендеринга

Определены в `nuxt.config.ts` через `routeRules`:

```
/                → SSR + SWR 300s   (главная, SEO + свежесть)
/catalog         → SSR + SWR 300s   (каталог с фильтрами)
/date/**         → SSR + SWR 600s   (страница квеста, ключевые SEO страницы)
/about           → SSR + SWR 3600s  (статичная, редко меняется)
/terms, /privacy → prerender        (полностью статичные)
/order/**        → CSR              (динамичная, не нужен SSR)
/quest/**        → CSR              (интерактивный плеер)
/admin/**        → CSR              (защищённая зона)
```

### API слой (useApi.js)

Единый composable для всех запросов. `apiBase` зависит от контекста:
- **Server-side (SSR):** `runtimeConfig.apiBaseInternal` → Docker internal network
- **Client-side (CSR):** `runtimeConfig.public.apiBase` → `/api` через Nuxt devProxy в dev, env переменная в prod

```javascript
// Пример использования
const { getDates, getCategories } = useDatesApi()
const { data } = await useAsyncData('catalog', () => getDates(params))
```

### JWT аутентификация

Токен хранится в `useCookie('auth_token')` — SSR-совместимо. Не используется `localStorage` (недоступен на сервере).

### Quest Player (изоляция)

`app.vue` содержит `isFullscreen` computed — при маршруте `/quest/**` скрываются Header и Footer, квест занимает весь экран.

---

## Backend архитектура

### Rate Limiting

```
generalLimiter  → все /api/*  → 300 req/15min (prod), 1000 (dev)
questLimiter    → /api/quests → 200 req/15min (prod)
orderLimiter    → /api/orders → 5 req/hour
contactLimiter  → /api/contact → 3 req/hour
loginLimiter    → /api/auth   → 5 попыток/15min (skipSuccessfulRequests)
```

**Важно:** в dev режиме `skip: skipLocalhost` — запросы с `127.0.0.1`/`::1` не засчитываются. Это необходимо для E2E тестов и SSR-запросов Nuxt.

### Express route ordering

Специфичные пути объявляются **до** параметрических:
```javascript
router.get('/featured', ...)  // ← до
router.get('/popular', ...)   // ← до
router.get('/:id', ...)       // ← после
```

### Ответы API

Единый формат:
```javascript
// Успех
{ success: true, data: {...}, message?: '...' }

// Ошибка
{ success: false, message: '...', errors?: {...} }

// 403 защищённый квест
{ success: false, requires_code: true, data: { title, theme, ... } }
```

**Важно:** PostgreSQL `COUNT()` возвращает строку в Node.js. Всегда приводить через `parseInt()`. Массивы параметров требуют явного каста `::int[]`.

---

## База данных

### Основные таблицы

**quest_templates** — шаблоны квестов (slug, title, base_price, category_id, author_id, difficulty, features JSON, faq JSON, is_published)

**created_quests** — квесты созданные по заказу (slug, template_id, client_name, access_code, content JSON с шагами)

**orders** — заказы (template_id, client_name, client_email, client_phone, event_date, status, total_price)

**categories** — категории квестов (name, slug, color, icon)

**authors** — авторы (единственный: Лиза Петри / elizaveta_petrova)

**quest_sessions** — сессии прохождения квестов (quest_id, progress JSON, completed_at)

**reviews** — отзывы (template_id, rating, author_name, text)

### Индексы

```sql
idx_templates_slug, idx_templates_category, idx_templates_is_published
idx_created_quests_slug, idx_orders_status, idx_quest_sessions_quest
```

---

## Рендеринг и SEO

### Мета-теги

Каждая страница устанавливает через `useSeoMeta()`:
- `title`, `description`
- `og:title`, `og:description`, `og:image`
- `og:image` → `/og-image.jpg` (1200×630, брендированный)

### JSON-LD Schema

- `/` → `WebSite` + `LocalBusiness`
- `/date/:slug` → `Product` + `FAQPage` + `BreadcrumbList`
- `/catalog` → `ItemList` + `BreadcrumbList`
- `/about` → `Person` (Лиза Петри)

### Sitemap и Robots

Генерируется через `@nuxtjs/seo`. Исключены: `/admin/**`, `/quest/**`, `/order/**`.

---

## Безопасность

- **JWT:** хранится в httpOnly cookie (`useCookie`), передаётся в `Authorization: Bearer`
- **SQL injection:** параметризованные запросы везде (`$1, $2, ...`)
- **XSS:** DOMPurify на входящих данных сервера
- **Quest access codes:** передаются только в теле POST, никогда в URL/query params
- **CORS:** whitelist доменов в Express
- **Rate limiting:** многоуровневый (см. выше)