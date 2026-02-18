# API Документация

Полная документация REST API для Quest Dating платформы.

## Базовый URL
```
Development: http://localhost:5000/api
Production: https://api.questdating.ru/api
```

## Аутентификация

API использует JWT (JSON Web Tokens) для аутентификации.

### Получение токена
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### Использование токена

Добавьте токен в заголовок Authorization:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Ответы API

Все ответы возвращаются в формате JSON.

### Успешный ответ
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Ответ с ошибкой
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## Коды ответов

| Код | Описание |
|-----|----------|
| 200 | OK - Запрос выполнен успешно |
| 201 | Created - Ресурс создан |
| 400 | Bad Request - Неверный запрос |
| 401 | Unauthorized - Требуется аутентификация |
| 403 | Forbidden - Доступ запрещен |
| 404 | Not Found - Ресурс не найден |
| 422 | Unprocessable Entity - Ошибка валидации |
| 500 | Internal Server Error - Внутренняя ошибка сервера |

---

## Templates (Шаблоны квестов)

### Получить список шаблонов
```http
GET /api/templates
```

**Query параметры:**

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `page` | integer | Номер страницы | 1 |
| `limit` | integer | Количество результатов | 12 |
| `category` | integer | ID категории | - |
| `tags` | string | ID тегов через запятую | - |
| `difficulty` | string | easy, medium, hard, expert | - |
| `min_price` | integer | Минимальная цена (копейки) | - |
| `max_price` | integer | Максимальная цена (копейки) | - |
| `duration` | integer | Длительность в минутах | - |
| `location_type` | string | city, park, indoor, universal | - |
| `search` | string | Поисковый запрос | - |
| `sort_by` | string | newest, rating, orders, price | newest |
| `order` | string | asc, desc | desc |

**Example:**
```http
GET /api/templates?category=1&difficulty=medium&sort_by=rating&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "romantic-city-adventure",
      "title": "Романтическое приключение по городу",
      "tagline": "Откройте город заново вместе",
      "description": "Квест по самым романтичным местам города...",
      "cover_image": "https://...",
      "images": ["https://...", "https://..."],
      "category_id": 1,
      "category_name": "Городские квесты",
      "category_icon": "🏙️",
      "difficulty": "medium",
      "duration_minutes": 180,
      "min_locations": 5,
      "max_locations": 7,
      "location_type": "city",
      "base_price": 299000,
      "is_free": false,
      "rating": 4.8,
      "reviews_count": 156,
      "orders_count": 342,
      "views_count": 5432,
      "author": {
        "id": 1,
        "username": "anna_quest",
        "display_name": "Анна Иванова",
        "avatar_url": "https://...",
        "is_verified": true
      },
      "tags": [
        { "id": 1, "name": "романтика", "slug": "romantika" },
        { "id": 2, "name": "город", "slug": "gorod" }
      ],
      "created_at": "2024-01-15T10:00:00Z",
      "published_at": "2024-01-16T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 150,
    "pages": 13
  }
}
```

### Получить популярные шаблоны
```http
GET /api/templates/popular?limit=6
```

### Получить избранные шаблоны
```http
GET /api/templates/featured?limit=6
```

### Получить новые шаблоны
```http
GET /api/templates/newest?limit=6
```

### Получить детали шаблона
```http
GET /api/templates/:slug
```

**Example:**
```http
GET /api/templates/romantic-city-adventure
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "romantic-city-adventure",
    "title": "Романтическое приключение по городу",
    "tagline": "Откройте город заново вместе",
    "description": "Полное описание квеста...",
    "cover_image": "https://...",
    "images": ["https://...", "https://..."],
    "demo_video": "https://...",
    "category_id": 1,
    "category_name": "Городские квесты",
    "category_slug": "city-quests",
    "category_icon": "🏙️",
    "difficulty": "medium",
    "duration_minutes": 180,
    "min_locations": 5,
    "max_locations": 7,
    "location_type": "city",
    "base_price": 299000,
    "is_free": false,
    "max_points": 1000,
    "rating": 4.8,
    "reviews_count": 156,
    "orders_count": 342,
    "views_count": 5432,
    "author": {
      "id": 1,
      "username": "anna_quest",
      "display_name": "Анна Иванова",
      "bio": "Создаю романтические квесты более 5 лет",
      "avatar_url": "https://...",
      "is_verified": true,
      "published_templates": 12,
      "average_rating": 4.9,
      "total_orders": 856
    },
    "tags": [
      { "id": 1, "name": "романтика", "slug": "romantika" },
      { "id": 2, "name": "город", "slug": "gorod" }
    ],
    "features": [
      "🎯 5-7 интересных локаций",
      "💝 Романтическая атмосфера",
      "📸 Фотозоны для памятных снимков"
    ],
    "what_included": [
      "Подробный маршрут",
      "Готовые задания и загадки",
      "Рекомендации по подготовке"
    ],
    "requirements": [
      "Смартфон с интернетом",
      "Удобная обувь",
      "3-4 часа свободного времени"
    ],
    "structure": {
      "blocks_count": 6,
      "tasks_count": 18,
      "estimated_time": "3 часа"
    },
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Отличный квест! Очень понравился...",
        "client_name": "Михаил",
        "created_at": "2024-02-01T15:30:00Z",
        "helpful_count": 12
      }
    ],
    "created_at": "2024-01-15T10:00:00Z",
    "published_at": "2024-01-16T12:00:00Z",
    "updated_at": "2024-02-01T08:00:00Z"
  }
}
```

