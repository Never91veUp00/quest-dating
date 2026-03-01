import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,

  reporter: [
    ['html', { outputFolder: 'tests/e2e/reports' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    locale: 'ru-RU',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile WebKit (Safari/iPhone) — раскомментируй на macOS или в CI
    // {
    //   name: 'mobile',
    //   use: { ...devices['iPhone 14'] },
    // },
  ],

  // Поднимает dev-сервер перед E2E тестами если не запущен
  webServer: process.env.CI ? {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60000,
  } : undefined,
})
