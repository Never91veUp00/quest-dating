import pool from '../config/database.js'
import { TEMPLATE_STATUS, PAGINATION } from '../config/constants.js'

// ─── Утилиты ────────────────────────────────────────────────────────────────

// Нормализует числовые поля — PostgreSQL возвращает их как строки
const normalizeTemplate = (template) => ({
  ...template,
  base_price: parseFloat(template.base_price) || 0,
  rating: parseFloat(template.rating) || 0,
  orders_count: parseInt(template.orders_count) || 0,
  duration_minutes: parseInt(template.duration_minutes) || 0,
  reviews_count: parseInt(template.reviews_count) || 0
})

// Базовый SELECT с JOIN'ами — используется во всех запросах списка
const BASE_SELECT = `
  SELECT
    qt.*,
    a.display_name as author_name,
    a.avatar_url   as author_avatar,
    a.username     as author_username,
    c.name         as category_name,
    c.slug         as category_slug,
    c.color        as category_color,
    ARRAY_AGG(
      DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
    ) FILTER (WHERE t.id IS NOT NULL) as tags
  FROM quest_templates qt
  LEFT JOIN authors       a  ON qt.author_id  = a.id
  LEFT JOIN categories    c  ON qt.category_id = c.id
  LEFT JOIN template_tags tt ON qt.id          = tt.template_id
  LEFT JOIN tags          t  ON tt.tag_id      = t.id
`

const BASE_GROUP_BY = `
  GROUP BY qt.id, a.display_name, a.avatar_url, a.username,
           c.name, c.slug, c.color
`

// Строит WHERE-условия по фильтрам и возвращает { conditions, params }
// startIndex — с какого $N начинать нумерацию параметров
const buildFilterConditions = (filters, startIndex = 2) => {
  const { category, difficulty, location_type, min_price, max_price, search } = filters
  const conditions = []
  const params = []
  let i = startIndex

  if (category) {
    conditions.push(`c.slug = $${i++}`)
    params.push(category)
  }

  if (difficulty) {
    conditions.push(`qt.difficulty = $${i++}`)
    params.push(difficulty)
  }

  if (location_type) {
    conditions.push(`qt.location_type = $${i++}`)
    params.push(location_type)
  }

  if (min_price) {
    conditions.push(`qt.base_price >= $${i++}`)
    params.push(parseInt(min_price) * 100)
  }

  if (max_price) {
    conditions.push(`qt.base_price <= $${i++}`)
    params.push(parseInt(max_price) * 100)
  }

  if (search) {
    conditions.push(`(
      qt.title       ILIKE $${i}   OR
      qt.description ILIKE $${i}   OR
      qt.tagline     ILIKE $${i}
    )`)
    params.push(`%${search}%`)
    i++
  }

  return { conditions, params, nextIndex: i }
}

// Допустимые значения для сортировки — защита от SQL-инъекций
const SORT_MAP = {
  rating:  'qt.rating',
  orders:  'qt.orders_count',
  newest:  'qt.published_at',
  price:   'qt.base_price'
}
const ALLOWED_ORDER = new Set(['ASC', 'DESC'])

// ─── Контроллеры ────────────────────────────────────────────────────────────

// Получить все опубликованные шаблоны (с фильтрами, сортировкой, пагинацией)
export const getAllTemplates = async (req, res, next) => {
  try {
    const {
      page:     _page     = PAGINATION.DEFAULT_PAGE,
      limit:    _limit    = PAGINATION.DEFAULT_LIMIT,
      category,
      difficulty,
      location_type,
      min_price,
      max_price,
      tags,
      search,
      sort_by  = 'rating',
      order    = 'DESC'
    } = req.query

    const page  = parseInt(_page,  10) || PAGINATION.DEFAULT_PAGE
    const limit = parseInt(_limit, 10) || PAGINATION.DEFAULT_LIMIT
    const offset = (page - 1) * limit

    // Валидация сортировки — не доверяем query-параметрам
    const sortColumn  = SORT_MAP[sort_by] || SORT_MAP.rating
    const sortOrder   = ALLOWED_ORDER.has(order?.toUpperCase()) ? order.toUpperCase() : 'DESC'

    // Строим фильтры один раз — используем для обоих запросов
    const filters = { category, difficulty, location_type, min_price, max_price, search }
    const { conditions, params: filterParams, nextIndex } = buildFilterConditions(filters)

    const whereClause = conditions.length
      ? 'AND ' + conditions.join(' AND ')
      : ''

    // ── Основной запрос ──
    const mainParams = [TEMPLATE_STATUS.PUBLISHED, ...filterParams]
    let mainQuery = `
      ${BASE_SELECT}
      WHERE qt.status = $1 ${whereClause}
      ${BASE_GROUP_BY}
    `

    // Фильтр по тегам (после GROUP BY)
    let tagIndex = nextIndex
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      mainQuery += ` HAVING COUNT(DISTINCT t.id) FILTER (WHERE t.slug = ANY($${tagIndex})) = $${tagIndex + 1}`
      mainParams.push(tagArray, tagArray.length)
      tagIndex += 2
    }

    mainQuery += ` ORDER BY ${sortColumn} ${sortOrder}`
    mainQuery += ` LIMIT $${tagIndex} OFFSET $${tagIndex + 1}`
    mainParams.push(limit, offset)

    // ── Count-запрос (те же фильтры, без JOIN тегов и сортировки) ──
    const countParams = [TEMPLATE_STATUS.PUBLISHED, ...filterParams]
    const countQuery = `
      SELECT COUNT(DISTINCT qt.id) as total
      FROM quest_templates qt
      LEFT JOIN categories c ON qt.category_id = c.id
      WHERE qt.status = $1 ${whereClause}
    `

    // Выполняем оба запроса параллельно
    const [result, countResult] = await Promise.all([
      pool.query(mainQuery, mainParams),
      pool.query(countQuery, countParams)
    ])

    const total = parseInt(countResult.rows[0].total)

    res.json({
      success: true,
      data: result.rows.map(normalizeTemplate),
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('❌ getAllTemplates PG error:', error.code, error.message, '| params:', JSON.stringify(error))
    next(error)
  }
}

// Получить популярные шаблоны
export const getPopularTemplates = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query

    const result = await pool.query(`
      ${BASE_SELECT}
      WHERE qt.status = $1
      ${BASE_GROUP_BY}
      ORDER BY qt.orders_count DESC, qt.rating DESC
      LIMIT $2
    `, [TEMPLATE_STATUS.PUBLISHED, limit])

    res.json({ success: true, data: result.rows.map(normalizeTemplate) })
  } catch (error) {
    next(error)
  }
}

