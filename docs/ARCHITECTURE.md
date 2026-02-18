# Архитектура проекта

Документация по архитектуре Quest Dating платформы.

## Оглавление

- [Общий обзор](#общий-обзор)
- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [Backend архитектура](#backend-архитектура)
- [Frontend архитектура](#frontend-архитектура)
- [База данных](#база-данных)
- [API дизайн](#api-дизайн)
- [Безопасность](#безопасность)
- [Масштабируемость](#масштабируемость)

---

## Общий обзор

Quest Dating — это fullstack веб-приложение для маркетплейса шаблонов квестов. Архитектура построена на принципах:

- **Монолитный backend с модульной структурой**
- **SPA frontend на Vue 3**
- **RESTful API**
- **PostgreSQL для хранения данных**
- **Stateless аутентификация через JWT**

### Высокоуровневая диаграмма
```
┌─────────────┐
│   Client    │
│  (Vue 3)    │
└──────┬──────┘
       │ HTTP/HTTPS
       │ (REST API)
       ▼
┌─────────────┐
│   Nginx     │
│  (Reverse   │
│   Proxy)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│   Backend   │─────▶│  PostgreSQL  │
│  (Express)  │      │   Database   │
└─────────────┘      └──────────────┘
       │
       ▼
┌─────────────┐
│   Storage   │
│ (Uploads)   │
└─────────────┘
```

---

## Технологический стек

### Frontend

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Vue.js | 3.4+ | UI Framework |
| Vue Router | 4.3+ | Роутинг |
| Pinia | 2.1+ | State Management |
| Axios | 1.6+ | HTTP клиент |
| Vite | 5.2+ | Build Tool |

### Backend

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Node.js | 18+ | Runtime |
| Express | 4.18+ | Web Framework |
| PostgreSQL | 14+ | База данных |
| pg | 8.11+ | PostgreSQL драйвер |
| JWT | 9.0+ | Аутентификация |
| Bcrypt | 5.1+ | Хеширование паролей |
| Multer | 1.4+ | Загрузка файлов |

### DevOps

| Технология | Назначение |
|-----------|------------|
| Docker | Контейнеризация |
| Docker Compose | Оркестрация |
| Nginx | Reverse Proxy |
| GitHub Actions | CI/CD (опционально) |

---

## Структура проекта
```
quest-dating/
├── client/                      # Frontend приложение
│   ├── public/                  # Статические файлы
│   ├── src/
│   │   ├── assets/             # Стили, изображения
│   │   │   └── styles/
│   │   │       ├── variables.css
│   │   │       ├── main.css
│   │   │       └── animations.css
│   │   ├── components/         # Vue компоненты
│   │   │   ├── common/        # Переиспользуемые компоненты
│   │   │   ├── marketplace/   # Компоненты маркетплейса
│   │   │   ├── template/      # Компоненты шаблонов
│   │   │   ├── order/         # Компоненты заказов
│   │   │   ├── quest/         # Компоненты квестов
│   │   │   └── author/        # Компоненты авторов
│   │   ├── composables/       # Composition API логика
│   │   │   ├── useTemplates.js
│   │   │   ├── useFilters.js
│   │   │   └── useQuest.js
│   │   ├── router/            # Vue Router
│   │   │   └── index.js
│   │   ├── services/          # API сервисы
│   │   │   ├── api.js
│   │   │   ├── templateService.js
│   │   │   ├── authorService.js
│   │   │   └── orderService.js
│   │   ├── store/             # Pinia stores
│   │   │   ├── index.js
│   │   │   └── modules/
│   │   │       ├── auth.js
│   │   │       └── cart.js
│   │   ├── utils/             # Утилиты
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   ├── views/             # Страницы
│   │   ├── App.vue
│   │   └── main.js
│   └── vite.config.js
│
├── server/                      # Backend приложение
│   ├── config/                 # Конфигурация
│   │   ├── db.js
│   │   └── config.js
│   ├── controllers/            # Контроллеры (бизнес-логика)
│   │   ├── templateController.js
│   │   ├── authorController.js
│   │   ├── orderController.js
│   │   └── questController.js
│   ├── database/               # SQL скрипты
│   │   ├── schema.sql
│   │   └── seeds.sql
│   ├── middleware/             # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validators.js
│   ├── models/                 # Модели данных
│   │   ├── Template.js
│   │   ├── Author.js
│   │   └── Order.js
│   ├── routes/                 # API роуты
│   │   ├── templates.js
│   │   ├── authors.js
│   │   ├── orders.js
│   │   └── index.js
│   ├── services/               # Сервисный слой
│   │   ├── emailService.js
│   │   └── uploadService.js
│   ├── uploads/                # Загруженные файлы
│   ├── utils/                  # Утилиты
│   │   ├── helpers.js
│   │   └── constants.js
│   └── index.js
│
├── docs/                        # Документация
├── nginx/                       # Nginx конфигурация
├── docker-compose.yml
└── package.json
```

---

## Backend архитектура

### Слои приложения
```
┌──────────────────────────────────────┐
│           Routes Layer               │  HTTP endpoints
│  (Определение API endpoints)         │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│        Controllers Layer             │  Request handling
│  (Обработка запросов, валидация)    │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│          Models Layer                │  Business logic
│  (Работа с данными, SQL запросы)    │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│         Database Layer               │  PostgreSQL
│  (Хранение данных)                   │
└──────────────────────────────────────┘
```

### Middleware Pipeline
```
Request
   │
   ▼
┌─────────────────┐
│  CORS           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Body Parser    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auth (JWT)     │ (для защищенных роутов)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Route Handler  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Error Handler  │
└────────┬────────┘
         │
         ▼
      Response
```

### Модель данных (Models)

Каждая модель отвечает за:
- SQL запросы к базе данных
- Валидацию данных на уровне модели
- Бизнес-логику работы с данными
```javascript
// Пример: models/Template.js
class Template {
  static async findAll(filters = {}) { /* ... */ }
  static async findBySlug(slug) { /* ... */ }
  static async create(data) { /* ... */ }
  static async update(id, data) { /* ... */ }
  static async delete(id) { /* ... */ }
}
```

### Контроллеры (Controllers)

Контроллеры обрабатывают HTTP запросы:
- Валидация входящих данных
- Вызов методов моделей
- Форматирование ответов
- Обработка ошибок
```javascript
// Пример: controllers/templateController.js
exports.getTemplates = async (req, res, next) => {
  try {
    const filters = req.query
    const templates = await Template.findAll(filters)
    res.json({ success: true, data: templates })
  } catch (error) {
    next(error)
  }
}
```

### Роуты (Routes)

Роуты определяют API endpoints:
```javascript
// routes/templates.js
router.get('/', templateController.getTemplates)
router.get('/popular', templateController.getPopular)
router.get('/:slug', templateController.getBySlug)
router.post('/', auth, templateController.create)
```

---

## Frontend архитектура

### Архитектурные принципы

1. **Component-Based Architecture** - все UI элементы - компоненты
2. **Composition API** - используем современный Vue 3 API
3. **Centralized State Management** - Pinia для глобального состояния
4. **Service Layer** - изолированная логика API вызовов
5. **Utility Functions** - переиспользуемые функции

### Структура компонентов
```
components/
├── common/              # Переиспользуемые компоненты
│   ├── Header.vue
│   ├── Footer.vue
│   ├── Button.vue
│   ├── Modal.vue
│   └── Loader.vue
├── marketplace/         # Компоненты маркетплейса
│   ├── TemplateCard.vue
│   ├── TemplateGrid.vue
│   └── TemplateFilters.vue
└── template/            # Компоненты шаблона
    ├── TemplateGallery.vue
    └── TemplateReviews.vue
```

### State Management (Pinia)
```javascript
// store/index.js
export const useQuestStore = defineStore('quest', {
  state: () => ({
    templates: [],
    currentTemplate: null,
    loading: false
  }),
  
  getters: {
    templateBySlug: (state) => (slug) => {
      return state.templates.find(t => t.slug === slug)
    }
  },
  
  actions: {
    async fetchTemplates() {
      this.loading = true
      const data = await templateService.getAll()
      this.templates = data
      this.loading = false
    }
  }
})
```

### Composables

Переиспользуемая логика через Composition API:
```javascript
// composables/useTemplates.js
export function useTemplates() {
  const templates = ref([])
  const loading = ref(false)
  
  const fetchTemplates = async (filters) => {
    loading.value = true
    templates.value = await templateService.getAll(filters)
    loading.value = false
  }
  
  return { templates, loading, fetchTemplates }
}
```

### Роутинг
```javascript
// router/index.js
const routes = [
  { path: '/', component: Home },
  { path: '/templates', component: Templates },
  { path: '/template/:slug', component: TemplateDetail },
  { path: '/order/:slug', component: Order, meta: { requiresConsent: true } },
  { path: '/quest/:slug', component: Quest }
]
```

---

## База данных

### ER диаграмма
```
┌──────────────┐       ┌──────────────┐
│  categories  │       │   authors    │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ name         │       │ username     │
│ slug         │◄──┐   │ email        │
│ icon         │   │   │ password     │
└──────────────┘   │   └──────┬───────┘
                   │          │
┌──────────────┐   │          │
│   templates  │   │          │
├──────────────┤   │          │
│ id (PK)      │   │          │
│ slug         │   │          │
│ title        │   │          │
│ category_id  ├───┘          │
│ author_id    ├──────────────┘
│ difficulty   │
│ base_price   │
└──────┬───────┘
       │
       │     ┌──────────────┐
       │     │    tags      │
       │     ├──────────────┤
       │     │ id (PK)      │
       │     │ name         │
       │     │ slug         │
       │     └──────┬───────┘
       │            │
       │     ┌──────▼───────────┐
       └────►│ template_tags    │
             ├──────────────────┤
             │ template_id (FK) │
             │ tag_id (FK)      │
             └──────────────────┘

┌──────────────┐       ┌──────────────┐
│   orders     │       │   reviews    │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ template_id  ├───┐   │ template_id  ├───┐
│ client_name  │   │   │ order_id     │   │
│ status       │   │   │ rating       │   │
└──────────────┘   │   │ comment      │   │
                   │   └──────────────┘   │
                   │                      │
                   └──────────────────────┘
                            │
                            ▼
                   ┌──────────────┐
                   │  templates   │
                   └──────────────┘
```

### Основные таблицы

**categories** - Категории квестов
```sql
id SERIAL PRIMARY KEY
name VARCHAR(100)
slug VARCHAR(100) UNIQUE
description TEXT
icon VARCHAR(10)
```

**authors** - Авторы квестов
```sql
id SERIAL PRIMARY KEY
username VARCHAR(50) UNIQUE
email VARCHAR(255) UNIQUE
password_hash VARCHAR(255)
display_name VARCHAR(100)
bio TEXT
avatar_url VARCHAR(500)
is_verified BOOLEAN DEFAULT false
```

**templates** - Шаблоны квестов
```sql
id SERIAL PRIMARY KEY
slug VARCHAR(150) UNIQUE
title VARCHAR(200)
tagline VARCHAR(300)
description TEXT
category_id INTEGER REFERENCES categories(id)
author_id INTEGER REFERENCES authors(id)
difficulty VARCHAR(20)
duration_minutes INTEGER
base_price INTEGER
rating DECIMAL(3,2)
orders_count INTEGER DEFAULT 0
```

**orders** - Заказы
```sql
id SERIAL PRIMARY KEY
order_number VARCHAR(50) UNIQUE
template_id INTEGER REFERENCES templates(id)
client_name VARCHAR(100)
client_email VARCHAR(255)
status VARCHAR(20)
total_price INTEGER
```

**reviews** - Отзывы
```sql
id SERIAL PRIMARY KEY
template_id INTEGER REFERENCES templates(id)
order_id INTEGER REFERENCES orders(id)
rating INTEGER CHECK (rating >= 1 AND rating <= 5)
comment TEXT
client_name VARCHAR(100)
```

### Индексы

Для оптимизации производительности:
```sql
-- Часто используемые поиски
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_author ON templates(author_id);
CREATE INDEX idx_templates_rating ON templates(rating DESC);

-- Полнотекстовый поиск
CREATE INDEX idx_templates_search ON templates 
  USING gin(to_tsvector('russian', title || ' ' || description));

-- Фильтрация и сортировка
CREATE INDEX idx_templates_difficulty ON templates(difficulty);
CREATE INDEX idx_templates_price ON templates(base_price);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## API дизайн

### RESTful принципы

- **Ресурсо-ориентированный** - URL представляют ресурсы
- **HTTP методы** - GET, POST, PATCH, DELETE
- **Stateless** - каждый запрос независим
- **JSON формат** - все данные в JSON

### Naming conventions
```
GET    /api/templates          # Получить список
GET    /api/templates/:slug    # Получить один
POST   /api/templates          # Создать
PATCH  /api/templates/:id      # Обновить
DELETE /api/templates/:id      # Удалить
```

### Response format

Единообразный формат ответов:
```javascript
// Успех
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}

// Ошибка
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### Versioning

API версионируется через URL:
- `/api/v1/templates` - версия 1
- `/api/v2/templates` - версия 2 (будущая)

---

## Безопасность

### Аутентификация

**JWT (JSON Web Tokens)**:
- Токены генерируются при логине
- Хранятся в localStorage на клиенте
- Передаются в заголовке `Authorization: Bearer <token>`
- Срок жизни: 7 дней

### Авторизация

Уровни доступа:
- **Anonymous** - просмотр каталога, заказы
- **Author** - создание шаблонов, статистика
- **Admin** - полный доступ

### Защита данных

- **Password hashing** - bcrypt с salt rounds = 10
- **SQL injection** - параметризованные запросы
- **XSS** - sanitization входящих данных
- **CORS** - настроенный whitelist доменов
- **Rate limiting** - ограничение запросов

### Валидация

Многоуровневая валидация:
1. **Client-side** - Vue компоненты
2. **API middleware** - Express validators
3. **Database** - constraints и triggers

---

## Масштабируемость

### Горизонтальное масштабирование
```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │────►│  Nginx  │────►│  Node   │
└─────────┘     │  Load   │     │Instance1│
                │ Balancer│     └─────────┘
                └────┬────┘           │
                     │          ┌─────▼─────┐
                     └─────────►│  Node     │
                                │Instance2  │
                                └─────┬─────┘
                                      │
                                ┌─────▼─────┐
                                │PostgreSQL │
                                │ (Master)  │
                                └───────────┘
```

### Кеширование

**Redis** (будущая оптимизация):
- Кеш популярных шаблонов
- Сессии пользователей
- Rate limiting counters

### CDN

Статические ресурсы через CDN:
- Изображения шаблонов
- Аватары авторов
- Frontend assets

### Database оптимизация

- **Connection pooling** - pg pool
- **Indexes** - на часто запрашиваемые поля
- **Query optimization** - EXPLAIN ANALYZE
- **Read replicas** - для аналитики (будущее)

---

## Мониторинг

### Логирование
```javascript
// Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

### Метрики

Отслеживаемые метрики:
- Response time
- Error rate
- Request count
- Database query time

### Alerting

Уведомления при:
- 5xx ошибках
- Высокой нагрузке
- Медленных запросах (>1s)

---

## Deployment

### Production архитектура
```
Internet
   │
   ▼
┌─────────────┐
│   Cloudflare│  SSL, DDoS protection, CDN
│     DNS     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Nginx    │  Reverse Proxy, SSL termination
└──────┬──────┘
       │
       ├────────┬────────┐
       ▼        ▼        ▼
    ┌────┐  ┌────┐  ┌────┐
    │Node│  │Node│  │Node│  Application servers
    │ 1  │  │ 2  │  │ 3  │
    └─┬──┘  └─┬──┘  └─┬──┘
      │       │       │
      └───────┴───────┘
              │
              ▼
      ┌──────────────┐
      │  PostgreSQL  │  Database
      │   (Master)   │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐
      │  PostgreSQL  │  Read Replica
      │   (Replica)  │
      └──────────────┘
```

---

## Будущие улучшения

### Планируемые фичи

1. **Real-time chat** - WebSocket для общения с авторами
2. **Payment integration** - Stripe/Яндекс.Касса
3. **Email notifications** - SendGrid/Mailgun
4. **Analytics dashboard** - для авторов
5. **Mobile app** - React Native
6. **GraphQL API** - альтернатива REST
7. **Microservices** - разделение сервисов

### Технические улучшения

1. **Redis caching**
2. **Elasticsearch** - полнотекстовый поиск
3. **S3 storage** - для файлов
4. **Kubernetes** - оркестрация
5. **Monitoring** - Prometheus + Grafana
6. **CI/CD** - GitHub Actions

---

## Заключение

Quest Dating построен на современном технологическом стеке с акцентом на:
- Модульность и расширяемость
- Безопасность
- Производительность
- Developer experience

Архитектура позволяет легко добавлять новые фичи и масштабировать систему по мере роста.