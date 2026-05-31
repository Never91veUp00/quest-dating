import { describe, it, expect, beforeEach } from 'vitest'
import { cache } from '@src/utils/cache.js'

// Unit-тесты счётчиков hit/miss (задача 1.4.1). БД не нужна.
// Контекст: при INC-001 кэш отдавал устаревшие данные незаметно — счётчики
// делают это наблюдаемым. Тест фиксирует корректность hits/misses/hitRate.

describe('cache — счётчики hit/miss', () => {
  beforeEach(() => {
    cache.clear() // сбрасывает store + hits/misses
  })

  it('первый getOrSet по ключу = miss, fn вызывается', async () => {
    let calls = 0
    const v = await cache.getOrSet('k1', 60, async () => { calls++; return 'v1' })

    expect(v).toBe('v1')
    expect(calls).toBe(1)
    const s = cache.stats()
    expect(s.misses).toBe(1)
    expect(s.hits).toBe(0)
  })

  it('повторный getOrSet по тому же ключу = hit, fn НЕ вызывается', async () => {
    let calls = 0
    const fn = async () => { calls++; return 'v1' }

    await cache.getOrSet('k1', 60, fn) // miss
    const v = await cache.getOrSet('k1', 60, fn) // hit

    expect(v).toBe('v1')
    expect(calls).toBe(1) // fn вызвана только на miss
    const s = cache.stats()
    expect(s.misses).toBe(1)
    expect(s.hits).toBe(1)
  })

  it('протухший ключ = miss (TTL истёк), fn вызывается заново', async () => {
    let calls = 0
    const fn = async () => { calls++; return calls }

    await cache.getOrSet('k1', 0, fn) // ttl=0 → запись протухает немедленно
    await new Promise(r => setTimeout(r, 5))
    const v = await cache.getOrSet('k1', 0, fn)

    expect(calls).toBe(2) // оба раза miss
    expect(v).toBe(2)
    const s = cache.stats()
    expect(s.misses).toBe(2)
    expect(s.hits).toBe(0)
  })

  it('hitRate считается как hits/(hits+misses) в процентах', async () => {
    const fn = async () => 'x'
    await cache.getOrSet('k', 60, fn) // miss
    await cache.getOrSet('k', 60, fn) // hit
    await cache.getOrSet('k', 60, fn) // hit
    // 2 hits из 3 запросов = 66.7%
    expect(cache.stats().hitRate).toBe(66.7)
  })

  it('hitRate = 0 при отсутствии запросов (без деления на ноль)', () => {
    expect(cache.stats().hitRate).toBe(0)
  })

  it('clear() сбрасывает счётчики', async () => {
    await cache.getOrSet('k', 60, async () => 'x')
    cache.clear()
    const s = cache.stats()
    expect(s.hits).toBe(0)
    expect(s.misses).toBe(0)
    expect(s.total).toBe(0)
  })

  it('del() не трогает счётчики, только удаляет ключ', async () => {
    const fn = async () => 'x'
    await cache.getOrSet('k', 60, fn) // miss, ключ в кэше
    cache.del('k')
    await cache.getOrSet('k', 60, fn) // снова miss (ключа нет)

    const s = cache.stats()
    expect(s.misses).toBe(2)
    expect(s.hits).toBe(0)
  })
})