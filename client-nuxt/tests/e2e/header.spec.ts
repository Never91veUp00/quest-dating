import { test, expect } from '@playwright/test'
import { mockHomepageApi } from './fixtures/mockApi'

test.describe('Хедер — навигация', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await mockHomepageApi(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('логотип Quest Dating присутствует', async ({ page }) => {
    const logo = page.locator('header a[href="/"], .header a[href="/"]').first()
    await expect(logo).toBeVisible()
    await expect(logo).toContainText('Quest Dating')
  })

  test('навигационные ссылки отображаются на десктопе', async ({ page }) => {
    const nav = page.locator('header nav, .header nav').first()
    await expect(nav).toBeVisible()
    await expect(nav.locator('a[href="/"]')).toBeVisible()
    await expect(nav.locator('a[href="/catalog"]')).toBeVisible()
    await expect(nav.locator('a[href="/about"]')).toBeVisible()
  })

  test('кнопка CTA в хедере содержит текст заказа', async ({ page }) => {
    await expect(
      page.locator('header a, .header a').filter({ hasText: 'Заказать' }).first()
    ).toContainText('Заказать')
  })

  test('логотип ведёт на главную', async ({ page }) => {
    await mockHomepageApi(page)
    await page.goto('/catalog')
    await page.locator('header a[href="/"], .header a[href="/"]').first().click()
    await expect(page).toHaveURL('/')
  })

  test('хедер становится scrolled после прокрутки', async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 300))
    await page.waitForTimeout(500)
    const hasScrolled = await page.locator('header, .header').first()
      .evaluate(el => el.classList.contains('scrolled'))
    expect(hasScrolled).toBe(true)
  })
})

test.describe('Хедер — мобильное меню', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await mockHomepageApi(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('гамбургер-кнопка видна на мобильном', async ({ page }) => {
    await expect(page.locator('.btn-mobile-menu')).toBeVisible()
  })

  test('desktop nav скрыт на мобильном', async ({ page }) => {
    await expect(page.locator('.nav-desktop')).toBeHidden()
  })

  test('мобильное меню открывается по клику', async ({ page }) => {
    await page.locator('.btn-mobile-menu').click()
    await expect(page.locator('.mobile-menu')).toBeVisible({ timeout: 3000 })
  })

  test('мобильное меню содержит "Заказать свидание-квест"', async ({ page }) => {
    await page.locator('.btn-mobile-menu').click()
    await expect(page.locator('.mobile-menu')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('.mobile-nav')).toContainText('Заказать квест')
  })

  test('мобильное меню закрывается при клике на ссылку', async ({ page }) => {
    await page.locator('.btn-mobile-menu').click()
    await expect(page.locator('.mobile-menu')).toBeVisible({ timeout: 3000 })
    await page.locator('.mobile-nav-link[href="/catalog"]').first().click()
    await expect(page).toHaveURL(/\/catalog/)
  })
})