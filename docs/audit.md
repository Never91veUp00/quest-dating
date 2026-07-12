# Аудит проекта Quest Dating — май 2026

> **Цель:** читаемый отчёт перед апгрейдом. Код не менялся.  
> **Дата создания:** 2026-05-24  
> **Последнее обновление:** 2026-05-26 (отметка пройденных пунктов после двух суток интенсива)  
> **Ветка:** `upgrade/audit` (исходный аудит); прогресс — `docs/upgrade-audit`

> **Статус документа:** снимок состояния на 24 мая. Пройденные пункты
> помечены `✅ DONE (PR #N)`. Для актуальной картины работ — см.
> `docs/upgrade-plan.md` и `docs/incidents.md` (постмортем INC-001 с
> разделом «Долгосрочный follow-up»).

---

## 1. Контекст: документация vs реальность

Документация в целом хорошая — 6 файлов, ~1 100 строк. Но накопились расхождения:

| Документ | Что написано | Что на самом деле | Статус |
|---|---|---|---|
| `ARCHITECTURE.md:164` | `/quest/**` → CSR (quest player) | `nuxt.config.ts:86` — `{ ssr: true }` (SSR) | ✅ PR #20 (доку оставили SSR) |
| `ARCHITECTURE.md` | Nginx — 4-й Docker-контейнер | В `docker-compose.yml` только 3 сервиса (postgres, server, client); nginx запускается отдельно на VPS | ✅ PR #20 |
| `API.md` | `orders` rate limit — 5/час | `rateLimiter.js:41` — 10/час, комментарий «было 5 — слишком мало при тихих ошибках» | ✅ PR #22 |
| `server/.env.example` | Не документирует `RESEND_API_KEY`, `NOTIFY_EMAIL`, `SMTP_*` | `docker-compose.yml` передаёт все эти переменные в контейнер | ✅ PR #10 |
| `server/.env.example` | Документирует `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` | `rateLimiter.js` не читает эти переменные — значения захардкожены | ✅ PR #10 (удалены) |

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
└── client-legacy/   ~~Старый Vue 2/3 SPA-клиент (архив)~~ ✅ удалён в PR #11
```

**client-legacy/** — это предыдущая версия фронтенда на Vue (без SSR). Содержала `src/`, `public/`, `tests/`, `playwright.config.js`. Не использовалась в production; docker-compose её не собирал. **✅ Полностью удалена в PR #11** (135 файлов / 4.9 МБ); создан git tag `pre-cleanup-legacy` для возможного отката.

**database/** содержит `schema_v2.sql`, `schema_v2_utf8.sql`, `schema_clean.sql`, `full_dump.sql` — источник истины для свежей установки не очевиден (см. раздел 8).

---

## 3. Зависимости

### client-nuxt/package.json

**Продакшн (6 пакетов):**
- `nuxt` 4.3.1 — актуален
- `vue` 3.5.29 — актуален
- `@pinia/nuxt` 0.11.3 — актуален
- ~~`@nuxtjs/seo` 3.4.0~~ → **5.1.3** ✅ PR #16
- `vue-router` 4.6.4 — актуален
- `dompurify` 3.3.2 — актуален

**Dev (5 пакетов):**
- ~~`vitest` 2.0.0 — устаревший~~ → **4.1.7** ✅ PR #12 → #15
- `@playwright/test` 1.44.0 — устаревший (актуальный 1.50+) — **TODO** (не в Фазе 1)
- ~~`@vitest/coverage-v8` 2.0.0~~ → **4.1.7** ✅ PR #15
- `@vue/test-utils` 2.4.0 — актуален
- `jsdom` 24.0.0 — актуален

**`"overrides": { "vite": "6.x" }`** — принудительная версия.  
Причина: Nuxt 4 внутренне использует Vite 6. Некоторые транзитивные зависимости (`@nuxtjs/seo` и её подпакеты) объявляют peer dependency на Vite 5.x. Без оверрайда npm создал бы два экземпляра Vite в `node_modules`, что приводит к конфликту плагинов при сборке. Форс — корректное решение для этой конфигурации.

### server/package.json

**Продакшн (13 пакетов):**
- `express` 4.18.2 — устаревший, вышел Express 5 (Breaking changes: async error handling) — **TODO**, явно отложено в `upgrade-plan.md` («Что НЕ делаем сейчас»)
- `pg` 8.11.3 — актуален
- `jsonwebtoken` 9.0.3, `bcryptjs` 2.4.3 — актуальны
- `express-rate-limit` 8.2.1 — актуален
- `express-validator` 7.0.1 — актуален
- `helmet` 7.1.0 — устаревший (актуальный — 8.x) — **TODO** (не в Фазе 1)
- `multer` 1.4.5-lts.1 — актуален
- `sharp` 0.33.0 — устаревший (актуальный — 0.34+) — **TODO** (не в Фазе 1)
- `nanoid` 5.0.5 — актуален
- `resend` — **отсутствует в package.json**, хотя `notificationService.js` вызывает Resend API через `fetch` напрямую. Риска нет, но нет явной зависимости. **TODO** — добавить как dep либо явно зафиксировать архитектурное решение «fetch напрямую».

**Dev:**
- `vitest` **4.0.18** — подозрительно. Последняя стабильная версия — 3.x. Возможно опечатка или ошибка; требует проверки `npm ls vitest` в server/.

**Дублей и неиспользуемых пакетов** не обнаружено.

> **✅ Окружение Node (обновлено 26 мая):** хост, Docker base image и
> nvm-копия — все на **Node 22 LTS** (PR #17 + системная чистка).
> Дублирующая apt-копия Node 20 удалена. PM2 полностью удалён как
> рудимент pre-Docker-эпохи.

> **⚠️ Известный мелкий рассинхрон (см. план 1.5):** `server/package.json`
> декларирует `engines: { "node": ">=18.0.0" }` — отстаёт от реальной
> минимальной версии (22). У `client-nuxt/package.json` поле `engines`
> вообще отсутствует.

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

**~~Критическое место (`notificationService.js:30`)~~ — ✅ закрыто в PR #1:**

~~`const recipient = to || process.env.NOTIFY_EMAIL || 'vp.vlad00@mail.ru'`~~

Fallback на личный email удалён. Сейчас: если `NOTIFY_EMAIL` не задан — email не отправляется (warn в логе). `NOTIFY_EMAIL` добавлен в `server/.env.example` как обязательная переменная (PR #10).

**`routes/telegram.js`** — webhook-обработчик:
- Отвечает `200` немедленно (требование Telegram API) ✓
- `/start <token>` → достаёт заказ из БД → отправляет детали пользователю
- ~~**Отсутствует** верификация подписи~~ → **✅ Добавлена в PR #6/#7.** Проверяется заголовок `X-Telegram-Bot-Api-Secret-Token` против `TELEGRAM_WEBHOOK_SECRET`; при несовпадении — 401.

---

## 6. Тесты

### Что реально написано

**Frontend unit-тесты** (`tests/unit/`, Vitest 4.1.7 + jsdom):
- `validators.test.ts` — `isValidEmail`, `isValidPhone`, `validateOrderForm`
- `formatters.test.ts` — `formatPrice`, `formatDuration`, `pluralize`, `formatDate`
- `helpers.test.ts` — `slugify`, `truncateText`, `debounce`, `groupBy`
- ~~`components/SearchBar.test.ts`~~ — удалён в PR #14 (orphan-тест, компонент уже не существовал)
- Итого: ~~182~~ **166 прошедших тестов** (после PR #14). Покрывают утилиты, но **нет тестов** для composables (`useApi`, `useFilters`, `useQuestEditor`) и страниц.

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
- **Проблема (TODO):** `tests/setup.js` делает `vi.mock('@src/config/database.js', ...)` — pool заменён мок-объектом
- Значит «integration» тесты тестируют только Express middleware и валидацию, **не трогая реальные SQL-запросы**
- `vitest.config.js` задаёт coverage thresholds: lines 70%, functions 70%, branches 60% — но из-за мока БД реальное покрытие бизнес-логики ниже
- **План закрытия:** задача 1.2.3 в `upgrade-plan.md` — testcontainers + реальный PostgreSQL в transaction-rollback

### Конфигурация тестов

Frontend `vitest.config.ts`: env jsdom, globals, coverage через v8.  
Backend `vitest.config.js`: env node, @src alias, coverage thresholds.  
Оба запускаются через `npm test` без лишних зависимостей — конфиги корректны.

~~**Версия vitest в server/package.json: `4.0.18`** — подозрительно высокая~~ → проверено: **vitest 4.x действительно стабилен** (последний релиз — 4.1.7). Корневая проблема была в другом — в `server/` никогда не запускался `npm install` локально (нет `node_modules` на dev-машине). Тесты прогоняются через Docker. ✅ В рамках 1.2.2 client-nuxt тоже выровнен до 4.x.

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

**Статус:** не закрыто. План — задача 1.3.1 в `upgrade-plan.md` (зависит от 1.2.3 — реальные integration-тесты с testcontainers).

### .env и секреты

- `.gitignore` правильно игнорирует `.env`, `node_modules`, `dist`, `uploads`, `backups`
- ~~`package-lock.json` был в `.gitignore`~~ → ✅ PR #13 убрал из ignore, теперь трекается
- `server/.env.example` — обновлён в PR #10: добавлены `RESEND_API_KEY`, `NOTIFY_EMAIL`, `TELEGRAM_WEBHOOK_SECRET`, `SMTP_*`; удалены мёртвые `RATE_LIMIT_*`; исправлено `UPLOAD_DIR` → `UPLOADS_DIR`
- ~~Не документированы в `.env.example`: `RESEND_API_KEY`, `NOTIFY_EMAIL`, `SMTP_*`~~ → ✅ PR #10
- Корневой `.env.example` (11 строк) — минимальный, только DB + JWT

---

## 8. Технический долг

### Дублирование логики

1. ~~**Два файла sitemap-urls**~~ — ✅ закрыто в PR #8/#9:
   - ~~`client-nuxt/server/api/sitemap-urls.get.ts`~~ — удалён
   - `client-nuxt/server/routes/sitemap-urls.get.ts` — остался активным

2. **Модели и контроллеры:** `src/models/Order.js` и `src/controllers/orderController.js` — частичное дублирование SQL-запросов. Нет чёткой границы. **TODO** — не в плане Фазы 1.

3. **Дублирование маршрутов orders в API** — *новая находка (26 мая, при работе над 1.2.4d):* у админских операций над заказами два пути — через `/api/orders/*` с `requireAdmin`-мидлварой (`GET /api/orders`, `GET /api/orders/stats`, `GET /api/orders/:id`, `PATCH /api/orders/:id/status`, `DELETE /api/orders/:id`) и через `/api/admin/orders/*`. Фронтенд использует второй, первый оставлен для обратной совместимости. **TODO** — план 1.5 (унификация).

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

- ~~`rateLimiter.js:41` — orderLimiter повышен с 5 до 10/час. «Тихие ошибки» — симптом, не причина.~~ Документация (API.md) синхронизирована с фактическим значением 10/час в рамках PR #22. Корневая проблема (как именно «тихие ошибки валидации» приводили к срабатыванию лимита) до сих пор не зафиксирована — **TODO**, мелкий пункт для расследования.
- `database/` — 4 файла схемы (`schema_v2.sql`, `schema_v2_utf8.sql`, `schema_clean.sql`, `full_dump.sql`). **Это причина инцидента INC-001** — `docker-compose.yml` монтировал `./database/dump.sql` при первом старте, файла не было → Docker создал директорию → exit 127. Сейчас bind-mount закомментирован (PR #4). Полное решение — задача **1.2.6** в `upgrade-plan.md` (выбрать каноничную схему, сгенерировать `dump.sql` для свежей установки, раскомментировать монтирование).
- **Новая находка (26 мая):** в корне репозитория лежит `dump.sql` (1257 строк, только схема, 0 INSERT) — мусор из коммита 15 марта 2026. Не связан с `database/dump.sql`. **TODO** — план 1.5 (удалить).
- **Новая находка (26 мая):** `uploads_local/` в корне (~7.2 МБ статики: avatars/, media/, templates/). Нигде в коде не используется. Кандидат на удаление как `client-legacy/`. **TODO** — план 1.5.
- `NODE_OPTIONS=--max-old-space-size=512` в docker-compose — 512 МБ для Nuxt SSR может быть мало при высоком трафике. **TODO** (мониторить).
- `blog/[slug].vue:37` — `v-html="post.content"` без DOMPurify. Контент статичный (из `blogPosts.js`) — сейчас безопасно. Если когда-либо перейдут на CMS/БД — станет XSS-уязвимостью. **TODO** (профилактика).

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
| Telegram webhook | ✅ Закрыто | ~~Нет верификации~~ → PR #6/#7: проверка `X-Telegram-Bot-Api-Secret-Token`, 401 при несовпадении |
| Hardcoded email | ✅ Закрыто | ~~`notificationService.js:30` — fallback на личный email~~ → PR #1: fallback удалён, `NOTIFY_EMAIL` обязательна |
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

> **Сводка по прогрессу (на 26 мая):** из 10 пунктов закрыто 6 (#1, #2, #3, #5, #6, #7, #8 — то есть 7 если считать #8 как закрытое расследование), осталось 4 в TODO (#4, #9, #10 и доделка #5 по остальным docs).

### P0 — Критично, исправить до деплоя

**1. ~~Hardcoded email в notificationService.js:30~~ — ✅ DONE (PR #1)**  
Fallback `'vp.vlad00@mail.ru'` удалён. `NOTIFY_EMAIL` добавлен в `.env.example` как обязательная переменная (PR #10). Если не задана — email админу не отправляется (warn в логе).

**2. ~~Telegram webhook без верификации подписи~~ — ✅ DONE (PR #6/#7)**  
Webhook проверяет `X-Telegram-Bot-Api-Secret-Token` против `TELEGRAM_WEBHOOK_SECRET`. При несовпадении — 401. Backward-compat: если переменная не задана, проверка пропускается с warning. Передача переменной в Docker-контейнер исправлена в PR #7.

---

### P1 — Важно, устранить в рамках апгрейда

**3. ~~server/.env.example пропускает критичные переменные~~ — ✅ DONE (PR #10)**  
Добавлены `RESEND_API_KEY`, `NOTIFY_EMAIL`, `TELEGRAM_WEBHOOK_SECRET`. Удалены мёртвые `RATE_LIMIT_*`. Исправлен `UPLOAD_DIR` → `UPLOADS_DIR` (опечатка приводила к тому, что переменная не читалась). Закомментированы опциональные `SMTP_*`, `FRONTEND_URL`.

**4. Integration-тесты мокируют БД (server/tests/setup.js)** — **TODO**, план 1.2.3  
`vi.mock('@src/config/database.js')` — pool заменён заглушкой. SQL-запросы в контроллерах не тестируются. Решение — testcontainers + транзакции с rollback. Самая длинная задача в Фазе 1.

**5. ARCHITECTURE.md расходится с кодом** — ✅ DONE (PR #20, follow-up в PR #22)  
Поправлены оба пункта: `/quest/**` в доке теперь SSR (соответствует коду), nginx описан как внешний systemd-сервис. Заодно обновлены: версии стека (Node 22, Vitest 4.x, @nuxtjs/seo 5.x), структура проекта (удалён dead-link на sitemap-urls в api/), безопасность (добавлен пункт про secret_token), новый раздел Health & мониторинг. *Остальные файлы документации синхронизируются под-задачами 1.2.4 (план): DEPLOY ✅ PR #21, API ✅ PR #22, audit (этот PR), DEVELOPMENT+TESTING — TODO.*

**6. ~~`RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` в .env.example — мёртвые~~ — ✅ DONE (PR #10)**  
Удалены из `.env.example`. `rateLimiter.js` явно помечен комментарием, что значения hardcoded — операторы больше не введены в заблуждение.

**7. ~~Дубль `server/api/sitemap-urls.get.ts`~~ — ✅ DONE (PR #8/#9)**  
Файл удалён. Активный остался один — `client-nuxt/server/routes/sitemap-urls.get.ts`.

---

### P2 — Долг, стоит запланировать

**8. ~~vitest 4.0.18 — подозрительная версия~~ → расследование закрыто, версия валидна**  
vitest 4.x реален (последний релиз — 4.1.7). Проблема была в другом — в `server/` никогда не запускался `npm install` локально (`node_modules` отсутствовал; тесты прогоняются через Docker). ✅ Client-nuxt в рамках 1.2.2 тоже выровнен до 4.x (PR #15). Плюс попутно — `npm audit fix` свёл уязвимости client-nuxt к нулю (PR #16). В `docs/SETUP.md` (1.2.4b) добавить шаг `cd server && npm install` для локальной разработки.

**9. DOMPurify race condition в date/[slug].vue:448-450** — **TODO**, не в плане Фазы 1  
Если computed `formattedDescription` отрабатывает до загрузки DOMPurify, `v-html` получает несанированный HTML. Риск ограничен (описания пишут только admins), но паттерн хрупкий. Решение: Nuxt plugin для eager-загрузки DOMPurify или синхронный импорт.

**10. Нет CI/CD pipeline** — **TODO**, план 1.3.1  
`.github/workflows/` пустая. Зависит от 1.2.3 (для job `test-server` с реальной БД).
