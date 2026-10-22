# Quest Dating: правила для Claude Code

Сервис персональных свиданий-квестов. Монорепо:

- `client-nuxt/`: Nuxt 4 (SSR), Vue 3, Pinia. Плеер квестов: `app/pages/quest/[slug].vue` + `app/components/quest/`
- `server/`: Express API, PostgreSQL 15
- `database/`: `dump.sql` (схема и сиды), миграции
- `docs/`: `upgrade-plan.md` (дорожная карта, статус фаз), `phase3-player-recon.md` (карта плеера)

Текущая работа: **Фаза 3.1, редизайн V1-плеера** (mobile-first, без «нейроночного» вида). Статус и решения смотри в `docs/upgrade-plan.md` → «Фаза 3».

## Локальный запуск

Разработка ведётся на Windows (PowerShell), Node 22 (nvm-windows).

```
docker compose up -d postgres        # БД на localhost:5433
cd server; npm run dev               # API на :5000
cd client-nuxt; npm run dev          # сайт на http://localhost:3000, админка /admin
```

- Зависимости ставить через `npm ci`, а не `npm install`, чтобы не переписывать lock-файлы. Менять зависимости только отдельным PR.
- `loginLimiter` пускает 5 попыток за 15 минут, в том числе с localhost. Если вход перестал работать, перезапусти сервер (`rs` в окне nodemon).
- Прод работает на VPS (`/home/questdating`, docker compose, домен questdating.ru). Проверка по-прежнему локальная: в PR не ходим на прод, деплой делает владелец. После клиентских правок клиент на проде пересобирается (`docker compose build client && docker compose up -d client`), миграции применяются вручную `psql -f`.

## Git

- `production` — основная ветка, прямой push закрыт. Работа идёт так: ветка от свежего `production`, затем PR, затем зелёный CI.
- Имена веток: `upgrade/<name>`, `fix/<name>`, `chore/<name>`, `docs/<name>`.
- Conventional commits: `feat|fix|refactor|docs|chore|test|style(scope): описание`. Один логический шаг = один коммит.
- Перед удалением крупного куска кода ставь тег: `git tag pre-<what>`.

## Тесты

- Сервер: `npm run test:unit` (без БД). `npm run test:integration` гоняет реальную Postgres через testcontainers и требует Docker. Серверные правки делаются по TDD.
- Клиент: `npx vitest run` (unit). E2E-тестов плеера в CI нет, поэтому фронт проверяется глазами через Playwright MCP на мобильном вьюпорте.

## Дизайн: без «нейроночности»

Перед любой визуальной работой прочитай `PRODUCT.md` и `DESIGN.md` в корне, если они есть (их создаёт Impeccable: `/impeccable init`, `/impeccable document`).

Сейчас в `variables.css` типичный AI-вид: градиент `#667eea → #764ba2`, Inter-подобные шрифты, одинаковые скругления, карточки в карточках. Это то, от чего уходим, а не образец.

Правила:

- Mobile-first. Основной вьюпорт 390×844, проверка также на 360×740 и десктопе 1280.
- Никаких фиолетово-синих градиентов «по умолчанию», glassmorphism ради эффекта, bounce/elastic-анимаций, серого текста на цветном фоне, чистого #000/#808080 (только тонированные).
- Типографика — осознанная пара шрифтов (у бренда уже есть Cormorant Garamond), не Inter или Arial.
- Каждая тема квеста (detective, romantic, city, mystery, treasure, proposal) — отдельный визуальный характер, а не перекраска одного шаблона. Темы живут в `app/components/quest/themes.js`.
- План `docs/superpowers/plans/2026-06-28-player-redesign.md` написан до Impeccable и опирается на glassmorphism. Перед исполнением сверь его с `DESIGN.md` и правилами выше.
- Порядок работы над экраном: `/impeccable shape`, затем код, затем скриншоты через Playwright, затем `/impeccable critique`, затем `/impeccable polish`.
- Логику плеера (состояние прохождения, проверка ответов, API) при редизайне не трогаем. Если без этого никак, делай отдельный PR.

## Модели и токены

- Основной режим `opusplan` (задан в `.claude/settings.json`): планирование на Opus, исполнение на Sonnet.
- Рутину отдавай субагентам с дешёвой моделью (`.claude/agents/`):
  - `code-scout` (Haiku) — поиск по коду, «где это используется», сбор фактов;
  - `test-runner` (Haiku) — прогон тестов и сборки, краткий отчёт об ошибках;
  - `design-reviewer` (Sonnet) — скриншоты через Playwright и разбор по правилам дизайна;
  - `architect` (Opus) — только развилки, которые дорого переделывать (структура данных, архитектура плеера).
- `CLAUDE_CODE_SUBAGENT_MODEL` не задаём: эта переменная перебивает `model` в агентах.
