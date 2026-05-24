# Деплой на VPS рег.ру

## Подготовка

### 1. Подключиться и установить Docker

```bash
ssh root@YOUR_SERVER_IP
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git
systemctl enable --now docker
```

### 2. Клонировать репозиторий

```bash
cd /var/www
git clone https://github.com/Never91veUp00/quest-dating.git
cd quest-dating
git checkout feature/nuxt3-migration
```

### 3. .env файл

```bash
cat > .env << 'EOF'
DB_PASSWORD=СЛОЖНЫЙ_ПАРОЛЬ_МИНИМУМ_16_СИМВОЛОВ
JWT_SECRET=СЛУЧАЙНАЯ_СТРОКА_64_СИМВОЛА
JWT_EXPIRES_IN=7d
EOF
```

### 4. SSL сертификат

Скачать из панели рег.ру → Мои домены → SSL:

```bash
mkdir -p nginx/ssl
# Загрузить файлы:
scp fullchain.pem root@YOUR_IP:/var/www/quest-dating/nginx/ssl/
scp privkey.pem   root@YOUR_IP:/var/www/quest-dating/nginx/ssl/
chmod 600 nginx/ssl/privkey.pem
```

### 5. DNS

В панели рег.ру добавить A-записи:
- `questdating.ru` → IP сервера
- `www.questdating.ru` → IP сервера

Подождать распространения DNS (до 24 часов).

---

## Запуск

```bash
docker compose build --no-cache
docker compose up -d
docker compose ps    # все контейнеры: running
```

### SQL миграции

```bash
# Описания категорий для SEO
cat database/update_category_descriptions.sql | \
  docker exec -i quest-dating-db psql -U quest_user -d quest_dating
```

---

## Проверка

```bash
# Сайт доступен
curl -I https://questdating.ru

# Sitemap с квестами
curl https://questdating.ru/sitemap.xml

# Robots.txt
curl https://questdating.ru/robots.txt

# API работает
curl https://questdating.ru/api/stats

# JSON-LD на странице квеста
curl -s https://questdating.ru/date/detective-home | grep 'application/ld+json'
```

---

## Обновление

```bash
git pull origin feature/nuxt3-migration
docker compose build --no-cache client
docker compose up -d client
docker compose logs -f client    # следить за запуском
```

---

## После деплоя

1. **Google Search Console** — добавить сайт, подтвердить через DNS TXT запись на рег.ру, загрузить sitemap: `https://questdating.ru/sitemap.xml`

2. **Яндекс.Вебмастер** — аналогично, подтвердить через DNS, добавить sitemap

3. **PageSpeed Insights** — проверить Core Web Vitals: https://pagespeed.web.dev/

---

## Структура на сервере

```
/var/www/quest-dating/
├── docker-compose.yml
├── .env
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│       ├── fullchain.pem
│       └── privkey.pem
├── client-nuxt/
├── server/
└── database/
```

---

## Troubleshooting

```bash
# Логи Nginx
docker compose logs nginx --tail=50

# Логи Nuxt
docker compose logs client --tail=50 -f

# Логи Express
docker compose logs server --tail=50 -f

# Перезапустить один сервис
docker compose restart client

# Посмотреть использование ресурсов
docker stats
```