### Получить похожие шаблоны
```http
GET /api/templates/:slug/similar?limit=4
```

---

## Categories (Категории)

### Получить список категорий
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Городские квесты",
      "slug": "city-quests",
      "description": "Квесты по интересным местам города",
      "icon": "🏙️",
      "templates_count": 45,
      "order": 1
    }
  ]
}
```

### Получить детали категории
```http
GET /api/categories/:slug
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Городские квесты",
    "slug": "city-quests",
    "description": "Квесты по интересным местам города",
    "icon": "🏙️",
    "templates_count": 45,
    "templates": [ /* массив шаблонов */ ]
  }
}
```

---

## Tags (Теги)

### Получить список тегов
```http
GET /api/tags
```

### Получить популярные теги
```http
GET /api/tags/popular?limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "романтика",
      "slug": "romantika",
      "usage_count": 89
    }
  ]
}
```

---

## Authors (Авторы)

### Получить список авторов
```http
GET /api/authors?page=1&limit=12&sort_by=rating
```

**Query параметры:**

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `page` | integer | Номер страницы | 1 |
| `limit` | integer | Количество результатов | 12 |
| `sort_by` | string | rating, templates, orders | rating |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "anna_quest",
      "display_name": "Анна Иванова",
      "bio": "Создаю романтические квесты более 5 лет",
      "avatar_url": "https://...",
      "is_verified": true,
      "published_templates": 12,
      "average_rating": 4.9,
      "total_orders": 856,
      "created_at": "2023-06-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5
  }
}
```

### Получить топ авторов
```http
GET /api/authors/top?limit=6
```

### Получить профиль автора
```http
GET /api/authors/:username
```

**Response:**
```json
{
  "success": true,
  "data": {
    "author": {
      "id": 1,
      "username": "anna_quest",
      "display_name": "Анна Иванова",
      "bio": "Создаю романтические квесты более 5 лет",
      "avatar_url": "https://...",
      "is_verified": true,
      "website": "https://...",
      "social_links": {
        "instagram": "https://instagram.com/...",
        "telegram": "https://t.me/...",
        "vk": "https://vk.com/..."
      },
      "published_templates": 12,
      "average_rating": 4.9,
      "total_orders": 856,
      "created_at": "2023-06-01T10:00:00Z"
    },
    "templates": [ /* массив шаблонов автора */ ]
  }
}
```

### Статистика автора
```http
GET /api/authors/:username/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates_count": 12,
    "total_orders": 856,
    "average_rating": 4.9,
    "total_reviews": 432,
    "total_revenue": 2567000,
    "monthly_stats": [
      {
        "month": "2024-01",
        "orders": 45,
        "revenue": 134100
      }
    ]
  }
}
```

---

## Orders (Заказы)

### Создать заказ
```http
POST /api/orders
Content-Type: application/json

{
  "template_id": 1,
  "client_name": "Иван Петров",
  "client_email": "ivan@example.com",
  "client_phone": "+79991234567",
  "event_date": "2024-03-15",
  "event_time": "18:00",
  "location": "Москва, центр",
  "participants_count": 2,
  "description": "Хочу сделать предложение руки и сердца",
  "special_requests": "Включить романтическую музыку",
  "consent_data_processing": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "order_number": "ORD-20240210-123",
    "template_id": 1,
    "template_title": "Романтическое приключение по городу",
    "client_name": "Иван Петров",
    "client_email": "ivan@example.com",
    "status": "pending",
    "total_price": 299000,
    "created_at": "2024-02-10T12:00:00Z"
  },
  "message": "Заказ успешно создан. Мы отправим готовый квест на ваш email в течение 24 часов."
}
```

### Получить детали заказа
```http
GET /api/orders/:id
```

### Получить список заказов (только для авторов/админов)
```http
GET /api/orders?page=1&limit=20&status=pending
Authorization: Bearer {token}
```

### Обновить статус заказа (только автор/админ)
```http
PATCH /api/orders/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "admin_notes": "Квест отправлен клиенту"
}
```

**Статусы заказа:**
- `pending` - Ожидает обработки
- `in_progress` - В работе
- `completed` - Выполнен
- `cancelled` - Отменен

---

## Reviews (Отзывы)

### Получить отзывы шаблона
```http
GET /api/reviews/template/:templateId?page=1&limit=10&sort_by=newest
```

