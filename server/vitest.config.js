import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // @src — алиас для server/src/ чтобы не считать ../../../ в тестах
      '@src': resolve(__dirname, 'src'),
    }
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    // Файлы, переведённые на testcontainers (реальная БД), исключаем из
    // дефолтного (мок-)прогона — у них свой конфиг vitest.integration.config.js.
    // Список растёт по мере миграции integration-тестов с мока на контейнеры.
    exclude: [
      '**/node_modules/**',
      'tests/integration/api/health.test.js',
      'tests/integration/api/orders.test.js',
      'tests/integration/api/quests.test.js',
      'tests/integration/api/telegram.test.js',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/server.js', 'src/config/database.js'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
      }
    },
    testTimeout: 10000,
  }
})