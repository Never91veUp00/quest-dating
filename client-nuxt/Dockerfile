# ── Stage 1: build ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем манифесты отдельно — слой кешируется если зависимости не менялись
COPY package*.json ./
RUN npm ci

# Копируем исходники и собираем
COPY . .

# Nuxt build-time переменные
ARG NUXT_PUBLIC_API_BASE=/api
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE

RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Ограничиваем память Node.js — актуально для Orange Pi 5 Pro
ENV NODE_OPTIONS=--max-old-space-size=512

# Копируем только артефакт сборки — без node_modules и исходников
COPY --from=builder /app/.output ./

EXPOSE 3000

CMD ["node", "server/index.mjs"]