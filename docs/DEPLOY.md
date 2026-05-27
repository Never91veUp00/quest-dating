# Деплой на VPS

Прод хостится на **VDSina** (vdsina.com). Домен `questdating.ru` зарегистрирован на рег.ру и указывает A-записями на IP VPS. SSL-сертификат — из панели рег.ру.

Код развёрнут в `/home/questdating/` на сервере. На ветке `production`.

> История того, как мы пришли к текущему состоянию (включая инцидент INC-001 и
> зачистку pre-Docker-эпохи 24–26 мая), — см. `docs/incidents.md`.

---

## Первичная установка (с нуля на новом VPS)

### 1. Подключиться и установить Docker

```bash
ssh root@YOUR_SERVER_IP
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git nginx
systemctl enable --now docker
systemctl enable --now nginx
```

Обрати внимание: **nginx ставится отдельным пакетом** и работает на хосте как systemd-сервис. В нашем `docker-compose.yml` его нет.

### 2. Установить Node 22 LTS через nvm (для локальных утилит на сервере)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22 --lts
nvm use 22
nvm alias default 22
```

Не ставь Node через `apt` — это было причиной "теневых" установок в INC-001.

### 3. Клонировать репозиторий

```bash
cd /home
git clone https://github.com/Never91veUp00/quest-dating.git questdating
cd questdating
git checkout production
```

### 4. `.env` файл

```bash
cat > .env << 'ENVEOF'
DB_PASSWORD=СЛОЖНЫЙ_ПАРОЛЬ_МИНИМУМ_16_СИМВОЛОВ
JWT_SECRET=СЛУЧАЙНАЯ_СТРОКА_64_СИМВОЛА
JWT_EXPIRES_IN=7d
ENVEOF
```

`server/.env` — отдельно. Cм. `server/.env.example` — там полный список переменных (включая `RESEND_API_KEY`, `NOTIFY_EMAIL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`).

### 5. SSL сертификат

Скачать из панели рег.ру → Мои домены → SSL и положить на сервер:

```bash
mkdir -p nginx/ssl
# С локальной машины, после скачивания:
scp fullchain.pem root@YOUR_IP:/home/questdating/nginx/ssl/
scp privkey.pem   root@YOUR_IP:/home/questdating/nginx/ssl/
ssh root@YOUR_IP "chmod 600 /home/questdating/nginx/ssl/privkey.pem"
```

Подключить `nginx/nginx.conf` к системному nginx (например, через симлинк в `/etc/nginx/sites-enabled/` или прямой `include`) и перезапустить:

```bash
ln -s /home/questdating/nginx/nginx.conf /etc/nginx/sites-enabled/questdating
nginx -t && systemctl reload nginx
```

### 6. DNS

В панели рег.ру добавить A-записи:

- `questdating.ru` → IP сервера VDSina
- `www.questdating.ru` → IP сервера VDSina

Подождать распространения DNS (до 24 часов).

### 7. Запуск контейнеров

```bash
cd /home/questdating
docker compose build --no-cache
docker compose up -d
docker compose ps    # все контейнеры: running
```

### 8. SQL миграции

```bash
# Описания категорий для SEO
cat database/update_category_descriptions.sql | \
  docker exec -i quest-dating-db psql -U quest_user -d quest_dating
```

> **Полное развёртывание БД с нуля** (поднять схему + сиды) пока не
> поддержано — `database/dump.sql` отсутствует в репо, bind-mount в
> `docker-compose.yml` закомментирован. Это **открытая задача 1.2.6**
> из `upgrade-plan.md`. Сейчас БД должна быть восстановлена из бэкапа
> (`backups/docker-volume-snapshot-*.tar.gz`).

### 9. Зарегистрировать Telegram webhook

```bash
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?\
url=https://questdating.ru/api/telegram/webhook&\
secret_token=${TELEGRAM_WEBHOOK_SECRET}&\
drop_pending_updates=true"
```

`secret_token` обязателен — сервер проверяет заголовок `X-Telegram-Bot-Api-Secret-Token` против `TELEGRAM_WEBHOOK_SECRET` из env (PR #6/#7).

### 10. Cron для monitor.sh

```bash
crontab -e
# Добавить:
*/5 * * * * /home/questdating/monitor.sh
```

`monitor.sh` бьёт `/health` на backend напрямую (`127.0.0.1:5001`), парсит JSON и шлёт Telegram-алерт при `db:disconnected` или недоступности.

---

## Регулярное обновление

Стандартный сценарий — после мерджа PR в `production`:

```bash
ssh root@YOUR_IP
cd /home/questdating
git status                # должно быть clean (см. ниже)
git pull origin production
```

Дальше выбираем команду по тому, **что именно изменилось**:

### A) Только документация / SQL-скрипты / `monitor.sh`

```bash
# Ничего пересобирать не надо
```

### B) Только env (`.env` или `server/.env`)

```bash
docker compose up -d         # рестарт с новыми env, без билда
```

### C) Изменён код Nuxt-клиента

```bash
docker compose build client
docker compose up -d client
docker compose logs -f client    # следить за запуском
```

### D) Изменён код Express-сервера

```bash
docker compose build server
docker compose up -d server
docker compose logs -f server
```

### E) Изменён `Dockerfile`, base image, `package.json`/`package-lock.json`

Нужен `--no-cache`, иначе Docker возьмёт слой со старыми зависимостями из кэша:

```bash
docker compose build --no-cache client    # или server
docker compose up -d client
```

### F) Полная пересборка (на случай странных проблем)

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

> **Внимание:** `docker compose down` не трогает named volumes (БД сохраняется). Но если случайно использовать `down -v` — **снесётся БД**. Делай бэкап перед нестандартными операциями: `scripts/backup-db.sh`.

### Чистое рабочее дерево

`git status` должен быть пустым перед `git pull`. Если на проде есть локальные правки — это всегда симптом неправильного процесса. Скоммитить или откатить:

```bash
git diff                          # посмотреть что изменилось
git stash                         # отложить (если потом нужно)
# или
git checkout -- <file>            # откатить конкретный файл
```

---

## Проверка после деплоя

```bash
# Сайт отвечает 200
curl -I https://questdating.ru

