# Руководство по разработке

## Рабочий процесс

```bash
cd server && npm run dev          # Express :5000
cd client-nuxt && npm run dev     # Nuxt :3000
```

Nuxt devProxy проксирует `/api/*` → `localhost:5000/api`.

Основная ветка: `feature/nuxt3-migration`.

---

## Frontend (Nuxt 4)

### Добавление страницы

1. `app/pages/название.vue`
2. `routeRules` в `nuxt.config.ts`
3. `useSeoMeta()` + `useServerHead()` с JSON-LD

```vue
<script setup>
useSeoMeta({ title: '... | Quest Dating', description: '...', ogImage: '/og-image.jpg' })

// JSON-LD — ОБЯЗАТЕЛЬНО геттер () =>
useServerHead({
  script: [{ type: 'application/ld+json', innerHTML: () => JSON.stringify({ '@context': 'https://schema.org', ... }) }]
})

const { data } = await useAsyncData('key', () => getDates())
</script>
```

### Критические правила

**Не вкладывай `<NuxtLink>` в `<NuxtLink>`** — невалидный HTML, hydration error. Используй `<article @click="router.push(...)">`.

**`useServerHead` с JSON-LD** — `innerHTML` ОБЯЗАН быть `() => JSON.stringify(...)`. Прямой `JSON.stringify` ломает `_payload.json` при prefetch.

**JWT** — только `useCookie`, не `localStorage`.

**Изображения** — `:src="computed"`, не `src="/uploads/..."` (Vite ломает статику).

### OccasionFilters

Фильтрует по категориям из БД. При выборе — `occasionFilters` (отдельный ref, не влияет на `activeFiltersCount`).

| Повод | slug |
|-------|------|
| Дома | `home-quests` |
| По городу | `city-quests` |
| Предложение | `proposal` |
| В парке | `park-adventures` |
| Культурный | `cultural` |
| Гастро | `gastronomic` |

### useApi.js

Единственное место для всех API запросов.

```javascript
const { getDates, getDate, getCategories, createOrder } = useDatesApi()
const { get, post, patch, del } = useApi()
```

---

## Backend (Express)

### Все админ-роуты в admin.js

`routes/admin.js` содержит ВСЕ `/admin/*` эндпоинты — orders, templates, quests, upload.

### Правила PostgreSQL

```javascript
parseInt(result.rows[0].count)                    // COUNT() → строка
pool.query('... = ANY($1::int[])', [[1, 2, 3]])   // массивы
router.get('/templates/all', ...)  // специфичные ДО
router.get('/templates/:id', ...)  // параметрических
```

### Telegram

```javascript
res.json({ success: true, data: order })         // сначала ответ
notifyNewOrder(order).catch(console.error)        // потом уведомление
```

---

## SEO

### JSON-LD по страницам

| Страница | Схемы |
|----------|-------|
| `/` | `Organization` + `FAQPage` |
| `/date/:slug` | `Product` + `BreadcrumbList` + `FAQPage` |
| `/catalog` | `ItemList` |
| `/categories/:slug` | `BreadcrumbList` |
| `/about` | `Person` |

Sitemap: динамический через `server/api/sitemap-urls.get.ts`.

---

## База данных

```bash
# Docker
docker exec -it quest-dating-db psql -U quest_user -d quest_dating

# Применить миграцию
Get-Content migration.sql | docker exec -i quest-dating-db psql -U quest_user -d quest_dating
```

```sql
-- Квесты
SELECT qt.id, qt.slug, qt.title, c.name, qt.status
FROM quest_templates qt LEFT JOIN categories c ON qt.category_id = c.id;

-- Активные заказы
SELECT id, client_name, status FROM orders
WHERE status NOT IN ('cancelled','completed') ORDER BY created_at DESC;
```

---

## Git

```
feature/nuxt3-migration  ← основная рабочая ветка
main                     ← production
```

Формат коммитов: `feat(catalog): описание`, `fix(date-slug): описание`, `seo(about): описание`

---

## Команды

```bash
# Frontend
cd client-nuxt
npm run dev / build / test / test:e2e

# Docker
docker compose up -d
docker compose build --no-cache client
docker compose logs -f client
docker compose ps
```