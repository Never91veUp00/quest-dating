# API Документация

REST API Quest Dating. Базовый URL для API: `http://localhost:5000/api` (dev) / `https://questdating.ru/api` (prod).

Health endpoint живёт **на корне сервера**, не под `/api` — `GET /health`. Это сделано чтобы мониторинг ходил напрямую в backend, минуя любые префиксы (см. `monitor.sh`).

## Формат ответов

```javascript
{ "success": true, "data": { ... } }
{ "success": true, "data": [...], "pagination": { "total": 50, "page": 1, "limit": 12 } }
{ "success": false, "message": "Описание ошибки" }
{ "success": false, "requires_code": true, "data": { "title": "...", "theme": "..." } }  // 403 защищённый квест
```

---

## Публичные эндпоинты

### Health

```
GET /health   (на корне сервера, не под /api)
```

Реально проверяет соединение с БД через `pool.query('SELECT 1')`. Поле
`services` показывает **настроенность** (наличие env), а не живость внешних
каналов уведомлений. Ответ:

```json
// 200 — БД ок
{ "status": "OK", "db": "connected",
  "services": { "telegram": "configured", "resend": "configured", "notifyEmail": "configured" },
  "timestamp": "...", "uptime": 12345 }

// 503 — БД недоступна (services присутствует и здесь)
{ "status": "DEGRADED", "db": "disconnected",
  "services": { "telegram": "not_configured", "resend": "not_configured", "notifyEmail": "not_configured" },
  "error": "...", "timestamp": "..." }
```

Значения `services.*`: `configured` / `not_configured`. Условия зеркалят
реальную логику отправки в `notificationService`:
- `telegram` — `configured`, только если заданы И `TELEGRAM_BOT_TOKEN`, И `TELEGRAM_CHAT_ID`
- `resend` — `RESEND_API_KEY`
- `notifyEmail` — `NOTIFY_EMAIL` (получатель писем)

⚠️ `services` отражает только **наличие переменных**, не живость API. Здесь
намеренно нет активного пинга Telegram/Resend: `/health` — горячий путь
мониторинга (monitor.sh + pinger каждые 1-5 мин), пинг замедлял бы его и жёг
квоты. Проверка живости отправок — отдельный отложенный follow-up (1.4.2b).

**Контракт для мониторинга:** при живой БД код **200** и поле `"db":"connected"`
неизменны — `monitor.sh` парсит именно их. Поле `services` добавлено рядом и
обратную совместимость не ломает.

Заголовок ответа: `Cache-Control: no-store`. Дёргается напрямую `127.0.0.1:5001/health`, минуя nginx и кэш — это даёт настоящий сигнал о состоянии системы.

История появления: см. `docs/incidents.md` (INC-001).

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

### Sitemap

```
GET /sitemap-urls
```

→ `{ templates: [slug, ...], categories: [slug, ...] }` — все опубликованные шаблоны и все категории. Используется Nitro route `client-nuxt/server/routes/sitemap-urls.get.ts` как источник динамических URL для `@nuxtjs/seo`.

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
Rate limit: 10 заказов/час с одного IP (было 5 — слишком мало при тихих ошибках валидации, см. комментарий в `rateLimiter.js`).

Ответ включает `view_token` — UUID для публичной страницы отслеживания заказа.

При создании заказа автоматически отправляется:
- Email клиенту (Resend) с деталями и ссылкой на `/my-order/<view_token>`
- Telegram-уведомление администратору

```
GET /orders/by-token/:token
```
Публичный (без авторизации). Возвращает детали заказа по `view_token`.
Поля: `id`, `client_name`, `client_email`, `event_date`, `event_city`, `total_price`, `status`, `selected_features`, `view_token`, `template_title`, `template_image`.

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
POST /admin/upload/media       → multipart/form-data (field: media) → { url, type: 'video'|'audio', originalName, size }
```

### Дублирование маршрутов orders

> Часть админских операций над заказами доступна также через `/api/orders/*` с `requireAdmin`-мидлварой (`GET /api/orders`, `GET /api/orders/stats`, `GET /api/orders/:id`, `PATCH /api/orders/:id/status`, `DELETE /api/orders/:id`). Это исторический техдолг — два пути к одному и тому же ресурсу. Фронтенд использует `/admin/orders/*`; альтернативный путь оставлен для обратной совместимости. Унификация — задача для отдельного рефакторинга в будущем.

---

## Telegram Webhook

```
POST /telegram/webhook
```

Вебхук Telegram Bot API. Зарегистрирован через `setWebhook` с параметром `secret_token`. Telegram передаёт это значение в каждый запрос в заголовке `X-Telegram-Bot-Api-Secret-Token`.

### Верификация

Каждый запрос проверяется:

- `TELEGRAM_WEBHOOK_SECRET` задан и заголовок не совпадает → `401 Unauthorized`
- `TELEGRAM_WEBHOOK_SECRET` задан и заголовок совпадает → обработка
- `TELEGRAM_WEBHOOK_SECRET` не задан → пропуск проверки + warning в логе (backward compatibility, см. PR #6/#7)

### Команды

Обрабатывает входящие сообщения боту `@questdating_bot`:

- `/start` (без токена) — приветственное сообщение
- `/start <view_token>` — находит заказ по токену, отвечает сводкой: название квеста, статус, дата, город, сумма, ссылка на сайт

### Поведение

- Отвечает HTTP 200 **немедленно** (требование Telegram API), затем обрабатывает асинхронно
- На системные ошибки (БД недоступна и т.п.) клиенту не отвечает — пишет в логи
- При несовпадении secret_token — 401, до основной обработки

### Регистрация (один раз после деплоя)

```bash
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?\
url=https://questdating.ru/api/telegram/webhook&\
secret_token=${TELEGRAM_WEBHOOK_SECRET}&\
drop_pending_updates=true"
```

---

## Rate Limits

| Endpoint | Лимит (prod) | Лимит (dev) | Окно |
|---------|--------------|-------------|------|
| Все `/api/*` | 300 | 1000 | 15 мин |
| `/quests/*` (прохождение) | 200 | 1000 | 15 мин |
| `/admin/*` | 2000 | 100 000 | 15 мин |
| `/orders` (создание) | 10 | 10 | 1 час |
| `/contact` | 3 | 3 | 1 час |
| `/auth/login` | 5 попыток (только неудачных) | 5 | 15 мин |

Замечания:

- В **dev** запросы с `127.0.0.1`/`::1` не ограничиваются вообще (нужно для E2E и SSR).
- `loginLimiter` использует `skipSuccessfulRequests: true` — успешный вход не списывает попытку. То есть лимит работает только против неудачных попыток.
- `orderLimiter` подняли 5 → 10 в феврале 2026 — при тихих ошибках валидации формы лимит срабатывал слишком быстро.

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