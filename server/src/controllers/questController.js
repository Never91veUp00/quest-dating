import pool from '../config/database.js'

// Получить квест по slug для прохождения
export const getQuestBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const result = await pool.query(`
      SELECT 
        cq.*,
        qt.title as template_title,
        o.client_name
      FROM created_quests cq
      LEFT JOIN quest_templates qt ON cq.template_id = qt.id
      LEFT JOIN orders o ON cq.order_id = o.id
      WHERE cq.slug = $1
    `, [slug])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Квест не найден'
      })
    }

    const quest = result.rows[0]

    // Проверка срока действия
    if (quest.expires_at && new Date(quest.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Срок действия квеста истек'
      })
    }

    // Проверка кода доступа (если установлен)
    const { access_code } = req.query
    if (quest.access_code && quest.access_code !== access_code) {
      return res.status(403).json({
        success: false,
        message: 'Требуется код доступа'
      })
    }

    // Увеличить счетчик просмотров
    await pool.query(
      'UPDATE created_quests SET views_count = views_count + 1 WHERE id = $1',
      [quest.id]
    )

    res.json({
      success: true,
      data: quest
    })
  } catch (error) {
    next(error)
  }
}

// Создать сессию прохождения квеста
export const createQuestSession = async (req, res, next) => {
  try {
    const { questId } = req.params

    const result = await pool.query(`
      INSERT INTO quest_sessions (created_quest_id)
      VALUES ($1)
      RETURNING *
    `, [questId])

    // Увеличить счетчик начатых квестов
    await pool.query(
      'UPDATE created_quests SET started_count = started_count + 1 WHERE id = $1',
      [questId]
    )

    res.status(201).json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
}

// Обновить прогресс сессии
export const updateSessionProgress = async (req, res, next) => {
  try {
    const { sessionId } = req.params
    const { 
      completed_tasks, 
      current_block_position, 
      points, 
      achievements,
      hints_used 
    } = req.body

    const result = await pool.query(`
      UPDATE quest_sessions
      SET 
        completed_tasks = $1,
        current_block_position = $2,
        points = $3,
        achievements = $4,
        hints_used = $5,
        last_activity = CURRENT_TIMESTAMP
      WHERE session_id = $6
      RETURNING *
    `, [
      JSON.stringify(completed_tasks),
      current_block_position,
      points,
      JSON.stringify(achievements),
      hints_used,
      sessionId
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Сессия не найдена'
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

// Завершить квест
export const completeQuest = async (req, res, next) => {
  try {
    const { sessionId } = req.params
    const { total_time_seconds } = req.body

    const result = await pool.query(`
      UPDATE quest_sessions
      SET 
        completed_at = CURRENT_TIMESTAMP,
        total_time_seconds = $1
      WHERE session_id = $2
      RETURNING *
    `, [total_time_seconds, sessionId])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Сессия не найдена'
      })
    }

    const session = result.rows[0]

    // Увеличить счетчик завершенных квестов
    await pool.query(
      'UPDATE created_quests SET completed_count = completed_count + 1 WHERE id = $1',
      [session.created_quest_id]
    )

    res.json({
      success: true,
      message: 'Квест успешно завершен!',
      data: session
    })
  } catch (error) {
    next(error)
  }
}

// Получить статистику сессии
export const getSessionStats = async (req, res, next) => {
  try {
    const { sessionId } = req.params

    const result = await pool.query(
      'SELECT * FROM quest_sessions WHERE session_id = $1',
      [sessionId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Сессия не найдена'
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