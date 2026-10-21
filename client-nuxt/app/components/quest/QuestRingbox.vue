<template>
  <svg
    class="rb"
    :class="{ 'is-fresh': fresh }"
    :width="size" :height="size" viewBox="0 0 40 40"
    aria-hidden="true" focusable="false"
  >
    <!-- Откинутая крышка: бархат снаружи, шёлк внутри -->
    <g class="rb__lid">
      <rect class="rb__velvet" x="5" y="2.5" width="30" height="14" rx="3.5" />
      <rect class="rb__silk" x="8" y="5.5" width="24" height="8.5" rx="1.5" />
    </g>
    <!-- Корпус: бархат, сверху подушечка шёлка с прорезью -->
    <rect class="rb__velvet" x="3.5" y="17.5" width="33" height="19" rx="4" />
    <rect class="rb__silk" x="6.5" y="17.5" width="27" height="8.5" rx="2" />
    <!-- Кольцо стоит в прорези: обод вертикальный, нижняя часть скрыта в подушечке -->
    <clipPath v-if="ring" :id="clipId"><rect x="0" y="0" width="40" height="21.6" /></clipPath>
    <ellipse v-if="ring" class="rb__ring" cx="20" cy="17.4" rx="4.2" ry="5.6" :clip-path="`url(#${clipId})`" />
    <path class="rb__slit" :d="ring ? 'M20 21.8 V25.5' : 'M20 19 V25'" />
    <!-- Камень: гранёный, одна краска, грани — шёлком -->
    <g class="rb__stone">
      <path class="rb__gem" :d="ring ? 'M20 6.4 L23 9.2 L20 12.4 L17 9.2 Z' : 'M20 12.4 L23.4 15.6 L20 19.4 L16.6 15.6 Z'" />
      <path class="rb__facet" :d="ring ? 'M17 9.2 H23 M20 6.4 V12.4' : 'M16.6 15.6 H23.4 M20 12.4 V19.4'" />
    </g>
  </svg>
</template>

<script setup>
import { useId } from 'vue'

// Открытый футляр (тема «Предложение»): на клетке пройденного шага — камешек,
// в финале — кольцо с камнем. Свежий футляр открывается: крышка откидывается.
defineProps({
  size:  { type: [Number, String], default: 34 },
  ring:  { type: Boolean, default: false },
  fresh: { type: Boolean, default: false },
})
const clipId = `rb-clip-${useId()}`
</script>

<style scoped>
.rb { display: block; overflow: visible; }
.rb__velvet { fill: var(--back); stroke: var(--rule); stroke-width: var(--rb-line, 1.4); }
.rb__silk   { fill: var(--paper); }
.rb__slit   { stroke: color-mix(in srgb, var(--ink) 35%, var(--paper)); stroke-width: 1.2; stroke-linecap: round; }
.rb__ring   { fill: none; stroke: var(--ink); stroke-width: calc(var(--rb-line, 1.4) * 1.15); }
.rb__gem    { fill: var(--chip); stroke: var(--rule); stroke-width: calc(var(--rb-line, 1.4) * .55); stroke-linejoin: round; }
.rb__facet  { fill: none; stroke: color-mix(in srgb, var(--paper) 70%, var(--chip)); stroke-width: .7; }

/* ход: крышка откидывается от шва, затем показывается камень */
.rb__lid { transform-box: fill-box; transform-origin: 50% 100%; }
.rb.is-fresh .rb__lid { animation: lid-open .42s cubic-bezier(.3, 0, .2, 1) .1s both; }
.rb.is-fresh .rb__stone { animation: stone-in .3s cubic-bezier(.16, 1, .3, 1) .46s both; }
.rb__stone { transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes lid-open {
  from { transform: translateY(15px) scaleY(.15); }
  to   { transform: none; }
}
@keyframes stone-in {
  from { opacity: 0; transform: translateY(3px) scale(.6); }
  to   { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .rb.is-fresh .rb__lid, .rb.is-fresh .rb__stone { animation: none; }
}
</style>
