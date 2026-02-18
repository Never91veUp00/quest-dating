// Константы приложения

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const TEMPLATE_STATUS = {
  DRAFT: 'draft',
  REVIEW: 'review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
}

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert'
}

export const LOCATION_TYPES = {
  CITY: 'city',
  INDOOR: 'indoor',
  PARK: 'park',
  UNIVERSAL: 'universal'
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
}

export const PRICE_RANGES = {
  FREE: { min: 0, max: 0 },
  BUDGET: { min: 0, max: 200000 }, // до 2000 руб
  MEDIUM: { min: 200000, max: 500000 }, // 2000-5000 руб
  PREMIUM: { min: 500000, max: 1000000 } // 5000-10000 руб
}

export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_SIZE: 5 * 1024 * 1024 // 5MB
}

export const RATING_RANGE = {
  MIN: 1,
  MAX: 5
}