/**
 * Вспомогательные утилиты
 */

/**
 * Задержка выполнения (debounce)
 * @param {Function} func - Функция для выполнения
 * @param {number} wait - Время задержки в мс
 * @returns {Function} - Debounced функция
 */
export function debounce(func, wait = 300) {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Ограничение частоты вызова (throttle)
 * @param {Function} func - Функция для выполнения
 * @param {number} limit - Минимальный интервал между вызовами в мс
 * @returns {Function} - Throttled функция
 */
export function throttle(func, limit = 300) {
  let inThrottle
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Глубокое клонирование объекта
 * @param {any} obj - Объект для клонирования
 * @returns {any} - Клонированный объект
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }

  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Генерация случайного ID
 * @param {number} length - Длина ID
 * @returns {string} - Случайный ID
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Генерация UUID v4
 * @returns {string} - UUID
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Генерация slug из строки
 * @param {string} text - Исходный текст
 * @returns {string} - Slug
 */
export function generateSlug(text) {
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  return text
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

/**
 * Копирование текста в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} - Успешно ли скопировано
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (err) {
        document.body.removeChild(textArea)
        return false
      }
    }
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Скачивание файла
 * @param {string} url - URL файла
 * @param {string} filename - Имя файла
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Получение параметров из URL
 * @param {string} url - URL (опционально, по умолчанию текущий)
 * @returns {object} - Объект с параметрами
 */
export function getUrlParams(url = window.location.href) {
  const params = {}
  const urlObj = new URL(url)
  
  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value
  }
  
  return params
}

/**
 * Обновление параметра в URL без перезагрузки
 * @param {string} key - Ключ параметра
 * @param {string} value - Значение параметра
 */
export function updateUrlParam(key, value) {
  const url = new URL(window.location.href)
  
  if (value) {
    url.searchParams.set(key, value)
  } else {
    url.searchParams.delete(key)
  }
  
  window.history.pushState({}, '', url)
}

/**
 * Проверка на мобильное устройство
 * @returns {boolean} - Мобильное устройство?
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Проверка поддержки touch событий
 * @returns {boolean} - Поддерживаются ли touch события
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Получение случайного элемента из массива
 * @param {Array} array - Массив
 * @returns {any} - Случайный элемент
 */
export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Перемешивание массива
 * @param {Array} array - Массив
 * @returns {Array} - Перемешанный массив
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

/**
 * Группировка массива по ключу
 * @param {Array} array - Массив объектов
 * @param {string} key - Ключ для группировки
 * @returns {object} - Сгруппированные объекты
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    
    result[groupKey].push(item)
    return result
  }, {})
}

/**
 * Удаление дубликатов из массива
 * @param {Array} array - Массив
 * @param {string} key - Ключ для сравнения (для массива объектов)
 * @returns {Array} - Массив без дубликатов
 */
export function uniqueArray(array, key = null) {
  if (key) {
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }
  
  return [...new Set(array)]
}

/**
 * Сортировка массива объектов по ключу
 * @param {Array} array - Массив объектов
 * @param {string} key - Ключ для сортировки
 * @param {string} order - Порядок ('asc' или 'desc')
 * @returns {Array} - Отсортированный массив
 */
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Задержка выполнения
 * @param {number} ms - Миллисекунды
 * @returns {Promise} - Promise с задержкой
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Проверка на пустой объект
 * @param {object} obj - Объект
 * @returns {boolean} - Объект пустой?
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0
}

/**
 * Безопасное получение вложенного свойства
 * @param {object} obj - Объект
 * @param {string} path - Путь к свойству (например, 'user.profile.name')
 * @param {any} defaultValue - Значение по умолчанию
 * @returns {any} - Значение свойства или defaultValue
 */
export function getNestedProperty(obj, path, defaultValue = undefined) {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }
  
  return result !== undefined ? result : defaultValue
}

/**
 * Капитализация первой буквы строки
 * @param {string} str - Строка
 * @returns {string} - Строка с заглавной первой буквой
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
/**
 * Преобразует относительный URL загруженного файла в абсолютный с хостом бэкенда.
 * /uploads/... → http://localhost:5000/uploads/...
 * Полные http-ссылки возвращаются без изменений.
 */
const _API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

export function toAbsoluteUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // Only prepend backend host for uploaded files; /images/ and /templates/ are frontend public assets
  if (url.startsWith('/uploads/')) return _API_BASE + url
  return url
}