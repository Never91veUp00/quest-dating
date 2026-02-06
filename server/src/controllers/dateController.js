import pool from '../config/database.js'

export const getDateBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params
    
    const result = await pool.query(`
      SELECT 
        d.id,
        d.slug,
        d.title,
        d.template_id,
        d.status,
        d.created_at,
        t.name as template_name,
        (
          SELECT json_agg(
            json_build_object(
              'id', db.id,
              'type', db.type,
              'position', db.position,
              'content', db.content
            ) ORDER BY db.position
          )
          FROM date_blocks db
          WHERE db.date_id = d.id
        ) as blocks
      FROM dates d
      LEFT JOIN templates t ON d.template_id = t.id
      WHERE d.slug = $1 AND d.status = 'published'
    `, [slug])
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      })
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
}