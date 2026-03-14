import { test, expect, type Page } from '@playwright/test'
import { mockHomepageApi } from './fixtures/mockApi'

// Мок для POST /api/orders — перехватывает оба варианта URL:
// - localhost:3000/api/orders (через Nuxt devProxy, если сервер перезапущен)
// - localhost:5000/api/orders (прямой, если сервер работает со старым конфигом)
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
  // Ждём загрузки шаблона квеста (v-else-if="template" — CSR страница)
  await page.locator('.btn-nav.btn-next').waitFor({ state: 'visible', timeout: 15000 })
}

test.describe('Создание заказа', () => {
  test('полный флоу: выбрать квест → заполнить форму → отправить', async ({ page }) => {
    // Мокируем ДО навигации — оба возможных URL
    await mockOrdersApi(page)

    await navigateToOrderPage(page)

    // ── Шаг 1: Контакты ──────────────────────────────────────────
    await page.locator('input[placeholder="Иван Иванов"]').fill('Александр Тестовый')
    await page.locator('input[placeholder="ivan@example.com"]').fill('test@example.com')
    await page.locator('input[placeholder="+7 999 123-45-67"]').fill('+79161234567')

    const dateInput = page.locator('input[type="date"]').first()
    if (await dateInput.isVisible()) {
      const future = new Date()
      future.setMonth(future.getMonth() + 3)
      await dateInput.fill(future.toISOString().split('T')[0])
    }

    await page.locator('.btn-nav.btn-next').click()

    // ── Шаг 2: Настройка — пропускаем ────────────────────────────
    await page.locator('.btn-nav.btn-next').waitFor({ state: 'visible' })
    await page.locator('.btn-nav.btn-next').click()

    // ── Шаг 3: Описание + согласие ───────────────────────────────
    await page.locator('textarea#description').fill(
      'Романтический вечер для двоих. Хотим провести незабываемый квест в честь годовщины свадьбы.'
    )

    // Чекбокс кастомный: кликаем на .checkbox-box (квадратик),
    // а не на весь label — внутри label есть <a @click.stop> которые
    // поглощают клик и не дают всплыть до @click на label
    const checkboxBox = page.locator('.checkbox-box').first()
    if (await checkboxBox.isVisible()) {
      await checkboxBox.click()
    }
    // Убеждаемся что согласие отмечено (появляется .checkbox-tick)
    await expect(page.locator('.checkbox-tick').first()).toBeVisible({ timeout: 2000 })

    await page.locator('button.btn-submit').click()

    await expect(page.locator('.success-modal').first()).toBeVisible({ timeout: 8000 })
    await expect(page.locator('.success-title').first()).toContainText('успешно оформлен')
  })

  test('форма показывает ошибки при пустой отправке шага 1', async ({ page }) => {
    await navigateToOrderPage(page)
    await page.locator('.btn-nav.btn-next').click()
    // Валидация: остаёмся на шаге 1 (toast с ошибкой)
    await expect(page.locator('input[placeholder="Иван Иванов"]')).toBeVisible({ timeout: 3000 })
  })
})