import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { ALLOWED_FILE_TYPES } from '../config/constants.js'

// Абсолютный путь к корню сервера (папка server/)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.resolve(__dirname, '../..')

// Создаём папки при инициализации
const UPLOAD_DIRS = {
  images:    path.join(SERVER_ROOT, 'uploads/templates'),
  avatars:   path.join(SERVER_ROOT, 'uploads/avatars'),
  media:     path.join(SERVER_ROOT, 'uploads/media'),
}
Object.values(UPLOAD_DIRS).forEach(dir => fs.mkdirSync(dir, { recursive: true }))

// ─── Хелпер: mime → расширение ───────────────────────────────
const mimeToExt = (mime) => ({
  'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
  'audio/mpeg': '.mp3', 'audio/ogg': '.ogg', 'audio/wav': '.wav',
  'audio/mp4': '.m4a', 'audio/x-m4a': '.m4a'
}[mime] || '')

// ─── Хранилище для изображений ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === 'avatar' ? UPLOAD_DIRS.avatars : UPLOAD_DIRS.images)
  },
  filename: (req, file, cb) => {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + suffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.IMAGES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Недопустимый формат. Разрешены: JPG, PNG, WEBP'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: ALLOWED_FILE_TYPES.MAX_SIZE }
})

// ─── Хранилище для медиафайлов ────────────────────────────────
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS.media)
  },
  filename: (req, file, cb) => {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname) || mimeToExt(file.mimetype)
    cb(null, 'media-' + suffix + ext)
  }
})

const mediaFileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.MEDIA.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Недопустимый формат. Разрешены: MP4, WebM, MOV, MP3, OGG, WAV, M4A'), false)
  }
}

export const uploadMedia = multer({
  storage: mediaStorage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: ALLOWED_FILE_TYPES.MAX_MEDIA_SIZE }
})

// ─── Обработка ошибок загрузки ────────────────────────────────
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Файл слишком большой. Максимум: изображения 5MB, медиа 200MB'
    })
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message })
  }
  next()
}