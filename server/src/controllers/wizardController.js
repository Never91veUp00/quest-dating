import { validationResult } from 'express-validator'
import pool from '../config/database.js'
import Template from '../models/Template.js'
import { generateSlug, makeUniqueSlug } from '../utils/slugGenerator.js'
import { buildWizardSchema } from '../services/buildWizardSchema.js'
import { questAssembler } from '../services/questAssembler.js'

// Контроллер опросника-конструктора (Фаза 2, 2.4.3).
// Тонкая обёртка над двумя чистыми функциями:
//   GET  /api/wizard/:templateSlug/schema → buildWizardSchema → вопросы фронту
//   POST /api/wizard/:templateSlug/submit → questAssembler → draft created_quests
// LLM не используется.

// ─── GET /api/wizard/:templateSlug/schema ──────────────────────────────
export const getWizardSchema = async (req, res, next) => {
  try {
    const template = await Template.findBySlug(req.params.templateSlug)
    if (!template) {
      return res.status(404).json({ success: false, message: 'Шаблон не найден' })
    }

    const schema = buildWizardSchema(template)
    return res.json({
      success: true,
      data: {
        template: { slug: template.slug, title: template.title, location_type: template.location_type },
        meta: schema.meta,
        questions: schema.questions,
      },
    })
  } catch (error) {
    next(error)
  }
}

// ─── POST /api/wizard/:templateSlug/submit ─────────────────────────────
// Тело: { answers: { [block.id|task.id]: {...} }, meta: { partner_name, ... },
//         client_name, order_id? }
// Создаёт created_quests в статусе DRAFT (is_public=false). Публикует — админ.
export const submitWizard = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const template = await Template.findBySlug(req.params.templateSlug)
    if (!template) {
      return res.status(404).json({ success: false, message: 'Шаблон не найден' })
    }

    const { answers = {}, meta = {}, client_name, order_id = null } = req.body

    // Детерминированная сборка квеста (чистая функция, без LLM)
    let blocks
    try {
      blocks = questAssembler(template.structure, answers, meta)
    } catch (e) {
      return res.status(400).json({ success: false, message: `Сборка квеста: ${e.message}` })
    }

    // Уникальный slug на основе имени клиента (как в Template.create)
    const baseSlug = generateSlug(`${client_name}-${template.slug}`)
    const slug = await makeUniqueSlug(baseSlug, 'created_quests', pool)

    // DRAFT: is_public=false, published_at=NULL. Полуавтомат — публикует админ.
    const result = await pool.query(
      `INSERT INTO created_quests
         (title, client_name, slug, theme, final_message, blocks,
          order_id, template_id, is_public, show_intro, player_version)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,$10)
       RETURNING id, slug, title, is_public, created_at`,
      [
        template.title,
        client_name,
        slug,
        template.default_theme || 'detective',
        meta.final_message || null,
        JSON.stringify(blocks),
        order_id,
        template.id,
        template.default_show_intro !== false,
        template.default_player_version || 'v1',
      ]
    )

    return res.status(201).json({
      success: true,
      data: { ...result.rows[0], status: 'draft' },
      message: 'Черновик квеста создан. Опубликует администратор после проверки.',
    })
  } catch (error) {
    next(error)
  }
}