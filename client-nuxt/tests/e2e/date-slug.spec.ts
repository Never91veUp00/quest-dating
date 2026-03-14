import { test, expect, type Page } from '@playwright/test'
import { mockHomepageApi } from './fixtures/mockApi'

async function getFirstDateSlug(page: Page) {
  await mockHomepageApi(page)
  await page.goto('/catalog')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('a[href*="/date/"]', { timeout: 10000 })
  const href = await page.locator('a[href*="/date/"]').first().getAttribute('href')
  return href ?? '/'
}

test.describe('Страница квеста', () => {
  test.beforeEach(async ({ page }) => {
    const slug = await getFirstDateSlug(page)
    await page.goto(slug)
    await page.waitForLoadState('networkidle')
    await page.locator('h1').waitFor({ state: 'visible', timeout: 10000 })
  })

  test('отображает h1 с названием квеста', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('title содержит "свидание-квест"', async ({ page }) => {
    await expect(page).toHaveTitle(/свидание-квест/i)
  })

  test('breadcrumbs отображаются на десктопе', async ({ page }) => {
    const breadcrumb = page.locator('[aria-label="Breadcrumb"]').first()
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb).toContainText('Главная')
    await expect(breadcrumb).toContainText('Сценарии свиданий-квестов')
  })

  test('кнопка заказа ведёт на форму заказа', async ({ page }) => {
    const btn = page.locator('a[href*="/order/"]').first()
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/\/order\//)
  })

  test('отображает блок CTA с Лизой Петри', async ({ page }) => {
    await expect(page.locator('text=Лиза Петри').first()).toBeVisible()
  })

  test('секция FAQ отображается', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Частые вопросы' })).toBeVisible()
    const faqItems = page.locator('details')
    const count = await faqItems.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('FAQ раскрывается по клику', async ({ page }) => {
    const firstDetails = page.locator('details').first()
    await expect(firstDetails).toBeVisible()
    await firstDetails.locator('summary').click()
    await expect(firstDetails).toHaveAttribute('open', '')
  })

  test('JSON-LD Product schema присутствует', async ({ page }) => {
    await page.waitForFunction(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      for (const s of scripts) { if (s.textContent?.includes('"Product"')) return true }
      return false
    }, { timeout: 5000 }).catch(() => {})
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    let found = false
    for (const s of scripts) { if ((await s.textContent())?.includes('"Product"')) { found = true; break } }
    expect(found).toBe(true)
  })

  test('JSON-LD FAQPage schema присутствует', async ({ page }) => {
    await page.waitForFunction(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      for (const s of scripts) { if (s.textContent?.includes('"FAQPage"')) return true }
      return false
    }, { timeout: 5000 }).catch(() => {})
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    let found = false
    for (const s of scripts) { if ((await s.textContent())?.includes('"FAQPage"')) { found = true; break } }
    expect(found).toBe(true)
  })

  test('JSON-LD BreadcrumbList присутствует', async ({ page }) => {
    await page.waitForFunction(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      for (const s of scripts) { if (s.textContent?.includes('"BreadcrumbList"')) return true }
      return false
    }, { timeout: 5000 }).catch(() => {})
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    let found = false
    for (const s of scripts) { if ((await s.textContent())?.includes('"BreadcrumbList"')) { found = true; break } }
    expect(found).toBe(true)
  })
})