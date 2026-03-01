import pool from '../config/database.js'
import { TEMPLATE_STATUS } from '../config/constants.js'

// In-memory кеш — статистика меняется редко, нет смысла считать COUNT при каждом запросе.
// Структура: { data, expiresAt }
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 минут

const getCached = (key) => {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

const setCached = (key, data) => {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL })
}

export const getPlatformStats = async () => {
  const cached = getCached('platform_stats')
  if (cached) return cached

  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM quest_templates WHERE status = $1)             as total_templates,
        (SELECT COUNT(*) FROM authors WHERE total_templates > 0)             as total_authors,
        (SELECT COUNT(*) FROM orders WHERE status = 'completed')             as total_orders,
        (SELECT AVG(rating) FROM quest_templates WHERE status = $1)          as average_rating,
        (SELECT SUM(views_count) FROM quest_templates WHERE status = $1)     as total_views
    `, [TEMPLATE_STATUS.PUBLISHED])

    const data = result.rows[0]
    setCached('platform_stats', data)
    return data
  } catch (error) {
    console.error('Stats error:', error)
    throw error
  }
}

export const getCategoryStats = async () => {
  const cached = getCached('category_stats')
  if (cached) return cached

  try {
    const result = await pool.query(`
      SELECT
        c.name,
        c.slug,
        COUNT(qt.id)         as templates_count,
        AVG(qt.rating)       as avg_rating,
        SUM(qt.orders_count) as total_orders
      FROM categories c
      LEFT JOIN quest_templates qt ON c.id = qt.category_id AND qt.status = $1
      GROUP BY c.id, c.name, c.slug
      ORDER BY templates_count DESC
    `, [TEMPLATE_STATUS.PUBLISHED])

    setCached('category_stats', result.rows)
    return result.rows
  } catch (error) {
    console.error('Category stats error:', error)
    throw error
  }
}

export const getTrendingTags = async (days = 30) => {
  const cacheKey = `trending_tags_${days}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const safeDays = parseInt(days) || 30

    const result = await pool.query(`
      SELECT
        t.name,
        t.slug,
        COUNT(DISTINCT tt.template_id) as templates_count
      FROM tags t
      JOIN template_tags tt ON t.id = tt.tag_id
      JOIN quest_templates qt ON tt.template_id = qt.id
      WHERE qt.published_at > CURRENT_DATE - ($1 || ' days')::INTERVAL
        AND qt.status = $2
      GROUP BY t.id, t.name, t.slug
      ORDER BY templates_count DESC
      LIMIT 10
    `, [safeDays, TEMPLATE_STATUS.PUBLISHED])

    setCached(cacheKey, result.rows)
    return result.rows
  } catch (error) {
    console.error('Trending tags error:', error)
    throw error
  }
}

// Сброс кеша вручную — вызывать после создания/обновления шаблонов
export const invalidateStatsCache = () => {
  cache.clear()
}
