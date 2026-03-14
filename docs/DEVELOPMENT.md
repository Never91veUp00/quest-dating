# Руководство по разработке

Документация для разработчиков Quest Dating.

## Оглавление

- [Рабочий процесс](#рабочий-процесс)
- [Frontend (Nuxt 4)](#frontend-nuxt-4)
- [Backend (Express)](#backend-express)
- [База данных](#база-данных)
- [Git workflow](#git-workflow)
- [Полезные команды](#полезные-команды)

---

## Рабочий процесс

### Запуск в dev

```bash
# Terminal 1
cd server && npm run dev          # Express на :5000

# Terminal 2
cd client-nuxt && npm run dev     # Nuxt 4 на :3000
```

Nuxt devProxy автоматически проксирует `/api/*` → `localhost:5000/api`. Браузер работает только с `:3000`, что важно для Playwright (перехват запросов).

### Ветка разработки

Вся работа ведётся в `feature/nuxt3-migration`. В `main` мержится только стабильный код.

---

## Frontend (Nuxt 4)

### Структура app/

```
app/
├── app.vue           # Root — isFullscreen для quest player
├── pages/            # Файловый роутинг
├── components/
│   ├── common/       # Header, Footer, Modal, Loader, Breadcrumbs...
│   ├── marketplace/  # TemplateCard, TemplateFilters...
│   ├── order/        # OrderForm, OrderSummary
│   └── quest/        # QuestSplash, QuestBlock, QuestTimer...
├── composables/
│   └── useApi.js     # Все API вызовы
└── assets/styles/    # variables.css, main.css, animations.css
```

### Добавление новой страницы

1. Создать файл в `app/pages/` — Nuxt автоматически создаст роут
2. Добавить `routeRules` в `nuxt.config.ts` с нужной стратегией рендеринга
3. Установить мета-теги через `useSeoMeta()`
4. Добавить JSON-LD если нужно для SEO

```vue
<script setup>
// Мета-теги
useSeoMeta({
  title: 'Заголовок | Quest Dating',
  description: 'Описание страницы',
  ogImage: '/og-image.jpg',
})

// Данные через SSR
const { getDates } = useDatesApi()
const { data } = await useAsyncData('key', () => getDates())
</script>
```

### useApi.js

Единственное место для всех API запросов. Не создавай прямые `$fetch` в компонентах.

```javascript
const {
  getDates,        // GET /templates?...
  getDate,         // GET /templates/:slug
  getCategories,   // GET /categories
  getStats,        // GET /stats
  createOrder,     // POST /orders
  sendContact,     // POST /contact
} = useDatesApi()
```

### Правила компонентов

**Никогда не вкладывай `<NuxtLink>` в `<NuxtLink>`** — оба рендерятся в `<a>`, это невалидный HTML и вызывает hydration error. Используй `<article>` или `<div>` с `@click="router.push()"` для внешнего контейнера, оставляя внутренние ссылки как `<NuxtLink>`.

**`ClientOnly` для контента зависящего от клиента:**
```vue
<ClientOnly>
  <div>{{ new Date().toLocaleDateString() }}</div>
</ClientOnly>
```

**JWT в `useCookie`, не в `localStorage`** — localStorage недоступен на сервере при SSR.

### Стили

Градиент бренда: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

CSS переменные объявлены в `assets/styles/variables.css`. Компонентные стили — `<style scoped>`.

---

## Backend (Express)

### Добавление нового endpoint

1. **Роут** в соответствующем файле `routes/`:
```javascript
router.get('/new-endpoint', controller.newMethod)
```

2. **Контроллер** в `controllers/`:
```javascript
export const newMethod = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT ...', [params])
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
}
```

3. **Важные правила PostgreSQL:**
```javascript
// COUNT() возвращает строку — всегда parseInt!
const count = parseInt(result.rows[0].count)

// Массивы параметров требуют явного каста
const q = 'SELECT * FROM t WHERE id = ANY($1::int[])'
await pool.query(q, [[1, 2, 3]])

// Специфичные роуты ПЕРЕД параметрическими
router.get('/featured', ...)  // ✅ сначала
router.get('/:id', ...)       // ✅ потом
```

### Rate limiter

При добавлении нового чувствительного endpoint (форма, платёж) — применить соответствующий limiter:
```javascript
import { contactLimiter } from '../middleware/rateLimiter.js'
router.post('/new-form', contactLimiter, controller.handle)
```

В dev режиме запросы с localhost автоматически пропускаются.

### Telegram уведомления

```javascript
import { sendTelegramNotification } from '../services/telegramService.js'

// Уведомление не должно блокировать HTTP-ответ
res.json({ success: true, data: order })
sendTelegramNotification(message).catch(console.error)  // после ответа
```

---

## База данных

### Подключение

```bash
# Локально
psql -U quest_user -d quest_dating

# В Docker
docker-compose exec postgres psql -U quest_user -d quest_dating
```

### Миграции

```bash
# Создать файл миграции
touch database/migrations/XXX_description.sql

# Применить
psql -U quest_user -d quest_dating -f database/migrations/XXX_description.sql
```

### Полезные запросы

```sql
-- Список квестов
SELECT id, slug, title, is_published FROM quest_templates ORDER BY id;

-- Активные заказы
SELECT id, client_name, status, created_at FROM orders
WHERE status != 'cancelled' ORDER BY created_at DESC LIMIT 20;

-- Сессии квестов за сегодня
SELECT COUNT(*) FROM quest_sessions
WHERE created_at >= CURRENT_DATE;
```

---

## Git workflow

### Именование веток

```
feature/nuxt3-migration     ← основная ветка разработки
feature/blog-routes         ← новые фичи
bugfix/catalog-filters      ← исправления
hotfix/payment-critical     ← срочные фиксы
```

### Формат коммитов

```
feat(catalog): добавить фильтр по сложности
fix(order): исправить кастомный чекбокс согласия
docs(testing): обновить TESTING.md под Nuxt 4
refactor(api): вынести mock helpers в fixtures/
test(e2e): добавить тест защищённого квеста
```

### Перед коммитом

```bash
# Убедиться что тесты проходят
cd client-nuxt
npm run test          # unit тесты
npm run test:e2e      # E2E (нужен запущенный сервер)
```

---

## Полезные команды

### Frontend

```bash
cd client-nuxt

npm run dev           # dev сервер
npm run build         # production сборка
npm run preview       # превью production build

npm run test          # unit тесты (Vitest)
npm run test:watch    # watch режим
npm run test:e2e      # E2E тесты (нужен dev сервер)
npm run test:e2e:ui   # Playwright UI
```

### Backend

```bash
cd server

npm run dev           # dev с nodemon
npm start             # production

npm test              # тесты
npm run test:watch    # watch режим
```

### Docker

```bash
docker-compose up -d              # запустить все
docker-compose logs -f server     # логи сервера
docker-compose logs -f client     # логи Nuxt
docker-compose restart client     # перезапустить Nuxt
docker-compose down               # остановить все
docker-compose build client       # пересобрать клиент
```