// Centralized error handling middleware

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err)

  // Определение статус кода
  const statusCode = err.statusCode || err.status || 500

  // Определение сообщения
  let message = err.message || 'Internal Server Error'

  // Обработка специфичных ошибок
  
  // PostgreSQL ошибки
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        message = 'Запись с такими данными уже существует'
        break
      case '23503': // Foreign key violation
        message = 'Связанная запись не найдена'
        break
      case '23502': // Not null violation
        message = 'Обязательное поле не заполнено'
        break
      case '22P02': // Invalid text representation
        message = 'Некорректный формат данных'
        break
      case '42P01': // Undefined table
        message = 'Таблица не найдена в базе данных'
        break
    }
  }

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    message = 'Недействительный токен'
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Срок действия токена истек'
  }

  // Multer ошибки (загрузка файлов)
  if (err.name === 'MulterError') {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Файл слишком большой'
        break
      case 'LIMIT_FILE_COUNT':
        message = 'Слишком много файлов'
        break
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Неожиданное поле файла'
        break
    }
  }

  // Validation ошибки
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ')
  }

  // Формирование ответа
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
      details: err
    })
  }

  res.status(statusCode).json(response)
}

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// Async handler wrapper для избежания try-catch в каждом контроллере
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Not Found handler
export const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404)
  next(error)
}