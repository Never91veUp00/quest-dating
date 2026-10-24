import { describe, it, expect } from 'vitest'
import { buildTie, integrate, relax, collide, ropePath, tugCurve, SEG, R_BTN } from '../../app/utils/rope.js'

const B1 = { x: 30, y: 28 }, B2 = { x: 30, y: 92 }

describe('buildTie', () => {
  it('звенья не длиннее SEG, нить идёт от нижней пуговицы', () => {
    const { pts } = buildTie(B1, B2)
    expect(pts.length).toBeGreaterThan(60)
    for (let i = 1; i < pts.length; i++) {
      expect(Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)).toBeLessThanOrEqual(SEG + 1e-6)
    }
    expect(Math.hypot(pts[0].x - B2.x, pts[0].y - B2.y)).toBeLessThan(12)
  })

  it('витки закреплены, хвост свободен и висит ниже верхней пуговицы', () => {
    const { pts, wrapStart, tailStart } = buildTie(B1, B2)
    expect(wrapStart).toBeLessThan(tailStart)
    expect(pts.slice(0, tailStart).every(p => p.pin)).toBe(true)
    expect(pts.slice(tailStart).every(p => !p.pin)).toBe(true)
    expect(pts[pts.length - 1].y).toBeGreaterThan(B2.y)
  })
})

describe('физика', () => {
  it('под гравитацией хвост остаётся связным', () => {
    const { pts, tailStart } = buildTie(B1, B2)
    for (let k = 0; k < 120; k++) {
      integrate(pts, 1 / 60, 0.97, () => ({ x: 0, y: 900 }))
      relax(pts, 12)
    }
    for (let i = tailStart; i < pts.length; i++) {
      const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
      expect(l).toBeLessThan(SEG * 1.3)
    }
  })

  it('held-точка не двигается при relax', () => {
    const { pts } = buildTie(B1, B2)
    const last = pts.length - 1
    pts[last].y += 30
    const y = pts[last].y
    relax(pts, 8, SEG, last)
    expect(pts[last].y).toBe(y)
  })

  it('свободные точки выталкиваются из пуговицы, закреплённые — нет', () => {
    const free = { x: B1.x + 1, y: B1.y, px: 0, py: 0, pin: false }
    const pinned = { x: B1.x + 1, y: B1.y, px: 0, py: 0, pin: true }
    collide([free, pinned], [B1])
    expect(Math.hypot(free.x - B1.x, free.y - B1.y)).toBeGreaterThanOrEqual(R_BTN)
    expect(pinned.x).toBe(B1.x + 1)
  })
})

describe('ropePath и tugCurve', () => {
  it('путь начинается с M и кончается в последней точке', () => {
    const d = ropePath([{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 0 }])
    expect(d.startsWith('M0.0 0.0')).toBe(true)
    expect(d.endsWith('L10.0 0.0')).toBe(true)
  })

  it('рывок резкий в начале и сходит на нет', () => {
    expect(tugCurve(-0.1)).toBe(0)
    expect(tugCurve(0.18)).toBeCloseTo(1)
    expect(tugCurve(0.05)).toBeGreaterThan(0.5)
    expect(tugCurve(1)).toBeCloseTo(0)
    expect(tugCurve(1.2)).toBe(0)
  })
})
