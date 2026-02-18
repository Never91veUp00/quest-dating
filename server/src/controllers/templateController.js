import pool from '../config/database.js'
import { TEMPLATE_STATUS, PAGINATION } from '../config/constants.js'

// Получить все опубликованные шаблоны
export const getAllTemplates = async (req, res, next) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      category,
      difficulty,
      location_type,
      min_price,
      max_price,
      tags,
      search,
      sort_by = 'rating', // rating, orders, newest, price
      order = 'DESC'
    } = req.query

    const offset = (page - 1) * limit

    // Базовый запрос
    let query = `
      SELECT 
        qt.*,
        a.display_name as author_name,
        a.avatar_url as author_avatar,
        a.username as author_username,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        ARRAY_AGG(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL) as tags
      FROM quest_templates qt
      LEFT JOIN authors a ON qt.author_id = a.id
      LEFT JOIN categories c ON qt.category_id = c.id
      LEFT JOIN template_tags tt ON qt.id = tt.template_id
      LEFT JOIN tags t ON tt.tag_id = t.id
      WHERE qt.status = $1
    `

    const params = [TEMPLATE_STATUS.PUBLISHED]
    let paramIndex = 2

    // Фильтр по категории
    if (category) {
      query += ` AND c.slug = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    // Фильтр по сложности
    if (difficulty) {
      query += ` AND qt.difficulty = $${paramIndex}`
      params.push(difficulty)
      paramIndex++
    }

    // Фильтр по типу локации
    if (location_type) {
      query += ` AND qt.location_type = $${paramIndex}`
      params.push(location_type)
      paramIndex++
    }

    // Фильтр по цене
    if (min_price) {
      query += ` AND qt.base_price >= $${paramIndex}`
      params.push(parseInt(min_price) * 100) // конвертируем в копейки
      paramIndex++
    }

    if (max_price) {
      query += ` AND qt.base_price <= $${paramIndex}`
      params.push(parseInt(max_price) * 100)
      paramIndex++
    }

    // Поиск
    if (search) {
      query += ` AND (
        qt.title ILIKE $${paramIndex} OR 
        qt.description ILIKE $${paramIndex} OR
        qt.tagline ILIKE $${paramIndex}
      )`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Группировка
    query += ` GROUP BY qt.id, a.display_name, a.avatar_url, a.username, c.name, c.slug, c.color`

    // Фильтр по тегам (после GROUP BY)
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      query += ` HAVING COUNT(DISTINCT t.id) FILTER (WHERE t.slug = ANY($${paramIndex})) = $${paramIndex + 1}`
      params.push(tagArray, tagArray.length)
      paramIndex += 2
    }

    // Сортировка
    const sortMap = {
      rating: 'qt.rating',
      orders: 'qt.orders_count',
      newest: 'qt.published_at',
      price: 'qt.base_price'
    }
    const sortColumn = sortMap[sort_by] || sortMap.rating
    query += ` ORDER BY ${sortColumn} ${order}`

    // Пагинация
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    // Выполнение запроса
    const result = await pool.query(query, params)

    // Подсчет общего количества
    const countQuery = `
      SELECT COUNT(DISTINCT qt.id) as total
      FROM quest_templates qt
      LEFT JOIN categories c ON qt.category_id = c.id
      WHERE qt.status = $1
      ${category ? `AND c.slug = '${category}'` : ''}
      ${difficulty ? `AND qt.difficulty = '${difficulty}'` : ''}
      ${location_type ? `AND qt.location_type = '${location_type}'` : ''}
      ${min_price ? `AND qt.base_price >= ${parseInt(min_price) * 100}` : ''}
      ${max_price ? `AND qt.base_price <= ${parseInt(max_price) * 100}` : ''}
      ${search ? `AND (qt.title ILIKE '%${search}%' OR qt.description ILIKE '%${search}%')` : ''}
    `

    const countResult = await pool.query(countQuery, [TEMPLATE_STATUS.PUBLISHED])
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

// Получить популярные шаблоны
export const getPopularTemplates = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query

    const result = await pool.query(`
      SELECT 
        qt.*,
        a.display_name as author_name,
        a.avatar_url as author_avatar,
        a.username as author_username,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        ARRAY_AGG(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL) as tags
      FROM quest_templates qt
      LEFT JOIN authors a ON qt.author_id = a.id
      LEFT JOIN categories c ON qt.category_id = c.id
      LEFT JOIN template_tags tt ON qt.id = tt.template_id
      LEFT JOIN tags t ON tt.tag_id = t.id
      WHERE qt.status = $1
      GROUP BY qt.id, a.display_name, a.avatar_url, a.username, c.name, c.slug, c.color
      ORDER BY qt.orders_count DESC, qt.rating DESC
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

// Получить избранные шаблоны
export const getFeaturedTemplates = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query

    const result = await pool.query(`
      SELECT 
        qt.*,
        a.display_name as author_name,
        a.avatar_url as author_avatar,
        a.username as author_username,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        ARRAY_AGG(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL) as tags
      FROM quest_templates qt
      LEFT JOIN authors a ON qt.author_id = a.id
      LEFT JOIN categories c ON qt.category_id = c.id
      LEFT JOIN template_tags tt ON qt.id = tt.template_id
      LEFT JOIN tags t ON tt.tag_id = t.id
      WHERE qt.status = $1 AND qt.is_premium = true
      GROUP BY qt.id, a.display_name, a.avatar_url, a.username, c.name, c.slug, c.color
      ORDER BY qt.rating DESC
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

// Получить новые шаблоны
export const getNewestTemplates = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query

    const result = await pool.query(`
      SELECT 
        qt.*,
        a.display_name as author_name,
        a.avatar_url as author_avatar,
        a.username as author_username,
        c.name as category_name,
        c.slug as category_slug,
        ARRAY_AGG(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL) as tags
      FROM quest_templates qt
      LEFT JOIN authors a ON qt.author_id = a.id
      LEFT JOIN categories c ON qt.category_id = c.id
      LEFT JOIN template_tags tt ON qt.id = tt.template_id
      LEFT JOIN tags t ON tt.tag_id = t.id
      WHERE qt.status = $1
      GROUP BY qt.id, a.display_name, a.avatar_url, a.username, c.name, c.slug
      ORDER BY qt.published_at DESC
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

// Получить шаблон по slug
export const getTemplateBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const result = await pool.query(`
      SELECT 
        qt.*,
        a.id as author_id,
        a.display_name as author_name,
        a.avatar_url as author_avatar,
        a.username as author_username,
        a.bio as author_bio,
        a.total_templates as author_total_templates,
        a.average_rating as author_average_rating,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        c.icon as category_icon,
        ARRAY_AGG(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL) as tags,
        (
          SELECT json_agg(json_build_object(
            'id', r.id,
            'client_name', r.client_name,
            'rating', r.rating,
            'title', r.title,
            'comment', r.comment,
            'images', r.images,
            'is_verified', r.is_verified,
            'created_at', r.created_at
          ) ORDER BY r.created_at DESC)
          FROM reviews r
          WHERE r.template_id = qt.id
        ) as reviews
      FROM quest_templates qt
      LEFT JOIN authors a ON qt.author_id = a.id
      LEFT JOIN categories c ON qt.category_id = c.id
      LEFT JOIN template_tags tt ON qt.id = tt.template_id
      LEFT JOIN tags t ON tt.tag_id = t.id
      WHERE qt.slug = $1 AND qt.status = $2
      GROUP BY qt.id, a.id, a.display_name, a.avatar_url, a.username, a.bio, 
               a.total_templates, a.average_rating, c.name, c.slug, c.color, c.icon
    `, [slug, TEMPLATE_STATUS.PUBLISHED])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Шаблон не найден'
      })
    }

    // Увеличить счетчик просмотров
    await pool.query(
      'UPDATE quest_templates SET views_count = views_count + 1 WHERE id = $1',
      [result.rows[0].id]
    )

    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
}

