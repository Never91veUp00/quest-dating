// Нить на папке «Дела»: витой шнурок восьмёркой на двух пуговицах.
// Верле: точки, связи-отрезки одной длины, гравитация. Координаты — viewBox завязки (60 × 120).

export const SEG = 3.2      // длина звена
export const R_BTN = 9      // пуговица
export const R_WRAP = 11.5  // виток вокруг пуговицы: пуговица плюс толщина нити

const rad = (a) => a * Math.PI / 180

// Завязка: начало под нижней пуговицей, виток, восьмёрка вверх, ещё виток,
// свободный конец висит вдоль края. wrapStart — верхний виток, tailStart — хвост.
export const buildTie = (b1, b2) => {
  const path = []
  const on = (c, a) => ({ x: c.x + R_WRAP * Math.cos(rad(a)), y: c.y + R_WRAP * Math.sin(rad(a)) })
  const arc = (c, a0, a1) => {
    const n = Math.ceil(Math.abs(rad(a1 - a0)) * R_WRAP / SEG)
    for (let i = 0; i <= n; i++) path.push({ ...on(c, a0 + (a1 - a0) * i / n), c })
  }
  const line = (q) => {
    const p = path[path.length - 1]
    const n = Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / SEG)
    for (let i = 1; i < n; i++) path.push({ x: p.x + (q.x - p.x) * i / n, y: p.y + (q.y - p.y) * i / n, c: null })
  }
  arc(b2, 90, 360)
  line(on(b1, 180)); arc(b1, 180, 360)
  line(on(b2, 180)); arc(b2, 180, 0)
  line(on(b1, 180))
  const wrapStart = path.length
  arc(b1, 180, 380)
  const e = path[path.length - 1]
  const tailStart = path.length + 1
  const tail = [{ x: e.x + 8, y: e.y + 20 }, { x: e.x + 12, y: e.y + 72 }, { x: e.x + 10, y: e.y + 128 }]
  for (const q of tail) line(q)
  path.push({ ...tail[2], c: null })
  const pts = path.map(p => ({ x: p.x, y: p.y, px: p.x, py: p.y, bx: p.x, by: p.y, c: p.c, pin: true }))
  // хвост свободен с самого начала: висит с весом
  for (let i = tailStart; i < pts.length; i++) pts[i].pin = false
  return { pts, wrapStart, tailStart, anchor: 4 }
}

// Инерция и сила: force(i) → { x, y } в ед/с²
export const integrate = (pts, dt, damping, force) => {
  pts.forEach((p, i) => {
    if (p.pin) return
    const f = force(i)
    const vx = (p.x - p.px) * damping, vy = (p.y - p.py) * damping
    p.px = p.x; p.py = p.y
    p.x += vx + f.x * dt * dt
    p.y += vy + f.y * dt * dt
  })
}

// Связи: соседние точки на расстоянии rest; закреплённые и held (индекс в руке) не двигаются
export const relax = (pts, iters, rest = SEG, held = -1) => {
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1]
      const wa = a.pin || i === held ? 0 : 1
      const wb = b.pin || i + 1 === held ? 0 : 1
      if (!wa && !wb) continue
      const dx = b.x - a.x, dy = b.y - a.y
      const l = Math.hypot(dx, dy) || 1
      const s = (l - rest) / l / (wa + wb)
      a.x += dx * s * wa; a.y += dy * s * wa
      b.x -= dx * s * wb; b.y -= dy * s * wb
    }
  }
}

// Свободная нить не проходит сквозь пуговицы
export const collide = (pts, buttons, r = R_BTN + 1.6) => {
  for (const p of pts) {
    if (p.pin) continue
    for (const c of buttons) {
      const dx = p.x - c.x, dy = p.y - c.y, l = Math.hypot(dx, dy)
      if (l < r && l > 0) { p.x = c.x + dx / l * r; p.y = c.y + dy / l * r }
    }
  }
}

// Гладкий путь через точки: квадратичные кривые через середины звеньев
export const ropePath = (pts) => {
  if (pts.length < 2) return ''
  const f = (v) => v.toFixed(1)
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]
    d += ` Q${f(a.x)} ${f(a.y)} ${f((a.x + b.x) / 2)} ${f((a.y + b.y) / 2)}`
  }
  const l = pts[pts.length - 1]
  return `${d} L${f(l.x)} ${f(l.y)}`
}

// Рывок-намёк: резко 0 → 1 за 18% времени, мягко назад; p — доля от начала рывка
export const tugCurve = (p) => (p < 0 || p > 1 ? 0 : p < 0.18 ? 1 - (1 - p / 0.18) ** 3 : (1 - (p - 0.18) / 0.82) ** 2)
