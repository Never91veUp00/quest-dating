import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Укажи логин и пароль'
      })
    }

    // Проверяем логин
    if (username !== process.env.ADMIN_USERNAME) {
      // Намеренно одинаковое сообщение — не раскрываем что именно неверно
      return res.status(401).json({
        success: false,
        message: 'Неверный логин или пароль'
      })
    }

    // Проверяем пароль через bcrypt
    const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный логин или пароль'
      })
    }

    // Выдаём токен
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    })
  }
}