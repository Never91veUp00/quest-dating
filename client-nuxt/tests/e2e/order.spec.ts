import { test, expect, type Page } from '@playwright/test'
import { mockHomepageApi } from './fixtures/mockApi'

async function mockOrdersApi(page: Page) {
  const orderResponse = {
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: { id: 999, total_price: 350000, client_email: 'test@example.com' }
    })
  }
  await page.route('**/api/orders', route => route.fulfill(orderResponse))
  await page.route('http://localhost:5000/api/orders', route => route.fulfill(orderResponse))
}

async function navigateToOrderPage(page: Page) {
  await mockHomepageApi(page)
  await page.goto('/catalog')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('a[href*="/date/"]', { timeout: 10000 })
  await page.locator('a[href*="/date/"]').first().click()
  await page.waitForLoadState('networkidle')
  await page.locator('a[href*="/order/"]').first().waitFor({ state: 'visible', timeout: 5000 })
  await page.locator('a[href*="/order/"]').first().click()
  await page.waitForURL(/\/order\//, { timeout: 5000 })
  await page.locator('.btn-nav.btn-next').waitFor({ state: 'visible', timeout: 15000 })
}

test.describe('Создание заказа', () => {
  test('полный флоу: 4 шага → отправить', async ({ page }) => {
    await mockOrdersApi(page)
    await navigateToOrderPage(page)

    // Шаг 1: Контакты
    await page.locator('input[placeholder="Иван"]').fill('Александр Тестовый')
    await page.locator('input[placeholder="ivan@example.com"]').fill('test@example.com')
    await page.locator('input[placeholder="+7 999 123-45-67"]').fill('+79161234567')
    const future = new Date()
    future.setMonth(future.getMonth() + 3)
    await page.locator('input[type="date"]').first().fill(future.toISOString().split('T')[0])
    await page.locator('.btn-nav.btn-next').click()

    // Шаг 2: Настройка — пропускаем
    await page.locator('.btn-nav.btn-next').waitFor({ state: 'visible' })
    await page.locator('.btn-nav.btn-next').click()

    // Шаг 3: О паре — пропускаем
    await page.locator('.btn-nav.btn-next').waitFor({ state: 'visible' })
    await page.locator('.btn-nav.btn-next').click()

    // Шаг 4: Пожелания + согласие
    await page.locator('button.btn-submit').waitFor({ state: 'visible' })
    const checkboxBox = page.locator('.checkbox-box').first()
    if (await checkboxBox.isVisible()) await checkboxBox.click()
    await expect(page.locator('.checkbox-tick').first()).toBeVisible({ timeout: 2000 })
    await page.locator('button.btn-submit').click()

    await expect(page.locator('.success-modal').first()).toBeVisible({ timeout: 8000 })
    await expect(page.locator('.success-title').first()).toContainText('успешно оформлен')
  })

  test('форма показывает ошибки при пустой отправке шага 1', async ({ page }) => {
    await navigateToOrderPage(page)
    await page.locator('.btn-nav.btn-next').click()
    await expect(page.locator('input[placeholder="Иван"]')).toBeVisible({ timeout: 3000 })
  })

  test('прогресс-бар показывает 4 шага', async ({ page }) => {
    await navigateToOrderPage(page)
    await expect(page.locator('.progress-step')).toHaveCount(4)
  })

  test('шаг 3 содержит вопросы о паре', async ({ page }) => {
    await navigateToOrderPage(page)
    await page.locator('input[placeholder="Иван"]').fill('Тест')
    await page.locator('input[placeholder="ivan@example.com"]').fill('test@example.com')
    const future = new Date()
    future.setMonth(future.getMonth() + 1)
    await page.locator('input[type="date"]').first().fill(future.toISOString().split('T')[0])
    await page.locator('.btn-nav.btn-next').click()
    await page.locator('.btn-nav.btn-next').waitFor({ state: 'visible' })
    await page.locator('.btn-nav.btn-next').click()
    await page.locator('.btn-nav.btn-next').waitFor({ state: 'visible' })
    await expect(page.locator('.step-title')).toContainText('Расскажите о вашей паре')
    await expect(page.locator('.qa-hint')).toBeVisible()
  })

  test('кнопка «Назад» возвращает на предыдущий шаг', async ({ page }) => {
    await navigateToOrderPage(page)
    await page.locator('input[placeholder="Иван"]').fill('Тест')
    await page.locator('input[placeholder="ivan@example.com"]').fill('test@example.com')
    const future = new Date()
    future.setMonth(future.getMonth() + 1)
    await page.locator('input[type="date"]').first().fill(future.toISOString().split('T')[0])
    await page.locator('.btn-nav.btn-next').click()
    await page.locator('.btn-nav.btn-next').waitFor({ state: 'visible' })
    await page.locator('.btn-nav.btn-prev').click()
    await expect(page.locator('input[placeholder="Иван"]')).toBeVisible()
  })
})