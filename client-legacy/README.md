# Quest Dating — Frontend

Vue 3 приложение для персонального сервиса романтических квестов. Включает публичный сайт для клиентов, веб-плеер квестов и защищённую админку для управления заказами и создания квестов.

## 🛠 Стек

- **Vue 3** + Composition API
- **Vue Router** — маршрутизация
- **Pinia** — state management
- **Axios** — HTTP-клиент
- **Vite** — сборка и dev-сервер

## 📦 Установка

```bash
npm install
cp .env.example .env
# Указать VITE_API_URL в .env
```

## 🔧 Команды

```bash
npm run dev       # Dev-сервер на http://localhost:3000
npm run build     # Production-сборка в dist/
npm run preview   # Превью production-сборки
npm run lint      # ESLint проверка
npm run format    # Prettier форматирование
```

## ⚙️ Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_API_URL` | URL бэкенда | `http://localhost:5000/api` |
| `VITE_APP_NAME` | Название приложения | `Quest Dating` |

## 🗺 Страницы и маршруты

| Маршрут | Компонент | Описание |
|---|---|---|
| `/` | `Home.vue` | Главная страница |
| `/templates` | `Templates.vue` | Каталог шаблонов квестов |
| `/template/:slug` | `TemplateDetail.vue` | Страница шаблона |
| `/categories/:slug` | `Category.vue` | Шаблоны по категории |
| `/order/:templateSlug` | `Order.vue` | Оформление заказа |
| `/quest/:slug` | `QuestPlayer.vue` | Прохождение квеста |
| `/about` | `About.vue` | О создателе |
| `/admin/login` | `AdminLogin.vue` | Вход в админку |
| `/admin` | `AdminDashboard.vue` | Дашборд администратора |
| `/admin/quest/new` | `QuestEditor.vue` | Создание нового квеста |
| `/admin/quest/:id/edit` | `QuestEditor.vue` | Редактирование квеста |

Маршруты с `requiresAdmin` защищены guard'ом — без JWT-токена редиректят на `/admin/login`.

## 📁 Структура проекта

