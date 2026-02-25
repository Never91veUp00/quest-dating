# Quest Dating — Backend API

REST API для персонального сервиса романтических квестов. Обрабатывает заказы клиентов, хранит квесты, управляет сессиями прохождения и предоставляет защищённый интерфейс для администратора.

## 🛠 Стек

- **Node.js** v18+ / **Express.js**
- **PostgreSQL** — основная база данных
- **JWT** — аутентификация администратора
- **Telegram Bot API** — уведомления о заказах
- **express-rate-limit** — защита от спама
- **DOMPurify** — XSS-защита контента
- **bcrypt** — хеширование паролей

## 📋 Требования

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

## 🚀 Установка и запуск

```bash
# Установить зависимости
cd server && npm install

# Настроить переменные окружения
cp .env.example .env
# Отредактировать .env

# Инициализировать базу данных
npm run db:init
npm run db:seed   # опционально — тестовые данные

# Запуск в режиме разработки (hot reload)
npm run dev

# Запуск в production
npm start
```

Сервер запускается на `http://localhost:5000`

## ⚙️ Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `NODE_ENV` | Режим работы | `development` |
| `PORT` | Порт сервера | `5000` |
| `DB_HOST` | Хост PostgreSQL | `localhost` |
| `DB_PORT` | Порт PostgreSQL | `5432` |
| `DB_NAME` | Имя базы данных | `quest_dating` |
| `DB_USER` | Пользователь БД | — |
| `DB_PASSWORD` | Пароль БД | — |
| `JWT_SECRET` | Секрет для JWT (мин. 32 символа) | — |
| `JWT_EXPIRES_IN` | Срок жизни токена | `7d` |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram-бота | — |
| `TELEGRAM_CHAT_ID` | Chat ID для уведомлений | — |
| `ADMIN_USERNAME` | Логин администратора | — |
| `ADMIN_PASSWORD_HASH` | bcrypt-хеш пароля администратора | — |
| `MAX_FILE_SIZE` | Максимальный размер файла (байт) | `5242880` |
| `ALLOWED_ORIGINS` | CORS origins (через запятую) | — |

## 📚 API Endpoints

### Публичные

#### Шаблоны квестов
```
GET  /api/templates                  # Список с фильтрами (category, difficulty, page, limit)
GET  /api/templates/popular          # Популярные шаблоны
GET  /api/templates/featured         # Избранные шаблоны
GET  /api/templates/newest           # Новые шаблоны
GET  /api/templates/:slug            # Детальная информация о шаблоне
GET  /api/templates/:slug/similar    # Похожие шаблоны
```

#### Категории и теги
```
GET  /api/categories                 # Все категории
GET  /api/categories/:slug           # Категория по slug
GET  /api/tags                       # Все теги
GET  /api/tags/popular               # Популярные теги
```

#### Отзывы
```
GET  /api/reviews/template/:id       # Отзывы для шаблона
POST /api/reviews                    # Оставить отзыв
POST /api/reviews/:id/helpful        # Отметить отзыв полезным
```

#### Заказы
```
POST /api/orders                     # Оформить заказ (rate limited)
```

#### Квесты (прохождение)
```
GET    /api/quests/:slug             # Получить квест по slug
POST   /api/quests/:questId/session  # Создать сессию прохождения
PATCH  /api/quests/session/:id       # Обновить прогресс сессии
POST   /api/quests/session/:id/complete # Завершить квест
GET    /api/quests/session/:id/stats # Статистика сессии
```

#### Аутентификация
```
POST /api/auth/login                 # Вход администратора → JWT
POST /api/auth/logout                # Выход
GET  /api/auth/me                    # Данные текущего пользователя
```

### Защищённые (требуют JWT: `Authorization: Bearer <token>`)

#### Управление заказами
```
GET   /api/orders                    # Все заказы с поиском и фильтрами
GET   /api/orders/stats              # Статистика и выручка
GET   /api/orders/:id                # Заказ по ID
PATCH /api/orders/:id/status         # Изменить статус заказа
```

