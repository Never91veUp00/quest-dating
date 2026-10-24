import { describe, it, expect } from 'vitest'
import { depthOf, project, visible, steps, footMatrix, trailStates, cameraAt, tagScale, sideOf, NOW_T, STEP_T, STRIDE, FOOT_LEN } from '~/utils/trail.js'

const route = [{ id: 'blk-0' }, { id: 'blk-1' }, { id: 'blk-2' }, { id: 'blk-3' }]

describe('depthOf', () => {
  it('текущая улика всегда на одной глубине', () => {
    expect(depthOf(2, 2)).toBe(NOW_T)
    expect(depthOf(5, 5)).toBe(NOW_T)
  })
  it('пройденные ближе, будущие дальше', () => {
    expect(depthOf(1, 2)).toBeCloseTo(NOW_T - STEP_T)
    expect(depthOf(3, 2)).toBeCloseTo(NOW_T + STEP_T)
  })
})

describe('project', () => {
  it('ближе — ниже и крупнее, дальше — к горизонту', () => {
    const near = project(0, 0, 390, 500)
    const far = project(0.9, 0, 390, 500)
    expect(near.y).toBeCloseTo(500)
    expect(near.s).toBe(1)
    expect(far.y).toBeLessThan(near.y)
    expect(far.s).toBeLessThan(near.s)
  })
  it('сдвиг от середины сходится к горизонту и растёт с шириной', () => {
    expect(project(0.9, 100, 390, 500).x - 195).toBeLessThan(project(0, 100, 390, 500).x - 195)
    expect(project(0, 100, 780, 500).x - 390).toBeCloseTo(200)
  })
})

describe('visible', () => {
  it('за спиной камеры и за горизонтом не рисуем', () => {
    expect(visible(-0.2)).toBe(false)
    expect(visible(0.5)).toBe(true)
    expect(visible(1.1)).toBe(false)
  })
})

describe('steps', () => {
  it('носок последнего отпечатка доходит до камеры и не дальше, ноги чередуются', () => {
    const s = steps(1)
    expect(s.at(-1).u + FOOT_LEN).toBeLessThanOrEqual(1 + 1e-6)
    expect(s.at(-1).u + FOOT_LEN).toBeGreaterThan(1 - STRIDE)
    expect(s[0].foot).toBe(-s[1].foot)
  })
  it('отпечаток короче шага: соседние не наезжают друг на друга', () => {
    expect(FOOT_LEN).toBeLessThan(STRIDE)
  })
  it('во время хода след удлиняется', () => {
    expect(steps(1.5).length).toBeGreaterThan(steps(1).length)
  })
})

describe('trailStates', () => {
  it('пройденные, пропущенные, текущая и впереди', () => {
    const st = trailStates(route, ['blk-0', 'blk-1'], ['blk-1']).map(s => s.state)
    expect(st).toEqual(['done', 'wrong', 'now', 'ahead'])
  })
})

describe('cameraAt', () => {
  it('стоит на первой непройденной, после финала — на последней', () => {
    expect(cameraAt(route, ['blk-0'])).toBe(1)
    expect(cameraAt(route, route.map(r => r.id))).toBe(3)
  })
})

describe('tagScale и sideOf', () => {
  it('текущая бирка крупнее любой другой', () => {
    expect(tagScale(1, true)).toBeGreaterThan(tagScale(1, false))
    expect(tagScale(0.01, false)).toBe(0.72)
  })
  it('таблички стоят по очереди справа и слева', () => {
    expect([0, 1, 2].map(sideOf)).toEqual([1, -1, 1])
  })
})

describe('footMatrix', () => {
  // [a b c d e f]: x' = a·x + c·y + e, y' = b·x + d·y + f
  const apply = (m: number[], x: number, y: number) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
  it('пятка (0, 0) ложится на пятку, носок (0, −1) — на носок', () => {
    const m = footMatrix({ x: 100, y: 300 }, { x: 104, y: 280 }, 12)
    expect(apply(m, 0, 0)).toEqual([100, 300])
    expect(apply(m, 0, -1)).toEqual([104, 280])
  })
  it('поперёк стопы — заданная ширина; у другой ноги зеркально', () => {
    expect(apply(footMatrix({ x: 0, y: 0 }, { x: 0, y: -10 }, 12), 1, 0)).toEqual([12, 0])
    expect(apply(footMatrix({ x: 0, y: 0 }, { x: 0, y: -10 }, -12), 1, 0)).toEqual([-12, 0])
  })
})
