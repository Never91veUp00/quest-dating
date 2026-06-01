import { validationResult } from 'express-validator'
import pool from '../config/database.js'
import Template from '../models/Template.js'
import { generateSlug, makeUniqueSlug } from '../utils/slugGenerator.js'
import { buildWizardSchema } from '../services/buildWizardSchema.js'
import { questAssembler } from '../services/questAssembler.js'
import { ORDER_STATUS, FEATURE_PRICES } from '../config/constants.js'
import { notifyNewOrder, sendClientOrderEmail } from '../services/notificationService.js'

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
// Поток (решено 1 июня): оформление заказа = прохождение опросника.
// В ОДНОЙ транзакции:
//   1. создаётся order (контакты клиента, цена, status=pending — оплату пока
//      не трогаем);
//   2. ответы → questAssembler → создаётся created_quests (DRAFT);
//   3. связываются: created_quests.order_id ↔ orders.created_quest_id.
// Публикует квест админ (полуавтомат). Оба создаются вместе или никак.
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

    const {
      answers = {}, meta = {},
      client_name, client_email, client_phone,
      event_date, event_city, selected_features, newsletter,
      description,
    } = req.body

    // Детерминированная сборка квеста (чистая функция, без LLM) — ДО транзакции,
    // чтобы при ошибке сборки не создавать заказ.
    let blocks
    try {
      blocks = questAssembler(template.structure, answers, meta)
    } catch (e) {
      return res.status(400).json({ success: false, message: `Сборка квеста: ${e.message}` })
    }

    // Цена — как в orderController (копейки)
    const base_price = template.base_price || 0
    const features = Array.isArray(selected_features) ? selected_features : []
    const additional_costs = features.reduce(
      (sum, code) => sum + (FEATURE_PRICES[code] || 0) * 100, 0
    )
    const total_price = base_price + additional_costs

    const slug = await makeUniqueSlug(
      generateSlug(`${client_name}-${template.slug}`), 'created_quests', pool
    )

    const client = await pool.connect()
    let order, quest
    try {
      await client.query('BEGIN')

      // 1. Заказ (status=pending — оплата отдельным этапом)
      const orderRes = await client.query(
        `INSERT INTO orders
           (template_id, client_name, client_email, client_phone, description,
            event_date, event_city, selected_features, base_price,
            additional_costs, total_price, status, newsletter_consent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
          template.id, client_name, client_email, client_phone || null,
          description || `Квест-опросник: ${template.title}`,
          event_date || null, event_city || null,
          JSON.stringify(features), base_price, additional_costs, total_price,
          ORDER_STATUS.PENDING, newsletter === true,
        ]
      )
      order = orderRes.rows[0]

      // 2. Draft-квест из ответов, привязан к заказу
      const questRes = await client.query(
        `INSERT INTO created_quests
           (title, client_name, slug, theme, final_message, blocks,
            order_id, template_id, is_public, show_intro, player_version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,$10)
         RETURNING id, slug, title, is_public, created_at`,
        [
          template.title, client_name, slug,
          template.default_theme || 'detective',
          meta.final_message || null, JSON.stringify(blocks),
          order.id, template.id,
          template.default_show_intro !== false,
          template.default_player_version || 'v1',
        ]
      )
      quest = questRes.rows[0]

      // 3. Обратная связь order → quest
      await client.query(
        'UPDATE orders SET created_quest_id = $1 WHERE id = $2',
        [quest.id, order.id]
      )

      // Счётчик заказов шаблона (в той же транзакции, как в createOrder)
      await client.query(
        'UPDATE quest_templates SET orders_count = orders_count + 1 WHERE id = $1',
        [template.id]
      )

      await client.query('COMMIT')
    } catch (txError) {
      await client.query('ROLLBACK')
      throw txError
    } finally {
      client.release()
    }

    // Уведомления — не блокируют ответ (как в createOrder)
    notifyNewOrder(order, template.title).catch((e) => console.error('admin-уведомление:', e))
    sendClientOrderEmail(order, template.title).catch((e) => console.error('client-уведомление:', e))

    return res.status(201).json({
      success: true,
      message: 'Заказ оформлен, черновик квеста создан. Опубликует администратор после проверки.',
      data: {
        order: { id: order.id, view_token: order.view_token, total_price: order.total_price, status: order.status },
        quest: { ...quest, status: 'draft' },
      },
    })
  } catch (error) {
    next(error)
  }
}