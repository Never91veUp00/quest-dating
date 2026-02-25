# 🎯 Quest Dating

Персональный сервис романтических квестов для свиданий.

## 📖 О проекте

Quest Dating — это персональный сервис, где Влад создаёт уникальные квесты для романтических свиданий. Клиент выбирает подходящий шаблон, описывает свою пару и пожелания — готовый квест отправляется в течение 24 часов. Партнёр проходит квест через красивый веб-интерфейс, выполняя задания и двигаясь от локации к локации.

Проект прошёл пивот: от маркетплейса с несколькими авторами к персональному сервису от первого лица. Все квесты создаёт лично Влад.

## ✨ Для клиентов

- Каталог готовых шаблонов квестов с фильтрами по категориям и сложности
- Персонализация под конкретную пару, локацию и повод
- Интерактивное прохождение квеста прямо в браузере (без установки приложений)
- Поддержка офлайн- и онлайн-форматов
- Готовый квест в течение 24 часов

## 🛠 Для администратора (Влад)

- Дашборд с заказами: статусы, статистика, выручка
- Редактор квестов с 10 типами заданий
- Привязка квеста к заказу клиента
- Уведомления о новых заказах через Telegram

## 🗂 Типы заданий в квестах

| Тип | Описание |
|-----|----------|
| `simple` | Простое задание — прочитать текст и двигаться дальше |
| `riddle` | Загадка с правильным ответом (автопроверка) |
| `text_answer` | Открытый вопрос партнёру без правильного ответа |
| `code_physical` | Сбор физического кода из предметов вокруг |
| `location` | Задание найти конкретное место |
| `selfie` | Сделать селфи с заданным условием |
| `photo` | Сфотографировать место или объект |
| `media` | Просмотр видео/аудио (Telegram или YouTube) |
| `qr` | Найти спрятанный QR-код и отсканировать |
| `mini_game` | Мини-игра: угадайка, пары или пазл из фото |

## 🛠 Технологический стек

**Frontend** — Vue 3, Vue Router, Pinia, Axios, Vite

**Backend** — Node.js, Express, PostgreSQL, JWT

**Интеграции** — Telegram Bot API (уведомления и медиа-хостинг), DOMPurify (XSS-защита), express-rate-limit

## 🚀 Быстрый старт

### Требования

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/quest-dating.git
cd quest-dating

# Установить все зависимости (root + server + client)
npm run install:all
```

### Настройка переменных окружения

**server/.env:**
```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=quest_dating
DB_USER=quest_user
DB_PASSWORD=quest_password

JWT_SECRET=your_random_32_char_secret_here
JWT_EXPIRES_IN=7d

TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here

MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

**client/.env:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Quest Dating
```

### Инициализация базы данных

```bash
npm run db:init
npm run db:seed
```

### Запуск

```bash
npm run dev
```

Приложение будет доступно:
- Клиентская часть: http://localhost:3000
- API: http://localhost:5000/api
- Админка: http://localhost:3000/admin

## 📁 Структура проекта

```
quest-dating/
├── client/                  # Vue 3 frontend
│   ├── src/
│   │   ├── assets/          # Стили и изображения
│   │   ├── components/      # Vue-компоненты
│   │   │   ├── common/      # Общие: Header, Footer, Modal, Toast...
│   │   │   ├── editor/      # Редактор квестов
│   │   │   ├── marketplace/ # Каталог шаблонов
│   │   │   ├── order/       # Оформление заказа
│   │   │   ├── quest/       # Плеер квеста
│   │   │   └── template/    # Страница шаблона
│   │   ├── composables/     # useQuest, useQuestEditor, useFilters...
│   │   ├── router/          # Маршруты
│   │   ├── services/        # API-сервисы
│   │   ├── store/           # Pinia stores
│   │   ├── utils/           # Форматтеры, хелперы, валидаторы
│   │   └── views/           # Страницы
│   └── vite.config.js
│
├── server/                  # Node.js / Express backend
│   ├── src/
│   │   ├── config/          # БД, константы
│   │   ├── controllers/     # Логика обработки запросов
│   │   ├── middleware/       # auth, rateLimiter, validator...
│   │   ├── models/          # Модели Template, Order, Review
│   │   ├── routes/          # API-маршруты
│   │   ├── services/        # email, notifications, search, stats
│   │   ├── utils/           # imageProcessor, slugGenerator
│   │   └── server.js        # Точка входа
│   └── package.json
│
├── scripts/                 # seed-database, generate-sitemap
├── docker-compose.yml
└── package.json             # Root: скрипты для запуска всего проекта
```

## 🔧 Команды

```bash
# Разработка
npm run dev              # Запуск frontend + backend параллельно
npm run client:dev       # Только frontend
npm run server:dev       # Только backend

# Сборка
npm run build            # Сборка всего проекта
npm run client:build     # Только frontend
npm run server:build     # Только backend

# База данных
npm run db:init          # Инициализация схемы
npm run db:seed          # Заполнение тестовыми данными
npm run db:reset         # Сброс и переинициализация

# Качество кода
npm run lint             # Проверка ESLint
npm run lint:fix         # Автоисправление
npm run format           # Форматирование Prettier

# Docker
npm run docker:dev       # Запуск dev-окружения
npm run docker:prod      # Запуск production
npm run docker:down      # Остановка
npm run docker:logs      # Просмотр логов
```

## 📞 Контакты

- Email: vp.vlad00@mail.ru
- Telegram: @vinatian00
- Сайт: https://questdating.ru

---

Made with ❤️ by Влад