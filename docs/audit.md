# Аудит проекта Quest Dating — май 2026

> **Цель:** читаемый отчёт перед апгрейдом. Код не менялся.  
> **Дата:** 2026-05-24  
> **Ветка:** `upgrade/audit`

---

## 1. Контекст: документация vs реальность

Документация в целом хорошая — 6 файлов, ~1 100 строк. Но накопились расхождения:

| Документ | Что написано | Что на самом деле |
|---|---|---|
| `ARCHITECTURE.md:164` | `/quest/**` → CSR (quest player) | `nuxt.config.ts:86` — `{ ssr: true }` (SSR) |
| `ARCHITECTURE.md` | Nginx — 4-й Docker-контейнер | В `docker-compose.yml` только 3 сервиса (postgres, server, client); nginx запускается отдельно на VPS |
| `API.md` | `orders` rate limit — 5/час | `rateLimiter.js:41` — 10/час, комментарий «было 5 — слишком мало при тихих ошибках» |
| `server/.env.example` | Не документирует `RESEND_API_KEY`, `NOTIFY_EMAIL`, `SMTP_*` | `docker-compose.yml` передаёт все эти переменные в контейнер |
| `server/.env.example` | Документирует `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` | `rateLimiter.js` не читает эти переменные — значения захардкожены |

---

## 2. Структура проекта

```
/home/questdating-work/
├── client-nuxt/     Nuxt 4 SSR frontend (основной клиент)
├── server/          Express API + PostgreSQL
├── database/        SQL схемы, миграции, сиды, полный дамп
├── nginx/           nginx.conf для production VPS
├── docs/            Документация (6 файлов)
├── scripts/         backup-db.sh, generate-sitemap.js
├── docker-compose.yml   3 сервиса: postgres, server, client
└── client-legacy/   Старый Vue 2/3 SPA-клиент (архив)
```

