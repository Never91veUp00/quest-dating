# Тестирование Quest Dating

## Стек

| Слой | Инструмент | Для чего |
|------|-----------|---------| 
| Frontend unit | Vitest + Vue Test Utils + jsdom | validators, formatters, helpers, компоненты |
| E2E | Playwright | полные пользовательские сценарии в браузере |

---

## Быстрый старт

```bash
cd client-nuxt
npm install
npx playwright install chromium   # один раз

# Unit тесты
npm run test

# E2E (требуется запущенный dev сервер)
npm run dev &
npm run test:e2e
```

---

## Unit тесты (Vitest)

### Запуск

```bash
cd client-nuxt

npm run test              # все тесты
npm run test:watch        # watch-режим при разработке
npm run test:unit         # только unit
```

### Структура

```
tests/
├── setup.ts                          # глобальная конфигурация
└── unit/
    ├── validators.test.ts            # 64 теста
    ├── formatters.test.ts            # 65 тестов
    ├── helpers.test.ts               # 37 тестов
    └── components/
        └── SearchBar.test.ts         # 16 тестов (XSS, подсветка)
```

### Что покрыто

**validators.ts** — `isValidEmail`, `isValidPhone`, `validateOrderForm`, `validateReviewForm`, граничные случаи

**formatters.ts** — `formatPrice` (копейки→рубли), `formatDuration`, `pluralize` (склонения), `formatDate`, `formatRating`

**helpers.ts** — `slugify`, `truncateText`, `debounce`, `groupBy`, работа с массивами

**SearchBar.vue** — XSS-экранирование в `v-html`, подсветка совпадений, сохранение в localStorage

---

## E2E тесты (Playwright)

### Запуск

```bash
cd client-nuxt

# Нужен запущенный сервер!
npm run dev             # в отдельном терминале

npm run test:e2e        # headless
npm run test:e2e:ui     # визуальный UI Playwright
```

### Проекты

| Проект | Viewport | Описание |
|--------|----------|---------|
| `chromium` | Desktop 1280px | Основные тесты |
| `mobile` | iPhone 13 390px | Мобильная проверка |

### Файлы тестов

```
tests/e2e/
├── fixtures/
│   ├── api.ts          # MOCK_TEMPLATE, MOCK_STATS, MOCK_CATEGORY...
│   └── mockApi.ts      # mockHomepageApi() — мок публичных GET
├── about.spec.ts       # /about — контент, JSON-LD Person, CTA
├── catalog.spec.ts     # /catalog — карточки, фильтры, breadcrumb
├── contact.spec.ts     # форма обратной связи (только десктоп)
├── date-slug.spec.ts   # /date/:slug — квест, FAQ, JSON-LD
├── header.spec.ts      # навигация, мобильное меню, scroll
├── homepage.spec.ts    # / — заголовок, шаги, og:image
├── order.spec.ts       # полный флоу заказа (3 шага)
└── quest-player.spec.ts # прохождение квеста, защита кодом
```

### mockHomepageApi()

Ключевая утилита. Мокирует `/stats`, `/categories`, `/reviews/featured`, `/templates/featured`, `/templates/popular`, `/tags/popular` через `page.route()`.

**Зачем:** при повторных запусках тестов rate limiter (1000 req/15min) выбивается на этих эндпоинтах. Мок перехватывает запросы до сервера.

```typescript
import { mockHomepageApi } from './fixtures/mockApi'

test.beforeEach(async ({ page }) => {
  await mockHomepageApi(page)
  await page.goto('/')
})
```

### Моки POST-запросов

```typescript
// Мокируем оба варианта URL (devProxy + прямой)
await page.route('**/api/orders', route => route.fulfill({ status: 201, ... }))
await page.route('http://localhost:5000/api/orders', route => route.fulfill({ status: 201, ... }))
```

Два паттерна нужны потому что `apiBase` может быть как `/api` (через devProxy, новый конфиг) так и `http://localhost:5000/api` (прямой, если сервер не перезапущен).

### Особенности компонентов

**TemplateCard** — внешний контейнер `<article>` (не `<a>`), клик через `@click`. Для теста используй `a[href*="/date/"]` для ссылок внутри карточки.

**Кастомный чекбокс в OrderForm** — нет `<input type="checkbox">`, только `<label @click>` и `<div class="checkbox-box">`. Кликай по `.checkbox-box`, не по `.checkbox-label` (внутри есть `<a @click.stop>` которые поглощают клик).

**Контактная форма** — скрыта на мобильном (`display:none` в CSS), тесты только для десктопа. Требует ожидания `.contact-form` для гарантии гидрации Vue перед кликом.

**Quest Player** — 403 от сервера при неверном/отсутствующем коде теперь корректно обрабатывается через `err.data.requires_code` в catch-блоке.

### Переменные окружения для E2E

```env
E2E_BASE_URL=http://localhost:3000      # URL Nuxt (по умолчанию)
E2E_TEST_QUEST_SLUG=test-quest          # slug публичного квеста в БД
```

`E2E_PROTECTED_QUEST_SLUG` больше не нужен — тест защищённого квеста использует мок.

---

## Текущий статус

```
102 passed  ✓
2 skipped   (quest-player: тесты с реальным квестом, пропускаются если slug не в БД)
0 failed
```

Пропущенные тесты — нормально. Они используют `test.skip()` при ответе 404 от сервера (квест не создан в тестовой БД). Для полного покрытия создай тестовый квест и передай slug через `E2E_TEST_QUEST_SLUG`.