import { test, expect } from '@playwright/test'
import { mockHomepageApi } from './fixtures/mockApi'

// Форма скрыта на мобильном по CSS (display:none в about.vue media query)
// Все тесты только для десктопа
test.describe('Контактная форма на странице О нас', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    // /about делает GET /stats — мокируем чтобы не выбивать rate limiter
    await mockHomepageApi(page)
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    // Ждём видимости .contact-form — гарантирует что Vue гидратирован
    // (без этого нативный <form> может выполнить GET до навешивания @submit.prevent)
    await page.locator('.contact-form').waitFor({ state: 'visible', timeout: 10000 })
  })

  test('форма отправляется с корректными данными', async ({ page }) => {
    const contactResponse = { status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Сообщение отправлено!' }) }
    await page.route('**/api/contact', route => route.fulfill(contactResponse))
    await page.route('http://localhost:5000/api/contact', route => route.fulfill(contactResponse))

    await page.locator('input[placeholder="Ваше имя"]').fill('Мария Тестова')
    await page.locator('input[placeholder="Номер телефона (с привязанным Telegram)"]').fill('+79991234567')
    await page.locator('textarea[placeholder="Ваше сообщение"]').fill(
      'Хочу узнать подробности про романтический квест для двоих'
    )
    await page.locator('button.btn-submit').waitFor({ state: 'visible' })
    await page.locator('button.btn-submit').click()

    await expect(page.locator('.success-message').first()).toBeVisible({ timeout: 5000 })
  })

  test('показывает ошибки при пустой отправке', async ({ page }) => {
    await page.locator('button.btn-submit').waitFor({ state: 'visible' })
    await page.locator('button.btn-submit').click()
    // HTML5 required: браузер фокусирует первое незаполненное поле
    await expect(page.locator('input[placeholder="Ваше имя"]')).toBeFocused({ timeout: 2000 })
  })

  test('кнопка показывает "Отправка..." во время запроса', async ({ page }) => {
    await page.locator('input[placeholder="Ваше имя"]').fill('Иван')
    await page.locator('input[placeholder="Номер телефона (с привязанным Telegram)"]').fill('+79161234567')
    await page.locator('textarea[placeholder="Ваше сообщение"]').fill('Тестовое сообщение')

    let buttonTextDuringRequest = ''

    await page.route('http://localhost:5000/api/contact', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }))
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