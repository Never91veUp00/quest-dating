import pool from '../config/database.js'

// Полнотекстовый поиск по шаблонам
export const searchTemplates = async (searchQuery, options = {}) => {
  const {
    limit = 10,
    offset = 0
  } = options

  try {
    const result = await pool.query(`
      SELECT 
        qt.*,
        a.display_name as author_name,
        c.name as category_name,
        ts_rank(
          to_tsvector('russian', qt.title || ' ' || qt.description || ' ' || qt.tagline),
          plainto_tsquery('russian', $1)
        ) as rank
      FROM quest_templates qt
      LEFT JOIN authors a ON qt.author_id = a.id
      LEFT JOIN categories c ON qt.category_id = c.id
      WHERE 
        to_tsvector('russian', qt.title || ' ' || qt.description || ' ' || qt.tagline) 
        @@ plainto_tsquery('russian', $1)
        AND qt.status = 'published'
      ORDER BY rank DESC
      LIMIT $2 OFFSET $3
    `, [searchQuery, limit, offset])

    return result.rows
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

// Поиск с автодополнением
export const searchSuggestions = async (query) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT title, slug
      FROM quest_templates
      WHERE 
        title ILIKE $1
        AND status = 'published'
      LIMIT 5
    `, [`%${query}%`])

    return result.rows
  } catch (error) {
    console.error('Suggestions error:', error)
    throw error
  }
}