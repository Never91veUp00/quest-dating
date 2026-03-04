import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Форма "Свяжитесь с нами"', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/about`)
    await page.locator('input[placeholder="Ваше имя"]').waitFor({ state: 'visible' })
  })

  test('форма отправляется с корректными данными', async ({ page }) => {
    // Мокаем API чтобы обойти contactLimiter (3 запроса/час).
    // Тест проверяет поведение фронтенда при успешном ответе — не интеграцию с сервером.
    await page.route('**/api/contact', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Сообщение отправлено! Мы свяжемся с вами в ближайшее время.'
      })
    }))

    await page.locator('input[placeholder="Ваше имя"]').fill('Мария Тестова')
    await page.locator('input[placeholder="Номер телефона (с привязанным Telegram)"]').fill('+79991234567')
    await page.locator('textarea[placeholder="Ваше сообщение"]').fill(
      'Хочу узнать подробности про романтический квест для двоих'
    )

    await page.locator('button.btn-submit').click()

    await expect(page.locator('.success-message')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('.success-message')).toContainText('отправлено')
  })

  test('показывает ошибки при пустой отправке', async ({ page }) => {
    await page.locator('button.btn-submit').click()
    await expect(page.locator('input[placeholder="Ваше имя"]')).toBeFocused({ timeout: 2000 })
  })

  test('кнопка показывает "Отправка..." во время запроса', async ({ page }) => {
    await page.locator('input[placeholder="Ваше имя"]').fill('Иван')
    await page.locator('input[placeholder="Номер телефона (с привязанным Telegram)"]').fill('+79161234567')
    await page.locator('textarea[placeholder="Ваше сообщение"]').fill(
      'Тестовое сообщение для проверки состояния кнопки'
    )

    let buttonTextDuringRequest = ''

    // Задержка в моке даёт время поймать текст кнопки
    await page.route('**/api/contact', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 200))
      buttonTextDuringRequest = await page.locator('button.btn-submit').textContent().catch(() => '')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.locator('button.btn-submit').click()

    // Ждём завершения — success-message появляется после ответа
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 })

    expect(buttonTextDuringRequest).toContain('Отправка')
  })
})