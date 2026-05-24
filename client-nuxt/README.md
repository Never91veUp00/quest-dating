# Quest Dating — Frontend (Nuxt 4)

Nuxt 4 фронтенд для сервиса романтических свиданий-квестов.

**Рендеринг:** SSR для каталога и страниц квестов, SSG для блога и статических страниц, CSR для админки и плеера.

---

## Стек

- **Nuxt 4** / **Vue 3**
- **@nuxtjs/seo** — sitemap, robots, useSeoMeta
- **Playwright** — E2E тесты
- **Vitest** — unit тесты

---

## Запуск

```bash
cd client-nuxt
npm install

# Dev сервер (порт 3000)
npm run dev

# Production сборка
npm run build
npm run preview
```

Для работы в dev нужен запущенный Express API на `:5000`.  
Nuxt автоматически проксирует `/api/*` → `localhost:5000/api`.

---

## Переменные окружения

```env
# Dev — не нужны (devProxy проксирует /api на :5000)

# Production
NUXT_PUBLIC_API_BASE=https://questdating.ru/api
NUXT_API_BASE_INTERNAL=http://server:5000/api
```

---

## Структура

```
client-nuxt/
├── app/
│   ├── app.vue                  # Root — isFullscreen для quest player
│   ├── pages/
│   │   ├── index.vue            # Главная (SSR)
│   │   ├── catalog.vue          # Каталог с фильтрами (SSR)
│   │   ├── about.vue            # О Лизе Петри (SSR)
│   │   ├── privacy.vue          # Политика конфиденциальности
│   │   ├── terms.vue            # Условия использования
│   │   ├── date/[slug].vue      # Страница квеста (SSR + JSON-LD)
│   │   ├── categories/[slug].vue # Категория (SSR)
│   │   ├── blog/
│   │   │   ├── index.vue        # Блог (SSG)
│   │   │   └── [slug].vue       # Статья (SSG)
│   │   ├── order/[templateSlug].vue # Форма заказа (CSR, 4 шага)
│   │   ├── my-order/[token].vue # Страница отслеживания заказа (CSR, noindex)
│   │   ├── quest/[slug].vue     # Плеер квеста (CSR)
│   │   └── admin/               # Админ-панель (CSR)
│   ├── components/
│   │   ├── common/              # Header, Footer, Modal, Breadcrumbs...
│   │   ├── marketplace/         # TemplateCard, TemplateFilters, CategoryCard...
│   │   ├── order/               # OrderForm (4 шага), OrderSummary
│   │   ├── template/            # TemplateAuthor, TemplateGallery, TemplateFeatures...
│   │   └── quest/               # QuestSplash, QuestBlock, QuestTimer...
│   ├── composables/
│   │   ├── useApi.js            # Все API вызовы (useDatesApi + useAdminApi)
│   │   ├── useQuestEditor.js    # Редактор квестов (блоки, шаблоны)
│   │   └── useFilters.js        # Фильтры каталога
│   ├── data/
│   │   └── blogPosts.js         # Статические статьи блога
│   └── assets/styles/
│       ├── variables.css
│       ├── main.css
│       └── animations.css
├── server/
│   └── routes/
│       └── uploads/[...path].js # Nitro proxy /uploads/** → Express
├── tests/
│   ├── unit/                    # Vitest
│   └── e2e/                     # Playwright
│       ├── fixtures/
│       │   ├── api.ts
│       │   └── mockApi.ts       # mockHomepageApi()
│       ├── about.spec.ts
│       ├── catalog.spec.ts
│       ├── date-slug.spec.ts    # FAQ, JSON-LD, breadcrumbs
│       ├── header.spec.ts
│       ├── homepage.spec.ts
│       ├── order.spec.ts        # 4-шаговая форма
│       └── quest-player.spec.ts
├── nuxt.config.ts
└── package.json
```

---

## Стратегии рендеринга

Настраиваются в `nuxt.config.ts` через `routeRules`:

| Маршрут | Стратегия | Причина |
|---|---|---|
| `/`, `/catalog`, `/date/*`, `/categories/*` | SSR | SEO, актуальные данные |
| `/blog`, `/blog/*` | SSG | Статический контент |
| `/order/*`, `/quest/*`, `/admin/*` | CSR | Не индексируется |
| `/my-order/*` | CSR | Страница отслеживания заказа (noindex) |

---

## SEO

Каждая страница квеста (`/date/[slug]`) содержит три JSON-LD схемы:
- `Product` — цена, рейтинг, описание
- `FAQPage` — 5 вопросов с ответами (rich snippets)
- `BreadcrumbList` — хлебные крошки

Страница `/about` содержит `Person` схему для Лизы Петри.  
Страницы категорий (`/categories/[slug]`) содержат `BreadcrumbList`.

---

## Блог

Статьи хранятся в `app/data/blogPosts.js` — статический JS-массив.  
Для добавления статьи: добавь объект в `BLOG_POSTS` и пересобери.

Обязательные поля: `slug`, `title`, `excerpt`, `category`, `date`, `readingTime`, `content` (HTML-строка).

---

## OrderForm — 4 шага

| Шаг | Содержимое |
|---|---|
| 1. Контакты | Имя, email, telegram/телефон, дата и город |
| 2. Настройка | Дополнительные опции квеста |
| 3. О паре | 5 наводящих вопросов о партнёре и паре |
| 4. Пожелания | Настроение, идеи, дополнительно + согласие |

После успешного оформления: модальное окно показывает кнопку **«Детали заказа →»** ведущую на `/my-order/<view_token>`.

Ответы шагов 3–4 автоматически собираются в поле `description` через геттер — бэкенд не менялся.

---

## Тесты

```bash
cd client-nuxt

# Unit (Vitest)
npm run test

# E2E (нужен запущенный dev сервер)
npm run dev &
npm run test:e2e

# Playwright UI
npm run test:e2e:ui
```

Текущий статус: **110 passed**, 2 skipped (quest-player без тестового квеста в БД).

Подробнее: [`../docs/TESTING.md`](../docs/TESTING.md)

---

## Ключевые правила

**Никогда не вкладывай `<NuxtLink>` в `<NuxtLink>`** — используй `<article @click="router.push()">` для внешнего контейнера.

**`ClientOnly` для данных зависящих от клиента** — `views_count`, `Date()`, `localStorage`.

**JWT через `useCookie`** — не `localStorage` (недоступен при SSR).

**Все API вызовы через `useApi.js`** — не создавай прямые `$fetch` в компонентах.

**`useDatesApi().getOrderByToken(token)`** — загружает публичные данные заказа по `view_token` для страницы `/my-order/[token]`.

**Градиент бренда:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`