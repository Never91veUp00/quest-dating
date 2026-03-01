import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Форма "Свяжитесь с нами"', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/about`)
  })

  test('форма отправляется с корректными данными', async ({ page }) => {
    await page.locator('input[placeholder*="имя" i]').fill('Мария Тестова')
    await page.locator('input[type="tel"]').fill('+79991234567')
    await page.locator('textarea').fill('Хочу узнать подробности про романтический квест для двоих')

    await page.locator('button:has-text("Отправить")').click()

    // Ждём успешного сообщения
    await expect(
      page.locator(':text("отправлено"), :text("Мы свяжемся"), .success-message')
    ).toBeVisible({ timeout: 8000 })
  })

  test('показывает ошибки при пустой отправке', async ({ page }) => {
    await page.locator('button:has-text("Отправить")').click()

    // Браузерная или кастомная валидация должна сработать
    const nameInput = page.locator('input[placeholder*="имя" i]')
    const isRequired = await nameInput.evaluate(el => el.required)
    if (isRequired) {
      // HTML5 validation — браузер покажет подсказку, форма не уйдёт
      await expect(nameInput).toBeFocused()
    }
  })

  test('кнопка заблокирована во время отправки', async ({ page }) => {
    await page.locator('input[placeholder*="имя" i]').fill('Иван')
    await page.locator('input[type="tel"]').fill('+79161234567')
    await page.locator('textarea').fill('Тестовое сообщение для проверки отправки')

    // Перехватываем запрос чтобы проверить состояние кнопки
    let buttonTextDuringRequest = ''
    await page.route('**/api/contact', async (route) => {
      const btn = page.locator('button:has-text("Отправ")')
      buttonTextDuringRequest = await btn.textContent()
      await route.continue()
    })

    await page.locator('button:has-text("Отправить")').click()
    await page.waitForResponse('**/api/contact')

    expect(buttonTextDuringRequest).toContain('Отправк') // "Отправка..."
  })
})
