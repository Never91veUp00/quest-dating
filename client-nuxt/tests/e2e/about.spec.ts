import { test, expect } from '@playwright/test'

test.describe('Страница О нас', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
  })

  test('h1 содержит "Лиза Петри"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Лиза Петри')
  })

  test('title содержит "Лиза Петри"', async ({ page }) => {
    await expect(page).toHaveTitle(/Лиза Петри/)
  })

  test('текст истории от первого лица', async ({ page }) => {
    await expect(page.locator('main')).toContainText('мне самой')
  })

  test('секция "Мои принципы" содержит 4 карточки', async ({ page }) => {
    // Реальная структура: section.values-section > .value-card (x4)
    const cards = page.locator('.value-card')
    await expect(cards).toHaveCount(4)
  })

  test('секция "Как это работает" содержит 4 шага', async ({ page }) => {
    // Реальная структура: section.how-it-works-section > .timeline-item (x4)
    const steps = page.locator('.timeline-item')
    await expect(steps).toHaveCount(4)
  })

  test('контактная информация отображается', async ({ page }) => {
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible()
    await expect(page.locator('a[href^="https://t.me/"]').first()).toBeVisible()
  })

  test('JSON-LD Person schema присутствует', async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    let hasPerson = false
    for (const script of scripts) {
      const content = await script.textContent()
      if (content?.includes('"Person"') && content?.includes('Лиза Петри')) {
        hasPerson = true
        break
      }
    }
    expect(hasPerson).toBe(true)
  })

  test('CTA ведёт на каталог', async ({ page }) => {
    await page.locator('a[href="/catalog"]').last().click()
    await expect(page).toHaveURL(/\/catalog/)
  })
})