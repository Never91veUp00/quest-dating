# Тестирование Quest Dating

## Стек

| Слой | Инструмент | Для чего |
|------|-----------|---------|
| Backend unit | Vitest | middleware, utils, services |
| Backend integration | Vitest + Supertest | HTTP API без реальной БД |
| Frontend unit | Vitest + Vue Test Utils + jsdom | validators, formatters, компоненты |
| E2E | Playwright | полные пользовательские сценарии |

---

## Установка

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
npx playwright install chromium  # браузеры для E2E
```

---

## Запуск

### Backend

```bash
cd server

npm test                    # все тесты
npm run test:watch          # watch-режим (при разработке)
npm run test:coverage       # с отчётом покрытия
npm run test:unit           # только unit
npm run test:integration    # только integration
```

### Frontend unit

```bash
cd client

npm test                    # все unit тесты
npm run test:watch          # watch-режим
npm run test:coverage       # с отчётом покрытия
```

### E2E (Playwright)

```bash
cd client

# Требует запущенный frontend (порт 3000) и backend (порт 5000)
npm run dev &               # в отдельном терминале

npm run test:e2e            # headless
npm run test:e2e:ui         # визуальный UI Playwright

# Для тестов квеста — укажи реальный slug:
E2E_TEST_QUEST_SLUG=my-quest npm run test:e2e
```

---

## Структура

```
server/tests/
├── setup.js                    # env + моки БД и Telegram
├── unit/
│   ├── middleware/
│   │   ├── auth.test.js        # requireAdmin: токены, роли, истечение
│   │   └── validator.test.js   # sanitizeQuery: page/limit
│   ├── utils/
│   │   └── slugGenerator.test.js  # транслитерация, уникальность
│   └── services/
│       ├── statsService.test.js    # кеш, запросы к БД
│       └── notificationService.test.js  # Telegram, маскировка телефона
└── integration/api/
    ├── auth.test.js            # POST /api/auth/login
    ├── contact.test.js         # POST /api/contact
    ├── quests.test.js          # сессии, прогресс, безопасность
    └── orders.test.js          # создание, статус, уведомления

client/tests/
├── setup.js                    # Vue Test Utils + моки api
├── unit/
│   ├── utils/
│   │   ├── validators.test.js  # isValidEmail, validateOrderForm, ...
│   │   └── formatters.test.js  # formatPrice, pluralize, ...
│   └── components/
│       └── SearchBar.test.js   # XSS, подсветка, localStorage
└── e2e/
    ├── order.spec.js           # полный флоу заказа
    ├── contact.spec.js         # форма обратной связи
    └── quest-player.spec.js    # прохождение квеста
```

---

## Что покрыто

### Безопасность (критично)
- ✅ JWT: отсутствие токена, истечение, неверная роль, подпись другим ключом
- ✅ Изоляция сессий: нельзя обновить сессию чужого квеста
- ✅ XSS в SearchBar: экранирование HTML в v-html
- ✅ Маскировка телефона в Telegram уведомлениях

### Бизнес-логика
- ✅ Расчёт цены заказа (база + доп. фичи)
- ✅ Кеш статистики (БД вызывается только при cache miss)
- ✅ Транслитерация и уникальность slug
- ✅ Уведомления не блокируют HTTP-ответ

### Валидация
- ✅ Все поля формы заказа
- ✅ Форма отзыва
- ✅ Формы на backend (contact, auth)
- ✅ sanitizeQuery: page/limit границы

### Форматирование
- ✅ Цены (копейки → рубли + локаль)
- ✅ Склонение (1 квест / 2 квеста / 5 квестов)
- ✅ Телефон, дата, длительность, рейтинг

---

## Переменные для E2E

```env
E2E_BASE_URL=http://localhost:3000       # URL фронтенда
E2E_TEST_QUEST_SLUG=test-quest           # slug публичного квеста
E2E_PROTECTED_QUEST_SLUG=protected-quest # slug квеста с кодом
```