# Sitemap c квестами
curl https://questdating.ru/sitemap.xml

# Robots.txt
curl https://questdating.ru/robots.txt

# API
curl https://questdating.ru/api/stats

# Health (реальная проверка БД)
curl -s https://questdating.ru/health
# Ожидаемо: {"status":"OK","db":"connected","uptime":...}

# JSON-LD на странице квеста
curl -s https://questdating.ru/date/detective-home | grep 'application/ld+json'
```

Если `/health` отвечает 503 или `db:disconnected` — БД отвалилась, см. troubleshooting.

---

## Откат

### Откатить последний коммит, который попал в `production`

Если PR смерджен и оказался поломан — **`revert`**, а не force-push (история на `production` должна быть линейной, без переписываний):

```bash
# На локальной машине
cd /home/questdating-work
git checkout production
git pull origin production
git revert <commit-sha>           # создаст revert-коммит
git push origin production
```

На сервере:

```bash
cd /home/questdating
git pull origin production
docker compose up -d                # или с --build, в зависимости от изменений
```

### Откатить на конкретный известный тег

Перед крупными удалениями мы ставим теги (например, `pre-cleanup-legacy` перед удалением `client-legacy/`). Откат к тегу:

```bash
git checkout <tag-name> -- <path>   # вытянуть файлы из тега в текущее дерево
git commit -m "revert: вернуть <что> из тега <tag>"
git push origin production
```

### Откатить БД из бэкапа

```bash
# Восстановление volume из snapshot
docker compose down                 # БЕЗ -v!
docker run --rm -v questdating_postgres_data:/data -v $(pwd)/backups:/backup alpine \
  tar -xzf /backup/docker-volume-snapshot-YYYY-MM-DD.tar.gz -C /data
docker compose up -d
```

---

## После деплоя (SEO)

1. **Google Search Console** — добавить сайт, подтвердить через DNS TXT запись на рег.ру, загрузить sitemap: `https://questdating.ru/sitemap.xml`
2. **Яндекс.Вебмастер** — аналогично, подтвердить через DNS, добавить sitemap
3. **PageSpeed Insights** — проверить Core Web Vitals: https://pagespeed.web.dev/

---

## Структура на сервере

```
/home/questdating/
├── docker-compose.yml
├── .env                    # docker-compose переменные
├── monitor.sh              # cron-проверка /health
├── backups/                # snapshots Docker volume с БД
├── nginx/
│   ├── nginx.conf          # подключается симлинком в /etc/nginx/sites-enabled/
│   └── ssl/
│       ├── fullchain.pem
│       └── privkey.pem
├── client-nuxt/
├── server/
│   └── .env                # переменные приложения (Resend, Telegram, JWT и т.д.)
└── database/
```

---

## Troubleshooting

### Логи

```bash
# Nginx (на хосте, не в Docker!)
journalctl -u nginx -n 50 --no-pager
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Контейнеры
docker compose logs client --tail=50 -f
docker compose logs server --tail=50 -f
docker compose logs postgres --tail=50 -f
```

### Полезные команды

```bash
# Перезапустить один сервис
docker compose restart client

# Посмотреть использование ресурсов
docker stats

# Health внутри сети Docker
docker compose exec server wget -qO- http://localhost:5000/health

# Соединение к БД
docker compose exec postgres psql -U quest_user -d quest_dating

# Дерево процессов хоста (если что-то странное)
ps auxf | grep -E "(node|nginx|docker|postgres)"
```

### Типичные проблемы

| Симптом | Где смотреть |
|---|---|
| Сайт 502 Bad Gateway | `journalctl -u nginx`, `docker compose ps` (контейнер `client` running?) |
| `/health` отвечает 503 + `db:disconnected` | `docker compose logs postgres`, `docker compose ps postgres` |
| `/health` не отвечает вообще | `docker compose ps server`, маппинг порта (`127.0.0.1:5001:5000`) |
| 404 для `/api/*` | `docker compose ps server`, nginx-конфиг (proxy_pass на 127.0.0.1:5001) |
| `/uploads/...` 404 | nginx-конфиг, права на volume директорию |
| Hydration mismatch / `_payload.json 500` | `docker compose logs client`, см. `docs/DEVELOPMENT.md` |
