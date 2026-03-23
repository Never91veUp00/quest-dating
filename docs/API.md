# API Документация

REST API Quest Dating. Базовый URL: `http://localhost:5000/api` (dev) / `https://questdating.ru/api` (prod)

## Формат ответов

```javascript
{ "success": true, "data": { ... } }
{ "success": true, "data": [...], "pagination": { "total": 50, "page": 1, "limit": 12 } }
{ "success": false, "message": "Описание ошибки" }
{ "success": false, "requires_code": true, "data": { "title": "...", "theme": "..." } }  // 403 защищённый квест
```

---

## Публичные эндпоинты

### Статистика

```
GET /stats
```
→ `{ total_templates, total_orders, total_reviews, average_rating }`

### Сценарии квестов

```
GET /templates
```
Параметры: `category` (slug), `difficulty` (easy/medium/hard/expert), `location_type`, `min_price`, `max_price`, `search`, `sort_by` (popular/newest/rating), `page`, `limit`, `tags` (ids через запятую)

```
GET /templates/featured?limit=6
GET /templates/popular?limit=6
GET /templates/:slug
```

Поля ответа: `id`, `slug`, `title`, `tagline`, `description`, `base_price` **(в копейках)**, `duration_minutes`, `difficulty`, `rating`, `orders_count`, `reviews_count`, `category_name`, `category_slug`, `author_name`, `tags[]`, `features[]`, `structure{}`

### Категории

```
GET /categories
```
→ `[{ id, name, slug, description, color, icon, templates_count }]`

### Теги

```
GET /tags
GET /tags/popular?limit=20
```

### Отзывы

```
GET /reviews/featured?limit=6
POST /reviews
```
Тело POST: `{ template_id, client_name, rating, comment }`

### Заказы

```
POST /orders
```
```json
{
  "template_id": 1,
  "client_name": "Имя",
  "client_email": "email@example.com",
  "client_phone": "+79161234567",
  "description": "Пожелания и ответы на вопросы анкеты",
  "event_date": "2025-06-15",
  "event_city": "Москва"
}
```
Rate limit: 5 заказов/час с одного IP. Отправляет Telegram уведомление.

### Квесты (прохождение)

```
GET  /quests/:slug                          → квест (403 если требует код)
POST /quests/:slug/access                   → { access_code }
POST /quests/:questId/session               → создать сессию
PATCH /quests/session/:sessionId            → обновить прогресс
POST /quests/session/:sessionId/complete    → завершить
POST /quests/session/:sessionId/restart     → { quest_id } — перезапустить
GET  /quests/session/:sessionId/stats       → статистика
```

**Важно:** `access_code` только в теле POST, никогда в URL. `restart` требует `quest_id` в теле.

---

## Аутентификация

```
POST /auth/login     → { username, password } → { token }
GET  /auth/me        → проверка токена
POST /auth/logout
```

Rate limit: 5 попыток/15 мин на login.

---

## Админ-эндпоинты

Все требуют `Authorization: Bearer <token>`.

### Заказы

```
GET    /admin/orders
GET    /admin/orders/:id
PATCH  /admin/orders/:id/status    → { status: 'confirmed'|'in_progress'|'completed'|'cancelled' }
DELETE /admin/orders/:id           → только отменённые (status = 'cancelled')
```

### Сценарии

```
GET    /admin/templates             → опубликованные (для редактора квестов)
GET    /admin/templates/all         → все (для управления витриной)
GET    /admin/templates/:id
POST   /admin/templates/create
PUT    /admin/templates/:id
PATCH  /admin/templates/:id/status  → { status: 'draft'|'published'|'archived' }
DELETE /admin/templates/:id
```

### Квесты

```
GET    /admin/quests
GET    /admin/quests/:id
POST   /admin/quests
PUT    /admin/quests/:id
DELETE /admin/quests/:id
```

### Прочее

```
GET  /admin/dashboard          → статистика + recent_orders + recent_quests
GET  /admin/categories         → для селекта при создании сценария
POST /admin/upload/image       → multipart/form-data (field: image) → { url }
POST /admin/upload/images      → multipart/form-data (field: images[]) → [urls]
```

---

## Rate Limits

| Endpoint | Лимит | Окно |
|---------|-------|------|
| Все `/api/*` | 300 (prod) / 1000 (dev) | 15 мин |
| `/contact` | 3 | 1 час |
| `/orders` | 5 | 1 час |
| `/auth/login` | 5 попыток | 15 мин |
| `/admin/*` | 2000 (prod) | 15 мин |

Dev: запросы с localhost не ограничиваются.

---

## Коды ошибок

| Код | Значение |
|-----|---------|
| 400 | Неверные данные |
| 401 | Не авторизован |
| 403 | Нет доступа / квест требует код |
| 404 | Не найден |
| 409 | Конфликт (slug занят) |
| 429 | Rate limit |
| 500 | Ошибка сервера |