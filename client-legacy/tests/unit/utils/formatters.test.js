import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  formatDate,
  formatDuration,
  formatNumber,
  formatRating,
  pluralize,
  formatCount,
  formatPhone,
  truncate,
  formatFileSize,
  formatPercent,
  formatRelativeTime,
} from '@/utils/formatters.js'

describe('formatPrice', () => {
  it('конвертирует копейки в рубли', () => {
    expect(formatPrice(350000)).toContain('3')
    expect(formatPrice(350000)).toContain('500')
    expect(formatPrice(350000)).toContain('₽')
  })

  it('возвращает 0 ₽ для null/undefined', () => {
    expect(formatPrice(null)).toBe('0 ₽')
    expect(formatPrice(undefined)).toBe('0 ₽')
  })

  it('показывает цену без знака валюты', () => {
    const result = formatPrice(100000, false)
    expect(result).not.toContain('₽')
    expect(result).toContain('1')
  })

  it('форматирует с разделителем тысяч', () => {
    const result = formatPrice(1000000) // 10 000 ₽
    // Русская локаль использует неразрывный пробел или запятую
    expect(result.replace(/\s/g, '')).toContain('10000')
  })
})

describe('formatDate', () => {
  it('форматирует дату в short формате', () => {
    const result = formatDate('2025-06-14', 'short')
    expect(result).toMatch(/14/) // день
    expect(result).toMatch(/2025/) // год
  })

  it('форматирует дату в long формате', () => {
    const result = formatDate('2025-06-14', 'long')
    expect(result).toContain('2025')
    // В long формате месяц словом
    expect(result.length).toBeGreaterThan(10)
  })

  it('возвращает пустую строку для null', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('возвращает пустую строку для невалидной даты', () => {
    expect(formatDate('not-a-date')).toBe('')
  })
})

describe('formatDuration', () => {
  it.each([
    [90, '1ч 30м'],
    [60, '1ч'],
    [45, '45м'],
    [0, 'Не указано'],
    [null, 'Не указано'],
    [120, '2ч'],
    [75, '1ч 15м'],
  ])('%s минут → "%s"', (input, expected) => {
    expect(formatDuration(input)).toBe(expected)
  })
})

describe('formatNumber', () => {
  it.each([
    [1500, '1.5k'],
    [1000000, '1.0M'],
    [999, '999'],
    [0, '0'],
    [null, '0'],
  ])('%s → "%s"', (input, expected) => {
    expect(formatNumber(input)).toBe(expected)
  })
})

describe('formatRating', () => {
  it('форматирует число с одним знаком', () => {
    expect(formatRating(4.567)).toBe('4.6')
    expect(formatRating(5)).toBe('5.0')
  })

  it('принимает строки (тип из PostgreSQL)', () => {
    expect(formatRating('4.3')).toBe('4.3')
  })

  it('возвращает "Нет оценок" для null/undefined/NaN', () => {
    expect(formatRating(null)).toBe('Нет оценок')
    expect(formatRating(undefined)).toBe('Нет оценок')
    expect(formatRating('not-a-number')).toBe('Нет оценок')
  })

  it('поддерживает кастомное количество знаков', () => {
    expect(formatRating(4.567, 2)).toBe('4.57')
    expect(formatRating(4.567, 0)).toBe('5')
  })
})

describe('pluralize', () => {
  it.each([
    [1, 'шаблон'],
    [21, 'шаблон'],
    [2, 'шаблона'],
    [4, 'шаблона'],
    [22, 'шаблона'],
    [5, 'шаблонов'],
    [11, 'шаблонов'],
    [19, 'шаблонов'],
    [100, 'шаблонов'],
  ])('%s → "%s"', (count, expected) => {
    expect(pluralize(count, 'шаблон', 'шаблона', 'шаблонов')).toBe(expected)
  })
})

describe('formatCount', () => {
  it('возвращает число и правильную форму слова', () => {
    expect(formatCount(1, 'квест', 'квеста', 'квестов')).toBe('1 квест')
    expect(formatCount(3, 'квест', 'квеста', 'квестов')).toBe('3 квеста')
    expect(formatCount(10, 'квест', 'квеста', 'квестов')).toBe('10 квестов')
  })
})

describe('formatPhone', () => {
  it.each([
    ['79161234567', '+7 (916) 123-45-67'],
    ['+79161234567', '+7 (916) 123-45-67'],
    ['9161234567', '+7 (916) 123-45-67'],
    ['invalid', 'invalid'],   // не форматируется — возвращает как есть
    ['', ''],
  ])('"%s" → "%s"', (input, expected) => {
    expect(formatPhone(input)).toBe(expected)
  })
})

describe('truncate', () => {
  it('обрезает длинный текст и добавляет ...', () => {
    const result = truncate('Очень длинный текст для тестирования', 10)
    expect(result).toHaveLength(13) // 10 + '...'
    expect(result.endsWith('...')).toBe(true)
  })

  it('не обрезает текст короче maxLength', () => {
    expect(truncate('Короткий', 100)).toBe('Короткий')
  })

  it('возвращает пустую строку для null', () => {
    expect(truncate(null)).toBe('')
    expect(truncate('')).toBe('')
  })
})

describe('formatFileSize', () => {
  it.each([
    [0, '0 Bytes'],
    [1024, '1 KB'],
    [1048576, '1 MB'],
    [1073741824, '1 GB'],
    [1536, '1.5 KB'],   // 1024 * 1.5 = 1536 → 1.5 KB
    [512, '512 Bytes'], // 512 < 1024 → остаётся в Bytes
  ])('%s байт → "%s"', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected)
  })
})

describe('formatPercent', () => {
  it.each([
    [75, 0, '75%'],
    [33.333, 1, '33.3%'],
    [100, 0, '100%'],
    [null, 0, '0%'],
  ])('%s (decimals=%s) → "%s"', (val, dec, expected) => {
    expect(formatPercent(val, dec)).toBe(expected)
  })
})

describe('formatRelativeTime', () => {
  it('возвращает "только что" для событий менее минуты назад', () => {
    const recent = new Date(Date.now() - 10000) // 10 секунд назад
    expect(formatRelativeTime(recent)).toBe('только что')
  })

  it('возвращает минуты для событий менее часа назад', () => {
    const ago = new Date(Date.now() - 5 * 60 * 1000) // 5 минут назад
    expect(formatRelativeTime(ago)).toContain('минут')
  })

  it('возвращает часы для событий менее суток назад', () => {
    const ago = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 часа назад
    expect(formatRelativeTime(ago)).toContain('час')
  })

  it('возвращает пустую строку для null', () => {
    expect(formatRelativeTime(null)).toBe('')
  })
})
