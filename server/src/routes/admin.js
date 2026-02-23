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
  body('blocks').isArray({ min: 1 }).withMessage('Нужен хотя бы один блок'),
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
      expires_at
    } = req.body

    // Проверка уникальности slug
    const exists = await pool.query(
      'SELECT id FROM created_quests WHERE slug = $1', [slug]
    )
    if (exists.rows.length) {
      return res.status(409).json({ success: false, message: 'Slug уже занят' })
    }

    const result = await pool.query(`
      INSERT INTO created_quests
        (title, client_name, slug, theme, final_message, blocks,
         access_code, order_id, template_id, is_public, expires_at, published_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, CASE WHEN $10 THEN NOW() ELSE NULL END)
      RETURNING *
    `, [
      title, client_name, slug, theme, final_message || null,
      JSON.stringify(blocks), access_code || null,
      order_id || null, template_id || null, is_public,
      expires_at || null
    ])

    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

// ─── PUT /api/admin/quests/:id ────────────────────────────────
router.put('/quests/:id', [
  body('title').trim().notEmpty().withMessage('Название обязательно'),
  body('client_name').trim().notEmpty().withMessage('Имя клиента обязательно'),
  body('blocks').isArray({ min: 1 }).withMessage('Нужен хотя бы один блок'),
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const {
      title, client_name, theme, final_message,
      blocks, access_code, is_public, expires_at
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
        published_at  = CASE WHEN $7 AND published_at IS NULL THEN NOW() ELSE published_at END,
        updated_at    = NOW()
      WHERE id = $9
      RETURNING *
    `, [
      title, client_name, theme || 'detective', final_message || null,
      JSON.stringify(blocks), access_code || null,
      is_public, expires_at || null, req.params.id
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
      SELECT o.*, qt.title as template_title
      FROM orders o
      LEFT JOIN quest_templates qt ON o.template_id = qt.id
      ORDER BY o.created_at DESC
    `)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/templates (для выбора шаблона в редакторе)
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

export default router