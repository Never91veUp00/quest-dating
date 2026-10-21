<template>
  <svg
    class="arcana"
    :width="size" :height="size" viewBox="0 0 40 40"
    aria-hidden="true" focusable="false"
  >
    <g class="arcana__ink" v-html="GLYPHS[no % GLYPHS.length]" />
  </svg>
</template>

<script setup>
// Знак открытой карты (тема «Мистика»): авторская гравюра одной толщины,
// у каждой карты расклада свой знак по её номеру
defineProps({
  no:   { type: Number, default: 0 },
  size: { type: [Number, String], default: 28 },
})

// Рисунки в квадрате 40×40, только контур; точка зрачка и сердцевина — заливкой
const GLYPHS = [
  // солнце: диск и двенадцать лучей через один длинный
  '<circle cx="20" cy="20" r="6.5"/>' +
    Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6, r1 = 10, r2 = i % 2 ? 13.5 : 16.5
      const p = (r) => `${(20 + r * Math.cos(a)).toFixed(2)} ${(20 + r * Math.sin(a)).toFixed(2)}`
      return `<path d="M${p(r1)} L${p(r2)}"/>`
    }).join(''),
  // луна: серп
  '<path d="M25 6.5 A14 14 0 1 0 25 33.5 A11 11 0 1 1 25 6.5 Z"/>',
  // звезда о восьми лучах
  '<path d="M20 4 L22.6 15.4 L31.3 8.7 L24.6 17.4 L36 20 L24.6 22.6 L31.3 31.3 L22.6 24.6 L20 36 L17.4 24.6 L8.7 31.3 L15.4 22.6 L4 20 L15.4 17.4 L8.7 8.7 L17.4 15.4 Z"/>',
  // ключ: кольцо, стержень, две бородки
  '<circle cx="11" cy="20" r="5.5"/><circle cx="11" cy="20" r="2"/><path d="M16.5 20 H35 M30 20 V26 M34 20 V24.5"/>',
  // чаша
  '<path d="M9 8 H31 C31 17 26.5 22.5 20 22.5 C13.5 22.5 9 17 9 8 Z M20 22.5 V31 M13 33 H27 M15.5 33 C17 31.5 23 31.5 24.5 33 M12 12 H28"/>',
  // око
  '<path d="M4 20 C10 11 30 11 36 20 C30 29 10 29 4 20 Z"/><circle cx="20" cy="20" r="5.5"/><circle class="arcana__fill" cx="20" cy="20" r="2.2"/>',
  // колесо о восьми спицах
  '<circle cx="20" cy="20" r="14"/><circle cx="20" cy="20" r="3"/>' +
    Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4
      const p = (r) => `${(20 + r * Math.cos(a)).toFixed(2)} ${(20 + r * Math.sin(a)).toFixed(2)}`
      return `<path d="M${p(3)} L${p(14)}"/>`
    }).join(''),
  // сердце
  '<path d="M20 33 C9 25 5 19 5 13.5 C5 9 8.5 6 12.5 6 C16 6 18.5 8 20 11 C21.5 8 24 6 27.5 6 C31.5 6 35 9 35 13.5 C35 19 31 25 20 33 Z"/><path d="M11 13 C11 10.5 12.5 9.5 14 9.5"/>',
  // роза: завиток бутона, стебель и два листа
  '<path d="M20 15 C22 15 22.5 17.5 20.5 18 C17.5 18.7 16.5 15 19 13 C22 10.6 26 13.5 25 17.5 C24 21.5 17 22.5 14.8 18.5 C12.8 14.8 15.5 9 20.5 9 M20 22 V35 M20 29 C16 29 13 27 12 24 C15.5 24 18.5 25.5 20 29 M20 31 C23.5 30.5 26 28.5 27 26 C24 26 21.5 27.5 20 31"/>',
  // два кольца, сцепленных друг с другом
  '<circle cx="15" cy="21" r="8.5"/><circle cx="25" cy="21" r="8.5"/><path d="M14 9 L15 6.5 L16 9"/>',
]
</script>

<style scoped>
.arcana { display: block; overflow: visible; }
.arcana__ink :deep(*) {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.arcana__ink :deep(.arcana__fill) { fill: currentColor; stroke: none; }
</style>
