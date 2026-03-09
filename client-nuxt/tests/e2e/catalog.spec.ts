import { test, expect } from '@playwright/test'

test.describe('Каталог', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
  })

  test('отображает заголовок с ключевыми словами', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Свидания-квесты')
  })

  test('title содержит ключевые слова', async ({ page }) => {
    await expect(page).toHaveTitle(/свидани/i)
  })

  test('отображает карточки квестов', async ({ page }) => {
    await page.waitForSelector('a[href*="/date/"]', { timeout: 10000 })
    await expect(page.locator('a[href*="/date/"]').first()).toBeVisible()
  })

  test('breadcrumb содержит ссылку на главную', async ({ page }) => {
    await expect(page.locator('[aria-label="Breadcrumb"]').first()).toContainText('Главная')
  })

  test('JSON-LD ItemList присутствует', async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    let hasItemList = false
    for (const script of scripts) {
      const content = await script.textContent()
      if (content?.includes('ItemList')) { hasItemList = true; break }
    }
    expect(hasItemList).toBe(true)
  })

  test('фильтры категорий отображаются', async ({ page }) => {
    // Реальная структура: aside.filters-sidebar — скрыта на мобильном, видна на десктопе
    // Используем viewport десктопа для этого теста
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page.locator('.filters-sidebar').first()).toBeVisible()
  })

  test('клик по карточке ведёт на страницу квеста', async ({ page }) => {
    await page.waitForSelector('a[href*="/date/"]', { timeout: 10000 })
    await page.locator('a[href*="/date/"]').first().click()
    await expect(page).toHaveURL(/\/date\//)
  })
})