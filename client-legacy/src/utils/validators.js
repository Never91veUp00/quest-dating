/**
 * Утилиты для валидации данных
 */

/**
 * Проверка email
 * @param {string} email - Email адрес
 * @returns {boolean} - Валиден ли email
 */
export function isValidEmail(email) {
  if (!email) return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Проверка телефона (российский формат)
 * @param {string} phone - Номер телефона
 * @returns {boolean} - Валиден ли номер
 */
export function isValidPhone(phone) {
  if (!phone) return false
  
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '')
  
  // Проверяем длину (10 или 11 цифр)
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('7'))
}

/**
 * Проверка URL
 * @param {string} url - URL адрес
 * @returns {boolean} - Валиден ли URL
 */
export function isValidUrl(url) {
  if (!url) return false
  
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}

/**
 * Проверка пароля
 * @param {string} password - Пароль
 * @param {object} options - Опции проверки
 * @returns {object} - Результат валидации
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false
  } = options

  const errors = []

  if (!password) {
    return { valid: false, errors: ['Пароль обязателен'] }
  }

  if (password.length < minLength) {
    errors.push(`Пароль должен содержать минимум ${minLength} символов`)
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать заглавные буквы')
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчные буквы')
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Пароль должен содержать цифры')
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Пароль должен содержать специальные символы')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Проверка даты
 * @param {string} dateString - Строка с датой
 * @returns {boolean} - Валидна ли дата
 */
export function isValidDate(dateString) {
  if (!dateString) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Проверка, что дата в будущем
 * @param {string|Date} date - Дата
 * @returns {boolean} - Дата в будущем?
 */
export function isFutureDate(date) {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  return dateObj > now
}

/**
 * Проверка минимальной даты
 * @param {string|Date} date - Проверяемая дата
 * @param {string|Date} minDate - Минимальная дата
 * @returns {boolean} - Дата не раньше минимальной?
 */
export function isDateAfter(date, minDate) {
  if (!date || !minDate) return false
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const minDateObj = typeof minDate === 'string' ? new Date(minDate) : minDate
  
  return dateObj >= minDateObj
}

/**
 * Проверка числа в диапазоне
 * @param {number} value - Значение
 * @param {number} min - Минимум
 * @param {number} max - Максимум
 * @returns {boolean} - Число в диапазоне?
 */
export function isInRange(value, min, max) {
  return value >= min && value <= max
}

/**
 * Проверка обязательного поля
 * @param {any} value - Значение
 * @returns {boolean} - Поле заполнено?
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Проверка минимальной длины строки
 * @param {string} value - Строка
 * @param {number} minLength - Минимальная длина
 * @returns {boolean} - Длина достаточна?
 */
export function hasMinLength(value, minLength) {
  if (!value) return false
  return value.length >= minLength
}

/**
 * Проверка максимальной длины строки
 * @param {string} value - Строка
 * @param {number} maxLength - Максимальная длина
 * @returns {boolean} - Длина не превышена?
 */
export function hasMaxLength(value, maxLength) {
  if (!value) return true
  return value.length <= maxLength
}

/**
 * Проверка на содержание только цифр
 * @param {string} value - Строка
 * @returns {boolean} - Только цифры?
 */
export function isNumeric(value) {
  if (!value) return false
  return /^\d+$/.test(value)
}

/**
 * Проверка на содержание только букв
 * @param {string} value - Строка
 * @returns {boolean} - Только буквы?
 */
export function isAlpha(value) {
  if (!value) return false
  return /^[a-zA-Zа-яА-ЯёЁ]+$/.test(value)
}

/**
 * Проверка на содержание только букв и цифр
 * @param {string} value - Строка
 * @returns {boolean} - Только буквы и цифры?
 */
export function isAlphanumeric(value) {
  if (!value) return false
  return /^[a-zA-Z0-9а-яА-ЯёЁ]+$/.test(value)
}

/**
 * Валидация формы заказа
 * @param {object} formData - Данные формы
 * @returns {object} - Результат валидации
 */
export function validateOrderForm(formData) {
  const errors = {}

  // Имя
  if (!isRequired(formData.client_name)) {
    errors.client_name = 'Имя обязательно'
  } else if (!hasMinLength(formData.client_name, 2)) {
    errors.client_name = 'Имя должно содержать минимум 2 символа'
  }

  // Email
  if (!isRequired(formData.client_email)) {
    errors.client_email = 'Email обязателен'
  } else if (!isValidEmail(formData.client_email)) {
    errors.client_email = 'Некорректный email'
  }

  // Телефон (опционально, но если заполнен - должен быть валидным)
  if (formData.client_phone && !isValidPhone(formData.client_phone)) {
    errors.client_phone = 'Некорректный номер телефона'
  }

  // Описание
  if (!isRequired(formData.description)) {
    errors.description = 'Описание обязательно'
  } else if (!hasMinLength(formData.description, 50)) {
    errors.description = 'Описание должно содержать минимум 50 символов'
  }

  // Дата события (опционально, но если заполнена - должна быть в будущем)
  if (formData.event_date && !isFutureDate(formData.event_date)) {
    errors.event_date = 'Дата события должна быть в будущем'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Валидация формы отзыва
 * @param {object} reviewData - Данные отзыва
 * @returns {object} - Результат валидации
 */
export function validateReviewForm(reviewData) {
  const errors = {}

  // Имя
  if (!isRequired(reviewData.client_name)) {
    errors.client_name = 'Имя обязательно'
  }

  // Email
  if (!isRequired(reviewData.client_email)) {
    errors.client_email = 'Email обязателен'
  } else if (!isValidEmail(reviewData.client_email)) {
    errors.client_email = 'Некорректный email'
  }

  // Рейтинг
  if (!reviewData.rating) {
    errors.rating = 'Укажите оценку'
  } else if (!isInRange(reviewData.rating, 1, 5)) {
    errors.rating = 'Оценка должна быть от 1 до 5'
  }

  // Комментарий
  if (!isRequired(reviewData.comment)) {
    errors.comment = 'Комментарий обязателен'
  } else if (!hasMinLength(reviewData.comment, 10)) {
    errors.comment = 'Комментарий должен содержать минимум 10 символов'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}