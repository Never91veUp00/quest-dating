import pool from '../config/database.js'
import { TEMPLATE_STATUS } from '../config/constants.js'

// Получить все категории
export const getAllCategories = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(qt.id) as templates_count
      FROM categories c
      LEFT JOIN quest_templates qt ON c.id = qt.category_id AND qt.status = $1
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.position ASC
    `, [TEMPLATE_STATUS.PUBLISHED])

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    next(error)
  }
}

// Получить категорию по slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(qt.id) as templates_count
      FROM categories c
      LEFT JOIN quest_templates qt ON c.id = qt.category_id AND qt.status = $1
      WHERE c.slug = $2 AND c.is_active = true
      GROUP BY c.id
    `, [TEMPLATE_STATUS.PUBLISHED, slug])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
}