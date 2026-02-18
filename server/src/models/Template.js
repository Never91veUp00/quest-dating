import pool from '../config/database.js'
import { generateSlug, makeUniqueSlug } from '../utils/slugGenerator.js'
import { TEMPLATE_STATUS } from '../config/constants.js'

class Template {
  // Создать шаблон
  static async create(data) {
    const {
      author_id,
      category_id,
      title,
      tagline,
      description,
      cover_image,
      gallery,
      demo_video_url,
      difficulty,
      duration_minutes,
      location_type,
      min_locations,
      max_locations,
      structure,
      features,
      customization_options,
      base_price,
      is_free,
      is_premium
    } = data

    // Генерация уникального slug
    const baseSlug = generateSlug(title)
    const slug = await makeUniqueSlug(baseSlug, 'quest_templates', pool)

    const result = await pool.query(`
      INSERT INTO quest_templates (
        author_id, category_id, title, slug, tagline, description,
        cover_image, gallery, demo_video_url, difficulty, duration_minutes,
        location_type, min_locations, max_locations, structure, features,
        customization_options, base_price, is_free, is_premium, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, [
      author_id, category_id, title, slug, tagline, description,
      cover_image, JSON.stringify(gallery || []), demo_video_url,
      difficulty, duration_minutes, location_type, min_locations, max_locations,
      JSON.stringify(structure), JSON.stringify(features || []),
      JSON.stringify(customization_options || {}), base_price,
      is_free || false, is_premium || false, TEMPLATE_STATUS.DRAFT
    ])

    return result.rows[0]
  }

  // Обновить шаблон
  static async update(id, data) {
    const fields = []
    const values = []
    let paramIndex = 1

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id' && key !== 'slug') {
        if (['structure', 'features', 'customization_options', 'gallery'].includes(key)) {
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
      UPDATE quest_templates
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `, values)

    return result.rows[0]
  }

  // Удалить шаблон
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM quest_templates WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }

  // Получить по ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM quest_templates WHERE id = $1',
      [id]
    )
    return result.rows[0]
  }

  // Получить по slug
  static async findBySlug(slug) {
    const result = await pool.query(
      'SELECT * FROM quest_templates WHERE slug = $1',
      [slug]
    )
    return result.rows[0]
  }

  // Опубликовать шаблон
  static async publish(id) {
    const result = await pool.query(`
      UPDATE quest_templates
      SET status = $1, published_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [TEMPLATE_STATUS.PUBLISHED, id])

    return result.rows[0]
  }

  // Архивировать шаблон
  static async archive(id) {
    const result = await pool.query(`
      UPDATE quest_templates
      SET status = $1
      WHERE id = $2
      RETURNING *
    `, [TEMPLATE_STATUS.ARCHIVED, id])

    return result.rows[0]
  }

  // Добавить теги к шаблону
  static async addTags(templateId, tagIds) {
    const values = tagIds.map((tagId, index) => 
      `($1, $${index + 2})`
    ).join(', ')

    await pool.query(`
      INSERT INTO template_tags (template_id, tag_id)
      VALUES ${values}
      ON CONFLICT DO NOTHING
    `, [templateId, ...tagIds])

    return true
  }

  // Удалить теги шаблона
  static async removeTags(templateId, tagIds) {
    await pool.query(
      'DELETE FROM template_tags WHERE template_id = $1 AND tag_id = ANY($2)',
      [templateId, tagIds]
    )
    return true
  }
}

export default Template