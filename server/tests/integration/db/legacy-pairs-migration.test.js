import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'

// Миграция 013: старые задания «текстовые пары» (режим убран из плеера)
// заменяются новыми мини-играми в шаблонах и демо-квестах. Фото-пары и
// уже отредактированные задания миграция не трогает; повторный прогон безопасен.

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATION = resolve(__dirname, '../../../../database/migrations/013_replace_legacy_text_pairs.sql')

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

const legacyPairs = [{ left: 'Волнение', right: 'Первое свидание' }]

const insertQuest = (slug, tasks) => ctx.pool.query(
  `INSERT INTO created_quests (slug, title, blocks) VALUES ($1, 'Демо', $2)`,
  [slug, JSON.stringify([{ id: 'b1', title: 'Блок', tasks: [{ id: 't0', type: 'simple', title: 'Старт' }] }, { id: 'b2', title: 'Блок 2', tasks }])],
)

const questTask = async (slug, id) => {
  const { rows } = await ctx.pool.query('SELECT blocks FROM created_quests WHERE slug = $1', [slug])
  return rows[0].blocks.flatMap(b => b.tasks).find(t => t.id === id)
}

const templateTask = async (slug, id) => {
  const { rows } = await ctx.pool.query('SELECT structure FROM quest_templates WHERE slug = $1', [slug])
  return rows[0].structure.flatMap(b => b.tasks).find(t => t.id === id)
}

describe('миграция 013: текстовые пары → новые мини-игры', () => {
  it('заменяет текстовые пары демо-квеста новой игрой, остальное оставляет', async () => {
    await insertQuest('detective-home-demo', [
      { id: 't7', type: 'mini_game', game_type: 'pairs', title: 'Соедините пары', points: 30, pairs: legacyPairs, pairs_mode: 'text' },
    ])
    await ctx.pool.query(sql)

    const t = await questTask('detective-home-demo', 't7')
    expect(t.game_type).toBe('cipher')
    expect(t.cipher_phrase).toBeTruthy()
    expect(t.cipher_shift).toBeGreaterThan(0)
    expect(t.points).toBe(30)
    expect(t.pairs).toBeUndefined()
    expect(t.pairs_mode).toBeUndefined()
    expect((await questTask('detective-home-demo', 't0')).title).toBe('Старт')
  })

  it('хронология из «первых разов» берёт события в старом порядке, правые части — подписями', async () => {
    await insertQuest('proposal-moscow-demo', [
      { id: 't7', type: 'mini_game', game_type: 'pairs', title: 'Наши московские моменты', pairs: [
        { left: 'Первая прогулка по центру', right: 'Всё только начинается' },
        { left: 'Поздний вечер на набережной', right: 'Хочется остановить время' },
        { left: 'Смотровая площадка', right: 'Хочу видеть этот город с тобой' },
      ] },
    ])
    await ctx.pool.query(sql)

    const t = await questTask('proposal-moscow-demo', 't7')
    expect(t.game_type).toBe('timeline')
    expect(t.timeline_items.length).toBeGreaterThanOrEqual(3)
    expect(t.timeline_items[0]).toMatchObject({ text: 'Первая прогулка по центру', caption: 'Всё только начинается' })
  })

  it('не трогает фото-пары и задание, которое уже переделали', async () => {
    await insertQuest('mytishchi-detective', [
      { id: 't4', type: 'mini_game', game_type: 'pairs', title: 'Фото', pairs: legacyPairs, game_images: ['/a.jpg', '/b.jpg'] },
    ])
    await insertQuest('treasure-hunter-home-demo', [
      { id: 't8', type: 'mini_game', game_type: 'quiz', title: 'Уже угадайка' },
    ])
    await ctx.pool.query(sql)

    expect((await questTask('mytishchi-detective', 't4')).game_type).toBe('pairs')
    expect((await questTask('treasure-hunter-home-demo', 't8')).title).toBe('Уже угадайка')
  })

  it('в шаблонах из dump.sql не остаётся текстовых пар, повторный прогон ничего не меняет', async () => {
    await ctx.pool.query(sql)
    const before = await templateTask('detective-home', 't7')
    await ctx.pool.query(sql)
    const after = await templateTask('detective-home', 't7')

    expect(after).toEqual(before)
    expect(after.game_type).toBe('cipher')

    const { rows } = await ctx.pool.query(`
      SELECT q.slug FROM quest_templates q,
        jsonb_array_elements(q.structure) b, jsonb_array_elements(b->'tasks') t
      WHERE t->>'game_type' = 'pairs' AND jsonb_array_length(COALESCE(t->'game_images', '[]')) = 0`)
    expect(rows).toEqual([])
  })
})
