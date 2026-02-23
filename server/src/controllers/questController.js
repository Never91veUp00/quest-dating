import pool from '../config/database.js'

// Получить квест по slug для прохождения
export const getQuestBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const result = await pool.query(`
      SELECT 
        cq.id,
        cq.slug,
        cq.access_code,
        cq.title,
        cq.client_name,
        cq.blocks,
        cq.theme,
        cq.final_message,
        cq.is_public,
        cq.expires_at,
        cq.views_count,
        cq.started_count,
        cq.completed_count,
        cq.published_at,
        qt.duration_minutes,
        c.name  AS category_name,
        c.icon  AS category_icon
      FROM created_quests cq
      LEFT JOIN quest_templates qt ON cq.template_id = qt.id
      LEFT JOIN categories c ON qt.category_id = c.id
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
        message: 'Срок действия квеста истёк'
      })
    }

    // Проверка кода доступа — только наличие флага, НЕ сам код
    const { access_code } = req.query
    if (quest.access_code && quest.access_code !== access_code) {
      // Возвращаем метаданные, но не блоки
      return res.status(403).json({
        success: false,
        requires_code: true,
        data: {
          title: quest.title,
          client_name: quest.client_name,
          theme: quest.theme || 'detective',
          category_icon: quest.category_icon,
          duration_minutes: quest.duration_minutes,
        }
      })
    }

    // Не отдаём access_code клиенту
    delete quest.access_code

    // Увеличить счётчик просмотров — не блокируем ответ
    pool.query(
      'UPDATE created_quests SET views_count = views_count + 1 WHERE id = $1',
      [quest.id]
    ).catch(err => console.error('views_count error:', err))

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

    pool.query(
      'UPDATE created_quests SET started_count = started_count + 1 WHERE id = $1',
      [questId]
    ).catch(err => console.error('started_count error:', err))

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
        completed_tasks        = $1,
        current_block_position = $2,
        points                 = $3,
        achievements           = $4,
        hints_used             = $5,
        last_activity          = CURRENT_TIMESTAMP
      WHERE session_id = $6
      RETURNING *
    `, [
      JSON.stringify(completed_tasks),
      current_block_position,
      points,
      JSON.stringify(achievements || []),
      hints_used,
      sessionId
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Сессия не найдена' })
    }

    res.json({ success: true, data: result.rows[0] })
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
        completed_at       = CURRENT_TIMESTAMP,
        total_time_seconds = $1
      WHERE session_id = $2
      RETURNING *
    `, [total_time_seconds, sessionId])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Сессия не найдена' })
    }

    const session = result.rows[0]

    pool.query(
      'UPDATE created_quests SET completed_count = completed_count + 1 WHERE id = $1',
      [session.created_quest_id]
    ).catch(err => console.error('completed_count error:', err))

    res.json({
      success: true,
      message: 'Квест успешно завершён!',
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
      return res.status(404).json({ success: false, message: 'Сессия не найдена' })
    }

    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
}