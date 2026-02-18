import { validationResult } from 'express-validator'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    })
  }
  
  next()
}

export const sanitizeQuery = (req, res, next) => {
  // Санитизация query параметров
  if (req.query.page) {
    req.query.page = Math.max(1, parseInt(req.query.page) || 1)
  }
  
  if (req.query.limit) {
    req.query.limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12))
  }
  
  next()
}