// Стол с записками «Романтика» (flow = board, decor letters): записки лежат
// рядами по 2 и 3 вразбежку, посередине — связка последних писем. У каждой
// записки своё место в ряду, внутри него — сдвиг и поворот, поэтому беспорядок
// не прячет записки друг под друга.

// высота ряда записок и ряда связки — в долях ширины стола
export const NOTE_ROW = 0.34
export const FINAL_ROW = 0.46

const COLS = { 1: [50], 2: [28, 72], 3: [18, 50, 82] }

// детерминированный «шум» в [-1, 1]: один и тот же стол при каждом открытии
const jit = (i, k) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return (v - Math.floor(v)) * 2 - 1
}
const round = (v) => Math.round(v * 10) / 10

// ряды по 2 и 3 вперемешку; последний ряд забирает остаток
const rowSizes = (n) => {
  const out = []
  for (let left = n, k = 0; left > 0; k++) {
    const size = Math.min(k % 2 ? 3 : 2, left)
    out.push(size)
    left -= size
  }
  return out
}

export const deskLayout = (n) => {
  const sizes = rowSizes(n)
  // связка — посередине: сверху рядов столько же или на один больше
  const above = Math.ceil(sizes.length / 2)
  const heights = [...sizes.slice(0, above).map(() => NOTE_ROW), FINAL_ROW, ...sizes.slice(above).map(() => NOTE_ROW)]
  const ratio = heights.reduce((a, b) => a + b, 0)
  const tops = heights.map((_, r) => heights.slice(0, r).reduce((a, b) => a + b, 0))
  const mid = (r) => ((tops[r] + heights[r] / 2) / ratio) * 100

  const notes = []
  sizes.forEach((size, row) => {
    const r = row < above ? row : row + 1
    COLS[size].forEach((x) => {
      const i = notes.length
      notes.push({
        row,
        x: round(x + jit(i, 1) * 3),
        y: round(mid(r) + jit(i, 2) * (NOTE_ROW / ratio) * 8),
        r: round(jit(i, 3) * 7),
      })
    })
  })
  return {
    ratio: round(ratio * 100) / 100,
    final: { x: round(50 + jit(99, 1) * 2), y: round(mid(above)), r: -2 },
    notes,
  }
}

// вид записки по очереди: сложенная, конверт, открытка
export const NOTE_KINDS = ['fold', 'env', 'card']
export const noteKind = (i) => NOTE_KINDS[i % NOTE_KINDS.length]
