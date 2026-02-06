import pool from '../config/database.js'

export const getAllTemplates = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        description, 
        preview_image, 
        difficulty,
        duration_minutes,
        created_at
      FROM templates 
      WHERE is_active = true
      ORDER BY position ASC
    `)
    
    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    next(error)
  }
}

export const getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const result = await pool.query(
      'SELECT * FROM templates WHERE id = $1 AND is_active = true',
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
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