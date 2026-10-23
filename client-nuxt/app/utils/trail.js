// Маршрут «Детектива» (flow = route, decor casefile): аллея уходит к горизонту,
// след ведёт от пройденных улик к текущей, дальше — туман.
// Мир меряется в участках: u = 0 — улика I, u = 1 — улика II… Камера стоит так,
// что текущая улика всегда на одной глубине (NOW_T), пройденные — ближе к зрителю.

export const NOW_T = 0.26   // глубина текущей улики: 0 — у края экрана, 1 — горизонт
export const STEP_T = 0.14  // глубина одного участка
export const NEAR_T = -0.08 // ближе этого — уже за спиной камеры
export const HORIZON = 0.12 // горизонт, доля высоты сцены
const SPREAD = 7            // насколько быстро сходится перспектива
const STRIDE = 0.06         // шаг следа, в участках

// глубина точки мира u, когда камера стоит на позиции pos (pos — номер текущей улики, дробный во время хода)
export const depthOf = (u, pos) => NOW_T + (u - pos) * STEP_T

// аллея петляет: боковой сдвиг середины в мире, в пикселях ширины 390
export const wander = (u) => Math.sin(u * 1.7 + 0.4) * 46

// Проекция точки (глубина t, сдвиг от середины аллеи off) на сцену w × h.
// Возвращает x, y и масштаб s (1 — у края экрана).
export const project = (t, off, w, h) => {
  const z = 1 + t * SPREAD
  const hz = h * HORIZON
  const k = w / 390
  return { x: w / 2 + (off * k) / z, y: hz + (h - hz) / z, s: 1 / z }
}

export const visible = (t) => t > NEAR_T && t < 1

// Сторона, где стоит табличка улики: по очереди справа и слева от следа
export const sideOf = (i) => (i % 2 ? -1 : 1)

// Шаги следа от входа в аллею до позиции камеры: [{ u, foot }], foot — левая (−1) или правая (1)
export const steps = (pos, from = -0.6) => {
  const out = []
  for (let k = 0; ; k++) {
    const u = from + k * STRIDE
    if (u > pos + 1e-6) break
    out.push({ u, foot: k % 2 ? 1 : -1 })
  }
  return out
}

// Состояние улик для подписей: пройдена, пропущена, текущая, впереди
export const trailStates = (route, doneIds, wrongIds = []) => {
  const current = route.findIndex(r => !doneIds.includes(r.id))
  return route.map((r, i) => ({
    id: r.id,
    index: i,
    state: doneIds.includes(r.id) ? (wrongIds.includes(r.id) ? 'wrong' : 'done') : i === current ? 'now' : 'ahead',
  }))
}

// Где стоит камера: на текущей улике; когда всё пройдено — на последней
export const cameraAt = (route, doneIds) => {
  const current = route.findIndex(r => !doneIds.includes(r.id))
  return current === -1 ? Math.max(0, route.length - 1) : current
}

// Масштаб таблички и бирки: перспектива уменьшает дальнее, но текущая читается лучше всех
export const tagScale = (s, now) => (now ? 1.12 : Math.min(0.95, Math.max(0.72, s * 2.6)))
