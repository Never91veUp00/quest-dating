import pool from '../config/database.js'
import { ORDER_STATUS } from '../config/constants.js'

class Order {
  // Создать заказ
  static async create(data) {
    const {
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
      total_price
    } = data

    const result = await pool.query(`
      INSERT INTO orders (
        template_id, client_name, client_email, client_phone,
        description, event_date, event_city, customization,
        selected_features, base_price, additional_costs, total_price, status
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
      additional_costs || 0,
      total_price,
      ORDER_STATUS.PENDING
    ])

    return result.rows[0]
  }

  // Получить по ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    )
    return result.rows[0]
  }

  // Обновить статус
  static async updateStatus(id, status, notes = null) {
    const result = await pool.query(`
      UPDATE orders
      SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, notes, id])

    return result.rows[0]
  }

  // Связать с созданным квестом
  static async linkQuest(orderId, questId) {
    const result = await pool.query(
      'UPDATE orders SET created_quest_id = $1 WHERE id = $2 RETURNING *',
      [questId, orderId]
    )
    return result.rows[0]
  }

  // Получить заказы по email клиента
  static async findByClientEmail(email) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE client_email = $1 ORDER BY created_at DESC',
      [email]
    )
    return result.rows
  }

  // Получить заказы по шаблону
  static async findByTemplate(templateId) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE template_id = $1 ORDER BY created_at DESC',
      [templateId]
    )
    return result.rows
  }

  // Получить последние заказы
  static async getRecent(limit = 10) {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT $1',
      [limit]
    )
    return result.rows
  }

  // Получить статистику по статусам
  static async getStatusStats() {
    const result = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_price) as total_revenue
      FROM orders
      GROUP BY status
    `)
    return result.rows
  }

  // Удалить заказ
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }
}

export default Order