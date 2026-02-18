import pool from '../config/database.js'

class Review {
  // Создать отзыв
  static async create(data) {
    const {
      template_id,
      client_name,
      client_email,
      rating,
      title,
      comment,
      images,
      is_verified
    } = data

    const result = await pool.query(`
      INSERT INTO reviews (
        template_id, client_name, client_email, rating,
        title, comment, images, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      template_id,
      client_name,
      client_email,
      rating,
      title,
      comment,
      JSON.stringify(images || []),
      is_verified || false
    ])

    return result.rows[0]
  }

  // Получить по ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE id = $1',
      [id]
    )
    return result.rows[0]
  }

  // Получить отзывы для шаблона
  static async findByTemplate(templateId, options = {}) {
    const {
      limit = 10,
      offset = 0,
      sort_by = 'created_at',
      order = 'DESC'
    } = options

    const sortMap = {
      created_at: 'created_at',
      rating: 'rating',
      helpful: 'helpful_count'
    }

    const sortColumn = sortMap[sort_by] || 'created_at'

    const result = await pool.query(`
      SELECT * FROM reviews
      WHERE template_id = $1
      ORDER BY ${sortColumn} ${order}
      LIMIT $2 OFFSET $3
    `, [templateId, limit, offset])

    return result.rows
  }

  // Обновить отзыв
  static async update(id, data) {
    const fields = []
    const values = []
    let paramIndex = 1

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id') {
        if (key === 'images') {
          values.push(JSON.stringify(data[key]))
        } else {
          values.push(data[key])
        }
        fields.push(`${key} = $${paramIndex}`)
        paramIndex++
      }
    })

    values.push(id)

    const result = await pool.query(`
      UPDATE reviews
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `, values)

    return result.rows[0]
  }

  // Верифицировать отзыв
  static async verify(id) {
    const result = await pool.query(
      'UPDATE reviews SET is_verified = true WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }

  // Сделать отзыв избранным
  static async feature(id) {
    const result = await pool.query(
      'UPDATE reviews SET is_featured = true WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }

  // Увеличить счетчик полезности
  static async incrementHelpful(id) {
    const result = await pool.query(
      'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }

  // Удалить отзыв
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }

  // Получить среднюю оценку для шаблона
  static async getAverageRating(templateId) {
    const result = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE template_id = $1',
      [templateId]
    )
    return result.rows[0]
  }

  // Получить распределение оценок
  static async getRatingDistribution(templateId) {
    const result = await pool.query(`
      SELECT 
        rating,
        COUNT(*) as count
      FROM reviews
      WHERE template_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `, [templateId])

    return result.rows
  }
}

export default Review