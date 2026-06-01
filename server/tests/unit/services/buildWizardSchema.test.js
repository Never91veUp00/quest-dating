import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { buildWizardSchema } from '@src/services/buildWizardSchema.js'
import { questAssembler } from '@src/services/questAssembler.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templates = JSON.parse(
  readFileSync(join(__dirname, '../../fixtures/templates.json'), 'utf-8')
)

describe('buildWizardSchema', () => {
  describe('контракт', () => {
    it('бросает, если structure не массив', () => {
      expect(() => buildWizardSchema(null)).toThrow(/array/)
      expect(() => buildWizardSchema({})).toThrow(/array/)
      expect(() => buildWizardSchema({ structure: 'x' })).toThrow(/array/)
    })

    it('возвращает meta + questions', () => {
      const r = buildWizardSchema({ structure: [], location_type: 'indoor' })
      expect(r).toHaveProperty('meta')
      expect(r).toHaveProperty('questions')
      expect(Array.isArray(r.questions)).toBe(true)
    })

    it('meta содержит partner_name (required)', () => {
      const { meta } = buildWizardSchema({ structure: [] })
      const pn = meta.find((q) => q.key === 'partner_name')
      expect(pn).toBeTruthy()
      expect(pn.required).toBe(true)
    })

    it('детерминированность', () => {
      const t = { structure: [{ id: 'b1', title: 'A', tasks: [{ id: 't1', type: 'riddle', title: 'q', question: 'Q?' }] }] }
      expect(buildWizardSchema(t)).toEqual(buildWizardSchema(t))
    })
  })

  describe('маппинг типов (по answer_key)', () => {
    const ask = (task) => buildWizardSchema({ structure: [{ id: 'b1', title: 'B', tasks: [task] }], location_type: 'indoor' }).questions

    it('simple → hiding_spot, required, с шаблонным hint', () => {
      const qs = ask({ id: 't1', type: 'simple', title: 'Найди', description: 'под подушкой' })
      expect(qs).toHaveLength(1)
      expect(qs[0].answer_key).toBe('hiding_spot')
      expect(qs[0].required).toBe(true)
      expect(qs[0].hint).toBe('под подушкой')
    })

    it('riddle → answer (required) + hint (optional)', () => {
      const qs = ask({ id: 't1', type: 'riddle', title: 'Загадка', question: 'Где встретились?' })
      expect(qs.map((q) => q.answer_key)).toEqual(['answer', 'hint'])
      expect(qs[0].required).toBe(true)
      expect(qs[0].label).toBe('Где встретились?')
      expect(qs[1].required).toBe(false)
    })

    it('mini_game → options + correct (оба required)', () => {
      const qs = ask({ id: 't1', type: 'mini_game', title: 'Квиз', game_question: 'Десерт?' })
      expect(qs.map((q) => q.answer_key)).toEqual(['options', 'correct'])
      expect(qs[0].input).toBe('options_list')
      expect(qs[1].input).toBe('option_index')
    })

    it('text_answer → 0 вопросов', () => {
      expect(ask({ id: 't1', type: 'text_answer', title: 'x', question: 'q' })).toHaveLength(0)
    })

    it('selfie → 0 вопросов', () => {
      expect(ask({ id: 't1', type: 'selfie', title: 'x' })).toHaveLength(0)
    })

    it('неизвестный тип → 0 вопросов (forward-safe)', () => {
      expect(ask({ id: 't1', type: 'future_xyz', title: 'x' })).toHaveLength(0)
    })
  })

  describe('location-вопрос по location_type', () => {
    const block = { id: 'b1', title: 'Этап', tasks: [] }

    it('city → есть location-вопрос на блок', () => {
      const { questions } = buildWizardSchema({ structure: [block], location_type: 'city' })
      const loc = questions.find((q) => q.answer_key === 'location')
      expect(loc).toBeTruthy()
      expect(loc.block_id).toBe('b1')
    })

    it('indoor → нет location-вопросов', () => {
      const { questions } = buildWizardSchema({ structure: [block], location_type: 'indoor' })
      expect(questions.find((q) => q.answer_key === 'location')).toBeUndefined()
    })
  })

  // ─── ПРОГОН НА ВСЕХ 7 РЕАЛЬНЫХ ШАБЛОНАХ ──────────────────────────────
  describe('реальные шаблоны (7 шт)', () => {
    // ожидаемые числа слотов-заказчика (посчитаны из dump 1 июня)
    const expected = {
      'proposal-home':            { simple: 3, riddle: 1, mini_game: 0, city: false },
      'chocolate-detective-home': { simple: 1, riddle: 4, mini_game: 3, city: false },
      'proposal-moscow':          { simple: 4, riddle: 2, mini_game: 0, city: true },
      'time-machine-home':        { simple: 1, riddle: 1, mini_game: 3, city: false },
      'detective-home':           { simple: 1, riddle: 4, mini_game: 3, city: false },
      'treasure-hunter-home':     { simple: 1, riddle: 5, mini_game: 3, city: false },
      'starry-night-home':        { simple: 3, riddle: 1, mini_game: 0, city: false },
    }

    it('все 7 шаблонов присутствуют в фикстуре', () => {
      expect(Object.keys(templates).sort()).toEqual(Object.keys(expected).sort())
    })

    for (const [slug, exp] of Object.entries(expected)) {
      it(`${slug}: число вопросов совпадает с реальными слотами`, () => {
        const { questions } = buildWizardSchema(templates[slug])
        const byKey = questions.reduce((acc, q) => {
          acc[q.answer_key] = (acc[q.answer_key] || 0) + 1
          return acc
        }, {})

        // simple → 1 вопрос (hiding_spot) каждый
        expect(byKey.hiding_spot || 0).toBe(exp.simple)
        // riddle → 2 вопроса (answer + hint) каждый
        expect(byKey.answer || 0).toBe(exp.riddle)
        expect(byKey.hint || 0).toBe(exp.riddle)
        // mini_game → 2 вопроса (options + correct) каждый
        expect(byKey.options || 0).toBe(exp.mini_game)
        expect(byKey.correct || 0).toBe(exp.mini_game)
        // location → по числу блоков, только если city
        const nBlocks = templates[slug].structure.length
        expect(byKey.location || 0).toBe(exp.city ? nBlocks : 0)
      })
    }

    it('каждый вопрос имеет answer_key, input, label, required', () => {
      for (const slug of Object.keys(templates)) {
        const { questions } = buildWizardSchema(templates[slug])
        for (const q of questions) {
          expect(q.answer_key, `${slug}/${q.task_id || q.block_id}`).toBeTruthy()
          expect(q.input).toBeTruthy()
          expect(q.label).toBeTruthy()
          expect(typeof q.required).toBe('boolean')
        }
      }
    })
  })

  // ─── ИНТЕГРАЦИЯ С questAssembler (round-trip) ────────────────────────
  describe('round-trip: schema → ответы → assembler', () => {
    it('ответы по схеме собираются в валидный квест без болванок', () => {
      const tpl = templates['proposal-home']
      const { questions } = buildWizardSchema(tpl)

      // Симулируем заполнение КАЖДОГО вопроса схемы
      const answers = {}
      for (const q of questions) {
        const id = q.scope === 'block' ? q.block_id : q.task_id
        answers[id] = answers[id] || {}
        if (q.answer_key === 'options') answers[id].options = ['A', 'B']
        else if (q.answer_key === 'correct') answers[id].correct = 0
        else answers[id][q.answer_key] = `заполнено-${q.answer_key}`
      }

      const blocks = questAssembler(tpl.structure, answers, { partner_name: 'Аня' })

      // все riddle.answer и simple.description заполнены (нет болванок "ответ")
      const flat = blocks.flatMap((b) => b.tasks)
      for (const t of flat) {
        if (t.type === 'riddle') expect(t.answer).not.toBe('ответ')
        if (t.type === 'simple') expect(t.description).toContain('заполнено')
      }
    })
  })
})