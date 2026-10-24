// Маршрут «Детектива» (flow = route, decor casefile): аллея уходит к горизонту,
// текущая улика стоит внизу, над ней видны следующие, дальше — туман.
// Мир меряется в участках: u = 0 — улика I, u = 1 — улика II… Камера стоит так,
// что текущая улика всегда на одной глубине (NOW_T) у нижнего края, пройденные уходят за край.

export const NOW_T = 0.06   // глубина текущей улики: 0 — у края экрана, 1 — горизонт
export const STEP_T = 0.17  // глубина одного участка
export const NEAR_T = -0.05 // ближе этого — уже за спиной камеры
export const HORIZON = 0.12 // горизонт, доля высоты сцены
const SPREAD = 5            // насколько быстро сходится перспектива
export const AHEAD = 2      // сколько улик впереди видно над текущей
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

// След — один на весь путь: шаги лежат на общей сетке от входа в аллею, поэтому
// каждый ход продолжает его от прошлой улики, а не рисует заново.
export const TRAIL_ORIGIN = -0.53 // вход в аллею: пара пришла снизу, пара шагов под первой уликой
export const STOP_GAP = 0.04      // след останавливается чуть перед табличкой

// Шаги от from до улики to, по порядку: [{ u, foot }], u — пятка,
// foot — левая (−1) или правая (1). Носок последнего не заходит за табличку.
export const walkSteps = (from, to) => {
  const out = []
  if (!Number.isFinite(from) || !Number.isFinite(to)) return out
  for (let k = Math.max(0, Math.ceil((from - TRAIL_ORIGIN) / STRIDE - 1e-6)); ; k++) {
    const u = TRAIL_ORIGIN + k * STRIDE
    if (u + FOOT_LEN > to - STOP_GAP + 1e-6) break
    out.push({ u, foot: k % 2 ? 1 : -1 })
  }
  return out
}

// Что видно при прогрессе хода 0…1: шаги до start уже лежат, новые появляются по одному
export const trailWalk = (list, start, progress) =>
  list.slice(0, Math.min(list.length, start + Math.floor(progress * (list.length - start) + 1e-6)))

// Ниже текущей улики след растворяется к нижнему краю: 1 — выше таблички, 0.12 — у края
const clamp01 = (v) => Math.max(0, Math.min(1, v))
export const fadeBelow = (y, yNow, h) => 0.12 + 0.88 * clamp01(1 - (y - yNow - 6) / Math.max(1, h - yNow - 6)) ** 1.4

// Улика впереди тонет в тумане: две ближние видны, дальше гаснут
export const aheadFade = (i, pos) => clamp01(1.25 - (i - pos - 1) * 0.35)

// Листание аллеи: куда встать, когда палец отпустили (velocity — улик в секунду)
export const snapTo = (pos, velocity, count) =>
  Math.max(0, Math.min(count - 1, Math.round(pos + velocity * 0.18)))

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
