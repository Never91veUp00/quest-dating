/**
 * Утилиты для форматирования данных
 */

/**
 * Форматирование цены из копеек в рубли
 * @param {number} priceInCents - Цена в копейках
 * @param {boolean} showCurrency - Показывать ли символ валюты
 * @returns {string} - Отформатированная цена
 */
export function formatPrice(priceInCents, showCurrency = true) {
  if (priceInCents === null || priceInCents === undefined) {
    return showCurrency ? '0 ₽' : '0'
  }

  const priceInRubles = priceInCents / 100

  if (showCurrency) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(priceInRubles)
  }

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(priceInRubles)
}

/**
 * Форматирование даты
 * @param {string|Date} date - Дата
 * @param {string} format - Формат ('short', 'long', 'full')
 * @returns {string} - Отформатированная дата
 */
export function formatDate(date, format = 'short') {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const options = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  }

  return dateObj.toLocaleDateString('ru-RU', options[format] || options.short)
}

/**
 * Форматирование времени
 * @param {string|Date} date - Дата/время
 * @returns {string} - Отформатированное время
 */
export function formatTime(date) {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  return dateObj.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Форматирование длительности (минуты -> часы и минуты)
 * @param {number} minutes - Количество минут
 * @returns {string} - Отформатированная длительность
 */
export function formatDuration(minutes) {
  if (!minutes || minutes === 0) return 'Не указано'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours}ч ${mins}м`
  } else if (hours > 0) {
    return `${hours}ч`
  } else {
    return `${mins}м`
  }
}

/**
 * Форматирование большого числа (1000 -> 1k)
 * @param {number} num - Число
 * @returns {string} - Отформатированное число
 */
export function formatNumber(num) {
  if (!num || num === 0) return '0'

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }

  return num.toString()
}

/**
 * Форматирование рейтинга
 * @param {number|string} rating - Рейтинг
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} - Отформатированный рейтинг
 */
export function formatRating(rating, decimals = 1) {
  if (rating === null || rating === undefined) return 'Нет оценок'
  
  // Конвертируем в число, если это строка
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating
  
  if (isNaN(numRating)) return 'Нет оценок'
  
  return numRating.toFixed(decimals)
}

/**
 * Склонение существительных
 * @param {number} count - Количество
 * @param {string} one - Форма для 1 (например, "шаблон")
 * @param {string} few - Форма для 2-4 (например, "шаблона")
 * @param {string} many - Форма для 5+ (например, "шаблонов")
 * @returns {string} - Правильная форма слова
 */
export function pluralize(count, one, few, many) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few
  } else {
    return many
  }
}

/**
 * Форматирование количества с правильным склонением
 * @param {number} count - Количество
 * @param {string} one - Форма для 1
 * @param {string} few - Форма для 2-4
 * @param {string} many - Форма для 5+
 * @returns {string} - Число с правильным склонением
 */
export function formatCount(count, one, few, many) {
  return `${count} ${pluralize(count, one, few, many)}`
}

/**
 * Форматирование телефона
 * @param {string} phone - Номер телефона
 * @returns {string} - Отформатированный номер
 */
export function formatPhone(phone) {
  if (!phone) return ''

  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '')

  // Форматируем как +7 (999) 123-45-67
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`
  } else if (cleaned.length === 10) {
    return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`
  }

  return phone
}

/**
 * Обрезка текста с добавлением многоточия
 * @param {string} text - Текст
 * @param {number} maxLength - Максимальная длина
 * @returns {string} - Обрезанный текст
 */
export function truncate(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Форматирование размера файла
 * @param {number} bytes - Размер в байтах
 * @returns {string} - Отформатированный размер
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Форматирование процентов
 * @param {number} value - Значение (0-100)
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} - Отформатированные проценты
 */
export function formatPercent(value, decimals = 0) {
  if (value === null || value === undefined) return '0%'
  return `${value.toFixed(decimals)}%`
}

/**
 * Форматирование относительного времени (например, "2 часа назад")
 * @param {string|Date} date - Дата
 * @returns {string} - Относительное время
 */
export function formatRelativeTime(date) {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now - dateObj
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'только что'
  } else if (diffMin < 60) {
    return `${diffMin} ${pluralize(diffMin, 'минуту', 'минуты', 'минут')} назад`
  } else if (diffHour < 24) {
    return `${diffHour} ${pluralize(diffHour, 'час', 'часа', 'часов')} назад`
  } else if (diffDay < 7) {
    return `${diffDay} ${pluralize(diffDay, 'день', 'дня', 'дней')} назад`
  } else {
    return formatDate(dateObj, 'short')
  }
}