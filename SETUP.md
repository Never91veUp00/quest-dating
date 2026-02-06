# Руководство по установке Quest Dating Platform

## Требования к серверу

- Ubuntu 20.04 / 22.04 / 24.04 LTS
- Минимум 2GB RAM
- 20GB свободного места на диске
- Root или sudo доступ

---

## Шаг 1: Подключение к серверу и обновление системы
```bash
# Подключитесь к серверу по SSH
ssh root@your_server_ip

# Обновите систему
sudo apt update
sudo apt upgrade -y
```

---

## Шаг 2: Установка Node.js
```bash
# Установка Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка установки
node --version  # Должна быть версия 20.x
npm --version   # Должна быть версия 10.x
```

---

## Шаг 3: Установка PostgreSQL
```bash
# Установка PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Проверка статуса
sudo systemctl status postgresql

# Должен быть статус "active (running)"
# Нажмите 'q' для выхода
```

### Настройка PostgreSQL
```bash
# Переключитесь на пользователя postgres
sudo -i -u postgres

# Войдите в PostgreSQL
psql

# Выполните следующие команды в PostgreSQL консоли:
```
```sql
-- Создайте пользователя для приложения
CREATE USER web WITH PASSWORD 'web';

-- Создайте базу данных
CREATE DATABASE quest_dating OWNER web;

-- Предоставьте все права
GRANT ALL PRIVILEGES ON DATABASE quest_dating TO web;

-- Выйдите из psql
\q
```
```bash
# Выйдите из пользователя postgres
exit

# Вернитесь к root/sudo пользователю
```

### Разрешите удаленные подключения (если нужно)
```bash
# Откройте конфигурационный файл
sudo nano /etc/postgresql/16/main/postgresql.conf

# Найдите строку #listen_addresses = 'localhost' и измените на:
listen_addresses = '*'

# Сохраните (Ctrl+O, Enter, Ctrl+X)

# Настройте доступ
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Добавьте в конец файла:
host    all             all             0.0.0.0/0               md5

# Сохраните и перезапустите PostgreSQL
sudo systemctl restart postgresql
```

---

## Шаг 4: Установка Git
```bash
sudo apt install -y git
git --version
```

---

## Шаг 5: Создание пользователя для приложения (рекомендуется)
```bash
# Создайте нового пользователя
sudo adduser questapp
(password 12345678)

# Добавьте в группу sudo (опционально)
sudo usermod -aG sudo questapp

# Переключитесь на нового пользователя
su - questapp
```

---

## Шаг 6: Клонирование и настройка проекта
```bash
# Создайте директорию для проекта
mkdir -p ~/quest-dating
cd ~/quest-dating

# Если вы используете Git, клонируйте репозиторий:
# git clone https://github.com/your-username/quest-dating.git .

# Или создайте структуру проекта вручную
# (скопируйте файлы проекта на сервер через SCP/SFTP)
```

---

## Шаг 7: Настройка Backend
```bash
cd ~/quest-dating/server

# Установите зависимости
npm install

# Создайте .env файл
nano .env
```

### Содержимое `.env` файла:
```env
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quest_dating
DB_USER=web
DB_PASSWORD=your_strong_password_here

# JWT (для будущей авторизации)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long_change_this

# CORS (замените на ваш домен)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```
```bash
# Сохраните (Ctrl+O, Enter, Ctrl+X)
```

### Инициализация базы данных
```bash
# Подключитесь к базе данных
PGPASSWORD=your_strong_password_here psql -h localhost -U web -d quest_dating

# Или через sudo
sudo -u postgres psql -d quest_dating
```

Скопируйте и выполните SQL скрипт (создадим его ниже):
```sql
-- Вставьте содержимое database/schema.sql
-- (см. следующий раздел)
```

---

## Шаг 8: Настройка Frontend
```bash
cd ~/quest-dating/client

# Установите зависимости
npm install

# Создайте production build
npm run build

# Build будет в директории dist/
```

---

## Шаг 9: Установка PM2 (процесс-менеджер для Node.js)
```bash
# Установите PM2 глобально
sudo npm install -g pm2

# Запустите backend
cd ~/quest-dating/server
pm2 start src/server.js --name quest-dating-api

# Настройте автозапуск при перезагрузке сервера
pm2 startup
# Скопируйте и выполните команду, которую покажет PM2

pm2 save

# Проверьте статус
pm2 status
pm2 logs quest-dating-api
```

---

## Шаг 10: Установка и настройка Nginx
```bash
# Установите Nginx
sudo apt install -y nginx

# Создайте конфигурацию сайта
sudo nano /etc/nginx/sites-available/quest-dating
```

### Содержимое конфигурации Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    root /home/questapp/quest-dating/client/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
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

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```
```bash
# Сохраните (Ctrl+O, Enter, Ctrl+X)

# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/quest-dating /etc/nginx/sites-enabled/

# Удалите дефолтный конфиг (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Если всё ОК, перезапустите Nginx
sudo systemctl restart nginx

# Включите автозапуск
sudo systemctl enable nginx
```

---

## Шаг 11: Установка SSL сертификата (Let's Encrypt)
```bash
# Установите Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получите сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Следуйте инструкциям:
# - Введите email
# - Согласитесь с условиями
# - Выберите опцию перенаправления HTTP на HTTPS (рекомендуется)

