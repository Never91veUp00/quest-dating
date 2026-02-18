import multer from 'multer'
import path from 'path'
import { ALLOWED_FILE_TYPES } from '../config/constants.js'

// Конфигурация хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'avatar' 
      ? 'uploads/avatars/' 
      : 'uploads/templates/'
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.IMAGES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Недопустимый формат файла. Разрешены: JPG, PNG, WEBP'), false)
  }
}

// Настройка multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: ALLOWED_FILE_TYPES.MAX_SIZE
  }
})

// Middleware для обработки ошибок загрузки
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Файл слишком большой. Максимальный размер: 5MB'
      })
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
  
  next()
}