import { describe, it, expect } from 'vitest'
import { depthOf, project, visible, steps, footMatrix, walkSteps, trailWindow, trailStates, cameraAt, tagScale, sideOf, NOW_T, STEP_T, STRIDE, FOOT_LEN, TRAIL_SHOWN } from '~/utils/trail.js'

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

describe('walkSteps', () => {
  it('шаги идут снизу к камере: последний носок у камеры, первый не ниже начала', () => {
    const s = walkSteps(-1, 2)
    expect(s.at(-1).u + FOOT_LEN).toBeCloseTo(2)
    expect(s[0].u).toBeGreaterThanOrEqual(-1)
    expect(s[1].u - s[0].u).toBeCloseTo(STRIDE)
    expect(s[0].foot).toBe(-s[1].foot)
  })
  it('конец следа один и тот же, откуда бы ни шли: после хода ничего не прыгает', () => {
    const a = walkSteps(-1, 2).slice(-3)
    const b = walkSteps(0.5, 2).slice(-3)
    expect(a).toEqual(b)
  })
})

describe('trailWindow', () => {
  const list = walkSteps(-1, 2)
  it('видно не больше трёх последних отпечатков', () => {
    expect(TRAIL_SHOWN).toBe(3)
    expect(trailWindow(list, 1)).toHaveLength(3)
    expect(trailWindow(list, 1).map(p => p.u)).toEqual(list.slice(-3).map(p => p.u))
  })
  it('сначала появляется первый, потом второй и третий', () => {
    const n = list.length
    expect(trailWindow(list, 0)).toHaveLength(0)
    expect(trailWindow(list, 1 / n).map(p => p.u)).toEqual([list[0].u])
    expect(trailWindow(list, 2 / n)).toHaveLength(2)
  })
  it('четвёртый появляется — первый уходит; пока четвёртый на подходе, первый гаснет', () => {
    const n = list.length
    expect(trailWindow(list, 4 / n).map(p => p.u)).toEqual(list.slice(1, 4).map(p => p.u))
    const mid = trailWindow(list, 3.5 / n)
    expect(mid[0].u).toBe(list[0].u)
    expect(mid[0].fade).toBeCloseTo(0.5)
    expect(mid.at(-1).fade).toBe(1)
  })
})
