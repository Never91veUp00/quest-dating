import { describe, it, expect } from 'vitest'
import { corkLayout, clueIcon } from '~/utils/corkboard.js'

// Пробковая доска «Детектива»: улики разбросаны вокруг финала, но каждая
// в своей ячейке сетки 3 × rows — карточки не ложатся друг на друга целиком.

describe('corkLayout', () => {
  it('8 улик — сетка 3 × 3, финал в центре', () => {
    const l = corkLayout(8)
    expect(l.rows).toBe(3)
    expect(l.clues).toHaveLength(8)
    expect(l.final.x).toBeGreaterThan(44)
    expect(l.final.x).toBeLessThan(56)
    expect(l.final.y).toBeGreaterThan(40)
    expect(l.final.y).toBeLessThan(60)
  })

  it('мало улик — доска не меньше 3 рядов, улики сначала по углам', () => {
    const l = corkLayout(4)
    expect(l.rows).toBe(3)
    const corners = l.clues.map(c => [c.x < 40 ? 'L' : c.x > 60 ? 'R' : 'C', c.y < 33 ? 'T' : c.y > 66 ? 'B' : 'M'].join(''))
    expect(corners.sort()).toEqual(['LB', 'LT', 'RB', 'RT'])
  })

  it('много улик — доска растёт рядами', () => {
    const l = corkLayout(11)
    expect(l.rows).toBe(4)
    expect(l.clues).toHaveLength(11)
  })

  it('каждая улика в своей ячейке и внутри доски', () => {
    for (const n of [1, 2, 5, 8, 9, 12]) {
      const l = corkLayout(n)
      const cells = new Set(l.clues.map(c => c.cell))
      expect(cells.size).toBe(n)
      expect(cells.has(l.final.cell)).toBe(false)
      for (const c of l.clues) {
        expect(c.x).toBeGreaterThanOrEqual(10)
        expect(c.x).toBeLessThanOrEqual(90)
        expect(Math.abs(c.r)).toBeLessThanOrEqual(9)
      }
    }
  })

  it('беспорядок одинаковый при каждом открытии', () => {
    expect(corkLayout(8)).toEqual(corkLayout(8))
  })

  it('соседние улики повёрнуты по-разному', () => {
    const r = corkLayout(8).clues.map(c => c.r)
    expect(new Set(r).size).toBeGreaterThan(5)
  })
})

describe('clueIcon', () => {
  it('символ — по типу задания, как на карточке', () => {
    expect(clueIcon({ tasks: [{ type: 'riddle' }] })).toEqual({ icon: 'riddle', count: 1 })
    expect(clueIcon({ tasks: [{ type: 'mini_game' }] })).toEqual({ icon: 'game', count: 1 })
    expect(clueIcon({ tasks: [{ type: 'selfie' }] })).toEqual({ icon: 'selfie', count: 1 })
  })

  it('несколько заданий — самый частый тип и число заданий', () => {
    expect(clueIcon({ tasks: [{ type: 'mini_game' }, { type: 'riddle' }, { type: 'mini_game' }] }))
      .toEqual({ icon: 'game', count: 3 })
  })

  it('неизвестный тип и пустой участок — общий символ задания', () => {
    expect(clueIcon({ tasks: [{ type: 'teleport' }] })).toEqual({ icon: 'task', count: 1 })
    expect(clueIcon({ tasks: [] })).toEqual({ icon: 'task', count: 0 })
  })
})
