import api from './api'

export const uploadService = {
  /**
   * Загрузить изображение
   * @param {File} file - Файл изображения
   * @param {string} type - Тип загрузки ('avatar', 'template', 'review')
   * @returns {Promise} - URL загруженного изображения
   */
  async uploadImage(file, type = 'template') {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)

    return await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * Загрузить несколько изображений
   * @param {FileList|Array} files - Массив файлов
   * @param {string} type - Тип загрузки
   * @returns {Promise} - Массив URL загруженных изображений
   */
  async uploadMultipleImages(files, type = 'template') {
    const formData = new FormData()
    
    Array.from(files).forEach((file) => {
      formData.append('images', file)
    })
    
    formData.append('type', type)

    return await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * Удалить изображение
   * @param {string} imageUrl - URL изображения
   * @returns {Promise} - Результат удаления
   */
  async deleteImage(imageUrl) {
    return await api.delete('/upload/image', {
      data: { image_url: imageUrl }
    })
  },

  /**
   * Валидация изображения перед загрузкой
   * @param {File} file - Файл изображения
   * @param {object} options - Опции валидации
   * @returns {object} - Результат валидации
   */
  validateImage(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    } = options

    const errors = []

    // Проверка типа файла
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Недопустимый тип файла. Разрешены: ${allowedTypes.join(', ')}`)
    }

    // Проверка размера файла
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1)
      errors.push(`Размер файла не должен превышать ${maxSizeMB}MB`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}