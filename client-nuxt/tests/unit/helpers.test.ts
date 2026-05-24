import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  deepClone,
  generateId,
  generateUUID,
  generateSlug,
  getRandomItem,
  shuffleArray,
  groupBy,
  uniqueArray,
  sortBy,
  isEmptyObject,
  getNestedProperty,
  capitalize,
  sleep,
} from '../../app/utils/helpers'

describe('deepClone', () => {
  it('клонирует примитив', () => {
    expect(deepClone(42)).toBe(42)
    expect(deepClone('hello')).toBe('hello')
    expect(deepClone(null)).toBe(null)
  })

  it('клонирует объект', () => {
    const obj = { a: 1, b: { c: 2 } }
    const clone = deepClone(obj)
    expect(clone).toEqual(obj)
    expect(clone).not.toBe(obj)
    expect(clone.b).not.toBe(obj.b)
  })

  it('клонирует массив', () => {
    const arr = [1, [2, 3], { a: 4 }]
    const clone = deepClone(arr)
    expect(clone).toEqual(arr)
    expect(clone).not.toBe(arr)
    expect(clone[1]).not.toBe(arr[1])
  })

  it('клонирует Date', () => {
    const date = new Date('2024-06-15')
    const clone = deepClone(date)
    expect(clone).toEqual(date)
    expect(clone).not.toBe(date)
  })
})

describe('generateId', () => {
  it('генерирует строку нужной длины', () => {
    expect(generateId(8).length).toBe(8)
    expect(generateId(16).length).toBe(16)
  })

  it('использует длину 8 по умолчанию', () => {
    expect(generateId().length).toBe(8)
  })

  it('генерирует уникальные ID', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBeGreaterThan(95)
  })
})

describe('generateUUID', () => {
  it('генерирует строку в формате UUID v4', () => {
    const uuid = generateUUID()
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('генерирует уникальные UUID', () => {
    const uuids = new Set(Array.from({ length: 50 }, () => generateUUID()))
    expect(uuids.size).toBe(50)
  })
})

describe('generateSlug', () => {
  it('транслитерирует русский текст', () => {
    expect(generateSlug('Романтическое свидание')).toBe('romanticheskoe-svidanie')
  })

  it('заменяет пробелы дефисами', () => {
    expect(generateSlug('hello world')).toBe('hello-world')
  })

  it('убирает спецсимволы', () => {
    expect(generateSlug('test!@#test')).toBe('test-test')
  })

  it('приводит к нижнему регистру', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })

  it('убирает ведущие и завершающие дефисы', () => {
    expect(generateSlug('  текст  ')).not.toMatch(/^-|-$/)
  })

  it('ограничивает длину 100 символами', () => {
    const long = 'а'.repeat(200)
    expect(generateSlug(long).length).toBeLessThanOrEqual(100)
  })
})

describe('getRandomItem', () => {
  it('возвращает элемент из массива', () => {
    const arr = [1, 2, 3, 4, 5]
    const item = getRandomItem(arr)
    expect(arr).toContain(item)
  })

  it('работает с одним элементом', () => {
    expect(getRandomItem(['only'])).toBe('only')
  })
})

describe('shuffleArray', () => {
  it('возвращает массив той же длины', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffleArray(arr).length).toBe(arr.length)
  })

  it('содержит те же элементы', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(arr)
    expect(shuffled.sort()).toEqual([...arr].sort())
  })

  it('не мутирует исходный массив', () => {
    const arr = [1, 2, 3]
    shuffleArray(arr)
    expect(arr).toEqual([1, 2, 3])
  })
})

describe('groupBy', () => {
  it('группирует по ключу', () => {
    const items = [
      { type: 'a', val: 1 },
      { type: 'b', val: 2 },
      { type: 'a', val: 3 },
    ]
    const result = groupBy(items, 'type')
    expect(result.a).toHaveLength(2)
    expect(result.b).toHaveLength(1)
  })

  it('возвращает пустой объект для пустого массива', () => {
    expect(groupBy([], 'key')).toEqual({})
  })
})

describe('uniqueArray', () => {
  it('удаляет дубликаты примитивов', () => {
    expect(uniqueArray([1, 2, 2, 3, 3])).toEqual([1, 2, 3])
  })

  it('удаляет дубликаты объектов по ключу', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 1 }]
    expect(uniqueArray(arr, 'id')).toHaveLength(2)
  })
})

describe('sortBy', () => {
  const items = [
    { name: 'Банан', price: 50 },
    { name: 'Яблоко', price: 30 },
    { name: 'Вишня', price: 80 },
  ]

  it('сортирует по числовому ключу asc', () => {
    const sorted = sortBy(items, 'price', 'asc')
    expect(sorted[0].price).toBe(30)
    expect(sorted[2].price).toBe(80)
  })

  it('сортирует по числовому ключу desc', () => {
    const sorted = sortBy(items, 'price', 'desc')
    expect(sorted[0].price).toBe(80)
  })

  it('не мутирует исходный массив', () => {
    sortBy(items, 'price')
    expect(items[0].name).toBe('Банан')
  })
})

describe('isEmptyObject', () => {
  it('возвращает true для пустого объекта', () => {
    expect(isEmptyObject({})).toBe(true)
  })

  it('возвращает false для непустого объекта', () => {
    expect(isEmptyObject({ a: 1 })).toBe(false)
  })
})

describe('getNestedProperty', () => {
  const obj = { a: { b: { c: 42 } } }

  it('возвращает вложенное значение', () => {
    expect(getNestedProperty(obj, 'a.b.c')).toBe(42)
  })

  it('возвращает defaultValue если путь не найден', () => {
    expect(getNestedProperty(obj, 'a.x.y', 'default')).toBe('default')
  })

  it('возвращает undefined по умолчанию', () => {
    expect(getNestedProperty(obj, 'x.y.z')).toBeUndefined()
  })
})

describe('capitalize', () => {
  it('делает первую букву заглавной', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('не меняет остальные буквы', () => {
    expect(capitalize('hELLO')).toBe('HELLO')
  })

  it('возвращает пустую строку для пустой строки', () => {
    expect(capitalize('')).toBe('')
  })

  it('возвращает пустую строку для null', () => {
    expect(capitalize(null)).toBe('')
  })
})

describe('sleep', () => {
  it('задерживает выполнение', async () => {
    const start = Date.now()
    await sleep(50)
    expect(Date.now() - start).toBeGreaterThanOrEqual(40)
  })
})
