import { test, expect, type Page } from '@playwright/test'

async function navigateToOrderPage(page: Page) {
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
    // Мокируем по обоим паттернам: devProxy (localhost:3000/api) и прямой (localhost:5000/api)
    const mockFulfill = (route: Parameters<Parameters<typeof page.route>[1]>[0]) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 999, total_price: 350000, client_email: 'test@example.com' }
        })
      })
    await page.route('**/api/orders', mockFulfill)

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

    // Чекбокс кастомный — label @click, не input[type=checkbox]
    const agreeLabel = page.locator('.checkbox-label').first()
    if (await agreeLabel.isVisible()) {
      await agreeLabel.click()
    }

    await page.locator('button.btn-submit').click()

    await expect(page.locator('.success-modal').first()).toBeVisible({ timeout: 8000 })
    await expect(page.locator('.success-title').first()).toContainText('успешно оформлен')
  })

  test('форма показывает ошибки при пустой отправке шага 1', async ({ page }) => {
    await navigateToOrderPage(page)
    await page.locator('.btn-nav.btn-next').click()
    // Валидация: остаёмся на шаге 1 (показывается toast)
    await expect(page.locator('input[placeholder="Иван Иванов"]')).toBeVisible({ timeout: 3000 })
  })
})