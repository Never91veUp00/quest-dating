// Action types для Quest Store
export const QUEST_ACTIONS = {
  // Templates
  FETCH_TEMPLATES: 'fetchTemplates',
  FETCH_POPULAR_TEMPLATES: 'fetchPopularTemplates',
  FETCH_FEATURED_TEMPLATES: 'fetchFeaturedTemplates',
  FETCH_NEWEST_TEMPLATES: 'fetchNewestTemplates',
  FETCH_TEMPLATE: 'fetchTemplate',
  FETCH_SIMILAR_TEMPLATES: 'fetchSimilarTemplates',

  // Authors
  FETCH_AUTHORS: 'fetchAuthors',
  FETCH_TOP_AUTHORS: 'fetchTopAuthors',
  FETCH_AUTHOR: 'fetchAuthor',

  // Categories
  FETCH_CATEGORIES: 'fetchCategories',
  FETCH_CATEGORY: 'fetchCategory',

  // Tags
  FETCH_TAGS: 'fetchTags',
  FETCH_POPULAR_TAGS: 'fetchPopularTags',

  // Reviews
  ADD_REVIEW: 'addReview',
  MARK_REVIEW_HELPFUL: 'markReviewHelpful',

  // Orders
  CREATE_ORDER: 'createOrder',

  // Filters
  SET_FILTER: 'setFilter',
  RESET_FILTERS: 'resetFilters',

  // Pagination
  SET_TEMPLATES_PAGE: 'setTemplatesPage',
  SET_AUTHORS_PAGE: 'setAuthorsPage',

  // Clear
  CLEAR_CURRENT_TEMPLATE: 'clearCurrentTemplate',
  CLEAR_CURRENT_AUTHOR: 'clearCurrentAuthor',
  CLEAR_CURRENT_CATEGORY: 'clearCurrentCategory',
  CLEAR_ERROR: 'clearError'
}

// Action types для Auth Store
export const AUTH_ACTIONS = {
  LOGIN: 'login',
  REGISTER: 'register',
  LOGOUT: 'logout',
  CHECK_AUTH: 'checkAuth',
  CLEAR_ERROR: 'clearError'
}

// Action types для Cart Store
export const CART_ACTIONS = {
  ADD_ITEM: 'addItem',
  REMOVE_ITEM: 'removeItem',
  UPDATE_QUANTITY: 'updateQuantity',
  CLEAR_CART: 'clearCart',
  UPDATE_TOTAL: 'updateTotal'
}

// Getter types
export const QUEST_GETTERS = {
  HAS_TEMPLATES: 'hasTemplates',
  TEMPLATES_BY_CATEGORY: 'templatesByCategory',
  TEMPLATE_BY_SLUG: 'templateBySlug',
  FILTERED_TEMPLATES: 'filteredTemplates',
  ACTIVE_FILTERS_COUNT: 'activeFiltersCount',
  HAS_ACTIVE_FILTERS: 'hasActiveFilters',
  AUTHOR_BY_USERNAME: 'authorByUsername',
  CATEGORY_BY_SLUG: 'categoryBySlug'
}

export const AUTH_GETTERS = {
  IS_AUTHOR: 'isAuthor',
  IS_ADMIN: 'isAdmin',
  USER_NAME: 'userName'
}

export const CART_GETTERS = {
  ITEM_COUNT: 'itemCount',
  CART_TOTAL: 'cartTotal',
  HAS_ITEMS: 'hasItems'
}

// Константы для фильтров
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert'
}

export const LOCATION_TYPES = {
  CITY: 'city',
  PARK: 'park',
  INDOOR: 'indoor',
  UNIVERSAL: 'universal'
}

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  RATING: 'rating',
  ORDERS: 'orders',
  PRICE: 'price'
}

export const ORDER_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
}