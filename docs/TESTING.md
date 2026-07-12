# Тестирование Quest Dating

## Стек

| Слой | Инструмент | Где | Для чего |
|------|-----------|-----|---------|
| Frontend unit | Vitest 4.x + Vue Test Utils + jsdom | `client-nuxt/tests/unit/` | validators, formatters, helpers |
| Frontend E2E | Playwright 1.44 | `client-nuxt/tests/e2e/` | пользовательские сценарии |
| Backend unit | Vitest 4.x | `server/tests/unit/` | middleware, services, utils |
| Backend integration | Vitest 4.x | `server/tests/integration/` | API endpoints (с мок-БД, см. ниже) |

> **Важно (TODO):** integration-тесты в `server/tests/integration/` сейчас используют мок БД (`vi.mock` в `server/tests/setup.js`). Реальные SQL-запросы не тестируются. План закрытия — задача **1.2.3** в `docs/upgrade-plan.md` (testcontainers + транзакции с rollback).

---

## Быстрый старт (frontend)

```bash
cd client-nuxt
npm install
npx playwright install chromium   # один раз

npm run test          # unit
npm run dev &         # нужен для E2E
npm run test:e2e      # E2E
```

Для backend-тестов — см. раздел «Backend тесты» ниже.

---

## Frontend unit тесты (Vitest)

Из `client-nuxt/`:

```bash
npm run test          # все
npm run test:watch    # watch-режим
```

### Покрытие

```
tests/unit/
├── validators.test.ts   # isValidEmail, isValidPhone, validateOrderForm
├── formatters.test.ts   # formatPrice, formatDuration, pluralize, formatDate
└── helpers.test.ts      # slugify, truncateText, debounce, groupBy
```

---

## Frontend E2E тесты (Playwright)

Из `client-nuxt/`:

```bash
# Нужен запущенный dev сервер!
npm run test:e2e        # headless
npm run test:e2e:ui     # визуальный UI
```

### Проекты

| Проект | Viewport |
|--------|----------|
| `chromium` | Desktop 1280px |
| `mobile` | iPhone 13 390px |

### Файлы тестов

```
tests/e2e/
├── fixtures/
│   ├── api.ts        # MOCK_TEMPLATE, MOCK_STATS, MOCK_CATEGORY...
│   └── mockApi.ts    # mockHomepageApi() — мок публичных GET
├── about.spec.ts     # /about — Person JSON-LD, CTA
├── catalog.spec.ts   # /catalog — карточки, фильтры
├── date-slug.spec.ts # /date/:slug — FAQ блок, Product JSON-LD, BreadcrumbList
├── header.spec.ts    # навигация, мобильное меню
├── homepage.spec.ts  # / — заголовок, og:image, Organization JSON-LD
├── order.spec.ts     # форма заказа (3 шага)
└── quest-player.spec.ts  # прохождение квеста, защита кодом
```

### mockHomepageApi()

Мокирует `/stats`, `/categories`, `/reviews/featured`, `/templates/featured`, `/templates/popular`, `/tags/popular` через `page.route()`. Нужен чтобы не выбивать rate limiter при повторных запусках.

```typescript
import { mockHomepageApi } from './fixtures/mockApi'

test.beforeEach(async ({ page }) => {
  await mockHomepageApi(page)
  await page.goto('/')
})
```

### Моки POST

```typescript
// Мокировать оба URL (devProxy + прямой)
await page.route('**/api/orders', route => route.fulfill({ status: 201, ... }))
await page.route('http://localhost:5000/api/orders', route => route.fulfill({ status: 201, ... }))
```

---

## Backend тесты (Vitest)

```bash
cd server
npm install              # один раз (см. SETUP.md)
npm test                 # все тесты
npm run test:unit        # только unit
npm run test:integration # только integration
npm run test:coverage    # с покрытием
```

### Структура

```
server/tests/
├── setup.js                # моки БД + Telegram + rate-limiters
├── unit/
│   ├── middleware/         # auth, validator
│   ├── services/           # statsService, notificationService
│   └── utils/              # slugGenerator
└── integration/
    └── api/                # auth, contact, health, orders, quests, telegram
```

`health.test.js` и `telegram.test.js` появились после PR #2/#3 и PR #6/#7 — покрывают новый `/health` (БД-проверка) и webhook (secret_token верификацию). Это test-driven: тесты писались вместе с реализацией.

### Mock БД в setup.js

`vi.mock('@src/config/database.js', ...)` — pool заменён заглушкой. Это значит integration-тесты проверяют **только** Express middleware, валидацию и форму ответа — не реальные SQL-запросы. Coverage thresholds (lines 70%, functions 70%, branches 60%) корректные для текущей конфигурации, но реальное покрытие бизнес-логики ниже.

**Что планируется (задача 1.2.3):** заменить `vi.mock` на реальный pool с test-БД через testcontainers; каждый тест в транзакции с rollback. Это даст честное покрытие и отлов проблем со схемой при миграциях.

---

## Особенности компонентов

**TemplateCard** — внешний `<article>`, не `<a>`. Для ссылок внутри: `a[href*="/date/"]`.

**OrderForm** — 3 шага. Шаг 3 адаптируется к типу квеста (домашний, городской, предложение и т.д.).

**Quest Player** — `restart` требует `quest_id` в теле запроса.

**date-slug** — breadcrumb: `toContainText('Сценарии свиданий-квестов')`.

**Контактная форма** — скрыта на мобильном, тесты только для desktop.

---

## Переменные для E2E

```env
E2E_BASE_URL=http://localhost:3000
E2E_TEST_QUEST_SLUG=test-quest   # slug публичного квеста в БД
```

---

## Текущий статус

```
Frontend unit:        166 passed (после PR #14 удалён orphan SearchBar.test.ts)
Frontend E2E:         ~40 passed, 2 skipped (quest-player — нужен реальный квест в БД)
Backend unit:         покрывает middleware/services/utils
Backend integration:  все endpoints, но через mock БД (см. выше)
```

Пропущенные E2E тесты — нормально. Для полного покрытия создай тестовый квест в БД и передай slug через `E2E_TEST_QUEST_SLUG`.