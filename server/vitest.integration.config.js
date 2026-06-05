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
    // setup.integration.js мокает лимитеры + notificationService (НЕ БД).
    setupFiles: ['./tests/setup.integration.js'],
    // НЕ подключаем tests/setup.js — он мокает БД.
    // ФУНДАМЕНТ + мигрированные на реальную БД файлы. Список растёт по мере
    // переписывания integration-тестов с мок-БД на этот же helper.
    // Мигрировано на реальную БД: health (фундамент), orders, quests, telegram.
    // auth/contact в БД не ходят — остаются мок-тестами (vitest.config.js).
    // Миграция integration-тестов (задача 1.2.3) завершена.
    include: [
      'tests/integration/api/health.test.js',
      'tests/integration/api/orders.test.js',
      'tests/integration/api/quests.test.js',
      'tests/integration/api/telegram.test.js',
      'tests/integration/api/adminQuestPublish.test.js',
    ],

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