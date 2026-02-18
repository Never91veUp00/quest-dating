import jwt from 'jsonwebtoken'

// Middleware для проверки JWT токена (для будущей авторизации)
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    })
  }
}

// Middleware для проверки роли автора
export const authorizeAuthor = (req, res, next) => {
  if (req.user?.role !== 'author' && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права автора.'
    })
  }
  next()
}

// Middleware для проверки роли администратора
export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права администратора.'
    })
  }
  next()
}

// Генерация JWT токена
export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
}

// Проверка токена
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}