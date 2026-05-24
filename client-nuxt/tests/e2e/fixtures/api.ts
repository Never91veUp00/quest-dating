// Фикстуры для мокирования публичных API-эндпоинтов в E2E тестах.
// Используются глобально через mockPublicApi() чтобы не нагружать
// сервер и не выбивать rate limiter при повторных запусках тестов.

export const MOCK_TEMPLATE = {
  id: 1,
  slug: 'romanticheskiy-kvest',
  title: 'Романтический квест для двоих',
  description: 'Захватывающее приключение для влюблённых',
  short_description: 'Романтика и приключения',
  base_price: 350000,
  duration_minutes: 120,
  difficulty: 'easy',
  location_type: 'outdoor',
  max_participants: 2,
  is_published: true,
  is_featured: true,
  rating: 4.9,
  orders_count: 42,
  reviews_count: 18,
  preview_image: '/uploads/quest-preview.jpg',
  author_name: 'Лиза Петри',
  author_avatar: null,
  author_username: 'liza',
  category_name: 'Романтика',
  category_slug: 'romantika',
  category_color: '#e53e3e',
  tags: [{ id: 1, name: 'романтика', slug: 'romantika' }],
  features: [],
  faq: [
    { question: 'Как это работает?', answer: 'Вы получаете персональный сценарий на email' },
    { question: 'Сколько времени занимает?', answer: 'Около 2 часов' },
    { question: 'Нужна ли подготовка?', answer: 'Нет, всё включено' },
    { question: 'Можно ли изменить сценарий?', answer: 'Да, я адаптирую под вас' },
  ],
  content: [],
  steps: [],
}

export const MOCK_CATEGORY = {
  id: 1,
  name: 'Романтика',
  slug: 'romantika',
  description: 'Романтические квесты для пар',
  color: '#e53e3e',
  icon: '💑',
  templates_count: 5,
}

export const MOCK_REVIEW = {
  id: 1,
  author_name: 'Анна',
  rating: 5,
  text: 'Незабываемый вечер! Спасибо Лизе за идеальный квест.',
  created_at: '2025-01-15T10:00:00Z',
  template_title: 'Романтический квест',
}

export const MOCK_STATS = {
  total_templates: 12,
  total_orders: 89,
  total_reviews: 34,
  average_rating: 4.9,
}

// Формирует объект всех мок-ответов по URL-паттернам
export function buildApiMocks() {
  return [
    {
      pattern: '**/api/stats',
      body: { success: true, data: MOCK_STATS },
    },
    {
      pattern: '**/api/categories',
      body: { success: true, data: [MOCK_CATEGORY] },
    },
    {
      pattern: '**/api/reviews/featured**',
      body: { success: true, data: [MOCK_REVIEW] },
    },
    {
      pattern: '**/api/templates/featured**',
      body: { success: true, data: [MOCK_TEMPLATE] },
    },
    {
      pattern: '**/api/templates/popular**',
      body: { success: true, data: [MOCK_TEMPLATE] },
    },
    {
      pattern: '**/api/tags/popular**',
      body: { success: true, data: [{ id: 1, name: 'романтика', slug: 'romantika', count: 5 }] },
    },
    {
      // Каталог: GET /templates?... — фильтрация, пагинация
      pattern: '**/api/templates?**',
      body: {
        success: true,
        data: [MOCK_TEMPLATE],
        pagination: { total: 1, page: 1, limit: 12, totalPages: 1 },
      },
    },
    {
      // Отдельный квест по slug
      pattern: '**/api/templates/romanticheskiy-kvest',
      body: { success: true, data: MOCK_TEMPLATE },
    },
  ]
}