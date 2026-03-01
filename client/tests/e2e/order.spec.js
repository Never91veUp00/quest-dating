import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Создание заказа', () => {
  test('полный флоу: выбрать шаблон → заполнить форму → отправить', async ({ page }) => {
    // 1. Открываем каталог
    await page.goto(`${BASE_URL}/templates`)
    await expect(page).toHaveTitle(/Quest Dating/i)

    // 2. Кликаем на первый шаблон
    const firstCard = page.locator('.template-card').first()
    await firstCard.waitFor({ state: 'visible' })
    await firstCard.click()

    // 3. Проверяем страницу шаблона — маршрут /template/:slug (без s)
    await expect(page).toHaveURL(/\/template\//, { timeout: 5000 })
    await expect(page.locator('h1')).toBeVisible()

    // 4. Нажимаем "Заказать квест" → переходим на /order/:slug
    await page.locator('a.btn-order, a:has-text("Заказать квест"), button:has-text("Заказать квест")').first().click()

    // 5. Ждём страницу заказа
    await expect(page).toHaveURL(/\/order\//, { timeout: 5000 })

    // 6. Заполняем форму заказа
    await page.locator('input[name="client_name"], input[placeholder*="имя" i], input[placeholder*="Имя" i]').first().fill('Александр Тестовый')
    await page.locator('input[name="client_email"], input[type="email"]').first().fill('test@example.com')
    await page.locator('input[name="client_phone"], input[type="tel"]').first().fill('+79161234567')

    const descriptionArea = page.locator('textarea[name="description"], textarea').first()
    await descriptionArea.fill(
      'Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.'
    )

    // 7. Устанавливаем дату в будущем
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 3)
    const dateStr = futureDate.toISOString().split('T')[0]
    const dateInput = page.locator('input[type="date"]').first()
    if (await dateInput.isVisible()) {
      await dateInput.fill(dateStr)
    }

    // 8. Отправляем форму
    await page.locator('button[type="submit"]').click()

    // 9. Ждём успешного ответа
    await expect(
      page.locator(':text("успешно"), :text("принят"), :text("отправлен"), :text("Спасибо")')
    ).toBeVisible({ timeout: 10000 })
  })

  test('форма показывает ошибки при пустой отправке', async ({ page }) => {
    // Идём сразу на страницу заказа первого доступного шаблона
    await page.goto(`${BASE_URL}/templates`)
    const firstCard = page.locator('.template-card').first()
    await firstCard.waitFor({ state: 'visible' })
    await firstCard.click()

    // Ждём страницу шаблона и нажимаем "Заказать квест"
    await expect(page).toHaveURL(/\/template\//, { timeout: 5000 })
    await page.locator('a.btn-order, a:has-text("Заказать квест"), button:has-text("Заказать квест")').first().click()
    await expect(page).toHaveURL(/\/order\//, { timeout: 5000 })

    // Пытаемся отправить пустую форму
    const submitBtn = page.locator('button[type="submit"]')
    if (await submitBtn.isVisible({ timeout: 3000 })) {
      await submitBtn.click()

      // Ждём ошибки валидации
      await expect(
        page.locator('.error, .field-error, [class*="error"], input:invalid').first()
      ).toBeVisible({ timeout: 3000 })
    }
  })
})
