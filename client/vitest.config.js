import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    // E2E тесты (.spec.js) запускаются через Playwright отдельно: npm run test:e2e
    include: ['tests/unit/**/*.test.js'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/utils/**', 'src/composables/**', 'src/components/**'],
      thresholds: {
        lines: 70,
        functions: 70,
      }
    },
  }
})