```
src/
├── assets/
│   └── styles/
│       ├── main.css           # Глобальные стили
│       ├── variables.css      # CSS-переменные (цвета, типографика, spacing)
│       └── animations.css     # Анимации
│
├── components/
│   ├── common/                # Переиспользуемые компоненты
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   ├── Button.vue
│   │   ├── Modal.vue
│   │   ├── Toast.vue          # Уведомления (вместо alert)
│   │   ├── Loader.vue
│   │   ├── Pagination.vue
│   │   ├── SearchBar.vue
│   │   ├── Breadcrumbs.vue
│   │   └── ImageGalleryModal.vue
│   │
│   ├── editor/                # Редактор квестов (admin)
│   │   ├── EditorBlock.vue    # Блок (локация) квеста
│   │   ├── EditorTask.vue     # Одно задание с выбором типа
│   │   ├── EditorTaskFields.vue # Поля специфичные для каждого типа задания
│   │   └── EditorMeta.vue     # Мета-данные квеста (название, тема, slug)
│   │
│   ├── marketplace/           # Каталог шаблонов
│   │   ├── TemplateCard.vue
│   │   ├── TemplateGrid.vue
│   │   ├── TemplateFilters.vue
│   │   ├── CategoryCard.vue
│   │   ├── RatingStars.vue
│   │   ├── DifficultyBadge.vue
│   │   ├── PriceTag.vue
│   │   ├── TagBadge.vue
│   │   ├── ReviewCard.vue
│   │   ├── TestimonialCard.vue
│   │   └── QuickViewModal.vue
│   │
│   ├── order/                 # Оформление заказа
│   │   ├── OrderForm.vue
│   │   ├── OrderSummary.vue
│   │   ├── CustomizationOptions.vue
│   │   └── PaymentInfo.vue
│   │
│   ├── template/              # Страница шаблона
│   │   ├── TemplateGallery.vue
│   │   ├── TemplateFeatures.vue
│   │   ├── TemplateStructure.vue
│   │   ├── TemplateAuthor.vue
│   │   ├── TemplateReviews.vue
│   │   ├── ReviewFormModal.vue
│   │   ├── SimilarTemplates.vue
│   │   └── OrderCTA.vue
│   │
│   └── quest/                 # Плеер квеста
│       ├── QuestSplash.vue    # Экран ввода кода доступа
│       ├── QuestIntro.vue     # Вступительный экран
│       ├── QuestBlock.vue     # Блок (локация) с заданиями
│       ├── QuestTask.vue      # Рендер задания по типу
│       ├── TaskCard.vue       # Карточка задания
│       ├── QuestMap.vue       # Карта прогресса
│       ├── ProgressBar.vue    # Прогресс-бар
│       ├── QuestTimer.vue     # Таймер
│       ├── AchievementPopup.vue # Попап за выполнение
│       ├── QuestFinish.vue    # Финальный экран
│       └── themes.js          # Темы оформления плеера
│
├── composables/
│   ├── useQuest.js            # Логика прохождения квеста
│   ├── useQuestEditor.js      # Логика редактора квестов
│   ├── useTemplates.js        # Загрузка и фильтрация шаблонов
│   ├── useFilters.js          # Фильтры каталога
│   └── useToast.js            # Toast-уведомления
│
├── services/                  # Обёртки над API
│   ├── api.js                 # Axios instance (apiClient)
│   ├── templateService.js
│   ├── categoryService.js
│   ├── tagService.js
│   ├── orderService.js
│   ├── questService.js
│   ├── reviewService.js
│   ├── searchService.js
│   └── uploadService.js
│
├── store/
│   ├── index.js               # Pinia store
│   ├── types.js
│   └── modules/
│       ├── auth.js            # JWT-токен, данные пользователя
│       └── cart.js
│
├── utils/
│   ├── formatters.js          # Форматирование цен, дат
│   ├── helpers.js             # Общие хелперы
│   └── validators.js          # Валидация форм
│
├── config/
│   └── constants.js           # FEATURE_PRICES и другие константы
│
├── router/index.js            # Маршруты + navigation guard
├── App.vue                    # Корневой компонент
└── main.js                    # Точка входа
```

## 🎮 Редактор квестов

Доступен по маршрутам `/admin/quest/new` и `/admin/quest/:id/edit`. Основная логика вынесена в `useQuestEditor.js`.

Квест состоит из **блоков** (локаций), каждый блок содержит **задания**. Поддерживаемые типы заданий:

| Тип | Очки | Проверка | Суть |
|---|---|---|---|
| `simple` | 10 | — | Прочитать и продолжить |
| `riddle` | 30 | Авто | Загадка с правильным ответом |
| `text_answer` | 15 | — | Открытый вопрос, свободный ответ |
| `code_physical` | 30 | Авто | Собрать код из физических предметов |
| `location` | 15 | — | Найти место по описанию |
| `selfie` | 25 | — | Сделать селфи с условием |
| `photo` | 20 | — | Сфотографировать объект |
| `media` | 10 | — | Посмотреть видео или аудио |
| `qr` | 35 | Авто | Найти и отсканировать спрятанный QR |
| `mini_game` | 40 | Авто | Угадайка / пары / пазл из фото |

## 🎨 Дизайн-система

Все токены находятся в `src/assets/styles/variables.css` — цвета, типографика, отступы, тени, скруглния, переходы. Использовать CSS-переменные, не хардкодить значения.

## 🔑 Аутентификация

JWT-токен хранится в `localStorage` под ключом `auth_token`. Navigation guard в `router/index.js` проверяет токен для маршрутов с `meta.requiresAdmin`. Auth-стейт — в `store/modules/auth.js`.

## 📝 Соглашения

- Composition API везде (`<script setup>`)
- Компоненты именуются в PascalCase
- Файлы компонентов — `PascalCase.vue`
- Сервисы и утилиты — `camelCase.js`
- Toast вместо `alert()` для пользовательских уведомлений
- `v-if` вместо `v-show` в многошаговых формах (во избежание конфликтов браузерной валидации)
- Параллельная загрузка данных через `Promise.allSettled` где возможно