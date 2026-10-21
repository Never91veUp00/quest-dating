import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'

// Миграция 014: в HTML-описаниях квеста «Мытищи» цвета были вписаны под тёмную
// тему (белый с прозрачностью) — на светлой бумаге подписи пропадали.
// Миграция переводит их на токены мира; слова и разметку не трогает.

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATION = resolve(__dirname, '../../../../database/migrations/014_mytishchi_html_theme_colors.sql')

let ctx
let sql

beforeAll(async () => {
  ctx = await setupIntegration()
  sql = await readFile(MIGRATION, 'utf8')
}, 120000)

afterAll(async () => {
  await teardownIntegration(ctx)
})

afterEach(async () => {
  await ctx.reset()
})

const DARK_HTML = '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)">'
  + '<div style="color:rgba(255,255,255,.45)">📡 Шифровка</div>'
  + '<p style="color:rgba(255,255,255,.35)">сноска</p>'
  + '<span style="color:var(--accent);font-weight:600">пропало сердце</span></div>'

const insertQuest = (slug, description) => ctx.pool.query(
  `INSERT INTO created_quests (slug, title, blocks) VALUES ($1, 'Квест', $2)`,
  [slug, JSON.stringify([{ id: 'b1', title: 'Блок', tasks: [{ id: 't1', type: 'simple', title: 'Т', description_type: 'html', description }] }])],
)

const descOf = async (slug) => {
  const { rows } = await ctx.pool.query('SELECT blocks FROM created_quests WHERE slug = $1', [slug])
  return rows[0].blocks[0].tasks[0].description
}

describe('миграция 014: цвета HTML квеста «Мытищи» → токены мира', () => {
  it('убирает белый с прозрачностью и цвет акцента из текста, слова остаются', async () => {
    await insertQuest('mytishchi-detective', DARK_HTML)
    await ctx.pool.query(sql)

    const d = await descOf('mytishchi-detective')
    expect(d).not.toMatch(/rgba\(255,\s*255,\s*255/)
    expect(d).not.toContain('color:var(--accent)')
    expect(d).toContain('var(--ink-soft)')
    expect(d).toContain('📡 Шифровка')
    expect(d).toContain('пропало сердце')
  })

  it('повторный прогон ничего не меняет, другие квесты не трогает', async () => {
    await insertQuest('mytishchi-detective', DARK_HTML)
    await insertQuest('other-quest', DARK_HTML)
    await ctx.pool.query(sql)
    const once = await descOf('mytishchi-detective')
    await ctx.pool.query(sql)

    expect(await descOf('mytishchi-detective')).toBe(once)
    expect(await descOf('other-quest')).toBe(DARK_HTML)
  })
})
