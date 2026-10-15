import { describe, it, expect } from 'vitest'
import { mediaFilename, mimeToExt } from '@src/middleware/upload.js'
import { ALLOWED_FILE_TYPES } from '@src/config/constants.js'

describe('upload middleware — имя медиафайла', () => {
  it('берёт расширение из mimetype, а не из имени файла клиента', () => {
    const name = mediaFilename({ originalname: 'evil.html', mimetype: 'video/mp4' })
    expect(name).toMatch(/^media-\d+-\d+\.mp4$/)
  })

  it('игнорирует двойные расширения в оригинальном имени', () => {
    const name = mediaFilename({ originalname: 'shell.php.mp3', mimetype: 'audio/mpeg' })
    expect(name).toMatch(/\.mp3$/)
    expect(name).not.toContain('php')
  })

  it('у каждого разрешённого медиа-типа есть явное расширение', () => {
    for (const mime of ALLOWED_FILE_TYPES.MEDIA) {
      expect(mimeToExt(mime), mime).not.toBe('.bin')
    }
  })

  it('неизвестный тип получает безопасное .bin', () => {
    expect(mimeToExt('text/html')).toBe('.bin')
  })
})
