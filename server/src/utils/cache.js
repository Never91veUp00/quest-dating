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

const store = new Map()

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
      return hit.value
    }
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

  /** Clear everything */
  clear() {
    store.clear()
  },

  /** Stats for /health endpoint */
  stats() {
    const now = Date.now()
    let alive = 0, expired = 0
    for (const [, v] of store) {
      v.expires > now ? alive++ : expired++
    }
    return { total: store.size, alive, expired }
  }
}

// Sweep expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, v] of store) {
    if (v.expires <= now) store.delete(key)
  }
}, 5 * 60 * 1000).unref()

export { cache }
