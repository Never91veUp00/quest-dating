import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validatePassword,
  isValidDate,
  isFutureDate,
  isDateAfter,
  isInRange,
  isRequired,
  hasMinLength,
  hasMaxLength,
  isNumeric,
  isAlpha,
  validateOrderForm,
  validateReviewForm,
} from '@/utils/validators.js'

describe('isValidEmail', () => {
  it.each([
    ['alex@example.com', true],
    ['user+tag@domain.co.uk', true],
    ['not-an-email', false],
    ['missing@', false],
    ['@nodomain.com', false],
    ['', false],
    [null, false],
  ])('"%s" → %s', (input, expected) => {
    expect(isValidEmail(input)).toBe(expected)
  })
})

describe('isValidPhone', () => {
  it.each([
    ['+79161234567', true],   // 11 цифр, начинается с 7
    ['79161234567', true],    // без плюса
    ['9161234567', true],     // 10 цифр
    ['+7 (916) 123-45-67', true], // с форматированием
    ['123', false],           // слишком короткий
    ['', false],
    [null, false],
  ])('"%s" → %s', (input, expected) => {
    expect(isValidPhone(input)).toBe(expected)
  })
})

describe('isValidUrl', () => {
  it.each([
    ['https://example.com', true],
    ['http://localhost:3000', true],
    ['not-a-url', false],
    ['ftp://files.example.com', true],
    ['', false],
  ])('"%s" → %s', (input, expected) => {
    expect(isValidUrl(input)).toBe(expected)
  })
})

describe('validatePassword', () => {
  it('валидный пароль проходит все проверки', () => {
    const result = validatePassword('SecurePass123')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('возвращает ошибку для пустого пароля', () => {
    expect(validatePassword(null).valid).toBe(false)
    expect(validatePassword('').valid).toBe(false)
  })

  it('проверяет минимальную длину', () => {
    const result = validatePassword('Abc1')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('символов'))).toBe(true)
  })

  it('проверяет наличие заглавных букв', () => {
    const result = validatePassword('lowercase123')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('заглавные'))).toBe(true)
  })

  it('проверяет наличие цифр', () => {
    const result = validatePassword('NoNumbers!')
    // requireNumbers: true по умолчанию, но requireSpecialChars: false
    // 'NoNumbers!' не содержит цифр
    expect(result.errors.some(e => e.includes('цифры'))).toBe(true)
  })

  it('отключаемые опции работают', () => {
    const result = validatePassword('lowercase', {
      requireUppercase: false,
      requireNumbers: false,
      minLength: 5
    })
    expect(result.valid).toBe(true)
  })
})

describe('isValidDate', () => {
  it('принимает валидную дату', () => {
    expect(isValidDate('2025-06-14')).toBe(true)
    expect(isValidDate('2024-12-31')).toBe(true)
  })

  it('отклоняет невалидные значения', () => {
    expect(isValidDate('not-a-date')).toBe(false)
    expect(isValidDate('')).toBe(false)
    expect(isValidDate(null)).toBe(false)
  })
})

describe('isFutureDate', () => {
  it('возвращает true для даты в будущем', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    expect(isFutureDate(future)).toBe(true)
  })

  it('возвращает false для даты в прошлом', () => {
    expect(isFutureDate('2020-01-01')).toBe(false)
  })

  it('возвращает false для null', () => {
    expect(isFutureDate(null)).toBe(false)
  })
})

describe('isInRange', () => {
  it.each([
    [5, 1, 10, true],
    [1, 1, 10, true],  // граница включена
    [10, 1, 10, true], // граница включена
    [0, 1, 10, false],
    [11, 1, 10, false],
  ])('%s в [%s, %s] → %s', (val, min, max, expected) => {
    expect(isInRange(val, min, max)).toBe(expected)
  })
})

