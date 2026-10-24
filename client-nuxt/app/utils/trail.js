// Маршрут «Детектива» (flow = route, decor casefile): аллея уходит к горизонту,
// след ведёт от пройденных улик к текущей, дальше — туман.
// Мир меряется в участках: u = 0 — улика I, u = 1 — улика II… Камера стоит так,
// что текущая улика всегда на одной глубине (NOW_T), пройденные — ближе к зрителю.

export const NOW_T = 0.26   // глубина текущей улики: 0 — у края экрана, 1 — горизонт
export const STEP_T = 0.14  // глубина одного участка
export const NEAR_T = -0.08 // ближе этого — уже за спиной камеры
export const HORIZON = 0.12 // горизонт, доля высоты сцены
const SPREAD = 7            // насколько быстро сходится перспектива
export const STRIDE = 0.17      // шаг следа, в участках
export const FOOT_LEN = 0.12    // длина отпечатка, в участках: короче шага, соседние не наезжают
export const FOOT_SPREAD = 21   // расстояние от середины следа до каждой ноги, px ширины 390
export const FOOT_W = 25        // ширина отпечатка у края экрана, px ширины 390

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

// Шаги следа от входа в аллею до позиции камеры: [{ u, foot }], u — пятка,
// foot — левая (−1) или правая (1). Носок последнего отпечатка не заходит за камеру.
export const steps = (pos, from = -0.6) => {
  const out = []
  for (let k = 0; ; k++) {
    const u = from + k * STRIDE
    if (u + FOOT_LEN > pos + 1e-6) break
    out.push({ u, foot: k % 2 ? 1 : -1 })
  }
  return out
}

// След — один на весь путь: шаги лежат на общей сетке от входа в аллею, поэтому
// каждый ход продолжает его от прошлой улики, а не рисует заново. Ярких отпечатков
// TRAIL_SHOWN — последние шаги; старые остаются бледным следом.
export const TRAIL_SHOWN = 3
export const TRAIL_ORIGIN = -2.45 // вход в аллею: у нижнего края сцены, когда пара на старте

// Шаги от from до камеры to, по порядку: [{ u, foot }], u — пятка
export const walkSteps = (from, to) => {
  const out = []
  if (!Number.isFinite(from) || !Number.isFinite(to)) return out
  for (let k = Math.max(0, Math.ceil((from - TRAIL_ORIGIN) / STRIDE - 1e-6)); ; k++) {
    const u = TRAIL_ORIGIN + k * STRIDE
    if (u + FOOT_LEN > to + 1e-6) break
    out.push({ u, foot: k % 2 ? 1 : -1 })
  }
  return out
}

// Что видно при прогрессе хода 0…1: шаги до start уже лежали, новые появляются по одному.
// fresh — яркость: 1 у последних шагов, 0 у старого следа; пока следующий на подходе,
// старший из ярких уходит в след (1 → 0)
export const trailWalk = (list, start, progress, size = TRAIL_SHOWN) => {
  const n = start + progress * (list.length - start)
  const shown = Math.min(list.length, Math.floor(n + 1e-6))
  const out = list.slice(0, shown).map((p, i) => ({ ...p, fresh: shown - 1 - i < size ? 1 : 0 }))
  const frac = n - shown
  if (frac > 1e-6 && shown >= size && shown < list.length) out[shown - size].fresh = 1 - frac
  return out
}

// Отпечаток лежит на земле: пятка и носок проецируются отдельно, поэтому вдали он
// сплющивается вместе с шагом. Матрица SVG переводит стопу в своих координатах
// (x поперёк −.5….5, y от пятки 0 к носку −1) на сцену; width < 0 — зеркально, другая нога.
export const footMatrix = (heel, toe, width) => [width, 0, heel.x - toe.x, heel.y - toe.y, heel.x, heel.y]

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
