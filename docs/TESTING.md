# Тестирование Quest Dating

## Стек

| Слой | Инструмент | Для чего |
|------|-----------|---------|
| Unit | Vitest + Vue Test Utils | validators, formatters, helpers |
| E2E | Playwright | пользовательские сценарии |

---

## Быстрый старт

```bash
cd client-nuxt
npm install
npx playwright install chromium   # один раз

npm run test          # unit
npm run dev &         # нужен для E2E
npm run test:e2e      # E2E
```

---

## Unit тесты (Vitest)

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

## E2E тесты (Playwright)

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
Unit:  182 passed
E2E:   ~40 passed, 2 skipped (quest-player без реального квеста в БД)
```

Пропущенные E2E тесты — нормально. Для полного покрытия создай тестовый квест и передай slug через `E2E_TEST_QUEST_SLUG`.