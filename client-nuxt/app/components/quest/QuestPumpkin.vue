<template>
  <svg
    class="pk"
    :class="[`pk--${state}`, { 'is-fresh': fresh }]"
    :width="size" :height="size" viewBox="0 0 40 40"
    aria-hidden="true" focusable="false"
  >
    <!-- Хвостик -->
    <path class="pk__stem" d="M18.6 12.4 C18.4 8.6 19.6 6.2 22.6 4.8 L24 6.6 C22 7.6 21.4 9.4 21.6 12.4 Z" />
    <!-- Тыква: три дольки, контур картоном -->
    <ellipse class="pk__body" cx="20" cy="24.5" rx="16" ry="12.5" />
    <path class="pk__rib" d="M20 12 C12.5 15 12.5 34 20 37 M20 12 C27.5 15 27.5 34 20 37" />
    <!-- Лицо прорезано: глаза-треугольники и рот с зубцами, в прорезях — кремовая бумага -->
    <g v-if="state === 'done'" class="pk__face">
      <path class="pk__cut pk__cut--l" d="M11.6 22.6 L15.4 17.6 L18.4 22.6 Z" />
      <path class="pk__cut pk__cut--r" d="M21.6 22.6 L24.6 17.6 L28.4 22.6 Z" />
      <path class="pk__cut pk__cut--m" d="M10.6 26.4 Q20 34.6 29.4 26.4 L26.6 27.8 L24.6 26.6 L22.4 29 L20 27.4 L17.6 29 L15.4 26.6 L13.4 27.8 Z" />
    </g>
    <!-- Бирка с номером дома -->
    <g v-if="label != null && label !== ''">
      <rect class="pk__tag" x="12.5" y="20" width="15" height="10" rx="1.5" />
      <text class="pk__no" x="20" y="28" text-anchor="middle">{{ label }}</text>
    </g>
  </svg>
</template>

<script setup>
// Тыква (тема «Хеллоуин»): тёмная — впереди, оранжевая с биркой — сейчас,
// с вырезанным лицом — пройдена. Свежая на ходу прорезается: глаза, затем рот.
defineProps({
  size:  { type: [Number, String], default: 34 },
  state: { type: String, default: 'back' },   // 'back' | 'active' | 'done'
  label: { type: [String, Number], default: null },
  fresh: { type: Boolean, default: false },
})
</script>

<style scoped>
.pk { display: block; overflow: visible; }
.pk__body { stroke: var(--rule); stroke-width: var(--pk-line, 1.5); }
.pk__rib  { fill: none; stroke: var(--rule); stroke-width: calc(var(--pk-line, 1.5) * .8); }
.pk__stem { fill: color-mix(in srgb, var(--chip) 30%, var(--rule)); stroke: var(--rule); stroke-width: calc(var(--pk-line, 1.5) * .6); stroke-linejoin: round; }
.pk--back .pk__body { fill: var(--back); }
.pk--back .pk__rib  { stroke: color-mix(in srgb, var(--field-ink) 22%, var(--back)); }
.pk--active .pk__body, .pk--done .pk__body { fill: var(--chip); }
.pk__cut { fill: var(--paper); stroke: var(--rule); stroke-width: calc(var(--pk-line, 1.5) * .6); stroke-linejoin: round; }
.pk__tag { fill: var(--paper); stroke: var(--rule); stroke-width: calc(var(--pk-line, 1.5) * .6); }
.pk__no  { fill: var(--ink); font-family: var(--font-d); font-size: 8.5px; font-size-adjust: none; }

/* ход: лицо прорезается — сначала глаза, потом рот */
.pk__cut { transform-box: fill-box; transform-origin: 50% 50%; }
.pk.is-fresh .pk__cut--l { animation: cut-in .22s cubic-bezier(.3, 0, .2, 1) .12s both; }
.pk.is-fresh .pk__cut--r { animation: cut-in .22s cubic-bezier(.3, 0, .2, 1) .3s both; }
.pk.is-fresh .pk__cut--m { animation: cut-in .3s cubic-bezier(.3, 0, .2, 1) .5s both; }
@keyframes cut-in {
  from { transform: scale(0); }
  to   { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pk.is-fresh .pk__cut { animation: none; }
}
</style>
