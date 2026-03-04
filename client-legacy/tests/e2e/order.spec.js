import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Создание заказа', () => {
  // Вспомогательная функция: каталог → шаблон → страница заказа
  async function navigateToOrderPage(page) {
    await page.goto(`${BASE_URL}/templates`)

    const firstCard = page.locator('.template-card').first()
    await firstCard.waitFor({ state: 'visible' })
    await Promise.all([
      page.waitForURL(/\/template\//, { timeout: 5000 }),
      firstCard.click()
    ])

    const orderBtn = page.getByTestId('order-button').first()
    await orderBtn.waitFor({ state: 'visible', timeout: 5000 })
    await Promise.all([
      page.waitForURL(/\/order\//, { timeout: 5000 }),
      orderBtn.click()
    ])
  }

  test('полный флоу: выбрать шаблон → заполнить форму → отправить', async ({ page }) => {
    // Мокируем POST /api/orders — обходим orderLimiter (5 заказов/час)
    await page.route('**/api/orders', route => route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { id: 999, total_price: 350000, client_email: 'test@example.com' }
      })
    }))

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

    // ── Шаг 2: Настройка — пропускаем ───────────────────────────
    await page.locator('.btn-nav.btn-next').waitFor({ state: 'visible' })
    await page.locator('.btn-nav.btn-next').click()

    // ── Шаг 3: Описание ──────────────────────────────────────────
    await page.locator('textarea[placeholder*="событии"]').fill(
      'Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.'
    )

    const agreeLabel = page.locator('.checkbox-label').first()
    if (await agreeLabel.isVisible()) {
      const isChecked = await page.locator('.checkbox-box.checked').first().isVisible().catch(() => false)
      if (!isChecked) await agreeLabel.click()
    }

    // ── Отправляем ───────────────────────────────────────────────
    await page.locator('button.btn-submit').click()

    // Успех — модальное окно с классом .success-modal
    await expect(page.locator('.success-modal')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.success-title')).toContainText('успешно оформлен')
  })

  test('форма показывает ошибки при пустой отправке шага 1', async ({ page }) => {
    await navigateToOrderPage(page)

    // Пытаемся перейти на шаг 2 без заполнения
    await page.locator('.btn-nav.btn-next').click()

    // Должна появиться валидация — поле имени получит фокус или появится ошибка
    await expect(
      page.locator('input[placeholder="Иван Иванов"]:invalid, .field-error, .error-text').first()
    ).toBeVisible({ timeout: 3000 }).catch(async () => {
      // Если HTML5 валидация — проверяем что остались на шаге 1
      await expect(page.locator('input[placeholder="Иван Иванов"]')).toBeVisible()
    })
  })
})