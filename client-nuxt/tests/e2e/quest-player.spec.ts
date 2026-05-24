import { test, expect } from '@playwright/test'

// Слаг тестового публичного квеста.
// Для CI: создай тестовый квест заранее через API и передай слаг через env.
const TEST_QUEST_SLUG = process.env.E2E_TEST_QUEST_SLUG || 'test-quest'

test.describe('Прохождение квеста', () => {
  test('загружает страницу квеста', async ({ page }) => {
    const response = await page.goto(`/quest/${TEST_QUEST_SLUG}`)

    // Если квест не существует в БД — пропускаем, не падаем
    if (response?.status() === 404) {
      test.skip()
      return
    }

    await expect(page).toHaveURL(new RegExp(`/quest/${TEST_QUEST_SLUG}`))
  })

  test('показывает intro и запускает квест', async ({ page }) => {
    const response = await page.goto(`/quest/${TEST_QUEST_SLUG}`)
    if (response?.status() === 404) {
      test.skip()
      return
    }

    const startBtn = page.locator('button:has-text("Начать"), button:has-text("Старт")')
    if (await startBtn.isVisible({ timeout: 5000 })) {
      await startBtn.click()
      await expect(
        page.locator('.task-card, .quest-block, [class*="block"]').first()
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('не показывает код доступа в URL', async ({ page }) => {
    await page.goto(`/quest/${TEST_QUEST_SLUG}`)
    // Критично: код доступа должен передаваться только в теле POST, не в URL
    expect(page.url()).not.toContain('access_code')
    expect(page.url()).not.toContain('code=')
  })
})

test.describe('Квест с кодом доступа', () => {
  test('показывает форму ввода кода для защищённого квеста', async ({ page }) => {
    // Мокируем 403 с requires_code: true — именно так отвечает реальный сервер
    // (questController.js возвращает 403 + requires_code + data с метаданными квеста).
    // Не зависим от наличия защищённого квеста в БД.
    const protectedResponse = {
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        requires_code: true,
        data: {
          title: 'Тестовый защищённый квест',
          theme: 'detective',
          duration_minutes: 60,
        }
      })
    }
    await page.route('**/api/quests/protected-test', route => route.fulfill(protectedResponse))
    await page.route('http://localhost:5000/api/quests/protected-test', route => route.fulfill(protectedResponse))

    await page.goto('/quest/protected-test')

    // QuestSplash рендерит .splash__code-input когда :requiresCode="true"
    await expect(page.locator('.splash__code-input')).toBeVisible({ timeout: 5000 })
  })
})