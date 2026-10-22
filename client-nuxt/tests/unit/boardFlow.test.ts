import { describe, it, expect } from 'vitest'
import { isBoardFlow, isBlockDone, finalIndex, cluesDone, finalUnlocked, canOpenBlock } from '~/utils/boardFlow.js'

// Порядок прохождения «доска»: все участки открыты сразу, последний — финал,
// он открывается, когда пройдены все остальные.

const blocks = [
  { title: 'Первая улика', tasks: [{ id: 'a1' }] },
  { title: 'Досье',        tasks: [{ id: 'b1' }, { id: 'b2' }] },
  { title: 'Вещдок',       tasks: [{ id: 'c1' }] },
  { title: 'Дело закрыто', tasks: [{ id: 'f1' }] },
]

describe('isBoardFlow', () => {
  it('включается только у квеста с flow = board', () => {
    expect(isBoardFlow({ flow: 'board', blocks })).toBe(true)
    expect(isBoardFlow({ flow: 'route', blocks })).toBe(false)
    expect(isBoardFlow({ blocks })).toBe(false)
    expect(isBoardFlow(null)).toBe(false)
  })

  it('с одним участком доска не нужна: остаётся маршрут', () => {
    expect(isBoardFlow({ flow: 'board', blocks: [blocks[0]] })).toBe(false)
  })
})

describe('isBlockDone', () => {
  it('участок пройден, когда пройдены все его задания', () => {
    expect(isBlockDone(blocks[1], ['b1'])).toBe(false)
    expect(isBlockDone(blocks[1], ['b1', 'b2'])).toBe(true)
  })

  it('участок без заданий не считается пройденным', () => {
    expect(isBlockDone({ title: 'Пусто', tasks: [] }, [])).toBe(false)
    expect(isBlockDone({ title: 'Пусто' }, [])).toBe(false)
  })
})

describe('финал', () => {
  it('финал — последний участок', () => {
    expect(finalIndex(blocks)).toBe(3)
  })

  it('считает пройденные улики без финала', () => {
    expect(cluesDone(blocks, [])).toBe(0)
    expect(cluesDone(blocks, ['a1', 'b1'])).toBe(1)
    expect(cluesDone(blocks, ['a1', 'b1', 'b2', 'c1', 'f1'])).toBe(3)
  })

  it('заперт, пока не пройдены все улики, в любом порядке', () => {
    expect(finalUnlocked(blocks, ['c1', 'a1'])).toBe(false)
    expect(finalUnlocked(blocks, ['c1', 'b2', 'a1', 'b1'])).toBe(true)
  })

  it('пустая улика не запирает финал навсегда', () => {
    const withEmpty = [blocks[0], { title: 'Пусто', tasks: [] }, blocks[3]]
    expect(finalUnlocked(withEmpty, ['a1'])).toBe(true)
  })
})

describe('canOpenBlock', () => {
  it('любая улика открывается сразу и в любом порядке', () => {
    expect(canOpenBlock(2, blocks, [])).toBe(true)
    expect(canOpenBlock(0, blocks, ['c1'])).toBe(true)
  })

  it('финал открывается только после всех улик', () => {
    expect(canOpenBlock(3, blocks, ['a1', 'b1', 'b2'])).toBe(false)
    expect(canOpenBlock(3, blocks, ['a1', 'b1', 'b2', 'c1'])).toBe(true)
  })

  it('несуществующий участок не открывается', () => {
    expect(canOpenBlock(-1, blocks, [])).toBe(false)
    expect(canOpenBlock(9, blocks, [])).toBe(false)
  })
})
