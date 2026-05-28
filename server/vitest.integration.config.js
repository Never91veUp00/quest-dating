import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

// Отдельный конфиг для integration-тестов с РЕАЛЬНОЙ БД (testcontainers).
// НЕ использует tests/setup.js (там мок БД для unit-тестов).
// Каждый тест-файл поднимает свой PostgreSQL-контейнер (см.
// tests/helpers/integration-db.js) — максимальная изоляция.
//
// Запуск: npm run test:integration
export default defineConfig({
  resolve: {
    alias: {
      '@src': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    // НЕ подключаем tests/setup.js — он мокает БД.
    // ФУНДАМЕНТ: пока только health (пробный). Остальные файлы
    // (orders, auth, contact, quests, telegram) написаны под мок-БД и
    // будут переписаны на этот же helper отдельными шагами — тогда
    // include расширится до 'tests/integration/**/*.test.js'.
    include: ['tests/integration/api/health.test.js'],

    // Vitest 4: poolOptions удалён, опции стали top-level.
    // maxWorkers: 1 — строго последовательный запуск файлов (каждый
    // поднимает свой контейнер и пишет свои DB_* в process.env;
    // параллельный запуск дал бы гонку за env).
    // isolate оставляем дефолтным (true) — КРИТИЧНО: между файлами модули
    // сбрасываются, поэтому динамический import pool в каждом файле
    // подхватывает СВОЙ контейнер (свой порт), а не закешированный от
    // предыдущего файла.
    maxWorkers: 1,

    // Старт контейнера + применение dump.sql — небыстро. Щедрые таймауты.
    testTimeout: 60000,
    hookTimeout: 120000,
  },
})