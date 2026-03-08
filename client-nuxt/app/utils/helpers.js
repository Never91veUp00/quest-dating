/**
 * Вспомогательные утилиты
 * Nuxt 4 версия: window/navigator обёрнуты в import.meta.client
 */

/**
 * Задержка выполнения (debounce)
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
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date)  return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Генерация случайного ID
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
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Генерация slug из строки (с транслитерацией)
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
 * Только при action пользователя — всегда client-side, guard не нужен
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.cssText = 'position:fixed;left:-999999px;top:-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } finally {
      document.body.removeChild(textArea)
    }
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Скачивание файла
 * Только при action пользователя — guard не нужен
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a')
  link.href     = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Получение параметров из URL
 * ✅ ИСПРАВЛЕНО: window.location.href → useRequestURL() на сервере
 */
export function getUrlParams(url) {
  // На сервере window недоступен — используем переданный url или возвращаем {}
  const targetUrl = url ?? (import.meta.client ? window.location.href : '')
  if (!targetUrl) return {}
  try {
    return Object.fromEntries(new URL(targetUrl).searchParams.entries())
  } catch {
    return {}
  }
}

/**
 * Обновление параметра в URL без перезагрузки
 * ✅ ИСПРАВЛЕНО: guard import.meta.client
 */
export function updateUrlParam(key, value) {
  if (!import.meta.client) return
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
 * ✅ ИСПРАВЛЕНО: guard import.meta.client
 */
export function isMobile() {
  if (!import.meta.client) return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(navigator.userAgent)
}

/**
 * Проверка поддержки touch событий
 * ✅ ИСПРАВЛЕНО: guard import.meta.client
 */
export function isTouchDevice() {
  if (!import.meta.client) return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Случайный элемент из массива
 */
export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Перемешивание массива (Fisher-Yates)
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
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) result[groupKey] = []
    result[groupKey].push(item)
    return result
  }, {})
}

/**
 * Удаление дубликатов из массива
 */
export function uniqueArray(array, key = null) {
  if (key) {
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  }
  return [...new Set(array)]
}

/**
 * Сортировка массива объектов по ключу
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
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Проверка на пустой объект
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0
}

/**
 * Безопасное получение вложенного свойства
 */
export function getNestedProperty(obj, path, defaultValue = undefined) {
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result === null || result === undefined) return defaultValue
    result = result[key]
  }
  return result !== undefined ? result : defaultValue
}

/**
 * Капитализация первой буквы строки
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Преобразует относительный URL загруженного файла в абсолютный с хостом бэкенда.
 * /uploads/... → http://localhost:5000/uploads/...
 * Полные http-ссылки возвращаются без изменений.
 * ✅ ИСПРАВЛЕНО: import.meta.env.VITE_API_URL → useRuntimeConfig() для SSR
 */
export function toAbsoluteUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/uploads/')) {
    // На сервере берём из runtimeConfig, на клиенте — из public
    const config  = useRuntimeConfig()
    const apiBase = process.server
      ? config.apiBaseInternal
      : config.public.apiBase
    const backendBase = apiBase.replace('/api', '')
    return backendBase + url
  }
  return url
}