import pool from '../config/database.js'
import bcrypt from 'bcryptjs'

class Author {
  // Создать автора
  static async create(data) {
    const {
      username,
      email,
      password,
      display_name,
      bio,
      avatar_url,
      website,
      social_links
    } = data

    // Хеширование пароля (для будущей авторизации)
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null

    const result = await pool.query(`
      INSERT INTO authors (
        username, email, password, display_name, bio, 
        avatar_url, website, social_links
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email, display_name, bio, avatar_url, website, social_links, created_at
    `, [
      username,
      email,
      hashedPassword,
      display_name,
      bio,
      avatar_url,
      website,
      JSON.stringify(social_links || {})
    ])

    return result.rows[0]
  }

  // Обновить автора
  static async update(id, data) {
    const fields = []
    const values = []
    let paramIndex = 1

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id' && key !== 'password') {
        if (key === 'social_links') {
          values.push(JSON.stringify(data[key]))
        } else {
          values.push(data[key])
        }
        fields.push(`${key} = $${paramIndex}`)
        paramIndex++
      }
    })

    if (fields.length === 0) {
      throw new Error('No fields to update')
    }

    values.push(id)

    const result = await pool.query(`
      UPDATE authors
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, username, email, display_name, bio, avatar_url, website, social_links, updated_at
    `, values)

    return result.rows[0]
  }

  // Найти по ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM authors WHERE id = $1',
      [id]
    )
    return result.rows[0]
  }

  // Найти по username
  static async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM authors WHERE username = $1',
      [username]
    )
    return result.rows[0]
  }

  // Найти по email
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM authors WHERE email = $1',
      [email]
    )
    return result.rows[0]
  }

  // Проверка пароля
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // Обновить пароль
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    const result = await pool.query(
      'UPDATE authors SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    )

    return result.rows[0]
  }

  // Верифицировать автора
  static async verify(id) {
    const result = await pool.query(
      'UPDATE authors SET is_verified = true WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }

  // Получить статистику автора
  static async getStats(id) {
    const result = await pool.query(`
      SELECT 
        COUNT(qt.id) as total_templates,
        COUNT(qt.id) FILTER (WHERE qt.status = 'published') as published_templates,
        AVG(qt.rating) as average_rating,
        SUM(qt.orders_count) as total_orders,
        SUM(qt.views_count) as total_views
      FROM authors a
      LEFT JOIN quest_templates qt ON a.id = qt.author_id
      WHERE a.id = $1
      GROUP BY a.id
    `, [id])

    return result.rows[0]
  }
}

export default Author