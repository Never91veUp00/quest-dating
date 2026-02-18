import pool from '../config/database.js'
import { TEMPLATE_STATUS, PAGINATION } from '../config/constants.js'

// Получить всех авторов
export const getAllAuthors = async (req, res, next) => {
  try {
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      sort_by = 'rating' // rating, templates, orders
    } = req.query

    const offset = (page - 1) * limit

    const sortMap = {
      rating: 'a.average_rating',
      templates: 'a.total_templates',
      orders: 'total_orders'
    }
    const sortColumn = sortMap[sort_by] || sortMap.rating

    const result = await pool.query(`
      SELECT 
        a.*,
        COUNT(qt.id) as published_templates,
        SUM(qt.orders_count) as total_orders
      FROM authors a
      LEFT JOIN quest_templates qt ON a.id = qt.author_id AND qt.status = $1
      GROUP BY a.id
      HAVING COUNT(qt.id) > 0
      ORDER BY ${sortColumn} DESC
      LIMIT $2 OFFSET $3
    `, [TEMPLATE_STATUS.PUBLISHED, limit, offset])

    // Подсчет общего количества
    const countResult = await pool.query(`
      SELECT COUNT(DISTINCT a.id) as total
      FROM authors a
      LEFT JOIN quest_templates qt ON a.id = qt.author_id AND qt.status = $1
      WHERE qt.id IS NOT NULL
    `, [TEMPLATE_STATUS.PUBLISHED])

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

// Получить топ авторов
export const getTopAuthors = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query

    const result = await pool.query(`
      SELECT 
        a.*,
        COUNT(qt.id) as published_templates,
        SUM(qt.orders_count) as total_orders
      FROM authors a
      LEFT JOIN quest_templates qt ON a.id = qt.author_id AND qt.status = $1
      GROUP BY a.id
      HAVING COUNT(qt.id) > 0
      ORDER BY a.average_rating DESC, total_orders DESC
      LIMIT $2
    `, [TEMPLATE_STATUS.PUBLISHED, limit])

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    next(error)
  }
}

// Получить автора по username
export const getAuthorByUsername = async (req, res, next) => {
  try {
    const { username } = req.params

    // Информация об авторе
    const authorResult = await pool.query(`
      SELECT 
        a.*,
        COUNT(qt.id) as published_templates,
        SUM(qt.orders_count) as total_orders
      FROM authors a
      LEFT JOIN quest_templates qt ON a.id = qt.author_id AND qt.status = $1
      WHERE a.username = $2
      GROUP BY a.id
    `, [TEMPLATE_STATUS.PUBLISHED, username])

    if (authorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Автор не найден'
      })
    }

    const author = authorResult.rows[0]

    // Шаблоны автора
    const templatesResult = await pool.query(`
      SELECT 
        qt.*,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        ARRAY_AGG(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL) as tags
      FROM quest_templates qt
      LEFT JOIN categories c ON qt.category_id = c.id
      LEFT JOIN template_tags tt ON qt.id = tt.template_id
      LEFT JOIN tags t ON tt.tag_id = t.id
      WHERE qt.author_id = $1 AND qt.status = $2
      GROUP BY qt.id, c.name, c.slug, c.color
      ORDER BY qt.rating DESC
    `, [author.id, TEMPLATE_STATUS.PUBLISHED])

    res.json({
      success: true,
      data: {
        ...author,
        templates: templatesResult.rows
      }
    })
  } catch (error) {
    next(error)
  }
}

// Создать автора (для будущей регистрации)
export const createAuthor = async (req, res, next) => {
  try {
    const { username, email, display_name, bio, avatar_url, website, social_links } = req.body

    const result = await pool.query(`
      INSERT INTO authors (username, email, display_name, bio, avatar_url, website, social_links)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [username, email, display_name, bio, avatar_url, website, JSON.stringify(social_links)])

    res.status(201).json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'Автор с таким username или email уже существует'
      })
    }
    next(error)
  }
}