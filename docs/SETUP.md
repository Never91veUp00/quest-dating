# Руководство по установке

## Требования

- Node.js 20 LTS, npm 9+, PostgreSQL 15+, Docker + Compose

---

## Локальная разработка

```bash
git clone https://github.com/Never91veUp00/quest-dating.git
cd quest-dating && git checkout feature/nuxt3-migration

cd server && npm install && cd ..
cd client-nuxt && npm install && cd ..

createdb quest_dating
psql -d quest_dating -f database/schema_v2.sql

# Terminal 1
cd server && npm run dev        # :5000

# Terminal 2
cd client-nuxt && npm run dev   # :3000
```

---

## Docker

Создать `.env` в корне:

```env
DB_PASSWORD=твой_пароль
JWT_SECRET=случайная_строка_64_символа
JWT_EXPIRES_IN=7d
```

```bash
docker compose up -d

# SEO описания категорий (первый запуск)
Get-Content database/update_category_descriptions.sql | docker exec -i quest-dating-db psql -U quest_user -d quest_dating

# Пересборка клиента
docker compose build --no-cache client && docker compose up -d client
```

---

## Переменные окружения

### server/.env

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost    # в Docker: postgres
DB_PORT=5432
DB_NAME=quest_dating
DB_USER=quest_user
DB_PASSWORD=quest_password
JWT_SECRET=минимум-32-символа
JWT_EXPIRES_IN=7d
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

---

## Деплой на VPS рег.ру

```bash
# 1. Установить Docker
ssh root@YOUR_IP
apt update && apt install -y docker.io docker-compose-plugin git
systemctl enable --now docker

# 2. Клонировать
cd /var/www
git clone https://github.com/Never91veUp00/quest-dating.git
cd quest-dating && git checkout feature/nuxt3-migration

# 3. .env
echo "DB_PASSWORD=ПАРОЛЬ\nJWT_SECRET=СТРОКА_64\nJWT_EXPIRES_IN=7d" > .env

# 4. SSL (из панели рег.ру)
mkdir -p nginx/ssl
# скопировать fullchain.pem и privkey.pem в nginx/ssl/
chmod 600 nginx/ssl/privkey.pem

# 5. DNS: A-записи questdating.ru и www → IP сервера

# 6. Запуск
docker compose build --no-cache
docker compose up -d
docker compose ps

# 7. SQL
cat database/update_category_descriptions.sql | \
  docker exec -i quest-dating-db psql -U quest_user -d quest_dating

# 8. Проверка
curl -I https://questdating.ru
curl https://questdating.ru/sitemap.xml
```

### Обновление

```bash
git pull origin feature/nuxt3-migration
docker compose build --no-cache client
docker compose up -d client
```

---

## Решение проблем

| Проблема | Решение |
|---------|---------|
| Сайт недоступен | `docker compose logs nginx` — нет SSL? |
| `_payload.json 500` | `innerHTML` в useServerHead должен быть `() => JSON.stringify(...)` |
| Hydration mismatch | Обернуть в `<ClientOnly>` |
| Cannot connect to DB | `docker compose ps postgres` — healthy? |
| Module not found | `npm install` в client-nuxt/ и server/ |