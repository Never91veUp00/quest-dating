// Камера маршрута в перспективе (flow = route): общая для сцен тем — аллеи «Детектива»
// и набережной «Романтика». Текущий участок всегда внизу, над ним видны два следующих.
// Момент хода — в две фазы: путь проступает к следующему участку (камера стоит),
// потом камера подтягивается. Доску открыли сами — маршрут можно листать.
// Сцена рисует своё: дорогу, след, метки и бирки; камера даёт позицию, проекцию и улики.
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import {
  depthOf, project, sideOf, trailStates, cameraAt, fadeBelow, aheadFade, snapTo, NOW_T, HORIZON, AHEAD,
} from '~/utils/trail.js'

const STEPS_MS = 1300 // путь к следующему участку
const GLIDE_MS = 1000 // камера подтягивается
const PX_PER = 150    // столько пикселей пальцем — один участок

export function useRouteCamera(props, { wander, horizon = HORIZON, words }) {
  const root = ref(null)
  const size = ref({ w: 390, h: 480 })

  const states = computed(() => trailStates(
    props.tasks,
    props.completedIds,
    props.tasks.filter(t => props.earnedMap?.[t.id]?.wrong).map(t => t.id),
  ))
  const target = computed(() => cameraAt(props.tasks, props.completedIds))
  const last = computed(() => Math.max(0, props.tasks.length - 1))
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // ─── Ход ───────────────────────────────────────────────────────
  // На старте пара входит: камера подъезжает к первому участку снизу.
  const pos = ref(props.enter && target.value === 0 ? -0.7 : target.value)
  const stepsFrom = ref(target.value) // докуда путь лежал до хода
  const walked = ref(1)               // доля нового пути
  const arrived = ref(true)           // камера дошла: новый участок внизу и стал текущим
  let raf = 0
  const run = (ms, fn) => new Promise((done) => {
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms)
      fn(p)
      if (p < 1) raf = requestAnimationFrame(tick); else done()
    }
    raf = requestAnimationFrame(tick)
  })
  const easeInOut = (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2)
  const walk = async (to, from) => {
    cancelAnimationFrame(raf)
    const start = pos.value
    if (reduced()) { pos.value = to; walked.value = 1; arrived.value = true; stepsFrom.value = to; return }
    if (from >= 0 && to > from) {
      stepsFrom.value = from
      arrived.value = false
      walked.value = 0
      await run(STEPS_MS, (p) => { walked.value = p })
    }
    await run(GLIDE_MS, (p) => { pos.value = start + (to - start) * easeInOut(p) })
    arrived.value = true
    stepsFrom.value = to
  }
  watch(target, (to, from) => walk(to, from))

  // ─── Листание: доску открыли сами — маршрут тянется пальцем ────
  let drag = null
  let dragged = false
  const glideTo = (to) => {
    cancelAnimationFrame(raf)
    const start = pos.value
    if (reduced()) { pos.value = to; return }
    run(Math.min(900, 380 + Math.abs(to - start) * 160), (p) => { pos.value = start + (to - start) * (1 - (1 - p) ** 3) })
  }
  const dragStart = (e) => {
    if (!props.free || !arrived.value) return
    cancelAnimationFrame(raf)
    drag = { y: e.clientY, pos: pos.value, t: performance.now(), v: 0, id: e.pointerId }
    dragged = false
  }
  const dragMove = (e) => {
    if (!drag) return
    const dy = e.clientY - drag.y
    if (!dragged && Math.abs(dy) < 6) return
    if (!dragged) { dragged = true; root.value?.setPointerCapture?.(drag.id) }
    const now = performance.now()
    const np = Math.max(-0.15, Math.min(last.value + 0.15, drag.pos + dy / PX_PER))
    drag.v = (np - pos.value) / Math.max(1, now - drag.t) * 1000
    drag.t = now
    pos.value = np
  }
  const dragEnd = () => {
    if (!drag) return
    const v = drag.v
    drag = null
    if (dragged) glideTo(snapTo(pos.value, v, props.tasks.length))
  }
  // после протяжки бирка под пальцем не открывается
  const eatClick = (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false } }
  let wheelT = 0
  const onWheel = (e) => {
    if (!props.free || !arrived.value) return
    e.preventDefault()
    cancelAnimationFrame(raf)
    pos.value = Math.max(0, Math.min(last.value, pos.value - e.deltaY / PX_PER))
    clearTimeout(wheelT)
    wheelT = setTimeout(() => glideTo(Math.round(pos.value)), 160)
  }
  // доску закрыли и открыли снова — камера на текущем участке
  watch(() => props.free, (f) => { if (!f && arrived.value) glideTo(target.value) })

  // ─── Проекция ──────────────────────────────────────────────────
  const horizonY = computed(() => size.value.h * horizon)
  const at = (u, off) => {
    const t = depthOf(u, pos.value)
    return { t, ...project(t, wander(u) + off, size.value.w, size.value.h, horizon) }
  }
  const yNow = computed(() => project(NOW_T, 0, size.value.w, size.value.h, horizon).y)
  const fade = (y) => fadeBelow(y, yNow.value, size.value.h)

  // ─── Участки для меток и бирок ─────────────────────────────────
  // view: done — пройден (можно перечитать), now — текущий, ahead — впереди, только номер.
  // Пока пара идёт к новому участку, он ещё «впереди»: текущим становится, когда камера дошла.
  const clues = computed(() => {
    const reach = Math.max(target.value, Math.ceil(pos.value)) + AHEAD
    return states.value
      .filter(s => s.index <= reach)
      .map((s) => {
        const view = s.state === 'ahead' || (s.state === 'now' && !arrived.value) ? 'ahead' : s.state === 'now' ? 'now' : 'done'
        const pr = props.progress?.[s.id]
        const note = view === 'now'
          ? (pr?.total > 1 ? `${words.now} · ${pr.done} из ${pr.total}` : words.now)
          : view === 'ahead' ? words.ahead : s.state === 'wrong' ? 'пропущено' : words.done
        return { ...s, view, side: sideOf(s.index), note, title: props.tasks[s.index]?.title || props.itemWord }
      })
  })
  // прозрачность метки: впереди тонет в дымке, пройденная растворяется ниже текущей
  const clueFade = (c, y) => (c.view === 'ahead' ? aheadFade(c.index, pos.value) : c.view === 'done' ? fade(y) : 1)
  // бирке не хватает места с этой стороны — вешаем с другой, метку не закрываем
  const placeTag = (x, gap, tw, side) => {
    const { w } = size.value
    let sd = side
    if (sd < 0 && x - gap - tw < 6) sd = 1
    else if (sd > 0 && x + gap + tw > w - 6) sd = -1
    return { side: sd, x: sd > 0 ? Math.min(x + gap, w - tw - 6) : Math.max(x - gap, tw + 6) }
  }

  const aheadCount = computed(() => props.tasks.length - 1 - Math.max(target.value, Math.round(pos.value)) - AHEAD)
  const allDone = computed(() => states.value.every(s => s.state !== 'ahead'))

  // ─── Размер сцены ──────────────────────────────────────────────
  let ro = null
  const measure = () => {
    const r = root.value?.getBoundingClientRect()
    // во время влёта/анимаций экран масштабирован: меряем по offset-размерам
    const w = root.value?.offsetWidth || r?.width
    const h = root.value?.offsetHeight || r?.height
    if (w && h) size.value = { w: Math.round(w), h: Math.round(h) }
  }
  onMounted(() => {
    measure()
    if (window.ResizeObserver && root.value) { ro = new ResizeObserver(measure); ro.observe(root.value) }
    if (pos.value !== target.value) walk(target.value, -1)
  })
  onUnmounted(() => { cancelAnimationFrame(raf); clearTimeout(wheelT); ro?.disconnect() })

  return {
    root, size, states, target, last, pos, stepsFrom, walked, arrived,
    glideTo, dragStart, dragMove, dragEnd, eatClick, onWheel,
    horizonY, at, yNow, fade, clues, clueFade, placeTag, aheadCount, allDone,
  }
}