// Получить похожие шаблоны
export const getSimilarTemplates = async (req, res, next) => {
  try {
    const { slug } = req.params
    const { limit = 4 } = req.query

    // Сначала получаем текущий шаблон
    const currentTemplate = await pool.query(
      'SELECT id, category_id FROM quest_templates WHERE slug = $1',
      [slug]
    )

    if (currentTemplate.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Шаблон не найден'
      })
    }

    const { id, category_id } = currentTemplate.rows[0]

    // Получаем похожие шаблоны из той же категории
    const result = await pool.query(`
      SELECT 
        qt.*,
        a.display_name as author_name,
        a.avatar_url as author_avatar,
        a.username as author_username,
        c.name as category_name,
        c.slug as category_slug,
        ARRAY_AGG(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL) as tags
      FROM quest_templates qt
      LEFT JOIN authors a ON qt.author_id = a.id
      LEFT JOIN categories c ON qt.category_id = c.id
      LEFT JOIN template_tags tt ON qt.id = tt.template_id
      LEFT JOIN tags t ON tt.tag_id = t.id
      WHERE qt.id != $1 
        AND qt.category_id = $2 
        AND qt.status = $3
      GROUP BY qt.id, a.display_name, a.avatar_url, a.username, c.name, c.slug
      ORDER BY qt.rating DESC
      LIMIT $4
    `, [id, category_id, TEMPLATE_STATUS.PUBLISHED, limit])

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    next(error)
  }
}