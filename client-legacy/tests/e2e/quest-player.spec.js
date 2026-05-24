import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

// Эти тесты требуют реального квеста в БД.
// Для CI: создавай тестовый квест в beforeAll через API.
test.describe('Прохождение квеста', () => {
  // Слаг тестового публичного квеста (без кода доступа)
  const TEST_QUEST_SLUG = process.env.E2E_TEST_QUEST_SLUG || 'test-quest'

  test('загружает страницу квеста', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/quest/${TEST_QUEST_SLUG}`)

    // Если квест не существует — пропускаем тест
    if (response?.status() === 404) {
      test.skip()
      return
    }

    await expect(page).toHaveURL(new RegExp(`/quest/${TEST_QUEST_SLUG}`))
  })

  test('показывает intro и запускает квест', async ({ page }) => {
    await page.goto(`${BASE_URL}/quest/${TEST_QUEST_SLUG}`)

    // Проверяем наличие кнопки старта
    const startBtn = page.locator('button:has-text("Начать"), button:has-text("Старт")')
    if (await startBtn.isVisible({ timeout: 5000 })) {
      await startBtn.click()

      // После старта должен появиться первый блок
      await expect(
        page.locator('.task-card, .quest-block, [class*="block"]').first()
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('не показывает код доступа в URL', async ({ page }) => {
    await page.goto(`${BASE_URL}/quest/${TEST_QUEST_SLUG}`)
    // Код доступа никогда не должен быть в URL — только в теле POST
    expect(page.url()).not.toContain('access_code')
    expect(page.url()).not.toContain('code=')
  })
})

test.describe('Квест с кодом доступа', () => {
  test('показывает форму ввода кода для защищённого квеста', async ({ page }) => {
    const protectedSlug = process.env.E2E_PROTECTED_QUEST_SLUG
    if (!protectedSlug) {
      test.skip()
      return
    }

    await page.goto(`${BASE_URL}/quest/${protectedSlug}`)

    await expect(
      page.locator('.splash__code-input')
    ).toBeVisible({ timeout: 5000 })
  })
})