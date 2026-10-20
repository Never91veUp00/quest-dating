<template>
  <svg
    class="postmark"
    :width="size * 1.5" :height="size" viewBox="0 0 180 120"
    aria-hidden="true" focusable="false"
  >
    <defs>
      <!-- Неровный оттиск: краска ложится пятнами, как резиновый штемпель на бумаге -->
      <filter :id="ids.ink" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" :seed="seed" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 1.6" result="holes" />
        <feComposite in="SourceGraphic" in2="holes" operator="in" />
      </filter>
      <path :id="ids.top" d="M 22 60 A 38 38 0 0 1 98 60" />
      <path :id="ids.bottom" d="M 19 60 A 41 41 0 0 0 101 60" />
    </defs>

    <g class="postmark__ink" :filter="`url(#${ids.ink})`">
      <!-- Круг штемпеля -->
      <circle cx="60" cy="60" r="50" fill="none" stroke-width="3.4" />
      <circle cx="60" cy="60" r="31" fill="none" stroke-width="1.6" />
      <text class="postmark__arc" stroke="none">
        <textPath :href="`#${ids.top}`" startOffset="50%" text-anchor="middle">QUEST DATING</textPath>
      </text>
      <text class="postmark__arc" stroke="none">
        <textPath :href="`#${ids.bottom}`" startOffset="50%" text-anchor="middle">{{ label }}</textPath>
      </text>
      <text class="postmark__no" :class="{ 'postmark__no--date': String(no).length > 3 }" x="60" :y="String(no).length > 3 ? 67 : 72" text-anchor="middle" stroke="none">{{ no }}</text>

      <!-- Гашение: волнистые линии вправо от круга -->
      <path v-for="y in [40, 54, 68, 82]" :key="y" class="postmark__wave" :d="wave(y)" fill="none" stroke-width="3" />
    </g>
  </svg>
</template>

<script setup>
import { useId } from 'vue'

// Почтовый штемпель: гасит пройденный конверт в момент хода (тема «Романтик»).
defineProps({
  size:  { type: [Number, String], default: 80 },
  no:    { type: [Number, String], default: '' },
  label: { type: String, default: 'ДОСТАВЛЕНО' },
  seed:  { type: Number, default: 7 },
})

const uid = useId()
const ids = { ink: `pm-ink-${uid}`, top: `pm-top-${uid}`, bottom: `pm-bot-${uid}` }

// Волна гашения: три горба от края круга до правого края
const wave = (y) => `M 108 ${y} q 9 -7 18 0 t 18 0 t 18 0 t 16 0`
</script>

<style scoped>
.postmark {
  display: block;
  overflow: visible;
  font-size-adjust: none;   /* размеры подписей подобраны под круг штемпеля */
}
.postmark__ink { fill: var(--ink); stroke: var(--ink); opacity: .88; }
.postmark__ink circle, .postmark__wave { fill: none; }
.postmark__arc {
  font-family: var(--font-b);
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 1.4px;
}
.postmark__no {
  font-family: var(--font-d);
  font-weight: 700;
  font-size: 38px;
}
.postmark__no--date { font-size: 21px; }
</style>
