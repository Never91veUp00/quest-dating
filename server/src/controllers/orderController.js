import pool from '../config/database.js'
import { validationResult } from 'express-validator'

export const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { name, email, phone, description, template_id, event_date } = req.body
    
    const result = await pool.query(`
      INSERT INTO orders (
        client_name, 
        client_email, 
        client_phone,
        description,
        template_id,
        event_date,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id, created_at
    `, [name, email, phone, description, template_id, event_date])
    
    // TODO: Отправить email-уведомление администратору
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: result.rows[0].id,
        createdAt: result.rows[0].created_at
      }
    })
  } catch (error) {
    next(error)
  }
}