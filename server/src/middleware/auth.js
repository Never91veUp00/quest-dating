import jwt from 'jsonwebtoken'

export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Токен не предоставлен'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав'
      })
    }

    req.admin = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Токен истёк'
      })
    }
    return res.status(401).json({
      success: false,
      message: 'Невалидный токен'
    })
  }
}