describe('isRequired', () => {
  it.each([
    ['текст', true],
    [42, true],
    [['a', 'b'], true],
    ['', false],
    ['   ', false],   // только пробелы
    [[], false],
    [null, false],
    [undefined, false],
  ])('%j → %s', (input, expected) => {
    expect(isRequired(input)).toBe(expected)
  })
})

describe('hasMinLength / hasMaxLength', () => {
  it('hasMinLength', () => {
    expect(hasMinLength('hello', 3)).toBe(true)
    expect(hasMinLength('hi', 3)).toBe(false)
    expect(hasMinLength('', 1)).toBe(false)
    expect(hasMinLength(null, 1)).toBe(false)
  })

  it('hasMaxLength', () => {
    expect(hasMaxLength('hello', 10)).toBe(true)
    expect(hasMaxLength('hello world', 5)).toBe(false)
    expect(hasMaxLength('', 5)).toBe(true)
    expect(hasMaxLength(null, 5)).toBe(true) // null считается "нет значения"
  })
})

describe('isNumeric / isAlpha', () => {
  it('isNumeric', () => {
    expect(isNumeric('12345')).toBe(true)
    expect(isNumeric('123abc')).toBe(false)
    expect(isNumeric('')).toBe(false)
  })

  it('isAlpha', () => {
    expect(isAlpha('hello')).toBe(true)
    expect(isAlpha('привет')).toBe(true)
    expect(isAlpha('hello123')).toBe(false)
    expect(isAlpha('')).toBe(false)
  })
})

describe('validateOrderForm', () => {
  const validForm = {
    client_name: 'Александр',
    client_email: 'alex@example.com',
    client_phone: '+79161234567',
    description: 'Романтический вечер для двоих в честь годовщины свадьбы',
    event_date: (() => {
      const d = new Date()
      d.setFullYear(d.getFullYear() + 1)
      return d.toISOString().split('T')[0]
    })()
  }

  it('принимает корректные данные', () => {
    const result = validateOrderForm(validForm)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('требует имя', () => {
    const result = validateOrderForm({ ...validForm, client_name: '' })
    expect(result.errors.client_name).toBeDefined()
  })

  it('требует корректный email', () => {
    const result = validateOrderForm({ ...validForm, client_email: 'not-email' })
    expect(result.errors.client_email).toBeDefined()
  })

  it('минимальная длина описания — 50 символов', () => {
    const result = validateOrderForm({ ...validForm, description: 'Слишком короткое' })
    expect(result.errors.description).toBeDefined()
  })

  it('дата должна быть в будущем', () => {
    const result = validateOrderForm({ ...validForm, event_date: '2020-01-01' })
    expect(result.errors.event_date).toBeDefined()
  })

  it('некорректный телефон вызывает ошибку', () => {
    const result = validateOrderForm({ ...validForm, client_phone: '123' })
    expect(result.errors.client_phone).toBeDefined()
  })

  it('телефон опциональный — пустое поле не вызывает ошибку', () => {
    const result = validateOrderForm({ ...validForm, client_phone: '' })
    expect(result.errors.client_phone).toBeUndefined()
  })
})

describe('validateReviewForm', () => {
  const validReview = {
    client_name: 'Мария',
    client_email: 'maria@example.com',
    rating: 5,
    comment: 'Отличный квест, очень понравилось!'
  }

  it('принимает корректные данные', () => {
    expect(validateReviewForm(validReview).valid).toBe(true)
  })

  it('рейтинг должен быть от 1 до 5', () => {
    expect(validateReviewForm({ ...validReview, rating: 6 }).errors.rating).toBeDefined()
    expect(validateReviewForm({ ...validReview, rating: 0 }).errors.rating).toBeDefined()
    expect(validateReviewForm({ ...validReview, rating: 3 }).valid).toBe(true)
  })

  it('комментарий не менее 10 символов', () => {
    const result = validateReviewForm({ ...validReview, comment: 'Ок' })
    expect(result.errors.comment).toBeDefined()
  })
})
