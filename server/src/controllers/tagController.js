import pool from '../config/database.js'

// Получить все теги
export const getAllTags = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tags
      WHERE usage_count > 0
      ORDER BY usage_count DESC, name ASC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    next(error)
  }
}

// Получить популярные теги
export const getPopularTags = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query

    const result = await pool.query(`
      SELECT * FROM tags
      WHERE usage_count > 0
      ORDER BY usage_count DESC
      LIMIT $1
    `, [parseInt(limit)])

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    next(error)
  }
}