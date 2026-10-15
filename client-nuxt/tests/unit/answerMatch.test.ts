import { describe, it, expect } from 'vitest'
import {
  normalizeAnswer,
  editDistance,
  isAnswerCorrect,
} from '../../app/utils/answerMatch'

describe('normalizeAnswer', () => {
  it('приводит к нижнему регистру и обрезает пробелы', () => {
    expect(normalizeAnswer('  Ванная ')).toBe('ванная')
  })

  it('схлопывает пробелы внутри', () => {
    expect(normalizeAnswer('старый   \t мост')).toBe('старый мост')
  })

  it('заменяет ё на е', () => {
    expect(normalizeAnswer('Ёлка')).toBe('елка')
  })

  it('переживает null и undefined', () => {
    expect(normalizeAnswer(null)).toBe('')
    expect(normalizeAnswer(undefined)).toBe('')
  })

  it('принимает числа', () => {
    expect(normalizeAnswer(1234)).toBe('1234')
  })
})

describe('editDistance', () => {
  it('0 для одинаковых строк', () => {
    expect(editDistance('мост', 'мост')).toBe(0)
  })

  it('1 за замену, вставку и удаление', () => {
    expect(editDistance('мост', 'мсст')).toBe(1)
    expect(editDistance('мост', 'мосты')).toBe(1)
    expect(editDistance('мост', 'мот')).toBe(1)
  })

  it('1 за перестановку соседних букв (Дамерау)', () => {
    expect(editDistance('ванная', 'вананя')).toBe(1)
  })

  it('считает расстояние с пустой строкой', () => {
    expect(editDistance('', 'абв')).toBe(3)
    expect(editDistance('абв', '')).toBe(3)
  })

  it('2 за две независимые правки', () => {
    expect(editDistance('ванная', 'вонная1')).toBe(2)
  })
})

describe('isAnswerCorrect', () => {
  it('точное совпадение с учётом нормализации', () => {
    expect(isAnswerCorrect(' ВАННАЯ ', 'ванная')).toBe(true)
    expect(isAnswerCorrect('елка', 'Ёлка')).toBe(true)
  })

  it('засчитывает одну опечатку', () => {
    expect(isAnswerCorrect('вагная', 'ванная')).toBe(true)  // замена
    expect(isAnswerCorrect('ванна', 'ванная')).toBe(true)   // пропуск
    expect(isAnswerCorrect('ваннная', 'ванная')).toBe(true) // лишняя
    expect(isAnswerCorrect('вананя', 'ванная')).toBe(true)  // перестановка
  })

  it('не засчитывает две опечатки', () => {
    expect(isAnswerCorrect('вагнвя', 'ванная')).toBe(false)
  })

  it('короткие ответы (1–3 символа) только точно', () => {
    expect(isAnswerCorrect('кит', 'кит')).toBe(true)
    expect(isAnswerCorrect('кот', 'кит')).toBe(false)
    expect(isAnswerCorrect('ки', 'кит')).toBe(false)
    expect(isAnswerCorrect('да', 'да')).toBe(true)
  })

  it('допуск с четырёх символов', () => {
    expect(isAnswerCorrect('мсот', 'мост')).toBe(true)
  })

  it('числовые ответы только точно', () => {
    expect(isAnswerCorrect('1235', '1234')).toBe(false)
    expect(isAnswerCorrect('2143', '1234')).toBe(false)
    expect(isAnswerCorrect('1234', '1234')).toBe(true)
    expect(isAnswerCorrect(' 1234 ', 1234)).toBe(true)
  })

  it('без допуска, если typos: false', () => {
    expect(isAnswerCorrect('lovw', 'LOVE', { typos: false })).toBe(false)
    expect(isAnswerCorrect('love', 'LOVE', { typos: false })).toBe(true)
  })

  it('проверяет каждый из нескольких допустимых ответов', () => {
    const answers = ['ванная', 'душ']
    expect(isAnswerCorrect('вагная', answers)).toBe(true)
    expect(isAnswerCorrect('душ', answers)).toBe(true)
    expect(isAnswerCorrect('дущ', answers)).toBe(false) // «душ» короткий
  })

  it('пустой ввод никогда не верен', () => {
    expect(isAnswerCorrect('   ', 'ванная')).toBe(false)
  })

  it('пустые правильные ответы пропускаются', () => {
    expect(isAnswerCorrect('мост', ['', null, 'мост'])).toBe(true)
    expect(isAnswerCorrect('мост', '')).toBe(false)
  })
})
