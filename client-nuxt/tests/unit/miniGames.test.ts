import { describe, it, expect } from 'vitest'
import {
  RU_ALPHABET,
  caesar,
  wordSlots,
  wordTiles,
  isWordMatch,
  shuffledOrder,
  randomShift,
} from '../../app/utils/miniGames'

// детерминированный генератор для проверок перемешивания
const seq = (...vals: number[]) => { let i = 0; return () => vals[i++ % vals.length] }

describe('caesar', () => {
  it('в алфавите 33 буквы, Ё на своём месте', () => {
    expect(RU_ALPHABET).toHaveLength(33)
    expect(RU_ALPHABET.indexOf('Ё')).toBe(6)
  })

  it('сдвигает буквы и сохраняет регистр', () => {
    expect(caesar('Абвг', 3)).toBe('Гдеё')
  })

  it('заворачивает конец алфавита на начало', () => {
    expect(caesar('Я', 1)).toBe('А')
  })

  it('не трогает пробелы, знаки, цифры и латиницу', () => {
    expect(caesar('Я, 7 OK!', 1)).toBe('А, 7 OK!')
  })

  it('обратный сдвиг расшифровывает', () => {
    const phrase = 'Жду тебя у старого моста'
    expect(caesar(caesar(phrase, 11), -11)).toBe(phrase)
  })
})

describe('randomShift', () => {
  it('не даёт сдвигов, при которых фраза почти не меняется', () => {
    expect(randomShift(() => 0)).toBe(3)
    expect(randomShift(() => 0.9999)).toBe(29)
  })
})

describe('wordSlots', () => {
  it('режет ответ на слова из заглавных букв', () => {
    expect(wordSlots(' Старый  мост ')).toEqual([['С', 'Т', 'А', 'Р', 'Ы', 'Й'], ['М', 'О', 'С', 'Т']])
  })

  it('отбрасывает знаки препинания', () => {
    expect(wordSlots('Ты, я!')).toEqual([['Т', 'Ы'], ['Я']])
  })
})

describe('wordTiles', () => {
  it('содержит все буквы ответа и нужное число лишних', () => {
    const tiles = wordTiles('мост', 2, Math.random)
    expect(tiles).toHaveLength(6)
    expect(tiles.map(t => t.ch).filter(c => 'МОСТ'.includes(c)).length).toBeGreaterThanOrEqual(4)
    expect(new Set(tiles.map(t => t.id)).size).toBe(6)
  })

  it('не выдаёт фишки уже собранным словом', () => {
    // генератор, при котором тасование ничего не меняет
    const tiles = wordTiles('мост', 0, seq(0.99))
    expect(tiles.map(t => t.ch).join('')).not.toBe('МОСТ')
  })
})

describe('isWordMatch', () => {
  it('не различает регистр, Ё и Е, пробелы', () => {
    expect(isWordMatch('ЕЛКА', 'Ёлка')).toBe(true)
    expect(isWordMatch('СТАРЫЙМОСТ', 'старый мост')).toBe(true)
  })

  it('отличает другое слово из тех же букв', () => {
    expect(isWordMatch('СОТМ', 'мост')).toBe(false)
  })
})

describe('shuffledOrder', () => {
  it('перестановка индексов, не совпадающая с правильным порядком', () => {
    const order = shuffledOrder(4, seq(0.99))
    expect([...order].sort()).toEqual([0, 1, 2, 3])
    expect(order).not.toEqual([0, 1, 2, 3])
  })

  it('для одного пункта отдаёт его как есть', () => {
    expect(shuffledOrder(1, Math.random)).toEqual([0])
  })
})