// Получить избранные шаблоны
export const getFeaturedTemplates = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query

    const result = await pool.query(`
      ${BASE_SELECT}
      WHERE qt.status = $1 AND qt.is_premium = true
      ${BASE_GROUP_BY}
      ORDER BY qt.rating DESC
      LIMIT $2
    `, [TEMPLATE_STATUS.PUBLISHED, limit])

    res.json({ success: true, data: result.rows.map(normalizeTemplate) })
  } catch (error) {
    next(error)
  }
}

// Получить новые шаблоны
export const getNewestTemplates = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query

    const result = await pool.query(`
      ${BASE_SELECT}
      WHERE qt.status = $1
      ${BASE_GROUP_BY}
      ORDER BY qt.published_at DESC
      LIMIT $2
    `, [TEMPLATE_STATUS.PUBLISHED, limit])

    res.json({ success: true, data: result.rows.map(normalizeTemplate) })
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
        a.id                   as author_id,
        a.display_name         as author_name,
        a.avatar_url           as author_avatar,
        a.username             as author_username,
        a.bio                  as author_bio,
        a.website              as author_website,
        a.social_links         as author_social_links,
        a.total_templates      as author_total_templates,
        a.average_rating       as author_average_rating,
        c.name                 as category_name,
        c.slug                 as category_slug,
        c.color                as category_color,
        c.icon                 as category_icon,
        dq.blocks              as demo_blocks,
        ARRAY_AGG(
          DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
        ) FILTER (WHERE t.id IS NOT NULL) as tags,
        (
          -- FIX: Добавлен LIMIT 20 — без него при сотнях отзывов ответ мог быть огромным.
          -- Полная пагинация отзывов доступна через /api/reviews/template/:id
          SELECT json_agg(sub.review)
          FROM (
            SELECT json_build_object(
              'id',          r.id,
              'client_name', r.client_name,
              'rating',      r.rating,
              'title',       r.title,
              'comment',     r.comment,
              'images',      r.images,
              'is_verified', r.is_verified,
              'created_at',  r.created_at
            ) AS review
            FROM reviews r
            WHERE r.template_id = qt.id
            ORDER BY r.created_at DESC
            LIMIT 20
          ) sub
        ) as reviews
      FROM quest_templates qt
      LEFT JOIN authors       a  ON qt.author_id      = a.id
      LEFT JOIN categories    c  ON qt.category_id    = c.id
      LEFT JOIN created_quests dq ON qt.demo_quest_id = dq.id
      LEFT JOIN template_tags tt ON qt.id             = tt.template_id
      LEFT JOIN tags          t  ON tt.tag_id         = t.id
      WHERE qt.slug = $1 AND qt.status = $2
      GROUP BY qt.id, a.id, a.display_name, a.avatar_url, a.username, a.bio,
               a.website, a.social_links, a.total_templates, a.average_rating,
               c.name, c.slug, c.color, c.icon, dq.blocks
    `, [slug, TEMPLATE_STATUS.PUBLISHED])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Шаблон не найден' })
    }

    // Увеличиваем счётчик просмотров асинхронно — не блокируем ответ
    pool.query(
      'UPDATE quest_templates SET views_count = views_count + 1 WHERE id = $1',
      [result.rows[0].id]
    ).catch(err => console.error('Ошибка обновления views_count:', err))

    res.json({ success: true, data: normalizeTemplate(result.rows[0]) })
  } catch (error) {
    next(error)
  }
}

// Получить похожие шаблоны
export const getSimilarTemplates = async (req, res, next) => {
  try {
    const { slug } = req.params
    const { limit = 4 } = req.query

    const currentTemplate = await pool.query(
      'SELECT id, category_id FROM quest_templates WHERE slug = $1',
      [slug]
    )

    if (currentTemplate.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Шаблон не найден' })
    }

    const { id, category_id } = currentTemplate.rows[0]

    const result = await pool.query(`
      ${BASE_SELECT}
      WHERE qt.id != $1 AND qt.category_id = $2 AND qt.status = $3
      ${BASE_GROUP_BY}
      ORDER BY qt.rating DESC
      LIMIT $4
    `, [id, category_id, TEMPLATE_STATUS.PUBLISHED, limit])

    res.json({ success: true, data: result.rows.map(normalizeTemplate) })
  } catch (error) {
    next(error)
  }
}

// Инкремент просмотров — POST /templates/:slug/view
export const incrementView = async (req, res, next) => {
  try {
    const { slug } = req.params
    await pool.query(
      'UPDATE quest_templates SET views_count = views_count + 1 WHERE slug = $1',
      [slug]
    )
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}