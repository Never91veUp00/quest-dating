import { describe, it, expect } from 'vitest'
import { questAssembler } from '@src/services/questAssembler.js'

// Минимальные фикстуры по реальной форме structure (см. §2.4.0 плана)
const meta = { partner_name: 'Аня', author_name: 'Игорь' }

describe('questAssembler', () => {
  describe('контракт', () => {
    it('бросает, если structure не массив', () => {
      expect(() => questAssembler(null)).toThrow(/array/)
      expect(() => questAssembler({})).toThrow(/array/)
    })

    it('сохраняет количество блоков', () => {
      const structure = [
        { id: 'b1', title: 'A', description: '', location: '', tasks: [] },
        { id: 'b2', title: 'B', description: '', location: '', tasks: [] },
      ]
      expect(questAssembler(structure, {}, meta)).toHaveLength(2)
    })

    it('детерминированность: одинаковый вход → одинаковый выход', () => {
      const structure = [{ id: 'b1', title: '{partner}', description: '', location: '', tasks: [] }]
      const r1 = questAssembler(structure, {}, meta)
      const r2 = questAssembler(structure, {}, meta)
      expect(r1).toEqual(r2)
    })

    it('не мутирует исходную structure', () => {
      const structure = [{ id: 'b1', title: 'x', description: '', location: 'старое',
        tasks: [{ id: 't1', type: 'riddle', answer: 'ответ', question: 'q', hint: '' }] }]
      const snapshot = JSON.stringify(structure)
      questAssembler(structure, { b1: { location: 'новое' }, t1: { answer: 'реальный' } }, meta)
      expect(JSON.stringify(structure)).toBe(snapshot)
    })
  })

  describe('подстановка переменных', () => {
    it('заменяет {partner} и {author} в title/description', () => {
      const structure = [{ id: 'b1', title: 'Привет, {partner}', description: 'от {author}', location: '', tasks: [] }]
      const [b] = questAssembler(structure, {}, meta)
      expect(b.title).toBe('Привет, Аня')
      expect(b.description).toBe('от Игорь')
    })

    it('пустой meta → переменные стираются, не падает', () => {
      const structure = [{ id: 'b1', title: 'Привет, {partner}', description: '', location: '', tasks: [] }]
      const [b] = questAssembler(structure, {}, {})
      expect(b.title).toBe('Привет, ')
    })
  })

  describe('типы задач — заполняемые заказчиком', () => {
    it('simple: description заменяется на hiding_spot заказчика', () => {
      const structure = [{ id: 'b1', title: '', description: '', location: '',
        tasks: [{ id: 't1', type: 'simple', title: 'Найди', description: 'болванка' }] }]
      const [b] = questAssembler(structure, { t1: { hiding_spot: 'под подушкой' } }, meta)
      expect(b.tasks[0].description).toBe('под подушкой')
    })

    it('riddle: answer и hint заполняются, question берётся из шаблона', () => {
      const structure = [{ id: 'b1', title: '', description: '', location: '',
        tasks: [{ id: 't1', type: 'riddle', title: '', answer: 'ответ', hint: '', question: 'Где встретились?' }] }]
      const [b] = questAssembler(structure, { t1: { answer: 'кафе', hint: 'корица' } }, meta)
      expect(b.tasks[0].answer).toBe('кафе')
      expect(b.tasks[0].hint).toBe('корица')
      expect(b.tasks[0].question).toBe('Где встретились?')
    })

    it('mini_game: options и correct заполняются заказчиком', () => {
      const structure = [{ id: 'b1', title: '', description: '', location: '',
        tasks: [{ id: 't1', type: 'mini_game', title: '', game_type: 'quiz',
          game_question: 'Любимый десерт?', game_options: ['a'], game_correct: 0 }] }]
      const [b] = questAssembler(structure, { t1: { options: ['Торт', 'Мороженое'], correct: 1 } }, meta)
      expect(b.tasks[0].game_options).toEqual(['Торт', 'Мороженое'])
      expect(b.tasks[0].game_correct).toBe(1)
    })

    it('block.location заполняется из answers[block.id]', () => {
      const structure = [{ id: 'b1', title: '', description: '', location: '', tasks: [] }]
      const [b] = questAssembler(structure, { b1: { location: 'Парк Горького' } }, meta)
      expect(b.location).toBe('Парк Горького')
    })
  })

  describe('типы задач — шаблонные (НЕ трогаем)', () => {
    it('text_answer остаётся как в шаблоне', () => {
      const structure = [{ id: 'b1', title: '', description: '', location: '',
        tasks: [{ id: 't1', type: 'text_answer', title: '', question: 'Напиши 3 причины', placeholder: 'Потому что...' }] }]
      const [b] = questAssembler(structure, { t1: { answer: 'попытка подмены' } }, meta)
      expect(b.tasks[0].question).toBe('Напиши 3 причины')
      expect(b.tasks[0].placeholder).toBe('Потому что...')
    })

    it('selfie остаётся как в шаблоне', () => {
      const structure = [{ id: 'b1', title: '', description: '', location: '',
        tasks: [{ id: 't1', type: 'selfie', title: '', selfie_condition: 'Совместное фото!', selfie_emoji: '💍' }] }]
      const [b] = questAssembler(structure, {}, meta)
      expect(b.tasks[0].selfie_condition).toBe('Совместное фото!')
      expect(b.tasks[0].selfie_emoji).toBe('💍')
    })
  })

  describe('edge-cases', () => {
    it('нет ответа на слот → остаётся шаблонный дефолт (болванка)', () => {
      const structure = [{ id: 'b1', title: '', description: '', location: '',
        tasks: [{ id: 't1', type: 'riddle', title: '', answer: 'ответ', hint: '', question: 'q' }] }]
      const [b] = questAssembler(structure, {}, meta)
      expect(b.tasks[0].answer).toBe('ответ') // дефолт сохраняется — см. требование 2.4.1
    })

    it('неизвестный тип задачи → copy-through без изменений', () => {
      const structure = [{ id: 'b1', title: '', description: '', location: '',
        tasks: [{ id: 't1', type: 'future_type_xyz', title: 'X', custom_field: 42 }] }]
      const [b] = questAssembler(structure, {}, meta)
      expect(b.tasks[0].type).toBe('future_type_xyz')
      expect(b.tasks[0].custom_field).toBe(42)
    })

    it('блок без tasks → пустой массив, не падает', () => {
      const structure = [{ id: 'b1', title: '', description: '', location: '' }]
      const [b] = questAssembler(structure, {}, meta)
      expect(b.tasks).toEqual([])
    })

    it('answers и meta по умолчанию (не переданы)', () => {
      const structure = [{ id: 'b1', title: 'x', description: '', location: '', tasks: [] }]
      expect(() => questAssembler(structure)).not.toThrow()
    })
  })
})