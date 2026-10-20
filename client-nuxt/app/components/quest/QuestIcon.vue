<template>
  <svg
    class="qicon"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2.25"
    stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

// Авторский набор иконок плеера: одна толщина линии, без эмодзи.
const ICONS = {
  check:    ['M5 12.5l4.5 4.5L19 7.5'],
  pin:      ['M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0113 0c0 4.8-6.5 11-6.5 11z', 'M12 10.5h.01'],
  task:     ['M7 4h10v16H7z', 'M10 9h4', 'M10 13h4'],
  riddle:   ['M9.2 9a2.9 2.9 0 115.1 1.9c-.9.9-2.3 1.6-2.3 3.1', 'M12 18h.01'],
  code:     ['M5 5h14v14H5z', 'M9 9h.01', 'M15 9h.01', 'M9 15h.01', 'M15 15h.01', 'M12 12h.01'],
  location: ['M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0113 0c0 4.8-6.5 11-6.5 11z', 'M12 7.5v5', 'M9.5 10h5'],
  selfie:   ['M12 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7z', 'M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5'],
  photo:    ['M4 8h3l2-3h6l2 3h3v11H4z', 'M12 16.5a3 3 0 100-6 3 3 0 000 6z'],
  text:     ['M5 7h14', 'M5 12h14', 'M5 17h8'],
  media:    ['M5 5h14v14H5z', 'M10 9l5 3-5 3z'],
  qr:       ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h2v2h-2z', 'M18 18h2v2h-2z'],
  game:     ['M4 4h7v7H4z', 'M13 13h7v7h-7z', 'M16.5 4.5v6', 'M13.5 7.5h6', 'M5 15.5l5 3.5', 'M10 15.5l-5 3.5'],
  back:     ['M15 5l-7 7 7 7'],
  forward:  ['M9 5l7 7-7 7'],
  menu:     ['M12 5.5h.01', 'M12 12h.01', 'M12 18.5h.01'],
  close:    ['M6 6l12 12', 'M18 6L6 18'],
  hint:     ['M9.5 18h5', 'M10.5 21h3', 'M12 3a6 6 0 00-3.5 10.9V16h7v-2.1A6 6 0 0012 3z'],
  restart:  ['M4 12a8 8 0 102.3-5.6', 'M4 4v4.5h4.5'],
  play:     ['M8 5.5v13l10.5-6.5z'],
}

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
})

const paths = computed(() => ICONS[props.name] ?? ICONS.task)
</script>

<style scoped>
.qicon { display: block; flex-shrink: 0; }
</style>
