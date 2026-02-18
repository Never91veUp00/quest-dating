import pool from '../config/database.js'

// Получить общую статистику платформы
export const getPlatformStats = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM quest_templates WHERE status = 'published') as total_templates,
        (SELECT COUNT(*) FROM authors WHERE total_templates > 0) as total_authors,
        (SELECT COUNT(*) FROM orders WHERE status = 'completed') as total_orders,
        (SELECT AVG(rating) FROM quest_templates WHERE status = 'published') as average_rating,
        (SELECT SUM(views_count) FROM quest_templates WHERE status = 'published') as total_views
    `)

    return result.rows[0]
  } catch (error) {
    console.error('Stats error:', error)
    throw error
  }
}

// Получить статистику по категориям
export const getCategoryStats = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        c.name,
        c.slug,
        COUNT(qt.id) as templates_count,
        AVG(qt.rating) as avg_rating,
        SUM(qt.orders_count) as total_orders
      FROM categories c
      LEFT JOIN quest_templates qt ON c.id = qt.category_id AND qt.status = 'published'
      GROUP BY c.id, c.name, c.slug
      ORDER BY templates_count DESC
    `)

    return result.rows
  } catch (error) {
    console.error('Category stats error:', error)
    throw error
  }
}

// Получить тренды (популярные теги за период)
export const getTrendingTags = async (days = 30) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.name,
        t.slug,
        COUNT(DISTINCT tt.template_id) as templates_count
      FROM tags t
      JOIN template_tags tt ON t.id = tt.tag_id
      JOIN quest_templates qt ON tt.template_id = qt.id
      WHERE qt.published_at > CURRENT_DATE - INTERVAL '${days} days'
        AND qt.status = 'published'
      GROUP BY t.id, t.name, t.slug
      ORDER BY templates_count DESC
      LIMIT 10
    `)

    return result.rows
  } catch (error) {
    console.error('Trending tags error:', error)
    throw error
  }
}