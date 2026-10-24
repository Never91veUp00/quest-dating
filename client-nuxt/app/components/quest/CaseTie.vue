<template>
  <!-- Завязка папки «Дела»: витой шнурок восьмёркой на двух пуговицах.
       В покое кончик покачивается и нить сама коротко дёргается — намёк «потяни»;
       pulled — конец срывают, витки слетают, нить повисает на нижней пуговице -->
  <svg viewBox="0 0 60 120" aria-hidden="true">
    <g v-for="(b, i) in BUTTONS" :key="i">
      <circle :cx="b.x" :cy="b.y + 1.4" :r="R_BTN" class="tie__shade" />
      <g :transform="btnTf[i]">
        <circle :r="R_BTN" class="tie__button" />
        <circle :r="R_BTN - 2.8" class="tie__rim" />
        <circle cx="-2.4" r="1.2" class="tie__hole" />
        <circle cx="2.4" r="1.2" class="tie__hole" />
      </g>
    </g>
    <path :d="d" class="tie__shadow" transform="translate(0 1.5)" />
    <path :d="d" class="tie__cord" />
    <path :d="d" class="tie__twist" />
    <path :d="fray" class="tie__fray" />
  </svg>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { buildTie, integrate, relax, collide, ropePath, tugCurve, R_BTN } from '~/utils/rope.js'

const props = defineProps({
  pulled: { type: Boolean, default: false },
})

const BUTTONS = [{ x: 30, y: 28 }, { x: 30, y: 92 }]
const rope = buildTie(BUTTONS[0], BUTTONS[1])
const { pts, wrapStart, tailStart, anchor } = rope
const tip = pts[pts.length - 1]

const d = ref('')
const fray = ref('')
const btnTf = ref(BUTTONS.map(b => `translate(${b.x} ${b.y})`))

let tug = 0, tugSide = 1
const draw = () => {
  d.value = ropePath(pts)
  const p = pts[pts.length - 3]
  const a = Math.atan2(tip.y - p.y, tip.x - p.x)
  // распушённый кончик
  fray.value = [-0.5, 0, 0.5]
    .map(k => `M${tip.x.toFixed(1)} ${tip.y.toFixed(1)} l${(Math.cos(a + k) * 4.5).toFixed(1)} ${(Math.sin(a + k) * 4.5).toFixed(1)}`)
    .join(' ')
  // пуговицы вздрагивают при рывке: поворот и сдвиг к хвосту
  btnTf.value = BUTTONS.map((b, i) => {
    const k = i ? -5 : 9
    const s = tug * 0.7 * Math.abs(k) / 9
    return `translate(${(b.x + s).toFixed(2)} ${(b.y + s).toFixed(2)}) rotate(${(tug * k * tugSide).toFixed(1)})`
  })
}
draw()

let raf = 0
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// ─── Покой: сквозняк качает кончик, раз в пару секунд нить дёргается ─────
const TUG_MS = 520
const idle = () => {
  const t0 = performance.now()
  let last = t0, tugAt = t0 + 250
  const tick = (now) => {
    const dt = Math.min(1 / 30, (now - last) / 1000); last = now
    const p = (now - tugAt) / TUG_MS
    tug = tugCurve(p)
    if (p > 1) { tugAt = now + 2200 + Math.random() * 600; tugSide = -tugSide }
    // верхний виток отходит от пуговицы в сторону хвоста
    for (let i = wrapStart; i < tailStart; i++) {
      const q = pts[i], w = (i - wrapStart) / (tailStart - wrapStart)
      q.x = q.bx + tug * 2 * w; q.y = q.by + tug * 3 * w
    }
    const tw = (now - t0) / 1000
    const wind = Math.sin(tw * 2.1) * 34 + Math.sin(tw * 3.7 + 1.3) * 12
    integrate(pts, dt, 0.97, (i) => ({ x: wind * (Math.max(0, i - tailStart) / (pts.length - tailStart)) ** 1.5, y: 900 }))
    const held = tug > 0
    if (held) { tip.x = tip.bx - 4 * tug; tip.y = tip.by + 14 * tug }
    relax(pts, 12, undefined, held ? pts.length - 1 : -1)
    draw()
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

// ─── Срыв: конец дёргают вниз сразу на полной скорости, витки слетают
// от конца к началу, нить повисает на нижней пуговице ──────────────────
const PULL_S = 0.22
const FRONT = 1300 // ед/с: как быстро бегут слетающие витки
const untie = () => {
  cancelAnimationFrame(raf)
  tug = 0
  const from = { x: tip.x, y: tip.y }
  const t0 = performance.now()
  let last = t0
  const n = pts.length
  const tick = (now) => {
    const dt = Math.min(1 / 30, (now - last) / 1000); last = now
    const t = (now - t0) / 1000
    const front = n - 1 - t * FRONT / 3.2
    for (let i = anchor; i < n; i++) {
      const p = pts[i]
      if (p.pin && i >= front) {
        p.pin = false
        // виток приподнимается с пуговицы наружу
        if (p.c) {
          const dx = p.x - p.c.x, dy = p.y - p.c.y, l = Math.hypot(dx, dy) || 1
          p.px = p.x - dx / l; p.py = p.y - dy / l
        }
      }
    }
    integrate(pts, dt, 0.985, () => ({ x: 0, y: 1500 }))
    const hold = t < PULL_S
    if (hold) {
      const k = 1 - (1 - t / PULL_S) ** 3
      tip.x = from.x - 40 * k; tip.y = from.y + 105 * k
    }
    relax(pts, 14, undefined, hold ? n - 1 : -1)
    collide(pts, BUTTONS)
    draw()
    if (t < 1.6) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

watch(() => props.pulled, (v) => { if (v && !reduced()) untie() })
onMounted(() => { if (!reduced()) idle() })
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<style scoped>
svg { overflow: visible; }
.tie__shade { fill: color-mix(in srgb, var(--rule) 30%, transparent); }
.tie__button { fill: color-mix(in srgb, var(--rule) 30%, var(--paper-edge)); stroke: var(--rule); stroke-width: 1.5; }
.tie__rim { fill: none; stroke: color-mix(in srgb, var(--rule) 35%, transparent); stroke-width: .9; }
.tie__hole { fill: var(--rule); }
.tie__shadow, .tie__cord, .tie__twist { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.tie__shadow { stroke: color-mix(in srgb, var(--rule) 40%, transparent); stroke-width: 4.4; }
/* витой шнурок: тёмная основа и светлые косые волокна поверх */
.tie__cord { stroke: color-mix(in srgb, var(--chip) 88%, #000); stroke-width: 3.6; }
.tie__twist { stroke: color-mix(in srgb, var(--chip) 70%, #fff); stroke-width: 2; stroke-dasharray: 1.3 2.1; stroke-linecap: butt; }
.tie__fray { stroke: var(--chip); stroke-width: .9; stroke-linecap: round; }
</style>
