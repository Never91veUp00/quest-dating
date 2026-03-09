import { test, expect } from '@playwright/test'

// Форма скрыта на мобильном по CSS (display:none)
// Все тесты только для десктопа
test.describe('Контактная форма на странице О нас', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    // Ждём гидрации Vue — иначе нативный <form> отправит GET до навешивания @submit.prevent
    await page.locator('.contact-form').waitFor({ state: 'visible', timeout: 10000 })
  })

  test('форма отправляется с корректными данными', async ({ page }) => {
    // Мокируем оба возможных URL: через devProxy и напрямую
    await page.route('**/api/contact', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Сообщение отправлено!' })
    }))

    await page.locator('input[placeholder="Ваше имя"]').fill('Мария Тестова')
    await page.locator('input[placeholder="Номер телефона (с привязанным Telegram)"]').fill('+79991234567')
    await page.locator('textarea[placeholder="Ваше сообщение"]').fill(
      'Хочу узнать подробности про романтический квест для двоих'
    )

    // Ждём что Vue полностью гидратировал форму (кнопка реагирует на Vue reactive)
    await page.locator('button.btn-submit').waitFor({ state: 'visible' })
    await page.locator('button.btn-submit').click()

    await expect(page.locator('.success-message').first()).toBeVisible({ timeout: 5000 })
  })

  test('показывает ошибки при пустой отправке', async ({ page }) => {
    await page.locator('button.btn-submit').waitFor({ state: 'visible' })
    await page.locator('button.btn-submit').click()
    // HTML5 required: браузер фокусирует первое пустое поле
    await expect(page.locator('input[placeholder="Ваше имя"]')).toBeFocused({ timeout: 2000 })
  })

  test('кнопка показывает "Отправка..." во время запроса', async ({ page }) => {
    await page.locator('input[placeholder="Ваше имя"]').fill('Иван')
    await page.locator('input[placeholder="Номер телефона (с привязанным Telegram)"]').fill('+79161234567')
    await page.locator('textarea[placeholder="Ваше сообщение"]').fill('Тестовое сообщение')

    let buttonTextDuringRequest = ''

    await page.route('**/api/contact', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 300))
      buttonTextDuringRequest = (await page.locator('button.btn-submit').textContent().catch(() => '')) ?? ''
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.locator('button.btn-submit').waitFor({ state: 'visible' })
    await page.locator('button.btn-submit').click()

    await expect(page.locator('.success-message').first()).toBeVisible({ timeout: 5000 })
    expect(buttonTextDuringRequest).toContain('Отправка')
  })
})