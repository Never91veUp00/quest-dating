# 🎯 Quest Dating

Персональный сервис романтических квестов для свиданий.

## 📖 Описание

Quest Dating — персональный сервис, где я создаю уникальные квесты для романтических свиданий. Клиент выбирает шаблон, указывает детали — я адаптирую сценарий специально под вашу пару и отправляю готовый квест за 24 часа.

## ✨ Возможности

- 📝 Каталог готовых шаблонов квестов с фильтрами
- ⭐ Рейтинги и отзывы реальных пар
- 🎨 Персонализация под вашу локацию и пожелания
- 📧 Готовый квест на email в течение 24 часов
- 🎮 Интерактивное прохождение квеста через веб-интерфейс

## 🛠 Технологический стек

### Frontend
- **Vue 3** - Progressive JavaScript Framework
- **Vue Router** - Официальный роутер
- **Pinia** - State Management
- **Axios** - HTTP клиент
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - База данных
- **JWT** - Аутентификация
- **Multer** - Загрузка файлов
- **Bcrypt** - Хеширование паролей

## 🚀 Быстрый старт

### Требования
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14 (или Docker)

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/yourusername/quest-dating.git
cd quest-dating
```

2. **Установите все зависимости:**
```bash
npm run install:all
```

3. **Настройте переменные окружения:**

Создайте файлы `.env` в директориях `server` и `client`:

**server/.env:**
```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quest_dating
DB_USER=quest_user
DB_PASSWORD=quest_password

# JWT
JWT_SECRET=your_random_32_char_secret_here
JWT_EXPIRES_IN=7d

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Admin
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here

# Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

**client/.env:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Quest Dating
VITE_APP_VERSION=1.0.0
```

4. **Инициализируйте базу данных:**
```bash
npm run db:init
npm run db:seed
```

5. **Запустите проект:**
```bash
npm run dev
```

Приложение будет доступно по адресам:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API: http://localhost:5000/api

## 🐳 Docker

### Разработка с Docker
```bash
# Запуск всех сервисов
npm run docker:dev

# Остановка
npm run docker:down

# Просмотр логов
npm run docker:logs

# Полная очистка (включая volumes)
npm run docker:clean
```

### Production с Docker
```bash
# Сборка и запуск
npm run docker:prod

# Остановка
npm run docker:down
```

## 📁 Структура проекта
```
quest-dating/
├── client/                 # Frontend приложение
│   ├── public/            # Статические файлы
│   ├── src/
│   │   ├── assets/        # Стили, изображения
│   │   ├── components/    # Vue компоненты
│   │   ├── composables/   # Composition API
│   │   ├── router/        # Vue Router
│   │   ├── services/      # API сервисы
│   │   ├── store/         # Pinia stores
│   │   ├── utils/         # Утилиты
│   │   ├── views/         # Страницы
│   │   ├── App.vue        # Корневой компонент
│   │   └── main.js        # Entry point
│   ├── .env.example       # Пример env файла
│   ├── index.html         # HTML template
│   ├── package.json       # Зависимости
│   └── vite.config.js     # Vite конфигурация
│
├── server/                # Backend приложение
│   ├── config/            # Конфигурация
│   ├── controllers/       # Контроллеры
│   ├── database/          # SQL скрипты
│   ├── middleware/        # Express middleware
│   ├── models/            # Модели данных
│   ├── routes/            # API роуты
│   ├── services/          # Бизнес-логика
│   ├── uploads/           # Загруженные файлы
│   ├── utils/             # Утилиты
│   ├── .env.example       # Пример env файла
│   ├── index.js           # Entry point
│   └── package.json       # Зависимости
│
├── nginx/                 # Nginx конфигурация (production)
├── .eslintrc.js          # ESLint конфигурация
├── .gitignore            # Git ignore правила
├── .prettierrc           # Prettier конфигурация
├── docker-compose.yml    # Docker compose файл
├── package.json          # Root package.json
└── README.md             # Документация
```

## 🔧 Доступные команды

### Разработка
```bash
npm run dev              # Запуск frontend + backend
npm run client:dev       # Только frontend
npm run server:dev       # Только backend
```

### Сборка
```bash
npm run build           # Сборка всего проекта
npm run client:build    # Сборка frontend
npm run server:build    # Сборка backend
```

### База данных
```bash
npm run db:init         # Инициализация базы данных
npm run db:seed         # Заполнение тестовыми данными
npm run db:migrate      # Применение миграций
npm run db:reset        # Сброс и переинициализация
```

### Линтинг и форматирование
```bash
npm run lint            # Проверка кода
npm run lint:fix        # Исправление ошибок
npm run format          # Форматирование кода
npm run format:check    # Проверка форматирования
```

### Docker
```bash
npm run docker:dev      # Запуск в dev режиме
npm run docker:prod     # Запуск в prod режиме
npm run docker:down     # Остановка контейнеров
npm run docker:clean    # Очистка всего
npm run docker:logs     # Просмотр логов
npm run docker:build    # Пересборка образов
```

## 🌐 API Документация

### Основные эндпоинты

#### Templates
- `GET /api/templates` - Список шаблонов
- `GET /api/templates/:slug` - Детали шаблона
- `GET /api/templates/popular` - Популярные шаблоны
- `GET /api/templates/featured` - Избранные шаблоны

#### Categories
- `GET /api/categories` - Список категорий
- `GET /api/categories/:slug` - Детали категории

#### Orders
- `POST /api/orders` - Создание заказа
- `GET /api/orders/:id` - Детали заказа

#### Reviews
- `GET /api/reviews/template/:id` - Отзывы шаблона
- `POST /api/reviews` - Создание отзыва

Полная документация API доступна по адресу: http://localhost:5000/api-docs (в разработке)

## 🧪 Тестирование
```bash
# Запуск тестов (в разработке)
npm test
```

## 📝 Переменные окружения

### Server
| Переменная | Описание | По умолчанию |
|-----------|----------|--------------|
| `NODE_ENV` | Режим работы | development |
| `PORT` | Порт сервера | 5000 |
| `DB_HOST` | Хост БД | localhost |
| `DB_PORT` | Порт БД | 5432 |
| `DB_NAME` | Имя БД | quest_dating |
| `DB_USER` | Пользователь БД | quest_user |
| `DB_PASSWORD` | Пароль БД | quest_password |
| `JWT_SECRET` | Секретный ключ JWT | - |
| `JWT_EXPIRES_IN` | Время жизни токена | 7d |

### Client
| Переменная | Описание | По умолчанию |
|-----------|----------|--------------|
| `VITE_API_URL` | URL API | http://localhost:5000/api |
| `VITE_APP_NAME` | Название приложения | Quest Dating |


## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👤 Автор

Влад — создатель Quest Dating

## 📞 Контакты

- Email: vp.vlad00@mail.ru
- Telegram: @vinatian00
- Website: https://questdating.ru

---

Made with ❤️ by Влад