**client-legacy/** — это предыдущая версия фронтенда на Vue (без SSR). Содержит `src/`, `public/`, `tests/`, `playwright.config.js`. Не используется в production; docker-compose его не собирает; в деплое не упоминается. Можно рассматривать как архив для референса.

**database/** содержит `schema_v2.sql`, `schema_v2_utf8.sql`, `schema_clean.sql`, `full_dump.sql` — источник истины для свежей установки не очевиден (см. раздел 8).

---

## 3. Зависимости

### client-nuxt/package.json

**Продакшн (6 пакетов):**
- `nuxt` 4.3.1 — актуален
- `vue` 3.5.29 — актуален
- `@pinia/nuxt` 0.11.3 — актуален
- `@nuxtjs/seo` 3.4.0 — актуален
- `vue-router` 4.6.4 — актуален
- `dompurify` 3.3.2 — актуален

**Dev (5 пакетов):**
- `vitest` 2.0.0 — **устаревший** (текущий — 3.x)
- `@playwright/test` 1.44.0 — **устаревший** (текущий — 1.50+)
- `@vitest/coverage-v8` 2.0.0 — устаревший
- `@vue/test-utils` 2.4.0 — актуален
- `jsdom` 24.0.0 — актуален

**`"overrides": { "vite": "6.x" }`** — принудительная версия.  
Причина: Nuxt 4 внутренне использует Vite 6. Некоторые транзитивные зависимости (`@nuxtjs/seo` и её подпакеты) объявляют peer dependency на Vite 5.x. Без оверрайда npm создал бы два экземпляра Vite в `node_modules`, что приводит к конфликту плагинов при сборке. Форс — корректное решение для этой конфигурации.

### server/package.json

**Продакшн (13 пакетов):**
- `express` 4.18.2 — **устаревший**, вышел Express 5 (Breaking changes: async error handling)
- `pg` 8.11.3 — актуален
- `jsonwebtoken` 9.0.3, `bcryptjs` 2.4.3 — актуальны
- `express-rate-limit` 8.2.1 — актуален
- `express-validator` 7.0.1 — актуален
- `helmet` 7.1.0 — **устаревший** (текущий — 8.x)
- `multer` 1.4.5-lts.1 — актуален
- `sharp` 0.33.0 — **устаревший** (текущий — 0.34+)
- `nanoid` 5.0.5 — актуален
- `resend` — **отсутствует в package.json**, хотя `notificationService.js` вызывает Resend API через `fetch` напрямую. Риска нет, но нет явной зависимости.

**Dev:**
- `vitest` **4.0.18** — подозрительно. Последняя стабильная версия — 3.x. Возможно опечатка или ошибка; требует проверки `npm ls vitest` в server/.

**Дублей и неиспользуемых пакетов** не обнаружено.

---

## 4. Фронтенд (client-nuxt/)

### Точки входа и layouts

- `app/app.vue` (38 строк) — рут. Рендерит `Header` + `NuxtPage` + `Footer` для обычных страниц. Для `/quest/**` и `/admin/**` — только `NuxtPage` (fullscreen).
- `app/error.vue` (194 строки) — 404/500 с поиском квестов.
- Layouts не используются — Nuxt 4 `layouts/` директория отсутствует; роль layout выполняет `app.vue` через `isFullscreen`.

### Страницы (app/pages/)

| Страница | Размер | Рендеринг | Примечание |
|---|---|---|---|
| `index.vue` | 489 строк | SSR + SWR 300s | Hero, featured quests, stats, reviews, FAQ, Organization JSON-LD |
| `catalog.vue` | 584 строки | SSR + SWR 300s | Фильтры, сортировка, пагинация |
| `date/[slug].vue` | 665 строк | SSR + SWR 600s | Product + BreadcrumbList + FAQ JSON-LD; `v-html` с DOMPurify |
| `about.vue` | 306 строк | SSR + SWR 3600s | Person JSON-LD |
| `blog/[slug].vue` | 285 строк | SSR + SWR 3600s | `v-html` БЕЗ sanitize (контент статичный) |
| `order/[templateSlug].vue` | 307 строк | CSR | 3-шаговая форма |
| `my-order/[token].vue` | 345 строк | CSR, `noindex` | Трекинг заказа по public token |
| `quest/[slug].vue` | 672 строки | **SSR** | Плеер квеста |
| `admin/**` | — | CSR | Dashboard, CRUD квестов/шаблонов |

**Особое внимание: `/quest/**` — SSR (`nuxt.config.ts:86`)**  
`ARCHITECTURE.md` описывает этот маршрут как CSR, но конфиг переключён на SSR. Это разрыв между документацией и кодом. С точки зрения SEO SSR здесь избыточен (страница закрыта robots.txt), но и вреда не несёт.

### Pinia stores

`app/stores/auth.js` (44 строки) — единственный стор:
- Состояние: `loading`, `error`
- Геттеры: `token`, `isAuthenticated`, `isAdmin` — все читают `useCookie('auth_token')`
- Действия: `login()`, `logout()`

Логика корректна: нет лишней бизнес-логики в сторе, всё делегировано `useApi`.

### Composables

**`useApi.js`** (142 строки) — единая точка доступа к API:
- Динамический `baseURL`: `NUXT_API_BASE_INTERNAL` (SSR) / `NUXT_PUBLIC_API_BASE` (CSR)
- JWT из `useCookie('auth_token')`
- 401 → очищает токен, 403 с `requires_code` → не считается ошибкой
- Экспортирует `useDatesApi()` и `useAdminApi()`
- Паттерн правильный: все страницы используют этот composable, нет прямых `fetch` во vue-файлах

**`useFilters.js`** (144 строки) — catalog filters:
- Синхронизация с URL query params через `watch`
- Диапазон цен по умолчанию `[0, 10000]` — **совпадает ли с реальным диапазоном цен в БД?** `base_price` хранится в копейках, значит 10 000 = 1 рубль. Скорее всего, это значение в рублях, а конвертация происходит при формировании API-запроса.

**`useQuestEditor.js`** — транслитерация кириллицы в slug при создании. Логика в composable, не в сторе — правильно.

### SSR/CSR обоснованность

| Роут | Решение | Обоснование |
|---|---|---|
| `/`, `/catalog`, `/date/**` | SSR + SWR | SEO — правильно |
| `/about`, `/blog/**` | SSR + SWR 3600s | SEO — правильно |
| `/order/**`, `/my-order/**` | CSR | Форма/трекинг — не нужен SSR |
| `/admin/**` | CSR | Защита — правильно |
| `/quest/**` | SSR | Избыточно (закрыт robots), но не вредит |

### SEO (nuxt.config.ts)

- `@nuxtjs/seo` модуль покрывает: sitemap, robots, og-meta, JSON-LD
- JSON-LD: Organization (index), Product (date/slug), Person (about), BreadcrumbList, FAQ
- Robots: `/admin`, `/quest`, `/order`, `/my-order`, `/feedbacks`, `/memberid` — закрыты
- Sitemap: динамические URL через `/sitemap-urls` endpoint (Nitro route)
- SWR кэши обоснованы по типу контента

---

## 5. Бэкенд (server/)

### Роутинг

Структура: `app.js` → `routes/api.js` → отдельные роутеры

```
/api/stats              GET  statsService
/api/sitemap-urls       GET  нет — этот путь не регистрируется в api.js!
/api/templates          GET  templateController
/api/categories         GET  categoryController
/api/tags               GET  tagController
/api/reviews            GET/POST  reviewController
/api/orders             GET/POST  orderController + orderLimiter
/api/quests/:slug       GET/POST  questController
/api/auth               POST/GET  authController
/api/admin/**           все  requireAdmin + adminController
/api/contact            POST  contactLimiter
/api/telegram/webhook   POST  telegamHandler
/health                 GET  healthcheck
```

`routes/admin.js` (685 строк) — все admin-операции в одном файле. Это нарушает SRP, но документировано как осознанное решение (DEVELOPMENT.md: «все /admin/* роуты в admin.js»). При дальнейшем росте потребует разбивки.

### Работа с БД

- Сырой SQL через `pg` pool — ORM отсутствует
- **Параметризованные запросы везде**: `pool.query('SELECT ... WHERE id = $1', [id])`
- `COUNT()` возвращает строку — оборачивается в `parseInt()` в кода
- Цены в копейках (`base_price`, `total_price` — integer)
- `pool.query` в контроллерах напрямую — нет data-access слоя, но модели в `src/models/` дублируют часть запросов

### Middleware стек

```
helmet → compression → cors → json parser → urlencoded parser
→ rateLimiters → sanitizeQuery → httpLogger → routes → errorHandler
```

- `sanitizeQuery` (`validator.js`) — XSS-защита query-параметров через `express-validator`
- `errorHandler.js` (~120 строк) — обрабатывает PostgreSQL коды ошибок, JWT ошибки, Multer, CORS
- `auth.js` — `requireAdmin` проверяет `Authorization: Bearer`, верифицирует JWT, `role === 'admin'`
- `rateLimiter.js:15` — `isProd ? 300 : 1000` в 15 мин (general); `isProd` = `NODE_ENV === 'production'`

**Важно:** `RATE_LIMIT_WINDOW_MS` и `RATE_LIMIT_MAX_REQUESTS` из `.env.example` **не читаются** в `rateLimiter.js` — там захардкожены значения. Переменные-пустышки в конфиге вводят в заблуждение.

### notificationService.js и Telegram

`notificationService.js` (259 строк) — централизованный сервис уведомлений:
- `sendTelegramMessage(text, chatId?)` — POST к Telegram Bot API
- `sendEmail(subject, html, to?)` — POST к Resend.com API
- `notifyNewOrder` / `notifyOrderStatusChange` / `notifyContactMessage`
- HTML-шаблоны email встроены в код (нет внешних шаблонных файлов)

**Критическое место (`notificationService.js:30`):**
```js
const recipient = to || process.env.NOTIFY_EMAIL || 'vp.vlad00@mail.ru'
```
Если `NOTIFY_EMAIL` не задан в окружении, уведомления уходят на личный email. При этом `NOTIFY_EMAIL` отсутствует в `server/.env.example`.

**`routes/telegram.js`** — webhook-обработчик:
- Отвечает `200` немедленно (требование Telegram API) ✓
- `/start <token>` → достаёт заказ из БД → отправляет детали пользователю
- **Отсутствует** верификация подписи (`X-Telegram-Bot-Api-Secret-Token`) — любой может отправить POST-запрос на `/api/telegram/webhook` с произвольными данными.

---

## 6. Тесты

### Что реально написано

**Frontend unit-тесты** (`tests/unit/`, Vitest + jsdom):
- `validators.test.ts` — `isValidEmail`, `isValidPhone`, `validateOrderForm`
- `formatters.test.ts` — `formatPrice`, `formatDuration`, `pluralize`, `formatDate`
- `helpers.test.ts` — `slugify`, `truncateText`, `debounce`, `groupBy`
- `components/SearchBar.test.ts` — компонент
- Итого: 182 прошедших теста. Покрывают утилиты, но **нет тестов** для composables (`useApi`, `useFilters`, `useQuestEditor`) и страниц.

**Frontend E2E** (Playwright, 2 проекта: chromium + mobile):
- `homepage.spec.ts`, `about.spec.ts`, `catalog.spec.ts`, `date-slug.spec.ts`, `header.spec.ts`, `order.spec.ts`, `contact.spec.ts` — основные пути
- `quest-player.spec.ts` — **2 теста пропущены** (`skip`): требуют `E2E_QUEST_SLUG` — реальные данные из БД
- Фикстуры `mockApi.ts` перехватывают `/api/**` через `page.route()` — тесты не зависят от реального сервера
- `playwright.config.ts:9` — `fullyParallel: false`, workers: 1 — тесты медленные

**Backend unit-тесты** (`server/tests/unit/`):
- `middleware/auth.test.js`, `middleware/validator.test.js`
- `utils/slugGenerator.test.js`
- `services/statsService.test.js`, `services/notificationService.test.js`
- Нотификации тестируются через мок `fetch` — корректно для unit-теста

**Backend integration-тесты** (`server/tests/integration/`):
- `auth.test.js`, `orders.test.js`, `contact.test.js`, `quests.test.js`
- **Проблема:** `tests/setup.js` делает `vi.mock('@src/config/database.js', ...)` — pool заменён мок-объектом
- Значит «integration» тесты тестируют только Express middleware и валидацию, **не трогая реальные SQL-запросы**
- `vitest.config.js` задаёт coverage thresholds: lines 70%, functions 70%, branches 60% — но из-за мока БД реальное покрытие бизнес-логики ниже

### Конфигурация тестов

Frontend `vitest.config.ts`: env jsdom, globals, coverage через v8.  
Backend `vitest.config.js`: env node, @src alias, coverage thresholds.  
Оба запускаются через `npm test` без лишних зависимостей — конфиги корректны.

**Версия vitest в server/package.json: `4.0.18`** — подозрительно высокая (стабильный релиз на 2026-05 — 3.x). Требует проверки `npm ls vitest` в server/.

---

## 7. Качество кода

### TypeScript

| Часть | .ts файлы | .js файлы | Оценка |
|---|---|---|---|
| client-nuxt/app/ | 0 логических | ~35 .vue, ~12 .js | Vue SFC, .js для composables/stores/utils |
| client-nuxt/ (конфиг) | nuxt.config.ts, vitest.config.ts, playwright.config.ts, tests/*.ts | — | Конфиги на TS |
| client-nuxt/server/ | sitemap-urls.get.ts (оба) | — | Nitro routes на TS |
| server/src/ | **0** | **37** | Чистый JS |

**Frontend:** composables, stores, utils написаны на JS, а не TS. Компоненты `.vue` без `lang="ts"`. Это допустимо для Nuxt 4 (автоматические типы через `.nuxt/`), но нет явных типов для API-ответов.

**Backend:** 0 файлов TypeScript. Нет типов для Express request/response расширений (например, `req.admin`). При рефакторинге высок риск silent type errors.

**Strict mode:** `tsconfig.json` фронта ссылается на авто-генерированные `.nuxt/tsconfig.*.json` — строгость определяется Nuxt-дефолтами.

### Линтеры / форматирование

- `.eslintrc.js` в корне — общий конфиг
- `.prettierrc` — форматирование
- **Нет** ESLint в `client-nuxt/package.json` как зависимости (только в корневом конфиге)
- Нет pre-commit хуков (`.husky/`, `lint-staged`)

### CI/CD

**Директория `.github/workflows/` — пустая.** Нет ни одного workflow.  
Деплой производится вручную через `docker compose build && docker compose up -d` на VPS.

### .env и секреты

- `.gitignore` правильно игнорирует `.env`, `node_modules`, `dist`, `uploads`, `backups`
- `server/.env.example` — 49 строк, покрывает основные переменные
- **Не документированы в .env.example:** `RESEND_API_KEY`, `NOTIFY_EMAIL`, `SMTP_*`, `SMTP_TO`, `SMTP_PASS` — все присутствуют в `docker-compose.yml`
- Корневой `.env.example` (11 строк) — минимальный, только DB + JWT

---

## 8. Технический долг

### Дублирование логики

1. **Два файла sitemap-urls:**
   - `client-nuxt/server/api/sitemap-urls.get.ts` — только шаблоны + категории
   - `client-nuxt/server/routes/sitemap-urls.get.ts` — блог + шаблоны + категории (полный)
   
   В Nuxt `server/api/` создаёт маршруты `/api/*`, `server/routes/` — корневые `/*`. Активный — `server/routes/`. Файл `server/api/sitemap-urls.get.ts` — **мёртвый код с неполным списком URL** (без блога). При обращении к `/api/sitemap-urls` вернёт некорректные данные.

2. **Модели и контроллеры:** `src/models/Order.js` и `src/controllers/orderController.js` — частичное дублирование SQL-запросов. Нет чёткой границы.

### Устаревшие паттерны

- **Нет** Options API — весь Vue 3 Composition API (`<script setup>`) — хорошо
- **`window.__dompurify_cache`** в `date/[slug].vue:448` — кастомный кэш через global window. Нестандартный паттерн; лучше Nuxt plugin или composable.

### TODO/FIXME

Единственный TODO в проекте:
```
client-nuxt/app/components/quest/QuestMap.vue:112
// TODO: Интеграция с картами (Leaflet, Google Maps, Yandex Maps)
```

В server/ TODO/FIXME не найдены.

### Подозрительные места

- `rateLimiter.js:41` — комментарий «было 5 — слишком мало при тихих ошибках»: orderLimiter повышен с 5 до 10/час. «Тихие ошибки» при создании заказа — симптом, а не причина. Корневая проблема не зафиксирована.
- `database/` — 4 файла схемы (`schema_v2.sql`, `schema_v2_utf8.sql`, `schema_clean.sql`, `full_dump.sql`). Непонятно, какой актуален для свежей установки. `docker-compose.yml` монтирует `./database/dump.sql` как init — этого файла нет в репо (должен генерироваться через `backup-db.sh`).
- `NODE_OPTIONS=--max-old-space-size=512` в docker-compose — 512 МБ для Nuxt SSR может быть мало при высоком трафике.
- `blog/[slug].vue:37` — `v-html="post.content"` без DOMPurify. Контент статичный (из `blogPosts.js`) — сейчас безопасно. Если когда-либо перейдут на CMS/БД — станет XSS-уязвимостью.

---

## 9. Безопасность (быстрый взгляд)

| Область | Статус | Детали |
|---|---|---|
| SQL injection | ✅ Защищено | Параметризованные запросы везде (`$1`, `$2`) |
| XSS | ⚠️ Частично | DOMPurify в `date/[slug].vue`, но паттерн с `window.__dompurify_cache` хрупкий; `blog/[slug].vue` без sanitize |
| JWT | ✅ | httpOnly cookie, bcrypt для пароля |
| CORS | ✅ | Whitelist через `ALLOWED_ORIGINS`, fallback на localhost |
| Rate limiting | ✅ | 6 лимитеров на разные эндпойнты |
| Secrets в репо | ✅ | `.gitignore` корректный; `.env` не коммитится |
| Telegram webhook | ❌ Уязвимость | Нет верификации `X-Telegram-Bot-Api-Secret-Token` — любой может подделать запрос |
| Hardcoded email | ❌ Уязвимость | `notificationService.js:30` — fallback на личный email |
| Yandex Metrika ID | ⚠️ Минор | ID `108293057` захардкожен в `app.vue:23`, не env-переменная |
| Access codes | ✅ | Только в POST body, не в query string |
| File uploads | ✅ | Multer + Sharp, лимит 5 МБ, тип проверяется |
| Admin auth | ✅ | JWT + role check на всех `/admin/**` |

### DOMPurify race condition (date/[slug].vue:444-470)

```js
// date/[slug].vue:448
const DOMPurify = window.__dompurify_cache ?? null
if (!DOMPurify) return withBreaks   // ← возвращает НЕсанированный HTML
return DOMPurify.sanitize(withBreaks)
```

DOMPurify загружается динамически (`import('dompurify')`). Если вычисляемое свойство отрабатывает до окончания загрузки (первый рендер), `v-html` получает несанированный контент. Описание квеста приходит из БД — риск зависит от того, кто имеет доступ к редактированию шаблонов (только admin → ограниченный риск, но паттерн хрупкий).

---

## 10. Хрупкие места

### Плохо покрытые тестами

1. **`useApi.js`** — весь слой API-обращений. Нет unit-тестов для composable.
2. **`useFilters.js`** — URL-синхронизация фильтров. Регрессии при изменении query-params легко пропустить.
3. **SQL-запросы в controllers/** — все замокированы в тестах. Ошибки схемы (переименование колонки, новый NOT NULL) не поймаются CI.
4. **`quest/[slug].vue`** — плеер (672 строки). E2E-тест пропущен (`skip`) при нехватке тестовых данных.
5. **Telegram-интеграция** — тесты мокируют `fetch`; реальный Telegram API не тестируется.

### Что выглядит запутанно

- `admin.js` — 685 строк смешанных роутов и inline-обработчиков без выделения контроллера. Очень трудно навигировать.
- DOMPurify через `window.__dompurify_cache` — нестандартный паттерн, который требует понимания sequence of events при гидрации.
- Два `sitemap-urls` файла с разным содержимым — непонятно, какой активен (ответ: `server/routes/` — активный).

### Точки отказа (внешние API)

| Сервис | Используется | Обработка отказа |
|---|---|---|
| Telegram Bot API | Уведомления при заказе, webhook | `try/catch` в notificationService, ошибка логируется но не пробрасывается — заказ создаётся даже при сбое Telegram ✅ |
| Resend.com | Email-уведомления | Аналогично — graceful degradation ✅ |
| Google Fonts | Шрифт на фронте | `preload` + `onload` (FOUT) — fallback не задан явно |
| Yandex Metrika | Аналитика | Блокируется AdBlock — нет влияния на функциональность ✅ |

**`database/dump.sql` не в репо** — `docker-compose.yml` монтирует его при первом старте postgres. Если файл отсутствует, контейнер стартует с пустой БД. Нет fallback на `schema_v2.sql`.

---

## Топ-10 находок по приоритету

### P0 — Критично, исправить до деплоя

**1. Hardcoded email в notificationService.js:30**  
`'vp.vlad00@mail.ru'` — fallback при отсутствии `NOTIFY_EMAIL`. При этом переменная не документирована в `server/.env.example`. В production при первом деплое все admin-уведомления (новые заказы, изменения статусов) уйдут на личный адрес.  
**Исправление:** убрать fallback-строку; добавить `NOTIFY_EMAIL` в .env.example как обязательную.

**2. Telegram webhook без верификации подписи (`routes/telegram.js`)**  
Нет проверки `X-Telegram-Bot-Api-Secret-Token`. Любой знающий URL может отправить поддельный `/start <token>` и получить данные заказа из БД.  
**Исправление:** добавить `secret_token` при регистрации webhook и проверять заголовок в middleware.

---

### P1 — Важно, устранить в рамках апгрейда

**3. server/.env.example пропускает критичные переменные**  
`RESEND_API_KEY`, `NOTIFY_EMAIL`, `SMTP_*`, `SMTP_TO` — все используются в `docker-compose.yml` и `notificationService.js`, но отсутствуют в `.env.example`. Свежая установка не получит email-уведомлений без явной подсказки.

**4. Integration-тесты мокируют БД (server/tests/setup.js)**  
`vi.mock('@src/config/database.js')` — pool заменён заглушкой. SQL-запросы в контроллерах не тестируются. Переименование колонки или изменение схемы не поймается CI. Coverage thresholds 70% создают ложное ощущение безопасности.

**5. ARCHITECTURE.md расходится с кодом в двух местах**  
- `/quest/**` документирован как CSR, в коде — SSR
- Nginx описан как Docker-сервис, в действительности — внешний процесс на VPS  
Риск: при онбординге разработчик будет работать по устаревшей документации.

**6. `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` в .env.example — мёртвые переменные**  
`rateLimiter.js` не читает их. Операторы думают, что управляют лимитами через env, но ничего не происходит.

**7. Дубль `server/api/sitemap-urls.get.ts` — мёртвый код с неполными данными**  
Активный endpoint — `server/routes/sitemap-urls.get.ts`. Файл в `server/api/` регистрируется под `/api/sitemap-urls` и возвращает список без блог-статей. Если что-то случайно обратится к `/api/sitemap-urls` — получит неполный sitemap.

---

### P2 — Долг, стоит запланировать

**8. vitest 4.0.18 в server/package.json — подозрительная версия**  
Текущая стабильная ветка vitest — 3.x. `4.0.18` вероятно опечатка или несуществующая версия. Требует проверки `npm ls vitest` в server/ и обновления в рамках апгрейда.

**9. DOMPurify race condition в date/[slug].vue:448-450**  
Если computed `formattedDescription` отрабатывает до загрузки DOMPurify, `v-html` получает несанированный HTML. Риск ограничен (описания пишут только admins), но паттерн хрупкий и нарушает принцип «secure by default». Решение: Nuxt plugin для eager-загрузки DOMPurify или синхронный импорт.

**10. Нет CI/CD pipeline**  
`.github/workflows/` пустая. Деплой ручной. Нет автоматического запуска тестов при push/PR, нет lint-check, нет build-verification. При апгрейде зависимостей ошибки можно обнаружить только вручную на VPS.
