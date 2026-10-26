import { describe, it, expect } from 'vitest'
import { deskLayout, noteKind, NOTE_ROW, FINAL_ROW } from '~/utils/desk.js'

// Стол «Романтика»: записки рядами по 2 и 3, связка последних писем посередине.

describe('deskLayout', () => {
  it('7 записок — ряды 2, 3 сверху, 2 снизу и связка посередине', () => {
    const l = deskLayout(7)
    expect(l.notes).toHaveLength(7)
    expect(l.notes.map(n => n.row)).toEqual([0, 0, 1, 1, 1, 2, 2])
    expect(l.ratio).toBeCloseTo(NOTE_ROW * 3 + FINAL_ROW, 2)
    const above = l.notes.filter(n => n.y < l.final.y).length
    expect(above).toBe(5)
    expect(l.final.x).toBeGreaterThan(46)
    expect(l.final.x).toBeLessThan(54)
  })

  it('связка не ложится на записки: между ними ряд', () => {
    for (const n of [1, 2, 4, 7, 9, 12]) {
      const l = deskLayout(n)
      const gap = (FINAL_ROW / 2 + NOTE_ROW / 2) / l.ratio * 100
      for (const note of l.notes) expect(Math.abs(note.y - l.final.y)).toBeGreaterThan(gap * .85)
    }
  })

  it('записки одного ряда не налезают друг на друга и не уходят за край', () => {
    for (const n of [1, 3, 5, 8, 11]) {
      const l = deskLayout(n)
      for (const a of l.notes) {
        expect(a.x).toBeGreaterThanOrEqual(14)
        expect(a.x).toBeLessThanOrEqual(86)
        expect(Math.abs(a.r)).toBeLessThanOrEqual(7)
        for (const b of l.notes) if (a !== b && a.row === b.row) expect(Math.abs(a.x - b.x)).toBeGreaterThan(26)
      }
    }
  })

  it('без записок — одна связка', () => {
    const l = deskLayout(0)
    expect(l.notes).toHaveLength(0)
    expect(l.final.y).toBe(50)
  })

  it('одинаковый стол при каждом открытии', () => {
    expect(deskLayout(7)).toEqual(deskLayout(7))
  })
})

describe('noteKind', () => {
  it('записки чередуются: сложенная, конверт, открытка', () => {
    expect([0, 1, 2, 3].map(noteKind)).toEqual(['fold', 'env', 'card', 'fold'])
  })
})
