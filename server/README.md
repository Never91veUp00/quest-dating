# Quest Marketplace - Backend API

REST API для платформы Quest Marketplace - маркетплейса шаблонов квестов для свиданий.

## 🚀 Технологии

- **Node.js** v18+
- **Express.js** - Web framework
- **PostgreSQL** - Реляционная база данных
- **JWT** - Авторизация (в разработке)
- **Multer** - Загрузка файлов

## 📋 Требования

- Node.js 18.x или выше
- PostgreSQL 12.x или выше
- npm или yarn

## 🛠️ Установка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd server
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка базы данных
```bash
# Войдите в PostgreSQL
sudo -u postgres psql

# Создайте базу данных и пользователя
CREATE DATABASE quest_dating;
CREATE USER quest_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE quest_dating TO quest_user;
\q
```

### 4. Импорт схемы
```bash
psql -U quest_user -d quest_dating -f ../database/schema_v2.sql
```

### 5. Настройка переменных окружения
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 6. Запуск сервера
```bash
# Development режим с hot reload
npm run dev

# Production режим
npm start
```

Сервер запустится на `http://localhost:5000`

## 📚 API Endpoints

### Шаблоны (Templates)
```
GET    /api/templates              # Все шаблоны с фильтрами
GET    /api/templates/popular      # Популярные шаблоны
GET    /api/templates/featured     # Избранные шаблоны
GET    /api/templates/newest       # Новые шаблоны
GET    /api/templates/:slug        # Детальная информация
GET    /api/templates/:slug/similar # Похожие шаблоны
```

### Авторы (Authors)
```
GET    /api/authors                # Все авторы
GET    /api/authors/top            # Топ авторы
GET    /api/authors/:username      # Профиль автора
POST   /api/authors                # Создать автора
```

### Категории (Categories)
```
GET    /api/categories             # Все категории
GET    /api/categories/:slug       # Категория по slug
```

### Теги (Tags)
```
GET    /api/tags                   # Все теги
GET    /api/tags/popular           # Популярные теги
```

### Отзывы (Reviews)
```
GET    /api/reviews/template/:id   # Отзывы для шаблона
POST   /api/reviews                # Создать отзыв
POST   /api/reviews/:id/helpful    # Отметить полезным
```

### Заказы (Orders)
```
GET    /api/orders                 # Все заказы
GET    /api/orders/stats           # Статистика
GET    /api/orders/:id             # Заказ по ID
POST   /api/orders                 # Создать заказ
PATCH  /api/orders/:id/status      # Обновить статус
```

### Квесты (Quests)
```
GET    /api/quests/:slug                    # Получить квест
POST   /api/quests/:id/session              # Создать сессию
PATCH  /api/quests/session/:id              # Обновить прогресс
POST   /api/quests/session/:id/complete     # Завершить квест
GET    /api/quests/session/:id/stats        # Статистика сессии
```

## 🔒 Авторизация (в разработке)

API использует JWT для авторизации. Для защищенных endpoints:
```bash
Authorization: Bearer <token>
```

## 📝 Примеры запросов

### Получить все шаблоны с фильтрами
```bash
GET /api/templates?category=romance&difficulty=medium&page=1&limit=12
```

### Создать заказ
```bash
POST /api/orders
Content-Type: application/json

{
  "template_id": 1,
  "client_name": "Иван Иванов",
  "client_email": "ivan@example.com",
  "client_phone": "+7 999 123-45-67",
  "description": "Хочу квест для предложения руки и сердца",
  "event_date": "2024-03-15",
  "event_city": "Москва",
  "customization": {
    "color_scheme": "romantic",
    "music": true
  }
}
```

### Добавить отзыв
```bash
POST /api/reviews
Content-Type: application/json

{
  "template_id": 1,
  "client_name": "Анна К.",
  "client_email": "anna@example.com",
  "rating": 5,
  "title": "Лучший квест!",
  "comment": "Всё прошло идеально, спасибо!"
}
```

## 🗂️ Структура проекта
```
server/
├── src/
│   ├── config/          # Конфигурация (БД, константы)
│   ├── controllers/     # Контроллеры (бизнес-логика)
│   ├── routes/          # API маршруты
│   ├── models/          # Модели данных
│   ├── middleware/      # Middleware (auth, errors)
│   ├── services/        # Сервисы (email, search)
│   ├── utils/           # Утилиты
│   └── server.js        # Точка входа
├── uploads/             # Загруженные файлы
├── .env                 # Переменные окружения
└── package.json
```

## 🔧 Конфигурация

### Переменные окружения

- `PORT` - Порт сервера (по умолчанию: 5000)
- `NODE_ENV` - Окружение (development/production)
- `DB_*` - Настройки PostgreSQL
- `JWT_SECRET` - Секретный ключ для JWT
- `ALLOWED_ORIGINS` - CORS origins

### База данных

Схема базы данных находится в `../database/schema_v2.sql`

Основные таблицы:
- `quest_templates` - Шаблоны квестов
- `authors` - Авторы шаблонов
- `categories` - Категории
- `tags` - Теги
- `reviews` - Отзывы
- `orders` - Заказы
- `created_quests` - Созданные квесты
- `quest_sessions` - Сессии прохождения

## 🐛 Отладка

### Логирование

Сервер выводит логи в консоль:
- ✅ Успешные операции
- ❌ Ошибки
- 📧 Email события
- 🗄️ Запросы к БД

### Проверка здоровья
```bash
GET /health
```

Ответ:
```json
{
  "status": "OK",
  "timestamp": "2024-02-08T12:00:00.000Z",
  "uptime": 3600
}
```

## 🚀 Деплой

### Production настройки

1. Установите `NODE_ENV=production`
2. Используйте сильный `JWT_SECRET`
3. Настройте HTTPS
4. Используйте PM2 для управления процессом
5. Настройте регулярные бэкапы БД

### PM2
```bash
npm install -g pm2
pm2 start src/server.js --name quest-api
pm2 startup
pm2 save
```

## 📊 Мониторинг

### Метрики

- Количество запросов
- Время ответа
- Ошибки
- Использование памяти

### Логи
```bash
# PM2 логи
pm2 logs quest-api

# Логи БД
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🤝 Разработка

### Добавление нового endpoint

1. Создайте контроллер в `src/controllers/`
2. Добавьте маршрут в `src/routes/`
3. Подключите роут в `src/routes/api.js`
4. Обновите документацию

### Добавление middleware

1. Создайте файл в `src/middleware/`
2. Подключите в нужном роуте или глобально в `server.js`

## 📄 Лицензия

MIT

## 👥 Контакты

- Email: support@questdating.com
- GitHub: [repository-url]