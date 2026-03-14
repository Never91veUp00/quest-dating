# API Документация

REST API для Quest Dating. Базовый URL: `http://localhost:5000/api`

В production: `https://questdating.ru/api`

## Формат ответов

```javascript
// Успех
{ "success": true, "data": { ... } }

// Список с пагинацией
{ "success": true, "data": [...], "pagination": { "total": 50, "page": 1, "limit": 12, "totalPages": 5 } }

// Ошибка
{ "success": false, "message": "Описание ошибки" }

// 403 — защищённый квест
{ "success": false, "requires_code": true, "data": { "title": "...", "theme": "..." } }
```

---

## Эндпоинты

### Общее

```
GET /stats
```
Возвращает счётчики платформы: `total_templates`, `total_orders`, `total_reviews`, `average_rating`.

---

### Шаблоны квестов

```
GET /templates
```
Параметры: `category` (slug), `difficulty` (easy/medium/hard), `location_type`, `min_price`, `max_price`, `search`, `sort` (popular/newest/rating), `page`, `limit`.

```
GET /templates/featured?limit=6
GET /templates/popular?limit=6
GET /templates/:slug
```

Поля ответа включают: `id`, `slug`, `title`, `tagline`, `description`, `base_price` (в копейках), `duration_minutes`, `difficulty`, `rating`, `orders_count`, `reviews_count`, `category_name`, `category_slug`, `category_color`, `author_name`, `tags[]`, `features[]`, `faq[]`.

---

### Категории

```
GET /categories
```
Список всех категорий с `id`, `name`, `slug`, `color`, `icon`, `templates_count`.

---

### Теги

```
GET /tags/popular?limit=20
```

---

### Отзывы

```
GET /reviews/featured?limit=6
```

---

### Заказы

```
POST /orders
```
Тело запроса:
```json
{
  "template_id": 1,
  "client_name": "Имя",
  "client_email": "email@example.com",
  "client_phone": "+79161234567",
  "event_date": "2025-06-15",
  "event_city": "Москва",
  "description": "Пожелания...",
  "agree_terms": true,
  "selected_features": [1, 2],
  "customization": {}
}
```
Rate limit: 5 заказов в час с одного IP.

Ответ: `{ success: true, data: { id, total_price, client_email } }` — отправляет Telegram уведомление.

---

### Контакт

```
POST /contact
```
Тело: `{ name, phone, message }`. Rate limit: 3 в час.

---

### Квесты (прохождение)

```
GET  /quests/:slug                    — получить квест (403 если требует код)
POST /quests/:slug/access             — { access_code } → разблокировать квест
POST /quests/:questId/session         — создать сессию прохождения
PATCH /quests/session/:sessionId      — обновить прогресс
POST /quests/session/:sessionId/complete — завершить квест
POST /quests/session/:sessionId/restart  — перезапустить
GET  /quests/session/:sessionId/stats — статистика сессии
```

**Важно:** `access_code` передаётся только в теле запроса, никогда в URL.

---

### Аутентификация (Админка)

```
POST /auth/login     — { username, password } → { token }
GET  /auth/me        — проверка токена (требует Authorization: Bearer <token>)
POST /auth/logout
```
Rate limit на login: 5 попыток / 15 минут (успешные входы не засчитываются).

---

### Админ-эндпоинты

Все требуют `Authorization: Bearer <token>` с ролью `admin`.

```
GET    /admin/templates
POST   /admin/templates
PATCH  /admin/templates/:id
DELETE /admin/templates/:id

GET    /admin/orders
PATCH  /admin/orders/:id      — обновить статус

GET    /admin/quests          — созданные квесты
POST   /admin/quests          — создать квест для заказа

GET    /admin/stats           — расширенная статистика
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

В dev режиме запросы с `localhost` не ограничиваются.

---

## Коды ошибок

| Код | Значение |
|-----|---------|
| 400 | Неверные данные запроса |
| 401 | Не авторизован (нет/истёк токен) |
| 403 | Нет доступа / квест требует код |
| 404 | Ресурс не найден |
| 429 | Превышен rate limit |
| 500 | Ошибка сервера |