#### Управление квестами (Admin)
```
GET    /api/admin/dashboard          # Статистика дашборда
GET    /api/admin/quests             # Все созданные квесты
GET    /api/admin/quests/:id         # Квест по ID
POST   /api/admin/quests             # Создать квест
PUT    /api/admin/quests/:id         # Обновить квест
DELETE /api/admin/quests/:id         # Удалить квест
GET    /api/admin/templates          # Шаблоны для выбора в редакторе
POST   /api/admin/templates          # Создать шаблон
```

### Системные
```
GET /health                          # Health check
GET /api                             # Версия API и список endpoints
```

## 🗄 Схема базы данных

Основные таблицы:

| Таблица | Назначение |
|---|---|
| `quest_templates` | Шаблоны квестов (витрина для клиентов) |
| `categories` | Категории шаблонов |
| `tags` | Теги |
| `reviews` | Отзывы клиентов |
| `orders` | Заказы (pending → confirmed → in_progress → completed) |
| `created_quests` | Готовые квесты, созданные Владом |
| `quest_sessions` | Сессии прохождения квеста парой |

Схема находится в `../database/schema_v2.sql`.

## 📁 Структура проекта

```
server/
├── src/
│   ├── config/
│   │   ├── database.js      # Пул подключений PostgreSQL
│   │   └── constants.js     # ORDER_STATUS, DIFFICULTY_LEVELS, FEATURE_PRICES...
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── questController.js
│   │   ├── reviewController.js
│   │   ├── tagController.js
│   │   └── templateController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT-проверка, requireAdmin
│   │   ├── errorHandler.js  # Централизованная обработка ошибок
│   │   ├── rateLimiter.js   # Лимиты запросов (orderLimiter и др.)
│   │   ├── upload.js        # Multer, ограничения типов и размера
│   │   └── validator.js     # express-validator хелперы
│   ├── models/
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── Template.js
│   ├── routes/
│   │   ├── api.js           # Корневой роутер — подключает все маршруты
│   │   ├── admin.js         # Защищённые маршруты для администратора
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   ├── quests.js
│   │   ├── reviews.js
│   │   ├── tags.js
│   │   └── templates.js
│   ├── services/
│   │   ├── emailService.js       # Отправка писем клиентам
│   │   ├── notificationService.js # Telegram-уведомления
│   │   ├── searchService.js      # Полнотекстовый поиск
│   │   └── statsService.js       # Агрегированная статистика
│   ├── utils/
│   │   ├── imageProcessor.js     # Обработка загружаемых изображений
│   │   └── slugGenerator.js      # Генерация slug из текста
│   └── server.js                 # Точка входа, Express app
├── .env                          # Переменные окружения (не коммитить)
├── .env.example
└── package.json
```

## 🔒 Безопасность

- Все admin-маршруты защищены JWT middleware (`requireAdmin`)
- Параметризованные SQL-запросы везде — без конкатенации
- Rate limiting на создание заказов (`orderLimiter`)
- CORS настроен через `ALLOWED_ORIGINS`
- Пароль администратора хранится только как bcrypt-хеш
- Загрузка файлов ограничена по типу (JPEG/PNG/WebP) и размеру (5 MB)

## 🐛 Отладка

```bash
# Health check
GET /health
# → { "status": "OK", "timestamp": "...", "uptime": 3600 }

# Проверка API
GET /api
# → { "version": "2.0.0", "endpoints": { ... } }
```

Сервер выводит цветные логи в консоль: ✅ успех, ❌ ошибки, 📧 email-события, 🗄️ запросы к БД.

## 🚀 Production

```bash
# Через PM2
npm install -g pm2
pm2 start src/server.js --name quest-api
pm2 startup && pm2 save

# Логи
pm2 logs quest-api
```

Обязательно для production:
1. Установить `NODE_ENV=production`
2. Использовать сильный `JWT_SECRET` (32+ случайных символа)
3. Настроить HTTPS (через nginx или облачный балансировщик)
4. Настроить регулярные бэкапы PostgreSQL