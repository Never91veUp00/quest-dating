/**
 * Simple in-memory LRU-like cache with TTL.
 * Zero dependencies — no Redis needed for this traffic level.
 *
 * Usage:
 *   import { cache } from '../utils/cache.js'
 *   const data = await cache.getOrSet('key', ttlSeconds, asyncFn)
 *   cache.del('key')
 *   cache.delByPrefix('templates:')
 */

import { logger } from './logger.js'

const store = new Map()

// Счётчики hit/miss. Контекст INC-001: при лежащей БД кэш молча отдавал
// устаревшие данные, и без метрики никто не видел, что отдаётся «старьё».
// hits/misses делают активность кэша наблюдаемой (лог-снапшот + stats()).
let hits = 0
let misses = 0

const cache = {
  /**
   * Get value or compute & store it.
   * @param {string} key
   * @param {number} ttl  seconds
   * @param {() => Promise<any>} fn
   */
  async getOrSet(key, ttl, fn) {
    const hit = store.get(key)
    if (hit && hit.expires > Date.now()) {
      hits++
      return hit.value
    }
    misses++
    const value = await fn()
    store.set(key, { value, expires: Date.now() + ttl * 1000 })
    return value
  },

  /** Delete a single key */
  del(key) {
    store.delete(key)
  },

  /** Delete all keys that start with prefix */
  delByPrefix(prefix) {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key)
    }
  },

  /** Clear everything (сбрасывает и счётчики — удобно в тестах) */
  clear() {
    store.clear()
    hits = 0
    misses = 0
  },

  /** Stats for /health и /api/metrics */
  stats() {
    const now = Date.now()
    let alive = 0, expired = 0
    for (const [, v] of store) {
      v.expires > now ? alive++ : expired++
    }
    const lookups = hits + misses
    const hitRate = lookups ? Math.round((hits / lookups) * 1000) / 10 : 0
    return { total: store.size, alive, expired, hits, misses, hitRate }
  }
}

// Sweep expired entries every 5 minutes + лог-снапшот метрик кэша.
// Лог делает hit/miss видимыми в проде без отдельного дашборда — прямой
// ответ на слепое пятно INC-001. Только при наличии активности (lookups>0),
// чтобы не засорять лог на простое.
setInterval(() => {
  const now = Date.now()
  for (const [key, v] of store) {
    if (v.expires <= now) store.delete(key)
  }
  const s = cache.stats()
  if (s.hits + s.misses > 0) {
    logger.info('Cache stats', { hits: s.hits, misses: s.misses, hitRate: s.hitRate, keys: s.total })
  }
}, 5 * 60 * 1000).unref()

export { cache }