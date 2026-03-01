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
