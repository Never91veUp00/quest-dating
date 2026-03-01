import { describe, it, expect, vi, beforeEach } from 'vitest'
import pool from '@src/config/database.js'

// Кеш statsService живёт в памяти модуля — чтобы сбросить его между тестами
// используем vi.resetModules() + повторный импорт внутри каждого теста.

describe('statsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()  // сбрасывает кеш модулей → in-memory кеш statsService тоже сбросится
  })

  describe('getPlatformStats', () => {
    it('выполняет запрос к БД и возвращает данные', async () => {
      const mockData = {
        total_templates: '5',
        total_authors: '2',
        total_orders: '10',
        average_rating: '4.5',
        total_views: '100'
      }
      pool.query.mockResolvedValueOnce({ rows: [mockData] })

      const { getPlatformStats } = await import('@src/services/statsService.js')
      const result = await getPlatformStats()

      expect(result).toEqual(mockData)
      expect(pool.query).toHaveBeenCalledOnce()
    })

    it('использует кеш при повторном вызове', async () => {
      pool.query.mockResolvedValue({ rows: [{ total_templates: '5' }] })

      const { getPlatformStats } = await import('@src/services/statsService.js')

      await getPlatformStats()
      await getPlatformStats()
      await getPlatformStats()

      // БД вызвана только один раз — остальные из кеша
      expect(pool.query).toHaveBeenCalledOnce()
    })

    it('пробрасывает ошибку БД', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB connection failed'))

      const { getPlatformStats } = await import('@src/services/statsService.js')

      await expect(getPlatformStats()).rejects.toThrow('DB connection failed')
    })
  })

  describe('invalidateStatsCache', () => {
    it('сбрасывает кеш — следующий вызов идёт в БД', async () => {
      pool.query.mockResolvedValue({ rows: [{ total_templates: '5' }] })

      const { getPlatformStats, invalidateStatsCache } = await import('@src/services/statsService.js')

      await getPlatformStats()       // кешируем
      invalidateStatsCache()         // сбрасываем
      await getPlatformStats()       // снова к БД

      expect(pool.query).toHaveBeenCalledTimes(2)
    })
  })
})
