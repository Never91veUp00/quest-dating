// Пробковая доска «Детектива» (flow = board, decor casefile): улики разбросаны
// вокруг финала. Беспорядок держится на сетке 3 × rows: у каждой улики своя
// ячейка, а внутри неё — сдвиг и поворот. Финал — в средней ячейке.
import { taskIcon } from '~/components/quest/taskIcons.js'

const COLS = [17, 50, 83]
// 3 ряда: сначала углы, потом края — при малом числе улик доска не пустеет с одного бока
const ORDER_3 = [0, 2, 6, 8, 1, 7, 3, 5]

// детерминированный «шум» в [-1, 1]: одна и та же доска при каждом открытии
const jit = (i, k) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return (v - Math.floor(v)) * 2 - 1
}
const round = (v) => Math.round(v * 10) / 10

export const corkLayout = (n) => {
  const rows = Math.max(3, Math.ceil((n + 1) / 3))
  const finalRow = Math.floor((rows - 1) / 2)
  const finalCell = finalRow * 3 + 1
  const rowH = 100 / rows
  const order = rows === 3
    ? ORDER_3
    : Array.from({ length: rows * 3 }, (_, c) => c).filter(c => c !== finalCell)
  const at = (cell, i) => ({
    cell,
    x: round(COLS[cell % 3] + jit(i, 1) * 4),
    y: round((Math.floor(cell / 3) + .5) * rowH + jit(i, 2) * rowH * .1),
    r: round(jit(i, 3) * 8),
  })
  return {
    rows,
    final: { cell: finalCell, x: round(50 + jit(99, 1) * 2), y: round((finalRow + .5) * rowH), r: -3 },
    clues: order.slice(0, n).map(at),
  }
}

// Символ улики — тип её заданий (самый частый) и сколько их
export const clueIcon = (block) => {
  const tasks = block?.tasks ?? []
  const counts = {}
  for (const t of tasks) counts[taskIcon(t.type)] = (counts[taskIcon(t.type)] ?? 0) + 1
  const icon = Object.keys(counts).reduce((a, b) => counts[b] > (counts[a] ?? 0) ? b : a, 'task')
  return { icon, count: tasks.length }
}
