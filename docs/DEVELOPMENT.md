# Руководство по разработке

Документация для разработчиков Quest Dating платформы.

## Оглавление

- [Настройка окружения](#настройка-окружения)
- [Стандарты кода](#стандарты-кода)
- [Git workflow](#git-workflow)
- [Тестирование](#тестирование)
- [Отладка](#отладка)
- [Работа с базой данных](#работа-с-базой-данных)
- [API разработка](#api-разработка)
- [Frontend разработка](#frontend-разработка)
- [Часто встречающиеся задачи](#часто-встречающиеся-задачи)

---

## Настройка окружения

### Требования

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Git
- VS Code (рекомендуется)

### Установка

1. **Клонирование репозитория:**
```bash
git clone https://github.com/yourusername/quest-dating.git
cd quest-dating
```

2. **Установка зависимостей:**
```bash
npm run install:all
```

3. **Настройка переменных окружения:**
```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.example client/.env
```

4. **Настройка базы данных:**
```bash
# Создать базу данных
createdb quest_dating

# Инициализация схемы
npm run db:init

# Заполнение тестовыми данными
npm run db:seed
```

5. **Запуск в режиме разработки:**
```bash
npm run dev
```

### VS Code расширения

Рекомендуемые расширения:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar",
    "christian-kohler.path-intellisense",
    "streetsidesoftware.code-spell-checker",
    "eamodio.gitlens",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### VS Code настройки

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Стандарты кода

### JavaScript/Vue

#### Именование
```javascript
// Константы - UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5242880
const API_BASE_URL = 'http://localhost:5000'

// Переменные и функции - camelCase
const userName = 'John'
function getUserData() { }

// Классы и компоненты - PascalCase
class UserModel { }
// TemplateCard.vue, AuthorProfile.vue

// Приватные методы - _camelCase (convention)
function _validateInput() { }

// Boolean переменные - префикс is/has/should
const isActive = true
const hasPermission = false
const shouldRender = true
```

#### Структура файлов

**Vue компоненты:**
```vue
<template>
  <!-- HTML -->
</template>

<script setup>
// 1. Импорты
import { ref, computed } from 'vue'

// 2. Props
const props = defineProps({ ... })

// 3. Emits
const emit = defineEmits(['update', 'delete'])

// 4. Reactive state
const count = ref(0)

// 5. Computed
const doubleCount = computed(() => count.value * 2)

// 6. Methods
const increment = () => { count.value++ }

// 7. Lifecycle hooks
onMounted(() => { })
</script>

<style scoped>
/* Styles */
</style>
```

**JavaScript модули:**
```javascript
// 1. Импорты
import express from 'express'
import { someHelper } from './utils'

// 2. Константы
const PORT = 5000

// 3. Функции/Классы
export class Template {
  // ...
}

export const getTemplates = async () => {
  // ...
}

// 4. Default export (если нужен)
export default Template
```

#### ESLint правила

Основные правила:
- Нет `var`, только `const` и `let`
- Предпочитайте `const` над `let`
- Arrow functions для коллбеков
- Template literals вместо конкатенации
- Деструктуризация объектов
- Single quotes для строк
- No semicolons
- 2 spaces для отступов
```javascript
// ✅ Хорошо
const getUserName = (user) => user.name
const message = `Hello, ${userName}!`
const { id, name } = user

// ❌ Плохо
var getUserName = function(user) { return user.name; };
var message = 'Hello, ' + userName + '!';
var id = user.id;
var name = user.name;
```

### CSS/Styling

#### Именование классов

Используем BEM-подобную методологию:
```css
/* Block */
.template-card { }

/* Element */
.template-card__title { }
.template-card__image { }

/* Modifier */
.template-card--featured { }
.template-card__title--large { }
```

#### CSS переменные

Всегда используйте CSS переменные из `variables.css`:
```css
/* ✅ Хорошо */
.button {
  background: var(--color-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}

/* ❌ Плохо */
.button {
  background: #667eea;
  padding: 16px;
  border-radius: 8px;
}
```

### SQL
```sql
-- Все ключевые слова в ВЕРХНЕМ РЕГИСТРЕ
SELECT id, name, email
FROM users
WHERE status = 'active'
ORDER BY created_at DESC;

-- Используйте алиасы для ясности
SELECT 
  t.id,
  t.title,
  a.display_name AS author_name
FROM templates t
JOIN authors a ON t.author_id = a.id;

-- Параметризованные запросы (защита от SQL injection)
const query = 'SELECT * FROM users WHERE email = $1'
const values = [email]
```

---

## Git Workflow

### Ветки
```
main           # Production-ready код
├── develop    # Интеграционная ветка
    ├── feature/template-filters
    ├── feature/order-system
    ├── bugfix/image-upload
    └── hotfix/payment-error
```

### Именование веток
```bash
# Features
git checkout -b feature/add-payment-integration
git checkout -b feature/author-dashboard

# Bug fixes
git checkout -b bugfix/fix-image-upload
git checkout -b bugfix/template-search

# Hotfixes (срочные исправления в production)
git checkout -b hotfix/critical-security-patch
```

### Commit сообщения

Формат: `<type>(<scope>): <subject>`

**Types:**
- `feat` - новая функция
- `fix` - исправление бага
- `docs` - документация
- `style` - форматирование
- `refactor` - рефакторинг
- `test` - тесты
- `chore` - рутинные задачи
```bash
# Примеры
git commit -m "feat(templates): add filtering by difficulty"
git commit -m "fix(orders): resolve email validation bug"
git commit -m "docs(api): update endpoints documentation"
git commit -m "refactor(auth): simplify JWT middleware"
git commit -m "style(frontend): format code with prettier"
```

### Pull Request процесс

1. **Создайте ветку от `develop`:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
```

2. **Разрабатывайте и коммитьте:**
```bash
git add .
git commit -m "feat(scope): description"
```

3. **Push и создайте PR:**
```bash
git push origin feature/my-feature
# Создайте PR на GitHub
```

4. **Code Review:**
   - Минимум 1 аппрув
   - Все проверки пройдены
   - Нет конфликтов

5. **Merge:**
```bash
# Squash merge в develop
git checkout develop
git merge --squash feature/my-feature
git commit -m "feat(scope): complete description"
git push origin develop
```

---

## Тестирование

### Unit тесты
```javascript
// tests/utils/formatters.test.js
import { formatPrice, formatDate } from '@/utils/formatters'

describe('formatPrice', () => {
  it('should format price correctly', () => {
    expect(formatPrice(100000)).toBe('1 000 ₽')
    expect(formatPrice(0)).toBe('Бесплатно')
  })
})

describe('formatDate', () => {
  it('should format date in short format', () => {
    const date = new Date('2024-02-10')
    expect(formatDate(date, 'short')).toBe('10.02.2024')
  })
})
```

### Integration тесты
```javascript
// tests/api/templates.test.js
import request from 'supertest'
import app from '../server/index.js'

describe('GET /api/templates', () => {
  it('should return templates list', async () => {
    const response = await request(app)
      .get('/api/templates')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })
  
  it('should filter by category', async () => {
    const response = await request(app)
      .get('/api/templates?category=1')
      .expect(200)
    
    expect(response.body.data.every(t => t.category_id === 1)).toBe(true)
  })
})
```

### Запуск тестов
```bash
# Все тесты
npm test

# Конкретный файл
npm test -- tests/api/templates.test.js

# С покрытием
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Отладка

### Backend отладка

**Console logging:**
```javascript
console.log('Debug:', variable)
console.error('Error:', error)
console.table(arrayOfObjects)
```

**VS Code debugger:**

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/server/index.js",
      "envFile": "${workspaceFolder}/server/.env"
    }
  ]
}
```

**Database queries:**
```javascript
// Логирование SQL запросов
const result = await pool.query(query, values)
console.log('Query:', query)
console.log('Values:', values)
console.log('Result:', result.rows)
```

### Frontend отладка

**Vue DevTools:**
- Установите расширение Vue DevTools
- Просмотр компонентов, props, state
- Отслеживание events

**Browser DevTools:**
```javascript
// Логирование
console.log('Component mounted:', this.$options.name)

// Точки останова
debugger

// Network tab для API запросов
```

**Pinia DevTools:**
```javascript
// Просмотр state изменений
import { useQuestStore } from '@/store'

const store = useQuestStore()
console.log('Store state:', store.$state)
```

---

## Работа с базой данных

### Подключение к БД
```bash
# Используя psql
psql -U quest_user -d quest_dating

# Подключение к Docker контейнеру
docker exec -it quest-dating-db psql -U quest_user -d quest_dating
```

### Частые SQL команды
```sql
-- Список таблиц
\dt

-- Структура таблицы
\d templates

-- Выполнить SQL файл
\i server/database/schema.sql

-- Посмотреть данные
SELECT * FROM templates LIMIT 10;

-- Очистить таблицу
TRUNCATE TABLE templates RESTART IDENTITY CASCADE;
```

### Миграции

**Создание миграции:**
```bash
# Создать файл миграции
touch server/database/migrations/001_add_featured_column.sql
```
```sql
-- 001_add_featured_column.sql
ALTER TABLE templates 
ADD COLUMN is_featured BOOLEAN DEFAULT false;

CREATE INDEX idx_templates_featured ON templates(is_featured);
```

**Применение миграций:**
```bash
npm run db:migrate
```

### Бэкапы
```bash
# Создать бэкап
pg_dump -U quest_user quest_dating > backup.sql

# Восстановить из бэкапа
psql -U quest_user quest_dating < backup.sql

# Бэкап через Docker
docker exec quest-dating-db pg_dump -U quest_user quest_dating > backup.sql
```

---

## API разработка

### Создание нового endpoint

1. **Создайте роут:**
```javascript
// server/routes/templates.js
router.get('/featured', templateController.getFeatured)
```

2. **Создайте контроллер:**
```javascript
// server/controllers/templateController.js
exports.getFeatured = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6
    const templates = await Template.findFeatured(limit)
    res.json({ success: true, data: templates })
  } catch (error) {
    next(error)
  }
}
```

3. **Создайте метод модели:**
```javascript
// server/models/Template.js
static async findFeatured(limit = 6) {
  const query = `
    SELECT * FROM templates
    WHERE is_featured = true
    ORDER BY rating DESC
    LIMIT $1
  `
  const result = await pool.query(query, [limit])
  return result.rows
}
```

4. **Добавьте валидацию (опционально):**
```javascript
// server/middleware/validators.js
const validateFeaturedQuery = [
  query('limit').optional().isInt({ min: 1, max: 20 })
]

// В роуте
router.get('/featured', validateFeaturedQuery, templateController.getFeatured)
```

### Тестирование API
```bash
# Используя curl
curl http://localhost:5000/api/templates/featured

# Используя httpie
http GET localhost:5000/api/templates/featured

# Используя Postman или Insomnia
```

---

## Frontend разработка

### Создание нового компонента

1. **Создайте файл компонента:**
```bash
touch client/src/components/common/Badge.vue
```

2. **Базовая структура:**
```vue
<template>
  <span :class="['badge', `badge--${variant}`]">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning'].includes(value)
  }
})
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge--primary {
  background: var(--color-primary);
  color: white;
}

.badge--success {
  background: var(--color-success);
  color: white;
}

.badge--warning {
  background: var(--color-warning);
  color: var(--color-gray-800);
}
</style>
```

3. **Использование:**
```vue
<template>
  <Badge variant="success">Активен</Badge>
</template>

<script setup>
import Badge from '@/components/common/Badge.vue'
</script>
```

### Работа со state

**Локальный state (ref):**
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>
```

**Глобальный state (Pinia):**
```javascript
// store/index.js
export const useQuestStore = defineStore('quest', {
  state: () => ({
    templates: []
  }),
  actions: {
    async fetchTemplates() {
      const data = await templateService.getAll()
      this.templates = data
    }
  }
})

// В компоненте
import { useQuestStore } from '@/store'
const store = useQuestStore()
store.fetchTemplates()
```

### API вызовы
```javascript
// services/templateService.js
import api from './api'

export const templateService = {
  async getAll(params) {
    const response = await api.get('/templates', { params })
    return response.data
  },
  
  async getBySlug(slug) {
    const response = await api.get(`/templates/${slug}`)
    return response.data
  }
}

// В компоненте
import { templateService } from '@/services/templateService'

const loadTemplates = async () => {
  try {
    const data = await templateService.getAll({ limit: 12 })
    templates.value = data
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## Часто встречающиеся задачи

### Добавить новую категорию
```sql
INSERT INTO categories (name, slug, description, icon, "order")
VALUES ('Новая категория', 'new-category', 'Описание', '🎯', 10);
```

### Сбросить базу данных
```bash
npm run db:reset
```

### Очистить кэш npm
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Пересобрать Docker контейнеры
```bash
npm run docker:clean
npm run docker:build
npm run docker:dev
```

### Исправить линтинг ошибки
```bash
npm run lint:fix
```

### Обновить зависимости
```bash
# Проверить устаревшие пакеты
npm outdated

# Обновить все (осторожно!)
npm update

# Обновить конкретный пакет
npm update vue@latest
```

### Профилирование производительности

**Backend:**
```javascript
console.time('Query execution')
const result = await pool.query(query)
console.timeEnd('Query execution')
```

**Frontend:**
```javascript
// Vue DevTools -> Performance
// Browser DevTools -> Performance tab
```

---

## Полезные команды
```bash
# Разработка
npm run dev              # Запуск frontend + backend
npm run client:dev       # Только frontend
npm run server:dev       # Только backend

# База данных
npm run db:init          # Инициализация
npm run db:seed          # Тестовые данные
npm run db:reset         # Сброс и переинициализация

# Код качество
npm run lint             # Проверка
npm run lint:fix         # Автоисправление
npm run format           # Prettier форматирование

# Docker
npm run docker:dev       # Запуск в dev
npm run docker:logs      # Логи
npm run docker:down      # Остановка
npm run docker:clean     # Полная очистка

# Тесты
npm test                 # Все тесты
npm test -- --watch      # Watch mode
npm test -- --coverage   # С покрытием
```

---

## Troubleshooting

### Проблема: Port already in use
```bash
# Найти процесс на порту
lsof -i :5000

# Убить процесс
kill -9 <PID>
```

### Проблема: Database connection error
```bash
# Проверить статус PostgreSQL
pg_isready -U quest_user -d quest_dating

# Перезапустить PostgreSQL (Mac)
brew services restart postgresql

# Перезапустить PostgreSQL (Linux)
sudo systemctl restart postgresql
```

### Проблема: Module not found
```bash
# Переустановить зависимости
rm -rf node_modules
npm install
```

### Проблема: Git merge conflicts
```bash
# Посмотреть конфликты
git status

# Разрешить через VS Code или вручную
# После разрешения:
git add .
git commit -m "resolve merge conflicts"
```

---

## Ресурсы

### Документация

- [Vue 3 Docs](https://vuejs.org/)
- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Pinia Docs](https://pinia.vuejs.org/)

### Инструменты

- [Vue DevTools](https://devtools.vuejs.org/)
- [Postman](https://www.postman.com/)
- [TablePlus](https://tableplus.com/) - GUI для PostgreSQL

### Community

- GitHub Issues
- Stack Overflow
- Vue Forum
- Node.js Forum

---

Happy Coding! 🚀