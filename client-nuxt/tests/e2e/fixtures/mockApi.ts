import { type Page } from '@playwright/test'
import { buildApiMocks } from './api'

/**
 * Мокирует все публичные GET-эндпоинты API.
 *
 * Зачем: при повторных запусках E2E тестов rate limiter (1000 req/15 min)
 * быстро срабатывает на GET /stats, /categories, /templates/featured и т.д.
 * Мок перехватывает эти запросы ДО того, как они достигают сервера.
 *
 * Использование: вызывать в beforeEach тестов которые загружают страницы с данными.
 * Или использовать через globalSetup / fixtures на уровне playwright.config.ts.
 *
 * Важно: мок не перехватывает запросы с реальными slug-ами квестов —
 * для них нужно либо знать slug заранее, либо позволить реальному серверу отвечать.
 */
export async function mockPublicApi(page: Page) {
  const mocks = buildApiMocks()
  for (const { pattern, body } of mocks) {
    await page.route(pattern, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    }))
  }
}

/**
 * Мокирует только медленные/тяжёлые эндпоинты главной страницы.
 * Для тестов которым нужны реальные данные каталога/квеста.
 */
export async function mockHomepageApi(page: Page) {
  const homepageMocks = [
    { pattern: '**/api/stats', body: { success: true, data: { total_templates: 12, total_orders: 89, total_reviews: 34, average_rating: 4.9 } } },
    { pattern: '**/api/reviews/featured**', body: { success: true, data: [] } },
    { pattern: '**/api/templates/featured**', body: { success: true, data: [] } },
    { pattern: '**/api/templates/popular**', body: { success: true, data: [] } },
    { pattern: '**/api/tags/popular**', body: { success: true, data: [] } },
  ]
  for (const { pattern, body } of homepageMocks) {
    await page.route(pattern, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    }))
  }
}