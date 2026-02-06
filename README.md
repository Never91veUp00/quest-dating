# Quest Dating Platform 🎯💝

Платформа для создания персонализированных квестов-свиданий с геймификацией, загадками и интерактивными заданиями.

## 🚀 Возможности

- 🎮 **Геймификация**: Загадки, пазлы, головоломки, система достижений
- 🗺️ **Интерактивные карты**: GPS-навигация по локациям
- 💝 **Персонализация**: Каждый квест создается индивидуально
- 📱 **Мобильный формат**: Работает на любых устройствах без установки
- ⚡ **Быстрое создание**: От идеи до готового квеста за 24 часа
- 🎨 **Красивый дизайн**: Современный UI с анимациями

## 📋 Требования

- Node.js 20.x или выше
- PostgreSQL 12 или выше
- npm или yarn

## 🛠️ Быстрый старт (локальная разработка)

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/quest-dating.git
cd quest-dating
```

### 2. Установка зависимостей
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Настройка базы данных
```bash
# Установите PostgreSQL (если ещё не установлен)
# Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib

# macOS:
brew install postgresql

# Windows: скачайте с postgresql.org

# Создайте базу данных
sudo -u postgres psql
```
```sql
CREATE DATABASE quest_dating;
CREATE USER quest_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE quest_dating TO quest_user;
\q
```
```bash
# Импортируйте схему
psql -U quest_user -d quest_dating < database/schema.sql
```

### 4. Настройка переменных окружения
```bash
# Backend
cd server
cp .env.example .env
# Отредактируйте .env с вашими настройками

# Frontend
cd ../client
cp .env.example .env
```

### 5. Запуск приложения
```bash
# Backend (терминал 1)
cd server
npm run dev

# Frontend (терминал 2)
cd client
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

## 🌐 Развертывание на production сервере

Подробная инструкция находится в файле [SETUP.md](SETUP.md)

Краткая версия:
```bash
# 1. Установите зависимости на сервере
sudo apt update
sudo apt install -y nodejs postgresql nginx certbot

# 2. Настройте базу данных
sudo -u postgres psql < database/schema.sql

# 3. Установите PM2
sudo npm install -g pm2

# 4. Соберите frontend
cd client
npm run build

# 5. Запустите backend
cd ../server
pm2 start src/server.js --name quest-dating-api

# 6. Настройте Nginx
sudo nano /etc/nginx/sites-available/quest-dating
# (см. конфигурацию в SETUP.md)

# 7. Получите SSL сертификат
sudo certbot --nginx -d yourdomain.com
```

## 📁 Структура проекта
```
quest-dating/
├── client/                 # Vue.js Frontend
│   ├── src/
│   │   ├── components/    # Компоненты
│   │   ├── views/         # Страницы
│   │   ├── store/         # Pinia store
│   │   ├── router/        # Vue Router
│   │   └── services/      # API клиент
│   └── package.json
│
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── config/       # Конфигурация
│   │   ├── models/       # Модели данных
│   │   ├── routes/       # API роуты
│   │   ├── controllers/  # Контроллеры
│   │   ├── middleware/   # Middleware
│   │   └── server.js     # Точка входа
│   └── package.json
│
├── database/
│   └── schema.sql        # SQL схема
│
├── SETUP.md              # Подробная инструкция по развертыванию
└── README.md             # Этот файл
```

## 🔧 Технологии

### Frontend
- **Vue.js 3** - Прогрессивный JavaScript фреймворк
- **Vite** - Быстрый сборщик
- **Pinia** - State management
- **Vue Router** - Роутинг
- **Axios** - HTTP клиент
- **Canvas Confetti** - Анимации конфетти
- **GSAP** - Анимации

### Backend
- **Node.js** - Runtime
- **Express** - Web фреймворк
- **PostgreSQL** - Реляционная БД
- **pg** - PostgreSQL клиент

## 📝 API Endpoints

### Публичные
- `GET /api/dates/:slug` - Получить квест по slug
- `GET /api/templates` - Список шаблонов
- `POST /api/orders` - Создать заказ

### Служебные
- `GET /health` - Health check

## 🎯 Использование

### Для клиентов

1. Перейдите на сайт
2. Выберите шаблон или опишите свою идею
3. Заполните форму заказа
4. Получите ссылку на квест через 24 часа
5. Поделитесь ссылкой с вашей второй половинкой

### Для администраторов

(В разработке) Админ-панель для:
- Управления заказами
- Создания квестов
- Просмотра статистики

## 🧪 Тестирование
```bash
# Backend тесты (будут добавлены)
cd server
npm test

# Frontend тесты (будут добавлены)
cd client
npm test
```

## 📊 Мониторинг
```bash
# Логи PM2
pm2 logs quest-dating-api

# Статус процессов
pm2 status

# Мониторинг ресурсов
pm2 monit
```

## 🔒 Безопасность

- Все пароли хранятся в .env файлах (не коммитятся в Git)
- HTTPS обязателен для production
- SQL инъекции предотвращены через параметризованные запросы
- CORS настроен только для разрешенных доменов
- Rate limiting на критичных endpoints (в планах)

## 🐛 Известные проблемы

- [ ] Админ-панель в разработке
- [ ] Email уведомления не реализованы
- [ ] Платежная система в планах

## 📈 Roadmap

- [ ] Админ-панель для управления квестами
- [ ] Email уведомления клиентам
- [ ] Интеграция платежной системы
- [ ] Мобильное приложение (React Native)
- [ ] AI-генерация квестов
- [ ] Интеграция с картами (Google Maps API)
- [ ] Система отзывов
- [ ] Реферальная программа

## 🤝 Контрибьюции

Вклад приветствуется! Пожалуйста:

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 👥 Авторы

- **Ваше имя** - [GitHub](https://github.com/yourusername)

## 📞 Поддержка

- Email: support@questdating.com
- Telegram: @questdating
- Документация: [docs.questdating.com](https://docs.questdating.com)

## 🙏 Благодарности

- Vue.js команде за отличный фреймворк
- PostgreSQL за надежную БД
- Всем контрибьюторам и тестировщикам

---

**Сделано с ❤️ для незабываемых свиданий**