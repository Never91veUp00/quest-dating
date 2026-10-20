<template>
  <svg
    class="seal"
    :width="size" :height="size" viewBox="0 0 120 120"
    aria-hidden="true" focusable="false"
  >
    <defs>
      <!-- Объём воска: рельеф из альфы + блик от света слева сверху -->
      <filter :id="ids.wax" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="blur" />
        <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".7" specularExponent="16" lighting-color="#ffe9dc" result="spec">
          <fePointLight x="-40" y="-60" z="110" />
        </feSpecularLighting>
        <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
        <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0" />
      </filter>
      <!-- Выдавленное тиснение: тонкий рельеф для ободка и букв -->
      <filter :id="ids.emboss" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation=".9" result="b" />
        <feSpecularLighting in="b" surfaceScale="2.4" specularConstant=".55" specularExponent="12" lighting-color="#ffe2d4" result="s">
          <fePointLight x="-30" y="-50" z="80" />
        </feSpecularLighting>
        <feComposite in="s" in2="SourceAlpha" operator="in" result="si" />
        <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3=".8" k4="0" />
      </filter>
      <path :id="ids.top" d="M 26 60 A 34 34 0 0 1 94 60" />
      <path :id="ids.bottom" d="M 30 64 A 30 30 0 0 0 90 64" />
    </defs>

    <!-- Капля воска неровной формы -->
    <path :d="blob" class="seal__wax" :filter="`url(#${ids.wax})`" />

    <!-- Тиснение печати -->
    <g class="seal__emboss" :filter="`url(#${ids.emboss})`">
      <circle cx="60" cy="60" r="40" fill="none" stroke-width="2.6" />
      <circle cx="60" cy="60" r="27" fill="none" stroke-width="1.4" />
      <text class="seal__arc" stroke="none">
        <textPath :href="`#${ids.top}`" startOffset="50%" text-anchor="middle">QUEST DATING</textPath>
      </text>
      <text class="seal__arc seal__arc--small" stroke="none">
        <textPath :href="`#${ids.bottom}`" startOffset="50%" text-anchor="middle">{{ motto }}</textPath>
      </text>
      <text class="seal__mono" x="60" y="68" text-anchor="middle" stroke="none">QD</text>
    </g>
  </svg>
</template>

<script setup>
import { computed, useId } from 'vue'

// Сургучная печать Quest Dating: ставится на пройденную клетку в момент хода.
const props = defineProps({
  size:  { type: [Number, String], default: 92 },
  seed:  { type: Number, default: 3 },
  motto: { type: String, default: '★ ДЕЛО ★' },
})

const uid = useId()
const ids = { wax: `wax-${uid}`, emboss: `emb-${uid}`, top: `top-${uid}`, bottom: `bot-${uid}` }

// Неровный край воска: окружность с «волной», сглаженная квадратичными кривыми
const blob = computed(() => {
  const n = 18
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const r = 52 + Math.sin(a * 3 + props.seed) * 2.6 + Math.sin(a * 5 + props.seed * 2) * 1.6
    return [60 + Math.cos(a) * r, 60 + Math.sin(a) * r]
  })
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  let d = `M ${mid(pts[n - 1], pts[0]).join(' ')}`
  for (let i = 0; i < n; i++) {
    const p = pts[i]; const m = mid(p, pts[(i + 1) % n])
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`
  }
  return d + ' Z'
})
</script>

<style scoped>
.seal {
  display: block;
  overflow: visible;
  filter: drop-shadow(0 4px 5px rgba(36, 22, 18, .55));
}
/* Цвет воска задаёт тема: --seal-wax / --seal-deep (запасные — красный сургуч) */
.seal__wax { fill: var(--seal-wax, #a3262a); }
.seal__emboss { fill: var(--seal-deep, #7e1a1e); stroke: var(--seal-deep, #7e1a1e); }
.seal__emboss circle { fill: none; }
.seal__arc {
  font-family: var(--seal-face, 'Dela Gothic One'), 'PT Serif', Georgia, serif;
  font-size: 9.5px;
  letter-spacing: 1.6px;
}
.seal__arc--small { font-size: 7px; letter-spacing: 1.2px; }
.seal__mono {
  font-family: var(--seal-face, 'Dela Gothic One'), 'PT Serif', Georgia, serif;
  font-size: 22px;
}
</style>
