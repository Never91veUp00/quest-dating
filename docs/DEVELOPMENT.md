# Руководство по разработке

## Рабочий процесс

Требования: Node 22 LTS (используем nvm, не apt), PostgreSQL 15 (или Docker), npm 9+.

```bash
cd server && npm run dev          # Express :5000
cd client-nuxt && npm run dev     # Nuxt :3000
```

Nuxt devProxy проксирует `/api/*` → `localhost:5000/api`.

Основная ветка: `production`. Это и default branch на GitHub, и та ветка, что развёрнута на проде. Любая работа идёт от неё через feature-ветки (см. раздел «Git» ниже).

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

### useQuestEditor.js

Центральный composable редактора квестов в `/admin/quest/`.

`applyTemplate(tpl)` — применяет шаблон: копирует `structure` в блоки, устанавливает `theme`, `player_version`, `show_intro` из `default_*` полей шаблона.

`loadTemplate(tplId?)` — если передан ID, ищет шаблон в `templates.value`, запрашивает подтверждение если есть контент, вызывает `applyTemplate`.

При создании квеста из заказа (`/admin/quest/new?order_id=X&template_id=Y`): onMounted автоматически вызывает `loadTemplate(template_id)`.

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

### Telegram / Email уведомления

```javascript
// Порядок в createOrder: сначала ответ клиенту, потом уведомления
res.status(201).json({ success: true, data: { ...order, view_token } })
notifyNewOrder(order, tplTitle).catch(...)         // admin: Telegram + Email
sendClientOrderEmail(order, tplTitle).catch(...)   // client: Email (Resend)
```

`notificationService.js` — единая точка для всех уведомлений:
- `sendEmail(subject, html, to?)` — `to` опционален (по умолчанию `NOTIFY_EMAIL`)
- `sendClientOrderEmail(order, templateTitle)` — красивое письмо клиенту с view_token ссылкой
- `notifyNewOrder` / `notifyOrderStatusChange` / `notifyContactMessage` — для администратора

> `NOTIFY_EMAIL` — **обязательная** переменная окружения. Раньше был fallback на личный email — убран в PR #1. Если переменная не задана, email админу не отправляется (warn в логе).

Telegram-вебхук (`routes/telegram.js`) обрабатывает `/start <token>` — клиент переходит по ссылке из письма, бот отвечает деталями заказа. Webhook проверяет заголовок `X-Telegram-Bot-Api-Secret-Token` против `TELEGRAM_WEBHOOK_SECRET` — при несовпадении 401 (PR #6/#7).

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

Sitemap: динамический через `client-nuxt/server/routes/sitemap-urls.get.ts` (Nitro route `/sitemap-urls` → дёргает Express `GET /api/sitemap-urls`).

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

### Ветки

- `production` — единственная долгоживущая. Default на GitHub, развёрнута на проде. Прямые коммиты запрещены.
- `upgrade/<short-name>` — для технических задач из `docs/upgrade-plan.md` (рефакторинги, апгрейды зависимостей)
- `docs/<short-name>` — для правок документации
- `fix/<short-name>` / `feat/<short-name>` — для багфиксов и фич

### Workflow

```bash
git checkout production
git pull origin production
git branch --show-current        # убедиться, что на production
git checkout -b upgrade/cache-metrics
git branch --show-current        # убедиться, что переключились
# ... работа, коммиты ...
git push origin upgrade/cache-metrics
# → открыть PR на GitHub, base production
# → merge после ревью
# → на проде: git pull origin production + при необходимости docker compose build
```

Подробнее про варианты деплоя после мерджа — `docs/DEPLOY.md` (раздел «Регулярное обновление»).

### Коммиты — Conventional Commits

Формат: `тип(scope): краткое описание`

Типы: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`.

Scope опционален: `chore(deps): bump vitest 3 → 4`, `fix(security): убрать hardcoded email`, `feat(health): /health проверяет БД`.

Один логический шаг — один коммит. Если задача большая, разбивать на несколько коммитов внутри одной feature-ветки.

### lock-файлы

`package-lock.json` (server, client-nuxt) — **трекаются в git** (с PR #13). Раньше были в `.gitignore` — это была фундаментальная ошибка для воспроизводимости билдов. Теперь `npm ci` работает воспроизводимо и в Docker, и локально.

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