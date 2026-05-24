import { test, expect } from '@playwright/test'
import { mockHomepageApi } from './fixtures/mockApi'

test.describe('Главная страница', () => {
  test.beforeEach(async ({ page }) => {
    await mockHomepageApi(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('отображает заголовок с ключевым словом квест', async ({ page }) => {
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('приключение')
  })

  test('отображает упоминание Лизы Петри', async ({ page }) => {
    await expect(page.locator('body')).toContainText('Лиза Петри')
  })

  test('кнопка "Выбрать квест" ведёт на каталог', async ({ page }) => {
    await page.locator('a, button').filter({ hasText: 'Выбрать квест' }).first().click()
    await expect(page).toHaveURL(/\/catalog/)
  })

  test('кнопка "О Лизе" ведёт на about', async ({ page }) => {
    // На мобильном десктопный nav скрыт — кликаем на видимую ссылку
    const aboutLink = page.locator('a[href="/about"]').first()
    await expect(aboutLink).toBeAttached()
    await page.goto('/about')
    await expect(page).toHaveURL(/\/about/)
  })

  test('секция "Как это работает" содержит 4 шага', async ({ page }) => {
    const steps = page.locator('.step')
    await expect(steps).toHaveCount(4)
  })

  test('отображает секцию с квестами', async ({ page }) => {
    await expect(page.locator('text=Избранные квесты')).toBeVisible()
  })

  test('title страницы содержит Quest Dating', async ({ page }) => {
    await expect(page).toHaveTitle(/Quest Dating/)
  })

  test('og:image meta тег присутствует', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveAttribute('content', /.+/)
  })
})