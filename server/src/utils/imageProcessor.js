import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

// Настройки ресайза по типу изображения
const PRESETS = {
  cover:     { width: 1200, height: 800,  quality: 85 }, // обложка шаблона
  card:      { width: 600,  height: 400,  quality: 82 }, // карточка в списке
  thumbnail: { width: 400,  height: 267,  quality: 80 }, // превью
  avatar:    { width: 200,  height: 200,  quality: 85 }, // аватар
}

/**
 * Обработать изображение: ресайз + оптимизация + конвертация в WebP
 * @param {string} inputPath  — путь к оригинальному файлу
 * @param {string} preset     — 'cover' | 'card' | 'thumbnail' | 'avatar'
 * @returns {{ success, outputPath, originalSize, processedSize }}
 */
export const processImage = async (inputPath, preset = 'cover') => {
  const config = PRESETS[preset] || PRESETS.cover

  try {
    const ext = path.extname(inputPath)
    const base = inputPath.slice(0, -ext.length)
    const outputPath = base + '.webp'

    const originalStat = await fs.stat(inputPath)

    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'cover',         // обрезаем по большей стороне
        withoutEnlargement: true  // не увеличиваем маленькие изображения
      })
      .webp({ quality: config.quality })
      .toFile(outputPath)

    const processedStat = await fs.stat(outputPath)

    // Удаляем оригинал если он не WebP
    if (inputPath !== outputPath) {
      await fs.unlink(inputPath).catch(() => {})
    }

    const savings = Math.round((1 - processedStat.size / originalStat.size) * 100)
    console.log(`🖼️ ${path.basename(inputPath)} → WebP: ${originalStat.size} → ${processedStat.size} bytes (${savings}% saved)`)

    return {
      success: true,
      outputPath,
      originalSize: originalStat.size,
      processedSize: processedStat.size
    }
  } catch (error) {
    console.error('imageProcessor error:', error)
    // Не бросаем ошибку — если обработка упала, оставляем оригинал
    return { success: false, outputPath: inputPath, error: error.message }
  }
}

/**
 * Создать thumbnail (маленькое превью)
 * @param {string} inputPath — путь к оригинальному файлу
 * @returns {{ success, thumbnailPath }}
 */
export const generateThumbnail = async (inputPath) => {
  const ext = path.extname(inputPath)
  const base = inputPath.slice(0, -ext.length)
  const thumbnailPath = base + '_thumb.webp'

  try {
    await sharp(inputPath)
      .resize(400, 267, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbnailPath)

    console.log(`🖼️ Thumbnail: ${path.basename(thumbnailPath)}`)
    return { success: true, thumbnailPath }
  } catch (error) {
    console.error('generateThumbnail error:', error)
    return { success: false, thumbnailPath: inputPath, error: error.message }
  }
}
