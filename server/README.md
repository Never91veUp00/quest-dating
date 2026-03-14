# Quest Dating — Backend API

Express REST API для сервиса романтических свиданий-квестов.

## Стек

- **Node.js** v20 / **Express.js**
- **PostgreSQL** 14+ — основная БД
- **JWT** — аутентификация администратора
- **Telegram Bot API** — уведомления о заказах
- **express-rate-limit** — защита от спама
- **DOMPurify** — XSS-защита контента
- **bcrypt** — хеширование паролей
- **multer** — загрузка изображений

---

## Запуск

```bash
cd server
npm install
cp .env.example .env    # заполни переменные

# Dev (nodemon)
npm run dev

# Production
npm start
```

Сервер запускается на `http://localhost:5000`

---

## Переменные окружения

| Переменная | Описание | Обязательная |
|---|---|---|
| `NODE_ENV` | `development` / `production` | — |
| `PORT` | Порт сервера (по умолчанию 5000) | — |
| `DB_HOST` | Хост PostgreSQL (`localhost` / `postgres` в Docker) | ✓ |
| `DB_PORT` | Порт PostgreSQL | — |
| `DB_NAME` | Имя базы данных | ✓ |
| `DB_USER` | Пользователь БД | ✓ |
| `DB_PASSWORD` | Пароль БД | ✓ |
| `JWT_SECRET` | Секрет для JWT (мин. 32 символа) | ✓ |
| `JWT_EXPIRES_IN` | Срок жизни токена (по умолчанию `7d`) | — |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram-бота | — |
| `TELEGRAM_CHAT_ID` | Chat ID для уведомлений | — |
| `ALLOWED_ORIGINS` | CORS origins через запятую | — |
| `MAX_FILE_SIZE` | Максимальный размер файла в байтах (по умолчанию 5 MB) | — |

---

## API

Полная документация: [`../docs/API.md`](../docs/API.md)

### Публичные эндпоинты

```
GET  /api/templates              # Каталог с фильтрами (category, difficulty, duration, tags, search)
GET  /api/templates/featured     # Избранные
GET  /api/templates/popular      # Популярные
GET  /api/templates/:slug        # Детальная страница квеста
GET  /api/categories             # Все категории
GET  /api/categories/:slug       # Категория по slug
GET  /api/tags/popular           # Популярные теги
GET  /api/stats                  # Счётчики платформы
POST /api/orders                 # Оформить заказ (rate limited)
POST /api/contact                # Форма связи (rate limited)
GET  /api/reviews/featured       # Отзывы для главной
POST /api/reviews                # Оставить отзыв
```

### Защищённые (JWT)

```
POST  /api/auth/login
GET   /api/auth/me
GET   /api/admin/dashboard
GET   /api/orders
PATCH /api/orders/:id/status
POST  /api/admin/upload/images
GET   /api/templates/all         # Все шаблоны включая черновики
POST  /api/admin/templates
PUT   /api/admin/templates/:id
```

### Фильтры каталога

`GET /api/templates` принимает query-параметры:

| Параметр | Тип | Описание |
|---|---|---|
| `category` | integer | ID категории |
| `tags` | string | ID тегов через запятую: `1,2,3` |
| `difficulty` | string | `easy`, `medium`, `hard`, `expert` |
| `duration` | string | `0-60`, `60-120`, `120-180`, `180+` |
| `min_price` | integer | Цена от (в рублях) |
| `max_price` | integer | Цена до (в рублях) |
| `search` | string | Полнотекстовый поиск |
| `sort_by` | string | `rating`, `newest`, `orders`, `price` |
| `order` | string | `ASC` / `DESC` |

---

## Структура

```
server/
├── src/
│   ├── config/
│   │   ├── database.js          # Пул подключений PostgreSQL
│   │   └── constants.js         # ORDER_STATUS, FEATURE_PRICES...
│   ├── controllers/
│   │   ├── templateController.js  # Каталог + фильтры
│   │   ├── orderController.js
│   │   ├── questController.js
│   │   ├── reviewController.js
│   │   ├── categoryController.js
│   │   ├── tagController.js
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT проверка
│   │   ├── rateLimiter.js       # contactLimiter, orderLimiter
│   │   ├── upload.js            # Multer
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── api.js               # Корневой роутер
│   │   ├── templates.js
│   │   ├── orders.js
│   │   ├── categories.js
│   │   ├── tags.js
│   │   ├── reviews.js
│   │   ├── quests.js
│   │   ├── auth.js
│   │   └── admin.js
│   ├── services/
│   │   └── telegramService.js
│   └── server.js
├── uploads/                     # Загруженные изображения
├── .env
├── .env.example
└── package.json
```

---

## Важные правила PostgreSQL

```javascript
// COUNT() возвращает строку — всегда parseInt!
const total = parseInt(result.rows[0].count)

// Массивы требуют явного каста
await pool.query('SELECT * FROM t WHERE id = ANY($1::int[])', [[1, 2, 3]])

// Специфичные маршруты ПЕРЕД параметрическими
router.get('/all', ...)      // ✓ сначала
router.get('/:id', ...)      // ✓ потом
```

---

## Безопасность

- Параметризованные SQL-запросы — без конкатенации строк
- JWT на все admin-маршруты (`requireAdmin` middleware)
- Rate limiting: 3 контакта/час, 5 заказов/час
- CORS через `ALLOWED_ORIGINS`
- Пароль администратора — только bcrypt-хеш
- Загрузка файлов: только JPEG/PNG/WebP, максимум 5 MB