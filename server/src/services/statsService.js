import pool from '../config/database.js'
import { TEMPLATE_STATUS } from '../config/constants.js'

export const getPlatformStats = async () => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM quest_templates WHERE status = $1)             as total_templates,
        (SELECT COUNT(*) FROM authors WHERE total_templates > 0)             as total_authors,
        (SELECT COUNT(*) FROM orders WHERE status = 'completed')             as total_orders,
        (SELECT AVG(rating) FROM quest_templates WHERE status = $1)          as average_rating,
        (SELECT SUM(views_count) FROM quest_templates WHERE status = $1)     as total_views
    `, [TEMPLATE_STATUS.PUBLISHED])

    return result.rows[0]
  } catch (error) {
    console.error('Stats error:', error)
    throw error
  }
}

export const getCategoryStats = async () => {
  try {
    const result = await pool.query(`
      SELECT
        c.name,
        c.slug,
        COUNT(qt.id)       as templates_count,
        AVG(qt.rating)     as avg_rating,
        SUM(qt.orders_count) as total_orders
      FROM categories c
      LEFT JOIN quest_templates qt ON c.id = qt.category_id AND qt.status = $1
      GROUP BY c.id, c.name, c.slug
      ORDER BY templates_count DESC
    `, [TEMPLATE_STATUS.PUBLISHED])

    return result.rows
  } catch (error) {
    console.error('Category stats error:', error)
    throw error
  }
}

export const getTrendingTags = async (days = 30) => {
  try {
    // days передаём параметром — защита от SQL-инъекции
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

    return result.rows
  } catch (error) {
    console.error('Trending tags error:', error)
    throw error
  }
}