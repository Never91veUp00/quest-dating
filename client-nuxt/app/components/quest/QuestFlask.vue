<template>
  <svg
    class="fl"
    :class="{ 'is-fresh': fresh }"
    :width="size" :height="size * 1.2" viewBox="0 0 40 48"
    aria-hidden="true" focusable="false"
  >
    <defs>
      <clipPath :id="ids.glass"><path :d="FLASK" /></clipPath>
    </defs>
    <!-- Стекло: тёмный тон камня под ним, контур чернилами -->
    <path class="fl__glass" :d="FLASK" />
    <!-- Зелье: прямоугольник, обрезанный формой колбы; на ходе поднимается снизу -->
    <g v-if="level > 0" :clip-path="`url(#${ids.glass})`">
      <rect class="fl__potion" x="0" :y="48 - 44 * level" width="40" height="48" />
      <path class="fl__meniscus" :d="`M4 ${48 - 44 * level} H36`" />
    </g>
    <path class="fl__line" :d="FLASK" />
    <!-- Пробка -->
    <rect class="fl__cork" x="15" y="0.8" width="10" height="4.4" rx="1.2" />
    <!-- Бумажный ярлык с номером рецепта -->
    <g v-if="label != null && label !== ''">
      <rect class="fl__label" :x="20 - labelW / 2" y="25" :width="labelW" height="11" rx="1.5" />
      <text class="fl__no" x="20" y="33.6" text-anchor="middle">{{ label }}</text>
    </g>
  </svg>
</template>

<script setup>
import { computed, useId } from 'vue'

// Флакон зельеварни (тема «Зельеварня»): пустой, с ярлыком-номером или наполненный.
// Свежий флакон наполняется на ходу: уровень зелья поднимается от дна.
const props = defineProps({
  size:  { type: [Number, String], default: 34 },
  level: { type: Number, default: 0 },          // 0…1, доля высоты колбы
  label: { type: [String, Number], default: null },
  fresh: { type: Boolean, default: false },
})

// Круглодонная колба: горлышко и шар
const FLASK = 'M16 5 H24 V17 Q34 20.5 34 31.5 A14 14 0 1 1 6 31.5 Q6 20.5 16 17 Z'
// Ярлык шире под длинную надпись («на двоих»), номер — на узком
const labelW = computed(() => String(props.label ?? '').length > 3 ? 27 : 19)
const uid = useId()
const ids = { glass: `fl-glass-${uid}` }
</script>

<style scoped>
.fl { display: block; overflow: visible; }
.fl__glass    { fill: color-mix(in srgb, var(--field-ink) 10%, var(--field)); }
.fl__line     { fill: none; stroke: var(--rule); stroke-width: var(--fl-line, 1.5); stroke-linejoin: round; }
.fl__potion   { fill: var(--chip); }
.fl__meniscus { stroke: color-mix(in srgb, var(--chip) 55%, var(--paper)); stroke-width: 1.2; }
.fl__cork     { fill: var(--paper-edge); stroke: var(--rule); stroke-width: calc(var(--fl-line, 1.5) * .8); }
.fl__label    { fill: var(--paper); stroke: var(--rule); stroke-width: calc(var(--fl-line, 1.5) * .6); }
.fl__no       { fill: var(--ink); font-family: var(--font-d); font-weight: 700; font-size: 9px; font-size-adjust: none; }

/* ход: зелье поднимается от дна флакона */
.fl.is-fresh .fl__potion,
.fl.is-fresh .fl__meniscus { animation: fill-up .7s cubic-bezier(.3, 0, .2, 1) .1s both; }
@keyframes fill-up {
  from { transform: translateY(44px); }
  to   { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .fl.is-fresh .fl__potion, .fl.is-fresh .fl__meniscus { animation: none; }
}
</style>
