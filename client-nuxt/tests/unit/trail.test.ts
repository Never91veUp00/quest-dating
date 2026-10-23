import { describe, it, expect } from 'vitest'
import { depthOf, project, visible, steps, trailStates, cameraAt, tagScale, sideOf, NOW_T, STEP_T } from '~/utils/trail.js'

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
  it('след доходит до камеры и не дальше, ноги чередуются', () => {
    const s = steps(1)
    expect(s.at(-1).u).toBeLessThanOrEqual(1 + 1e-6)
    expect(s.at(-1).u).toBeGreaterThan(0.9)
    expect(s[0].foot).toBe(-s[1].foot)
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
