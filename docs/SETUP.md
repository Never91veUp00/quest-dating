# Руководство по установке

Пошаговое руководство по установке и настройке Quest Dating платформы.

## Оглавление

- [Системные требования](#системные-требования)
- [Локальная установка](#локальная-установка)
- [Docker установка](#docker-установка)
- [Production установка](#production-установка)
- [Проверка установки](#проверка-установки)
- [Решение проблем](#решение-проблем)

---

## Системные требования

### Минимальные требования

- **OS:** macOS 10.15+, Ubuntu 20.04+, Windows 10+
- **RAM:** 4 GB
- **Disk:** 10 GB свободного места
- **Node.js:** 18.0.0 или выше
- **npm:** 9.0.0 или выше
- **PostgreSQL:** 14.0 или выше

### Рекомендуемые требования

- **RAM:** 8 GB или больше
- **Disk:** SSD с 20 GB свободного места
- **Node.js:** 20.x LTS
- **PostgreSQL:** 15.x

---

## Локальная установка

### Шаг 1: Установка зависимостей

#### macOS
```bash
# Установка Homebrew (если еще не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установка Node.js
brew install node@20

# Проверка версии
node --version  # должно быть >= 18.0.0
npm --version   # должно быть >= 9.0.0

# Установка PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Проверка PostgreSQL
psql --version
```

#### Ubuntu/Debian
```bash
# Обновление пакетов
sudo apt update

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версии
node --version
npm --version

# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Запуск PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Проверка статуса
sudo systemctl status postgresql
```

#### Windows

1. **Node.js:**
   - Скачайте с https://nodejs.org/
   - Установите LTS версию (20.x)
   - Перезапустите терминал
   - Проверьте: `node --version`

2. **PostgreSQL:**
   - Скачайте с https://www.postgresql.org/download/windows/
   - Установите PostgreSQL 15
   - Запомните пароль для пользователя `postgres`

3. **Git:**
   - Скачайте с https://git-scm.com/download/win
   - Установите с настройками по умолчанию

### Шаг 2: Клонирование репозитория
```bash
# HTTPS
git clone https://github.com/yourusername/quest-dating.git

# SSH (если настроен)
git clone git@github.com:yourusername/quest-dating.git

# Перейти в директорию
cd quest-dating
```

### Шаг 3: Установка зависимостей проекта
```bash
# Установка зависимостей для всего проекта
npm run install:all

# Это установит зависимости для:
# - Root проекта
# - Backend (server/)
# - Frontend (client/)
```

### Шаг 4: Настройка базы данных

#### Создание пользователя и базы данных

**macOS/Linux:**
```bash
# Подключиться к PostgreSQL
sudo -u postgres psql

# Или (macOS с Homebrew)
psql postgres
```

**Windows:**
```bash
# Открыть SQL Shell (psql) из меню Пуск
# Или использовать pgAdmin
```

**SQL команды:**
```sql
-- Создать пользователя
CREATE USER quest_user WITH PASSWORD 'quest_password';

-- Создать базу данных
CREATE DATABASE quest_dating OWNER quest_user;

-- Дать права
GRANT ALL PRIVILEGES ON DATABASE quest_dating TO quest_user;

-- Выйти
\q
```

#### Альтернативный способ (одной командой):
```bash
# macOS/Linux
createuser -s quest_user
createdb -O quest_user quest_dating

# Установить пароль
psql -U quest_user -d quest_dating -c "ALTER USER quest_user WITH PASSWORD 'quest_password';"
```

### Шаг 5: Настройка переменных окружения

#### Backend (.env)
```bash
# Создать файл из примера
cp server/.env.example server/.env

# Отредактировать server/.env
nano server/.env  # или используйте любой редактор
```

**server/.env:**
```env
# Environment
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quest_dating
DB_USER=quest_user
DB_PASSWORD=quest_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Email (optional, for future)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

#### Frontend (.env)
```bash
# Создать файл из примера
cp client/.env.example client/.env

# Отредактировать client/.env
nano client/.env
```

**client/.env:**
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Application
VITE_APP_NAME=Quest Dating
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false

# Debug
VITE_DEBUG=true
```

### Шаг 6: Инициализация базы данных
```bash
# Создать таблицы
npm run db:init

# Заполнить тестовыми данными
npm run db:seed
```

**Что создается:**

- ✅ Таблица `categories` с 6 категориями
- ✅ Таблица `authors` с 5 тестовыми авторами
- ✅ Таблица `templates` с 20+ шаблонами квестов
- ✅ Таблица `tags` с популярными тегами
- ✅ Связи `template_tags`
- ✅ Тестовые `orders` и `reviews`

### Шаг 7: Запуск приложения
```bash
# Запуск frontend и backend одновременно
npm run dev
```

**Или запустить раздельно:**
```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run client:dev
```

### Шаг 8: Проверка работы

Откройте в браузере:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

Вы должны увидеть:
- ✅ Главную страницу Quest Dating
- ✅ Каталог шаблонов квестов
- ✅ Работающие фильтры и поиск

---

## Docker установка

Если у вас установлен Docker, можно запустить проект в контейнерах.

### Шаг 1: Установка Docker

#### macOS
```bash
# Скачайте Docker Desktop
# https://www.docker.com/products/docker-desktop

# Или через Homebrew
brew install --cask docker
```

#### Ubuntu/Debian
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo apt install docker-compose

# Перезайти в систему или выполнить
newgrp docker
```

#### Windows

1. Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop
2. Установите и перезагрузите компьютер
3. Запустите Docker Desktop

### Шаг 2: Клонирование и настройка
```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/quest-dating.git
cd quest-dating

# Скопировать env файлы (опционально, есть дефолтные значения)
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Шаг 3: Запуск через Docker Compose
```bash
# Запуск всех сервисов
npm run docker:dev

# Или напрямую
docker-compose up -d
```

**Что запускается:**

- 🐘 PostgreSQL контейнер (порт 5432)
- 🟢 Backend контейнер (порт 5000)
- 🔵 Frontend контейнер (порт 3000)

### Шаг 4: Инициализация базы данных
```bash
# База данных автоматически инициализируется при первом запуске
# Но если нужно пересоздать:

# Подключиться к контейнеру backend
docker exec -it quest-dating-server sh

# Внутри контейнера
npm run db:init
npm run db:seed
exit
```

### Шаг 5: Проверка
```bash
# Посмотреть логи
npm run docker:logs

# Или для конкретного сервиса
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f postgres

# Проверить статус контейнеров
docker-compose ps
```

Откройте: http://localhost:3000

### Управление Docker контейнерами
```bash
# Остановить
npm run docker:down

# Перезапустить
docker-compose restart

# Пересобрать образы
npm run docker:build

# Полная очистка (удаляет volumes с данными!)
npm run docker:clean
```

---

## Production установка

### Требования для Production

- **VPS/Cloud сервер:** Ubuntu 22.04 LTS или выше
- **RAM:** минимум 2 GB (рекомендуется 4+ GB)
- **CPU:** 2+ cores
- **Disk:** 20+ GB SSD
- **Domain:** Зарегистрированный домен (опционально)
- **SSL:** Let's Encrypt или другой сертификат

### Шаг 1: Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y curl git build-essential

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Установка Nginx
sudo apt install -y nginx

# Настройка firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Шаг 2: Настройка PostgreSQL
```bash
# Создать пользователя и базу данных
sudo -u postgres psql << EOF
CREATE USER quest_user WITH PASSWORD 'strong_password_here';
CREATE DATABASE quest_dating OWNER quest_user;
GRANT ALL PRIVILEGES ON DATABASE quest_dating TO quest_user;
\q
EOF

# Настроить PostgreSQL для удаленных подключений (если нужно)
sudo nano /etc/postgresql/15/main/postgresql.conf
# Раскомментировать: listen_addresses = 'localhost'

sudo systemctl restart postgresql
```

### Шаг 3: Клонирование и установка проекта
```bash
# Создать директорию для проекта
sudo mkdir -p /var/www/quest-dating
sudo chown $USER:$USER /var/www/quest-dating
cd /var/www/quest-dating

# Клонировать репозиторий
git clone https://github.com/yourusername/quest-dating.git .

# Установить зависимости
npm run install:all
```

### Шаг 4: Настройка переменных окружения
```bash
# Backend
cp server/.env.example server/.env
nano server/.env
```

**server/.env (production):**
```env
NODE_ENV=production
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=quest_dating
DB_USER=quest_user
DB_PASSWORD=strong_password_here

JWT_SECRET=super-secret-production-key-min-32-chars
JWT_EXPIRES_IN=7d
```
```bash
# Frontend
cp client/.env.production client/.env.production.local
nano client/.env.production.local
```

**client/.env.production.local:**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Quest Dating
VITE_ENABLE_ANALYTICS=true
```

### Шаг 5: Инициализация базы данных
```bash
cd /var/www/quest-dating
npm run db:init
npm run db:seed  # Опционально для демо данных
```

### Шаг 6: Сборка Frontend
```bash
cd /var/www/quest-dating
npm run client:build

# Статические файлы будут в client/dist/
```

### Шаг 7: Настройка PM2 (Process Manager)
```bash
# Установка PM2 глобально
sudo npm install -g pm2

# Запуск backend через PM2
cd /var/www/quest-dating/server
pm2 start index.js --name quest-dating-api

# Сохранить конфигурацию
pm2 save

# Автозапуск при перезагрузке
pm2 startup
# Выполните команду, которую покажет PM2

# Проверка статуса
pm2 status
pm2 logs quest-dating-api
```

### Шаг 8: Настройка Nginx
```bash
# Создать конфигурацию
sudo nano /etc/nginx/sites-available/quest-dating
```

**Nginx конфигурация:**
```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/quest-dating/client/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
# Включить сайт
sudo ln -s /etc/nginx/sites-available/quest-dating /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx
```

### Шаг 9: Настройка SSL (Let's Encrypt)
```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Следуйте инструкциям Certbot
# Email для уведомлений
# Согласие с условиями
# Выбор: Redirect HTTP to HTTPS

# Автообновление сертификатов
sudo certbot renew --dry-run
```

### Шаг 10: Настройка логирования
```bash
# Логи PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Логи Nginx
sudo nano /etc/logrotate.d/nginx
```

### Шаг 11: Мониторинг
```bash
# PM2 мониторинг
pm2 monit

# Веб-дашборд PM2 (опционально)
pm2 install pm2-server-monit
```

---

## Проверка установки

### Проверка Backend
```bash
# Health check
curl http://localhost:5000/api/health

# Должен вернуть:
# {"success":true,"message":"API is running","timestamp":"..."}

# Получить шаблоны
curl http://localhost:5000/api/templates
```

### Проверка Frontend

Откройте в браузере: http://localhost:3000

Должны работать:
- ✅ Главная страница
- ✅ Каталог шаблонов
- ✅ Детальная страница шаблона
- ✅ Форма заказа
- ✅ Поиск и фильтры

### Проверка базы данных
```bash
# Подключиться к БД
psql -U quest_user -d quest_dating

# Проверить таблицы
\dt

# Проверить данные
SELECT COUNT(*) FROM templates;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM authors;

\q
```

### Проверка Docker установки
```bash
# Статус контейнеров
docker-compose ps

# Все контейнеры должны быть в состоянии "Up"

# Проверка логов
docker-compose logs

# Тест API
curl http://localhost:5000/api/health
```

---

## Решение проблем

### Проблема: "Cannot connect to database"

**Решение:**
```bash
# Проверить статус PostgreSQL
sudo systemctl status postgresql

# Запустить если не запущен
sudo systemctl start postgresql

# Проверить подключение
psql -U quest_user -d quest_dating -c "SELECT 1"

# Проверить параметры в .env файле
cat server/.env | grep DB_
```

### Проблема: "Port 5000 already in use"

**Решение:**
```bash
# Найти процесс
lsof -i :5000
# или
netstat -tuln | grep 5000

# Убить процесс
kill -9 <PID>

# Или изменить PORT в server/.env
```

### Проблема: "Module not found"

**Решение:**
```bash
# Удалить node_modules и переустановить
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Docker контейнеры не запускаются

**Решение:**
```bash
# Проверить логи
docker-compose logs

# Остановить и удалить контейнеры
docker-compose down -v

# Пересобрать
docker-compose build --no-cache

# Запустить заново
docker-compose up -d
```

### Проблема: "permission denied" при установке

**Решение:**
```bash
# Для npm глобальных пакетов
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /usr/local/lib/node_modules

# Для PostgreSQL
sudo chown -R postgres:postgres /var/lib/postgresql
```

### Проблема: Frontend не может подключиться к API

**Решение:**

1. Проверьте `VITE_API_URL` в `client/.env`
2. Убедитесь что backend запущен
3. Проверьте CORS настройки в `server/index.js`
4. Проверьте firewall/антивирус

### Проблема: SSL сертификат не работает

**Решение:**
```bash
# Проверить конфигурацию Nginx
sudo nginx -t

# Проверить сертификаты
sudo certbot certificates

# Переиздать сертификат
sudo certbot --nginx --force-renewal
```

---

## Дополнительная помощь

### Получение логов
```bash
# Backend логи (PM2)
pm2 logs quest-dating-api

# Backend логи (development)
cd server && npm run dev

# Frontend логи
cd client && npm run dev

# Nginx логи
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQL логи
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Полезные команды
```bash
# Проверка версий
node --version
npm --version
psql --version
docker --version
nginx -v

# Проверка портов
netstat -tuln | grep -E '3000|5000|5432'

# Проверка процессов
ps aux | grep node
ps aux | grep postgres
```

### Контакты поддержки

Если проблема не решается:

1. Проверьте Issues на GitHub
2. Создайте новый Issue с описанием проблемы
3. Email: support@questdating.ru
4. Telegram: @questdating_support

---

## Следующие шаги

После успешной установки:

1. 📖 Прочитайте [DEVELOPMENT.md](DEVELOPMENT.md) для разработки
2. 🏗️ Изучите [ARCHITECTURE.md](ARCHITECTURE.md) для понимания структуры
3. 📡 Ознакомьтесь с [API.md](API.md) для работы с API
4. 🚀 Начните разработку!

---

**Успешной установки!** 🎉