**Query параметры:**

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `page` | integer | Номер страницы | 1 |
| `limit` | integer | Количество результатов | 10 |
| `sort_by` | string | newest, rating, helpful | newest |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "template_id": 1,
      "rating": 5,
      "comment": "Отличный квест! Очень понравился...",
      "client_name": "Михаил",
      "client_email": "m***@example.com",
      "helpful_count": 12,
      "created_at": "2024-02-01T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "pages": 16
  }
}
```

### Создать отзыв
```http
POST /api/reviews
Content-Type: application/json

{
  "template_id": 1,
  "order_id": 123,
  "rating": 5,
  "comment": "Отличный квест! Очень понравился...",
  "client_name": "Михаил",
  "client_email": "mikhail@example.com"
}
```

### Отметить отзыв как полезный
```http
POST /api/reviews/:id/helpful
```

---

## Quests (Прохождение квестов)

### Получить квест по коду доступа
```http
GET /api/quests/:slug?access_code=XXXX-XXXX-XXXX
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Романтическое приключение",
    "category_name": "Городские квесты",
    "max_points": 1000,
    "blocks": [
      {
        "id": 1,
        "title": "Первая локация",
        "description": "Начните свое приключение...",
        "order": 1,
        "tasks": [
          {
            "id": 1,
            "title": "Найдите место",
            "description": "Описание задания...",
            "type": "location",
            "points": 50,
            "hint": "Подсказка..."
          }
        ]
      }
    ]
  }
}
```

### Создать сессию квеста
```http
POST /api/quests/:questId/session
Content-Type: application/json

{
  "access_code": "XXXX-XXXX-XXXX",
  "participant_name": "Иван и Мария"
}
```

### Обновить прогресс
```http
PATCH /api/quests/session/:sessionId
Content-Type: application/json

{
  "completed_tasks": [1, 2, 3],
  "current_block": 2,
  "points": 150,
  "hints_used": 1
}
```

### Завершить квест
```http
POST /api/quests/session/:sessionId/complete
Content-Type: application/json

{
  "completed_tasks": [1, 2, 3, 4, 5],
  "points": 950,
  "hints_used": 2,
  "elapsed_time": 10800
}
```

---

## Upload (Загрузка файлов)

### Загрузить изображение
```http
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "image": <file>,
  "type": "template_cover"
}
```

**Типы изображений:**
- `template_cover` - Обложка шаблона
- `template_gallery` - Галерея шаблона
- `author_avatar` - Аватар автора
- `quest_photo` - Фото из квеста

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.questdating.ru/uploads/templates/abc123.jpg",
    "filename": "abc123.jpg",
    "size": 245632,
    "mimetype": "image/jpeg"
  }
}
```

### Загрузить несколько изображений
```http
POST /api/upload/images
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "images": [<file1>, <file2>, <file3>],
  "type": "template_gallery"
}
```

---

## Search (Поиск)

### Глобальный поиск
```http
GET /api/search?q=романтика&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [ /* массив шаблонов */ ],
    "authors": [ /* массив авторов */ ],
    "categories": [ /* массив категорий */ ]
  },
  "total": 45
}
```

### Поисковые подсказки
```http
GET /api/search/suggestions?q=роман&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": [
    "романтика",
    "романтические квесты",
    "романтическое свидание"
  ]
}
```

---

## Пагинация

Все эндпоинты, возвращающие списки, поддерживают пагинацию:
```http
GET /api/templates?page=2&limit=20
```

**Response включает:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Rate Limiting

API имеет ограничения на количество запросов:

- **Анонимные пользователи:** 100 запросов/час
- **Авторизованные пользователи:** 1000 запросов/час

При превышении лимита API вернет `429 Too Many Requests`.

---

## Ошибки валидации

При ошибках валидации API возвращает детальную информацию:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "client_email": "Invalid email format",
    "event_date": "Date must be in the future"
  }
}
```

---

## Примеры использования

### JavaScript (Axios)
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Получить шаблоны
const getTemplates = async () => {
  const response = await api.get('/templates', {
    params: {
      category: 1,
      difficulty: 'medium',
      limit: 12
    }
  })
  return response.data
}

// Создать заказ
const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData)
  return response.data
}
```

### curl
```bash
# Получить шаблоны
curl -X GET "http://localhost:5000/api/templates?limit=5"

# Создать заказ
curl -X POST "http://localhost:5000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": 1,
    "client_name": "Иван Петров",
    "client_email": "ivan@example.com",
    "event_date": "2024-03-15"
  }'
```

---

## Changelog

### v1.0.0 (2024-02-10)
- Первая версия API
- Базовые эндпоинты для шаблонов, заказов, авторов
- Система аутентификации JWT
- Загрузка файлов

---

## Поддержка

Если у вас есть вопросы по API:
- Email: api@questdating.ru
- Telegram: @questdating_support
- GitHub Issues: https://github.com/yourusername/quest-dating/issues