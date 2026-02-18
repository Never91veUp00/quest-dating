# Quest Dating - Frontend

Фронтенд-приложение маркетплейса шаблонов квестов для романтических свиданий.

## 🚀 Технологии

- **Vue 3** - Progressive JavaScript Framework
- **Vue Router** - Официальный роутер для Vue.js
- **Pinia** - State Management
- **Axios** - HTTP клиент
- **Vite** - Build tool

## 📦 Установка
```bash
# Установка зависимостей
npm install

# Копирование env файла
cp .env.example .env
```

## 🛠 Разработка
```bash
# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Preview production build
npm run preview

# Линтинг
npm run lint

# Форматирование кода
npm run format
```

## 📁 Структура проекта
```
src/
├── assets/          # Статические ресурсы (стили, изображения)
├── components/      # Vue компоненты
│   ├── common/      # Общие компоненты
│   ├── marketplace/ # Компоненты маркетплейса
│   ├── template/    # Компоненты шаблонов
│   ├── order/       # Компоненты заказов
│   ├── quest/       # Компоненты квестов
│   └── author/      # Компоненты авторов
├── composables/     # Vue Composition API composables
├── router/          # Vue Router конфигурация
├── services/        # API сервисы
├── store/           # Pinia stores
├── utils/           # Утилиты
├── views/           # Страницы приложения
├── App.vue          # Корневой компонент
└── main.js          # Точка входа
```

## 🌐 API

По умолчанию API доступен на `http://localhost:5000/api`

Изменить URL можно в `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## 📝 Соглашения по коду

- Используем Composition API
- Компоненты именуются в PascalCase
- Файлы компонентов - PascalCase.vue
- Утилиты и сервисы - camelCase.js
- CSS переменные для всех цветов и размеров

## 🎨 Дизайн система

Все переменные дизайн-системы находятся в `src/assets/styles/variables.css`:

- Цвета
- Типографика
- Spacing
- Shadows
- Border radius
- Transitions

## 🚀 Деплой
```bash
# Сборка для production
npm run build

# Результат в папке dist/
```

## 📄 Лицензия

MIT