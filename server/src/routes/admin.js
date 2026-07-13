import express from 'express'
import { body } from 'express-validator'
import { requireAdmin } from '../middleware/auth.js'
import pool from '../config/database.js'
import { validationResult } from 'express-validator'

import { upload, uploadMedia, handleUploadError } from '../middleware/upload.js'
import { processImage } from '../utils/imageProcessor.js'

const router = express.Router()

// Все роуты — только для админа
router.use(requireAdmin)
// Отключаем HTTP-кэш для всех admin-роутов (ETag/304 ломает свежие данные)
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next() })

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
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
          (SELECT COUNT(*) FROM created_quests) as total_quests,
          (SELECT COUNT(*) FROM created_quests WHERE completed_count > 0) as completed_quests,
          COALESCE(SUM(total_price) FILTER (WHERE status = 'completed'), 0) as total_revenue
        FROM orders
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
    // FIX: Пагинация — без неё при росте данных запрос вернул бы всё
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 50)
    const offset = (page - 1) * limit

    const [result, countResult] = await Promise.all([
      pool.query(`
        SELECT
          cq.*,
          o.client_email,
          o.client_phone,
          qt.title as template_title
        FROM created_quests cq
        LEFT JOIN orders o ON cq.order_id = o.id
        LEFT JOIN quest_templates qt ON cq.template_id = qt.id
        ORDER BY cq.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
      pool.query('SELECT COUNT(*) as total FROM created_quests')
    ])

    const total = parseInt(countResult.rows[0].total)
    res.json({ success: true, data: result.rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
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
      expires_at, show_intro = true, player_version = 'v1',
      recipient_gender = 'f'
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
         access_code, order_id, template_id, is_public, show_intro, expires_at, published_at, player_version, recipient_gender)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, CASE WHEN $10 THEN NOW() ELSE NULL END, $13, $14)
      RETURNING *
    `, [
      title, client_name, slug, theme, final_message || null,
      JSON.stringify(blocks), access_code || null,
      order_id || null, template_id || null, is_public,
      show_intro !== false,
      expires_at || null,
      player_version || 'v1',
      recipient_gender || 'f'
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
      title, client_name, slug, theme, final_message,
      blocks, access_code, is_public, expires_at, show_intro, player_version,
      recipient_gender = 'f'
    } = req.body

    const result = await pool.query(`
      UPDATE created_quests SET
        title            = $1,
        client_name      = $2,
        slug             = $3,
        theme            = $4,
        final_message    = $5,
        blocks           = $6,
        access_code      = $7,
        is_public        = $8,
        expires_at       = $9,
        show_intro       = $10,
        player_version   = $11,
        recipient_gender = $12,
        published_at     = CASE WHEN $8 AND published_at IS NULL THEN NOW() ELSE published_at END,
        updated_at       = NOW()
      WHERE id = $13
      RETURNING *
    `, [
      title, client_name, slug,
      theme || 'detective', final_message || null,
      JSON.stringify(blocks), access_code || null,
      is_public, expires_at || null,
      show_intro !== false,
      player_version || 'v1',
      recipient_gender || 'f',
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
    // FIX: Пагинация
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 50)
    const offset = (page - 1) * limit

    const [result, countResult] = await Promise.all([
      pool.query(`
        SELECT o.*, qt.title as template_title, cq.slug as quest_slug
        FROM orders o
        LEFT JOIN quest_templates qt ON o.template_id = qt.id
        LEFT JOIN created_quests cq ON o.created_quest_id = cq.id
        ORDER BY o.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
      pool.query('SELECT COUNT(*) as total FROM orders')
    ])

    const total = parseInt(countResult.rows[0].total)
    res.json({ success: true, data: result.rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
})


// ─── POST /api/admin/upload/image (загрузка одного изображения) ───────────────
router.post('/upload/image',
  upload.single('image'),
  handleUploadError,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Файл не загружен' })
    }
    // Оптимизируем: ресайз до 1200x800, конвертация в WebP
    const pathMod = await import('path')
    const result = await processImage(req.file.path, 'cover')
    const filename = result.success
      ? pathMod.default.basename(result.outputPath)
      : req.file.filename
    const url = `/uploads/templates/${filename}`
    res.json({ success: true, data: { url } })
  }
)

// ─── POST /api/admin/upload/images (загрузка нескольких изображений) ──────────
router.post('/upload/images',
  upload.array('images', 20),
  handleUploadError,
  (req, res) => {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'Файлы не загружены' })
    }
    const urls = req.files.map(f => `/uploads/templates/${f.filename}`)
    res.json({ success: true, data: urls })
  }
)

// ─── POST /api/admin/upload/media (загрузка видео/аудио) ─────────────────────
router.post('/upload/media',
  uploadMedia.single('media'),
  handleUploadError,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Файл не загружен' })
    }
    const url = `/uploads/media/${req.file.filename}`
    const isVideo = req.file.mimetype.startsWith('video/')
    res.json({
      success: true,
      data: {
        url,
        type: isVideo ? 'video' : 'audio',
        originalName: req.file.originalname,
        size: req.file.size
      }
    })
  }
)

// ─── GET /api/admin/templates (для редактора квестов — только published) ──────
router.get('/templates', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, title, slug, structure, difficulty, duration_minutes,
             default_theme, default_player_version, default_show_intro
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
      min_locations, max_locations, demo_video_url,
      base_price, is_free = false, is_premium = false,
      features, cover_image, gallery, status = 'draft',
      demo_quest_id, quick_view_description
    } = req.body

    const baseSlug = title.toLowerCase()
      .replace(/[а-яё]/g, c => ({ а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }[c] || c))
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    let slug = baseSlug
    let counter = 1
    // FIX: Добавлен лимит итераций — защита от бесконечного цикла.
    // Без лимита при заполнении slug-пространства цикл мог подвесить воркер Node.js.
    while (counter <= 100) {
      const exists = await pool.query('SELECT id FROM quest_templates WHERE slug = $1', [slug])
      if (!exists.rows.length) break
      slug = `${baseSlug}-${counter++}`
    }
    if (counter > 100) {
      return res.status(409).json({
        success: false,
        message: 'Не удалось сгенерировать уникальный slug. Измените название шаблона.'
      })
    }

    const result = await pool.query(`
      INSERT INTO quest_templates (
        author_id, title, slug, tagline, description, category_id,
        difficulty, duration_minutes, location_type,
        min_locations, max_locations, demo_video_url,
        base_price, is_free, is_premium,
        features, cover_image, gallery, structure,
        demo_quest_id, quick_view_description, status,
        default_theme, default_player_version, default_show_intro,
        published_at
      ) VALUES (
        (SELECT id FROM authors ORDER BY id LIMIT 1),
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,
        $23,$24,$25,
        CASE WHEN $22 = 'published' THEN NOW() ELSE NULL END)
      RETURNING *
    `, [
      title, slug, tagline || null, description || '',
      category_id || null, difficulty, parseInt(duration_minutes),
      location_type,
      min_locations || null, max_locations || null, demo_video_url || null,
      parseInt(base_price) * 100,
      is_free, is_premium,
      JSON.stringify(features || []),
      cover_image || null,
      JSON.stringify(gallery || []),
      JSON.stringify({}),
      demo_quest_id || null,
      quick_view_description || null,
      status,
      status,
      req.body.default_theme || 'detective',
      req.body.default_player_version || 'v1',
      req.body.default_show_intro !== false
    ])
    // Сохраняем теги
    const tagIds = Array.isArray(req.body.tag_ids) ? req.body.tag_ids : []
    if (tagIds.length) {
      const newId = result.rows[0].id
      const tagValues = tagIds.map((tid, i) => `($1, $${i + 2})`).join(', ')
      await pool.query(
        `INSERT INTO template_tags (template_id, tag_id) VALUES ${tagValues}`,
        [newId, ...tagIds]
      )
    }

    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    switch (error.code) {
      case '23502':
        return res.status(400).json({ success: false, message: 'Не заполнено обязательное поле: ' + (error.column || error.message) })
      case '42703':
        return res.status(400).json({ success: false, message: `Столбец не найден в БД: ${error.message}. Выполните миграцию database/migration_missing_columns.sql` })
      case '23505':
        return res.status(409).json({ success: false, message: 'Шаблон с таким slug уже существует' })
      default:
        return res.status(500).json({ success: false, message: 'Ошибка создания: ' + error.message })
    }
  }
})

// ─── GET /api/admin/templates/:id (один шаблон для редактирования) ────────────
router.get('/templates/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT qt.*, c.name as category_name,
        COALESCE(
          json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
          FILTER (WHERE t.id IS NOT NULL), '[]'
        ) as tags
       FROM quest_templates qt
       LEFT JOIN categories c ON qt.category_id = c.id
       LEFT JOIN template_tags tt ON qt.id = tt.template_id
       LEFT JOIN tags t ON tt.tag_id = t.id
       WHERE qt.id = $1
       GROUP BY qt.id, c.name`,
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
  body('duration_minutes').isInt({ min: 10 }).withMessage('Укажите длительность (мин. 10)'),
  body('base_price').isNumeric().withMessage('Некорректная цена'),
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
      features, cover_image, gallery, structure, demo_quest_id,
      min_locations, max_locations, demo_video_url,
      quick_view_description, status
    } = req.body

    const existingRes = await pool.query('SELECT status FROM quest_templates WHERE id = $1', [req.params.id])
    if (!existingRes.rows.length) {
      return res.status(404).json({ success: false, message: 'Шаблон не найден' })
    }
    const becomesPublished = status === 'published' && existingRes.rows[0].status !== 'published'

    const result = await pool.query(`
      UPDATE quest_templates SET
        title                 = $1,
        tagline               = $2,
        description           = $3,
        category_id           = $4,
        difficulty            = $5,
        duration_minutes      = $6,
        location_type         = $7,
        min_locations         = $8,
        max_locations         = $9,
        demo_video_url        = $10,
        base_price            = $11,
        is_free               = $12,
        is_premium            = $13,
        features              = $14,
        cover_image           = $15,
        gallery               = $16,
        structure             = $17,
        demo_quest_id         = $18,
        quick_view_description= $19,
        status                = $20,
        default_theme         = $23,
        default_player_version= $24,
        default_show_intro    = $25,
        published_at          = CASE WHEN $21 THEN NOW() ELSE published_at END,
        updated_at            = NOW()
      WHERE id = $22
      RETURNING *
    `, [
      title,
      tagline || null,
      description || '',
      category_id || null,
      difficulty,
      parseInt(duration_minutes),
      location_type || 'universal',
      min_locations || null,
      max_locations || null,
      demo_video_url || null,
      parseInt(base_price) * 100,
      is_free || false,
      is_premium || false,
      JSON.stringify(features || []),
      cover_image || null,
      JSON.stringify(gallery || []),
      JSON.stringify(structure || {}),
      demo_quest_id || null,
      quick_view_description || null,
      status || 'draft',
      becomesPublished,
      req.params.id,
      req.body.default_theme || 'detective',
      req.body.default_player_version || 'v1',
      req.body.default_show_intro !== false
    ])

    // Сохраняем теги
    const tagIds = Array.isArray(req.body.tag_ids) ? req.body.tag_ids : []
    await pool.query('DELETE FROM template_tags WHERE template_id = $1', [req.params.id])
    if (tagIds.length) {
      const tagValues = tagIds.map((tid, i) => `($1, $${i + 2})`).join(', ')
      await pool.query(
        `INSERT INTO template_tags (template_id, tag_id) VALUES ${tagValues}`,
        [req.params.id, ...tagIds]
      )
    }

    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    switch (error.code) {
      case '23502': // NOT NULL violation
        return res.status(400).json({ success: false, message: 'Не заполнено обязательное поле: ' + (error.column || error.message) })
      case '42703': // undefined column
        return res.status(400).json({ success: false, message: `Столбец не найден в БД: ${error.message}. Выполните миграцию database/migration_missing_columns.sql` })
      case '23505': // unique violation
        return res.status(409).json({ success: false, message: 'Шаблон с таким slug уже существует' })
      case '22P02': // invalid input syntax
        return res.status(400).json({ success: false, message: 'Некорректный формат данных: ' + error.message })
      default:
        return res.status(500).json({ success: false, message: 'Ошибка сохранения: ' + error.message })
    }
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
        status       = $1::text,
        published_at = CASE WHEN $1::text = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END,
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

// ─── PATCH /api/admin/orders/:id/status (смена статуса заказа) ───────────────
router.patch('/orders/:id/status', [
  body('status').isIn(['confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Некорректный статус'),
], async (req, res, next) => {
  try {
    const vErrors = validationResult(req)
    if (!vErrors.isEmpty()) return res.status(400).json({ success: false, errors: vErrors.array() })

    const { status } = req.body
    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, status, client_name, client_email, created_quest_id`,
      [status, req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Заказ не найден' })

    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

// ─── DELETE /api/admin/orders/:id (удалить отменённый заказ) ────────────────
router.delete('/orders/:id', async (req, res, next) => {
  try {
    const check = await pool.query('SELECT id, status FROM orders WHERE id = $1', [req.params.id])
    if (!check.rows.length) {
      return res.status(404).json({ success: false, message: 'Заказ не найден' })
    }
    if (check.rows[0].status !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Удалить можно только отменённые заказы' })
    }
    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id])
    res.json({ success: true, message: 'Заказ удалён' })
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