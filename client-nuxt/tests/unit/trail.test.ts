import { describe, it, expect } from 'vitest'
import { depthOf, project, visible, footMatrix, walkSteps, trailWalk, fadeBelow, aheadFade, snapTo, petalTrail, PETAL_STEP, trailStates, cameraAt, tagScale, sideOf, NOW_T, STEP_T, STRIDE, FOOT_LEN, TRAIL_ORIGIN, STOP_GAP, AHEAD } from '~/utils/trail.js'

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

describe('камера', () => {
  it('текущая улика у нижнего края, две следующие ещё до тумана', () => {
    const h = 470
    expect(project(depthOf(3, 3), 0, 390, h).y).toBeGreaterThan(h * 0.72)
    expect(depthOf(3 + AHEAD, 3)).toBeLessThan(0.5)
  })
  it('прошлая улика уже за нижним краем', () => {
    expect(project(depthOf(2, 3), 0, 390, 470).y).toBeGreaterThan(470)
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
  it('шаги на одной сетке от входа в аллею: следующий ход продолжает след, а не рисует заново', () => {
    const a = walkSteps(TRAIL_ORIGIN, 1)
    const b = walkSteps(TRAIL_ORIGIN, 2)
    expect(b.slice(0, a.length)).toEqual(a)
    expect(b.length).toBeGreaterThan(a.length)
  })
  it('носок последнего отпечатка останавливается перед табличкой и отстаёт меньше чем на шаг', () => {
    const s = walkSteps(TRAIL_ORIGIN, 2)
    expect(s.at(-1).u + FOOT_LEN).toBeLessThanOrEqual(2 - STOP_GAP + 1e-6)
    expect(s.at(-1).u + FOOT_LEN).toBeGreaterThan(2 - STOP_GAP - STRIDE)
    expect(s[1].u - s[0].u).toBeCloseTo(STRIDE)
    expect(s[0].foot).toBe(-s[1].foot)
  })
  it('на старте под первой уликой уже есть пара шагов: пара пришла снизу', () => {
    expect(walkSteps(TRAIL_ORIGIN, 0).length).toBeGreaterThanOrEqual(2)
  })
})

describe('trailWalk', () => {
  const list = walkSteps(TRAIL_ORIGIN, 2)
  const start = list.findIndex(p => p.u >= 1) // ход начинается от прошлой улики
  it('в покое виден весь след', () => {
    expect(trailWalk(list, start, 1)).toHaveLength(list.length)
  })
  it('на старте хода след до прошлой улики уже лежит, новые шаги — по одному от неё', () => {
    expect(trailWalk(list, start, 0)).toHaveLength(start)
    expect(trailWalk(list, start, 1 / (list.length - start))).toHaveLength(start + 1)
  })
})

describe('fadeBelow', () => {
  it('выше текущей таблички след полный, к нижнему краю растворяется', () => {
    expect(fadeBelow(200, 380, 470)).toBe(1)
    expect(fadeBelow(470, 380, 470)).toBeCloseTo(0.12)
    const mid = fadeBelow(425, 380, 470)
    expect(mid).toBeGreaterThan(0.12)
    expect(mid).toBeLessThan(1)
  })
})

describe('aheadFade', () => {
  it('две ближние улики видны, дальние тонут в тумане', () => {
    expect(aheadFade(4, 3)).toBe(1)
    expect(aheadFade(5, 3)).toBeCloseTo(0.9)
    expect(aheadFade(8, 3)).toBe(0)
  })
})

describe('snapTo', () => {
  it('встаёт на ближайшую улику, бросок пальцем уносит дальше, края не переходит', () => {
    expect(snapTo(2.4, 0, 9)).toBe(2)
    expect(snapTo(2.4, 4, 9)).toBe(3)
    expect(snapTo(-0.3, -5, 9)).toBe(0)
    expect(snapTo(8.4, 5, 9)).toBe(8)
  })
})

describe('petalTrail', () => {
  it('дорожка продолжается, а не рисуется заново, и не доходит до участка', () => {
    const a = petalTrail(1), b = petalTrail(2)
    expect(b.slice(0, a.length)).toEqual(a)
    expect(b.at(-1).u).toBeLessThanOrEqual(2 - 0.1 + 1e-6)
    expect(b[1].u - b[0].u).toBeCloseTo(PETAL_STEP)
  })
  it('под первым участком уже лежат лепестки', () => {
    expect(petalTrail(0).length).toBeGreaterThanOrEqual(3)
  })
  it('лепестки у середины дороги', () => {
    expect(petalTrail(3).every(p => Math.abs(p.off) <= 30)).toBe(true)
  })
})
