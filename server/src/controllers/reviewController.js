import pool from '../config/database.js'
import { validationResult } from 'express-validator'
import { RATING_RANGE } from '../config/constants.js'

// Получить отзывы для шаблона
export const getTemplateReviews = async (req, res, next) => {
  try {
    const { templateId } = req.params
    const { 
      page = 1, 
      limit = 10,
      sort_by = 'newest' // newest, rating, helpful
    } = req.query

    const offset = (page - 1) * limit

    const sortMap = {
      newest: 'r.created_at DESC',
      rating: 'r.rating DESC',
      helpful: 'r.helpful_count DESC'
    }
    const sortClause = sortMap[sort_by] || sortMap.newest

    const result = await pool.query(`
      SELECT * FROM reviews
      WHERE template_id = $1
      ORDER BY ${sortClause}
      LIMIT $2 OFFSET $3
    `, [templateId, limit, offset])

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM reviews WHERE template_id = $1',
      [templateId]
    )

    const total = parseInt(countResult.rows[0].total)

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

// Создать отзыв
export const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { template_id, client_name, client_email, rating, title, comment, images } = req.body

    // Проверка рейтинга
    if (rating < RATING_RANGE.MIN || rating > RATING_RANGE.MAX) {
      return res.status(400).json({
        success: false,
        message: `Рейтинг должен быть от ${RATING_RANGE.MIN} до ${RATING_RANGE.MAX}`
      })
    }

    const result = await pool.query(`
      INSERT INTO reviews (template_id, client_name, client_email, rating, title, comment, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [template_id, client_name, client_email, rating, title, comment, JSON.stringify(images || [])])

    res.status(201).json({
      success: true,
      message: 'Отзыв успешно добавлен',
      data: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
}

// Отметить отзыв как полезный
export const markReviewHelpful = async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await pool.query(`
      UPDATE reviews 
      SET helpful_count = helpful_count + 1
      WHERE id = $1
      RETURNING *
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Отзыв не найден'
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