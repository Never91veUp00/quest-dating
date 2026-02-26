import express from 'express'
import { body } from 'express-validator'
import { requireAdmin } from '../middleware/auth.js'
import pool from '../config/database.js'
import { validationResult } from 'express-validator'

const router = express.Router()

// Все роуты — только для админа
router.use(requireAdmin)

// ─── GET /api/admin/dashboard ─────────────────────────────────
// Статистика для дашборда
router.get('/dashboard', async (req, res, next) => {
  try {
    const [orders, quests, stats] = await Promise.all([
      pool.query(`
        SELECT o.*, qt.title as template_title
        FROM orders o
        LEFT JOIN quest_templates qt ON o.template_id = qt.id
        ORDER BY o.created_at DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT cq.*, o.client_email
        FROM created_quests cq
        LEFT JOIN orders o ON cq.order_id = o.id
        ORDER BY cq.created_at DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
          (SELECT COUNT(*) FROM orders WHERE status = 'confirmed') as confirmed_orders,
          (SELECT COUNT(*) FROM created_quests) as total_quests,
          (SELECT COUNT(*) FROM created_quests WHERE completed_count > 0) as completed_quests,
          (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status = 'completed') as total_revenue
      `)
    ])

    res.json({
      success: true,
      data: {
        stats: stats.rows[0],
        recent_orders: orders.rows,
        recent_quests: quests.rows
      }
    })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/quests ────────────────────────────────────
router.get('/quests', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        cq.*,
        o.client_email,
        o.client_phone,
        qt.title as template_title
      FROM created_quests cq
      LEFT JOIN orders o ON cq.order_id = o.id
      LEFT JOIN quest_templates qt ON cq.template_id = qt.id
      ORDER BY cq.created_at DESC
    `)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/quests/:id ────────────────────────────────
router.get('/quests/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT cq.*, o.client_email, o.client_phone, qt.title as template_title
      FROM created_quests cq
      LEFT JOIN orders o ON cq.order_id = o.id
      LEFT JOIN quest_templates qt ON cq.template_id = qt.id
      WHERE cq.id = $1
    `, [req.params.id])

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Квест не найден' })
    }

    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

// ─── POST /api/admin/quests ───────────────────────────────────
router.post('/quests', [
  body('title').trim().notEmpty().withMessage('Название обязательно'),
  body('client_name').trim().notEmpty().withMessage('Имя клиента обязательно'),
  body('slug').trim().notEmpty().withMessage('Slug обязателен'),
  body('blocks').if(body('is_public').equals('true')).isArray({ min: 1 }).withMessage('Нужен хотя бы один блок'),
  body('theme').optional().isIn(['detective', 'romantic', 'city', 'mystery'])
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const {
      title, client_name, slug, theme = 'detective',
      final_message, blocks, access_code,
      order_id, template_id, is_public = false,
      expires_at, show_intro = true
    } = req.body

    // Проверка уникальности slug
    const exists = await pool.query(
      'SELECT id, title FROM created_quests WHERE slug = $1', [slug]
    )
    if (exists.rows.length) {
      return res.status(409).json({
        success: false,
        message: 'Slug уже занят',
        existing_id: exists.rows[0].id
      })
    }

    const result = await pool.query(`
      INSERT INTO created_quests
        (title, client_name, slug, theme, final_message, blocks,
         access_code, order_id, template_id, is_public, show_intro, expires_at, published_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, CASE WHEN $10 THEN NOW() ELSE NULL END)
      RETURNING *
    `, [
      title, client_name, slug, theme, final_message || null,
      JSON.stringify(blocks), access_code || null,
      order_id || null, template_id || null, is_public,
      show_intro !== false,
      expires_at || null
    ])

    const quest = result.rows[0]

    // Обновляем статус заказа на in_progress если order_id указан
    if (order_id) {
      await pool.query(
        "UPDATE orders SET status = 'in_progress', created_quest_id = $1, updated_at = NOW() WHERE id = $2",
        [quest.id, order_id]
      )
    }

    res.status(201).json({ success: true, data: quest })
  } catch (error) {
    next(error)
  }
})

// ─── PUT /api/admin/quests/:id ────────────────────────────────
router.put('/quests/:id', [
  body('title').trim().notEmpty().withMessage('Название обязательно'),
  body('client_name').trim().notEmpty().withMessage('Имя клиента обязательно'),
  body('blocks').if(body('is_public').equals('true')).isArray({ min: 1 }).withMessage('Нужен хотя бы один блок'),
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const {
      title, client_name, theme, final_message,
      blocks, access_code, is_public, expires_at, show_intro
    } = req.body

    const result = await pool.query(`
      UPDATE created_quests SET
        title         = $1,
        client_name   = $2,
        theme         = $3,
        final_message = $4,
        blocks        = $5,
        access_code   = $6,
        is_public     = $7,
        expires_at    = $8,
        show_intro    = $9,
        published_at  = CASE WHEN $7 AND published_at IS NULL THEN NOW() ELSE published_at END,
        updated_at    = NOW()
      WHERE id = $10
      RETURNING *
    `, [
      title, client_name, theme || 'detective', final_message || null,
      JSON.stringify(blocks), access_code || null,
      is_public, expires_at || null,
      show_intro !== false,
      req.params.id
    ])

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Квест не найден' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

// ─── DELETE /api/admin/quests/:id ─────────────────────────────
router.delete('/quests/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM created_quests WHERE id = $1', [req.params.id])
    res.json({ success: true, message: 'Квест удалён' })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/orders ────────────────────────────────────
router.get('/orders', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT o.*, qt.title as template_title, cq.slug as quest_slug
      FROM orders o
      LEFT JOIN quest_templates qt ON o.template_id = qt.id
      LEFT JOIN created_quests cq ON o.created_quest_id = cq.id
      ORDER BY o.created_at DESC
    `)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/templates (для редактора квестов — только published) ──────
router.get('/templates', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, title, slug, structure, difficulty, duration_minutes
      FROM quest_templates
      WHERE status = 'published'
      ORDER BY title
    `)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/templates/all (все шаблоны для управления витриной) ──────
router.get('/templates/all', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        qt.*,
        c.name as category_name,
        c.slug as category_slug
      FROM quest_templates qt
      LEFT JOIN categories c ON qt.category_id = c.id
      ORDER BY qt.created_at DESC
    `)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    next(error)
  }
})

// ─── POST /api/admin/templates/create (создать шаблон) ───────────────────────
router.post('/templates/create', [
  body('title').trim().notEmpty().withMessage('Название обязательно'),
  body('difficulty').isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Некорректная сложность'),
  body('duration_minutes').isInt({ min: 10 }).withMessage('Укажите длительность'),
  body('base_price').isInt({ min: 0 }).withMessage('Некорректная цена'),
], async (req, res, next) => {
  const vErrors = validationResult(req)
  if (!vErrors.isEmpty()) {
    return res.status(400).json({ success: false, errors: vErrors.array() })
  }
  try {
    const {
      title, tagline, description, category_id,
      difficulty, duration_minutes, location_type = 'universal',
      base_price, is_free = false, is_premium = false,
      features, cover_image, gallery, status = 'draft'
    } = req.body

    const baseSlug = title.toLowerCase()
      .replace(/[а-яё]/g, c => ({ а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }[c] || c))
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    let slug = baseSlug
    let counter = 1
    while (true) {
      const exists = await pool.query('SELECT id FROM quest_templates WHERE slug = $1', [slug])
      if (!exists.rows.length) break
      slug = `${baseSlug}-${counter++}`
    }

    const result = await pool.query(`
      INSERT INTO quest_templates (
        title, slug, tagline, description, category_id,
        difficulty, duration_minutes, location_type,
        base_price, is_free, is_premium,
        features, cover_image, gallery, status,
        published_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        CASE WHEN $15 = 'published' THEN NOW() ELSE NULL END)
      RETURNING *
    `, [
      title, slug, tagline || null, description || null,
      category_id || null, difficulty, parseInt(duration_minutes),
      location_type, parseInt(base_price) * 100,
      is_free, is_premium,
      JSON.stringify(features || []),
      cover_image || null,
      JSON.stringify(gallery || []),
      status
    ])
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/templates/:id (один шаблон для редактирования) ────────────
router.get('/templates/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT qt.*, c.name as category_name
       FROM quest_templates qt
       LEFT JOIN categories c ON qt.category_id = c.id
       WHERE qt.id = $1`,
      [req.params.id]
    )
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Шаблон не найден' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

// ─── PUT /api/admin/templates/:id (обновить шаблон) ──────────────────────────
router.put('/templates/:id', [
  body('title').trim().notEmpty().withMessage('Название обязательно'),
  body('difficulty').isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Некорректная сложность'),
  body('duration_minutes').isInt({ min: 10 }).withMessage('Укажите длительность'),
  body('base_price').isInt({ min: 0 }).withMessage('Некорректная цена'),
], async (req, res, next) => {
  const vErrors = validationResult(req)
  if (!vErrors.isEmpty()) {
    return res.status(400).json({ success: false, errors: vErrors.array() })
  }
  try {
    const {
      title, tagline, description, category_id,
      difficulty, duration_minutes, location_type,
      base_price, is_free, is_premium,
      features, cover_image, gallery, status
    } = req.body

    const existingRes = await pool.query('SELECT status FROM quest_templates WHERE id = $1', [req.params.id])
    if (!existingRes.rows.length) {
      return res.status(404).json({ success: false, message: 'Шаблон не найден' })
    }
    const becomesPublished = status === 'published' && existingRes.rows[0].status !== 'published'

    const result = await pool.query(`
      UPDATE quest_templates SET
        title            = $1,
        tagline          = $2,
        description      = $3,
        category_id      = $4,
        difficulty       = $5,
        duration_minutes = $6,
        location_type    = $7,
        base_price       = $8,
        is_free          = $9,
        is_premium       = $10,
        features         = $11,
        cover_image      = $12,
        gallery          = $13,
        status           = $14,
        published_at     = CASE WHEN $15 THEN NOW() ELSE published_at END,
        updated_at       = NOW()
      WHERE id = $16
      RETURNING *
    `, [
      title, tagline || null, description || null,
      category_id || null, difficulty, parseInt(duration_minutes),
      location_type || 'universal', parseInt(base_price) * 100,
      is_free || false, is_premium || false,
      JSON.stringify(features || []),
      cover_image || null,
      JSON.stringify(gallery || []),
      status || 'draft',
      becomesPublished,
      req.params.id
    ])
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

// ─── PATCH /api/admin/templates/:id/status (быстрая смена статуса) ────────────
router.patch('/templates/:id/status', [
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Некорректный статус'),
], async (req, res, next) => {
  const vErrors = validationResult(req)
  if (!vErrors.isEmpty()) {
    return res.status(400).json({ success: false, errors: vErrors.array() })
  }
  try {
    const { status } = req.body
    const result = await pool.query(`
      UPDATE quest_templates SET
        status       = $1,
        published_at = CASE WHEN $1 = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END,
        updated_at   = NOW()
      WHERE id = $2
      RETURNING id, title, status
    `, [status, req.params.id])
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Шаблон не найден' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

// ─── DELETE /api/admin/templates/:id (удалить шаблон) ────────────────────────
router.delete('/templates/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM quest_templates WHERE id = $1 RETURNING id, title',
      [req.params.id]
    )
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Шаблон не найден' })
    }
    res.json({ success: true, message: 'Шаблон удалён' })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/categories (для селекта категорий в форме) ────────────────
router.get('/categories', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, name, slug, icon FROM categories ORDER BY position, name')
    res.json({ success: true, data: result.rows })
  } catch (error) {
    next(error)
  }
})

export default router