/**
 * Единая заглушка для всех изображений проекта.
 *
 * PLACEHOLDER        — для обложек квестов (прямоугольник 4:3)
 * AVATAR_PLACEHOLDER — для аватаров авторов (квадрат 1:1)
 *
 * Принцип работы:
 * 1. withFallback/withAvatarFallback — вызываются в :src ДО рендера.
 *    Если путь невалидный — сразу возвращают заглушку.
 *    Работает одинаково на SSR и клиенте → нет hydration mismatch → нет мигания.
 *
 * 2. onImgError/onAvatarError — @error страховка для случаев когда
 *    URL выглядит валидным но файл реально 404 на сервере.
 *    Срабатывает только на клиенте, но это нормально — это редкий edge case.
 *
 * Валидные пути изображений из БД:
 *   http(s)://...    — внешние URL (Telegram CDN, S3 и т.д.)
 *   /uploads/...     — загружено через наш сервер, проксируется Nginx/devProxy
 *
 * Всё остальное считается невалидным и заменяется заглушкой сразу.
 */

export const PLACEHOLDER        = '/images/placeholder.svg'
export const AVATAR_PLACEHOLDER = '/images/avatars/default.svg'

/**
 * Проверяет является ли путь валидным URL изображения из БД.
 * Чистая функция — не зависит от контекста Vue/Nuxt.
 */
export function isValidImageSrc(src) {
  if (!src || typeof src !== 'string' || !src.trim()) return false
  // Внешний URL — Telegram CDN, S3 и т.д.
  if (src.startsWith('http://') || src.startsWith('https://')) return true
  // Загруженный файл через наш сервер
  if (src.startsWith('/uploads/')) return true
  // Всё остальное (/templates/..., /static/..., голые имена файлов) — невалидно
  return false
}

export function useImageFallback() {
  /** Возвращает src если валидный, иначе PLACEHOLDER */
  const withFallback = (src) => isValidImageSrc(src) ? src : PLACEHOLDER

  /** Возвращает src если валидный, иначе AVATAR_PLACEHOLDER */
  const withAvatarFallback = (src) => isValidImageSrc(src) ? src : AVATAR_PLACEHOLDER

  /**
   * @error страховка — URL валидный но файл реально не существует (404).
   * data-fallback-applied предотвращает рекурсию.
   */
  const onImgError = (e) => {
    const img = e.target
    if (img.dataset.fallbackApplied) return
    img.dataset.fallbackApplied = '1'
    img.src = PLACEHOLDER
    img.classList.add('is-placeholder')
  }

  const onAvatarError = (e) => {
    const img = e.target
    if (img.dataset.fallbackApplied) return
    img.dataset.fallbackApplied = '1'
    img.src = AVATAR_PLACEHOLDER
  }

  return {
    withFallback,
    withAvatarFallback,
    isValidImageSrc,
    onImgError,
    onAvatarError,
    PLACEHOLDER,
    AVATAR_PLACEHOLDER,
  }
}