# Certbot автоматически настроит HTTPS и обновление сертификатов
# Проверьте автообновление:
sudo certbot renew --dry-run
```

---

## Шаг 12: Настройка Firewall
```bash
# Установите UFW (если не установлен)
sudo apt install -y ufw

# Настройте правила
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Включите firewall
sudo ufw enable

# Проверьте статус
sudo ufw status
```

---

## Шаг 13: Проверка работы
```bash
# Проверьте статус всех сервисов
sudo systemctl status postgresql
sudo systemctl status nginx
pm2 status

# Проверьте логи
pm2 logs quest-dating-api
sudo tail -f /var/log/nginx/error.log
```

Откройте браузер и перейдите на ваш домен:
- `https://yourdomain.com` - должна открыться главная страница
- `https://yourdomain.com/api/health` - должен вернуть `{"status":"OK"}`

---

## Полезные команды для управления

### PM2 (Backend)
```bash
# Просмотр статуса
pm2 status

# Логи
pm2 logs quest-dating-api

# Перезапуск
pm2 restart quest-dating-api

# Остановка
pm2 stop quest-dating-api

# Удаление процесса
pm2 delete quest-dating-api
```

### PostgreSQL
```bash
# Подключение к базе
sudo -u postgres psql -d quest_dating

# Резервное копирование
sudo -u postgres pg_dump quest_dating > backup_$(date +%Y%m%d).sql

# Восстановление из бэкапа
sudo -u postgres psql quest_dating < backup_20240206.sql
```

### Nginx
```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx

# Просмотр логов
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Обновление приложения
```bash
# 1. Остановите backend
pm2 stop quest-dating-api

# 2. Обновите код
cd ~/quest-dating
git pull  # или загрузите новые файлы

# 3. Обновите зависимости backend
cd server
npm install

# 4. Примените миграции БД (если есть)
# psql -U web -d quest_dating < migrations/new_migration.sql

# 5. Пересоберите frontend
cd ../client
npm install
npm run build

# 6. Перезапустите backend
pm2 restart quest-dating-api

# 7. Перезагрузите Nginx
sudo systemctl reload nginx
```

---

## Мониторинг и обслуживание

### Автоматические бэкапы БД

Создайте скрипт для бэкапов:
```bash
# Создайте директорию для бэкапов
mkdir -p ~/backups

# Создайте скрипт
nano ~/backup.sh
```
```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/quest_dating_$DATE.sql"

# Создайте бэкап
PGPASSWORD=your_strong_password_here pg_dump -h localhost -U web quest_dating > $BACKUP_FILE

# Сжмите
gzip $BACKUP_FILE

# Удалите старые бэкапы (старше 7 дней)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```
```bash
# Сделайте скрипт исполняемым
chmod +x ~/backup.sh

# Добавьте в crontab (ежедневно в 2 AM)
crontab -e

# Добавьте строку:
0 2 * * * /home/questapp/backup.sh >> /home/questapp/backup.log 2>&1
```

### Мониторинг дискового пространства
```bash
# Проверка свободного места
df -h

# Очистка логов (если нужно)
sudo journalctl --vacuum-time=7d

# Очистка старых npm кэшей
npm cache clean --force
```

---

## Решение проблем

### Backend не запускается
```bash
# Проверьте логи
pm2 logs quest-dating-api

# Проверьте порт
sudo lsof -i :5000

# Проверьте подключение к БД
PGPASSWORD=your_strong_password_here psql -h localhost -U web -d quest_dating -c "SELECT version();"
```

### Nginx показывает 502 Bad Gateway
```bash
# Убедитесь, что backend запущен
pm2 status

# Проверьте права доступа
ls -la ~/quest-dating/client/dist/

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### База данных не отвечает
```bash
# Проверьте статус PostgreSQL
sudo systemctl status postgresql

# Перезапустите
sudo systemctl restart postgresql

# Проверьте логи
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## Безопасность

### Рекомендации:

1. **Регулярно обновляйте систему:**
```bash
   sudo apt update && sudo apt upgrade -y
```

2. **Настройте автоматические обновления безопасности:**
```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure --priority=low unattended-upgrades
```

3. **Используйте сильные пароли:**
   - База данных
   - JWT секрет
   - SSH ключи вместо паролей

4. **Ограничьте доступ к PostgreSQL:**
   - Разрешите подключения только с localhost, если API и БД на одном сервере

5. **Регулярно делайте бэкапы:**
   - Настройте автоматические бэкапы (см. выше)
   - Храните копии за пределами сервера

6. **Мониторинг:**
```bash
   # Установите htop для мониторинга ресурсов
   sudo apt install -y htop
   
   # Запустите
   htop
```

---

## Контакты и поддержка

Если возникли проблемы при установке, проверьте:
- Логи приложения: `pm2 logs`
- Логи Nginx: `/var/log/nginx/error.log`
- Логи PostgreSQL: `/var/log/postgresql/`

---

## Дополнительно: Настройка для разработки (локально)

Если вы хотите запустить проект локально для разработки:
```bash
# Backend
cd server
npm install
cp .env.example .env  # Настройте .env
npm run dev

# Frontend (в другом терминале)
cd client
npm install
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

---

**Поздравляем! Ваше приложение Quest Dating установлено и готово к работе! 🎉**