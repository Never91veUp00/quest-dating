import pool from '../config/database.js'
import { validationResult } from 'express-validator'
import { ORDER_STATUS, FEATURE_PRICES } from '../config/constants.js'
import { notifyNewOrder, notifyOrderStatusChange } from '../services/notificationService.js'

// Получить все заказы (для админки в будущем)
export const getAllOrders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      status,
      template_id 
    } = req.query

    const offset = (page - 1) * limit

    let query = `
      SELECT 
        o.*,
        qt.title as template_title,
        qt.slug as template_slug,
        qt.cover_image as template_image
      FROM orders o
      LEFT JOIN quest_templates qt ON o.template_id = qt.id
      WHERE 1=1
    `

    const params = []
    let paramIndex = 1

    if (status) {
      query += ` AND o.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (template_id) {
      query += ` AND o.template_id = $${paramIndex}`
      params.push(template_id)
      paramIndex++
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Подсчет общего количества
    const countParams = []
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1'

    if (status) {
      countParams.push(status)
      countQuery += ` AND status = $${countParams.length}`
    }
    if (template_id) {
      countParams.push(template_id)
      countQuery += ` AND template_id = $${countParams.length}`
    }

    const countResult = await pool.query(countQuery, countParams)
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

// Создать заказ
export const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const {
      template_id,
      client_name,
      client_email,
      client_phone,
      description,
      event_date,
      event_city,
      customization,
      selected_features
    } = req.body

    // Получить информацию о шаблоне для расчета цены
    const templateResult = await pool.query(
      'SELECT base_price, title FROM quest_templates WHERE id = $1',
      [template_id]
    )

    if (templateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Шаблон не найден'
      })
    }

    const base_price = templateResult.rows[0].base_price

    // Считаем стоимость выбранных фич
    const features = Array.isArray(selected_features) ? selected_features : []
    const additional_costs = features.reduce((sum, featureCode) => {
      const priceInRubles = FEATURE_PRICES[featureCode] || 0
      return sum + (priceInRubles * 100) // храним в копейках как base_price
    }, 0)

    const total_price = base_price + additional_costs

    const result = await pool.query(`
      INSERT INTO orders (
        template_id,
        client_name,
        client_email,
        client_phone,
        description,
        event_date,
        event_city,
        customization,
        selected_features,
        base_price,
        additional_costs,
        total_price,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      template_id,
      client_name,
      client_email,
      client_phone,
      description,
      event_date,
      event_city,
      JSON.stringify(customization || {}),
      JSON.stringify(selected_features || []),
      base_price,
      additional_costs,
      total_price,
      ORDER_STATUS.PENDING
    ])

    // Увеличить счетчик заказов шаблона
    await pool.query(
      'UPDATE quest_templates SET orders_count = orders_count + 1 WHERE id = $1',
      [template_id]
    )

    const order = result.rows[0]

    // Уведомление в Telegram — не блокируем ответ клиенту
    notifyNewOrder(order, templateResult.rows[0].title).catch(
      err => console.error('Ошибка уведомления о заказе:', err)
    )
    
    res.status(201).json({
      success: true,
      message: 'Заказ успешно создан',
      data: {
        ...order,
        base_price: parseFloat(order.base_price),
        additional_costs: parseFloat(order.additional_costs),
        total_price: parseFloat(order.total_price)
      }
    })
  } catch (error) {
    next(error)
  }
}

// Получить заказ по ID
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await pool.query(`
      SELECT 
        o.*,
        qt.title as template_title,
        qt.slug as template_slug,
        qt.cover_image as template_image,
        qt.author_id,
        a.display_name as author_name
      FROM orders o
      LEFT JOIN quest_templates qt ON o.template_id = qt.id
      LEFT JOIN authors a ON qt.author_id = a.id
      WHERE o.id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      })
    }

    const order = result.rows[0]
    res.json({
      success: true,
      data: {
        ...order,
        base_price: parseFloat(order.base_price),
        additional_costs: parseFloat(order.additional_costs),
        total_price: parseFloat(order.total_price)
      }
    })
  } catch (error) {
    next(error)
  }
}

// Обновить статус заказа
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, admin_notes } = req.body

    // Проверка валидности статуса
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный статус заказа'
      })
    }

    const result = await pool.query(`
      UPDATE orders 
      SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, admin_notes, id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      })
    }

    // Уведомление в Telegram
    notifyOrderStatusChange(result.rows[0], status).catch(
      err => console.error('Ошибка уведомления о статусе:', err)
    )

    res.json({
      success: true,
      message: 'Статус заказа обновлен',
      data: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
}

// Получить статистику заказов
export const getOrdersStats = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        SUM(total_price) FILTER (WHERE status = 'completed') as total_revenue
      FROM orders
    `)

    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
}