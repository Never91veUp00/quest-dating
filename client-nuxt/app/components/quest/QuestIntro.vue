<template>
  <div
    class="lid"
    :class="[{ 'lid--open': opening }, decor && `lid--${decor}`]"
    role="button"
    tabindex="0"
    aria-label="Открыть коробку с квестом"
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
    @transitionend.self="onLifted"
  >
    <div class="lid__face">
      <p v-if="decor === 'casefile'" class="lid__case">Дело № {{ caseNo }}</p>
      <!-- Свиток: скатанные концы сверху и снизу, внизу сургуч -->
      <QuestSeal v-if="decor === 'map'" class="lid__seal lid__seal--map" :size="84" :seed="9" motto="★ КАРТА ★" />
      <!-- Конверт обратной стороной: клапан под сургучом открывается первым -->
      <span v-if="decor === 'letters'" class="lid__flap" aria-hidden="true">
        <QuestSeal class="lid__seal" :size="88" :seed="5" motto="★ ПИСЬМО ★" />
      </span>
      <!-- Колода: верхняя карта рубашкой вверх, поперёк — бумажная бандероль -->
      <div :class="decor === 'tarot' ? 'lid__band' : decor === 'ringbox' ? 'lid__tag' : 'lid__text'">
        <h1 class="lid__title">{{ questData.title }}</h1>
        <p v-if="questData.client_name" class="lid__for">
          Кому: <b>{{ questData.client_name }}</b>
        </p>
      </div>
      <span v-if="decor === 'casefile'" class="lid__stamp" aria-hidden="true">Секретно</span>
      <!-- Проездной: линия маршрута со станциями вдоль нижнего края -->
      <span v-if="decor === 'metro'" class="lid__route" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
    </div>
    <p class="lid__hint">Нажми, чтобы открыть</p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import QuestSeal from './QuestSeal.vue'

// Крышка коробки с игрой: название и имя игрока. Поднимается сама
// через пару секунд или по тапу и открывает правила (QuestSplash).
const props = defineProps({
  theme:     { type: Object, required: true },
  questData: { type: Object, required: true },
  duration:  { type: Number, default: 2600 },
})
const emit = defineEmits(['done'])

const decor   = computed(() => props.theme.world?.decor ?? null)
const caseNo  = computed(() => 1000 + (Number(props.questData.id) || 0))
const opening = ref(false)
let timer = null

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const open = () => {
  if (opening.value) return
  clearTimeout(timer)
  opening.value = true
  if (reduced()) emit('done')
}
const onLifted = () => { if (opening.value) emit('done') }

onMounted(() => { timer = setTimeout(open, props.duration) })
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.lid {
  position: fixed; inset: 0; z-index: 200;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 24px 20px max(28px, env(safe-area-inset-bottom));
  background: var(--field);
  color: var(--field-ink);
  cursor: pointer;
  box-shadow: 0 24px 40px -10px color-mix(in srgb, var(--rule) 80%, transparent);
  transition: transform .75s cubic-bezier(.7, 0, .2, 1);
}
.lid:focus-visible { outline: 3px solid var(--field-ink); outline-offset: -8px; }
.lid--open { transform: translateY(-104%); }

.lid__face {
  container-type: inline-size;
  position: relative;
  width: 100%; max-width: 440px;
  padding: 40px 24px;
  border: 3px solid color-mix(in srgb, var(--field-ink) 45%, var(--field));
  border-radius: 14px;
  text-align: center;
}
.lid__text { display: contents; }
.lid__title {
  margin: 0;
  font-family: var(--font-d);
  font-weight: 400;
  /* по ширине папки: «расследование» помещается целиком */
  font-size: clamp(1.4rem, 8.6cqi, 2.9rem);
  line-height: 1.04;
  hyphens: auto;
  overflow-wrap: break-word;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.lid__for {
  margin: 18px 0 0;
  font-family: var(--font-b);
  font-size: 1.15rem;
  color: var(--field-ink-soft);
}
.lid__for b { color: var(--field-ink); font-weight: 700; }
/* Номер дела — на язычке папки */
.lid__case {
  position: absolute; left: 0; bottom: 100%;
  margin: 0;
  padding: 8px 18px 6px;
  background: var(--paper-edge);
  border-radius: 10px 10px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}
.lid__hint {
  margin: 28px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  color: var(--field-ink-soft);
}

/* ── Обличье дела: папка из крафта со штампом ─────────────────── */
.lid--casefile { background: var(--field); }
.lid--casefile .lid__face {
  background: var(--paper-edge);
  color: var(--ink);
  border: none;
  border-radius: 4px 18px 4px 4px;
  padding: 56px 24px 64px;
  box-shadow: 0 22px 30px -18px color-mix(in srgb, var(--rule) 90%, transparent);
}
.lid--casefile .lid__title { color: var(--ink); }
.lid--casefile .lid__for { color: var(--ink-soft); }
.lid--casefile .lid__for b { color: var(--ink); }
.lid__stamp {
  position: absolute; right: 18px; bottom: 16px;
  padding: 6px 12px;
  border: 3px double var(--chip);
  border-radius: 6px;
  color: var(--chip);
  font-family: var(--font-d);
  font-size: 1.15rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  transform: rotate(-9deg);
  opacity: .88;
}

/* ── Обличье переписки: конверт под сургучом ─────────────────── */
.lid--letters .lid__face {
  display: flex; flex-direction: column; justify-content: flex-end;
  aspect-ratio: 10 / 8;
  padding: 0 22px 26px;
  border: none;
  border-radius: 3px;
  color: var(--ink);
  background:
    linear-gradient(to top right, transparent calc(50% - 1px), color-mix(in srgb, var(--rule) 14%, var(--paper-edge)) calc(50% - 1px) calc(50% + .5px), transparent calc(50% + .5px)) left bottom / 50% 64% no-repeat,
    linear-gradient(to top left,  transparent calc(50% - 1px), color-mix(in srgb, var(--rule) 14%, var(--paper-edge)) calc(50% - 1px) calc(50% + .5px), transparent calc(50% + .5px)) right bottom / 50% 64% no-repeat,
    var(--paper-edge);
  box-shadow: 0 22px 30px -18px color-mix(in srgb, var(--rule) 90%, transparent);
  perspective: 900px;
}
.lid__flap {
  position: absolute; left: 0; right: 0; top: 0;
  height: 38cqi;
  transform-origin: top center;
  transition: transform .4s cubic-bezier(.5, 0, .3, 1);
  filter: drop-shadow(0 3px 2px color-mix(in srgb, var(--rule) 35%, transparent));
}
.lid__flap::before {
  content: "";
  position: absolute; inset: 0;
  background: color-mix(in srgb, var(--rule) 6%, var(--paper-edge));
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.lid__seal {
  position: absolute; left: 50%; bottom: 0;
  margin: 0 0 -36px -44px;
  /* тиснение антиквой темы, а не гротеском дела */
  --seal-face: 'Cormorant Garamond';
  font-weight: 700;
  transform: rotate(-8deg);
  transition: opacity .15s;
}
.lid--open .lid__seal { opacity: 0; }
.lid--letters .lid__title { position: relative; color: var(--ink); font-weight: 700; }
.lid--letters .lid__for {
  position: relative;
  margin-top: 8px;
  font-family: var(--font-h);
  font-size: 1.55rem;
  color: var(--ink);
}
.lid--letters .lid__for b { color: var(--ink); font-weight: 400; }
/* сначала клапан откидывается, потом конверт уходит вверх */
.lid--letters.lid--open { transition-delay: .32s; }
.lid--letters.lid--open .lid__flap { transform: rotateX(180deg); }

/* ── Обличье схемы: проездной на бумаге схемы ───────────────── */
.lid--metro .lid__face {
  display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
  aspect-ratio: 85.6 / 54;
  padding: 22px 22px 58px 52px;
  border: none;
  border-radius: 14px;
  background: var(--paper);
  color: var(--ink);
  text-align: left;
  box-shadow:
    inset 30px 0 0 var(--chip),
    0 1px 0 var(--paper-edge),
    0 22px 30px -18px color-mix(in srgb, var(--rule) 60%, transparent);
  transition: transform .3s cubic-bezier(.7, 0, .84, 0);
}
.lid--metro .lid__title { font-weight: 700; color: var(--ink); font-size: clamp(1.4rem, 8cqi, 2.4rem); }
.lid--metro .lid__for { margin-top: 10px; color: var(--ink); }
.lid--metro .lid__for b { color: var(--ink); }
.lid__route {
  position: absolute; left: 52px; right: 26px; bottom: 24px;
  display: flex; justify-content: space-between; align-items: center;
  height: 16px;
}
.lid__route::before {
  content: "";
  position: absolute; left: 4px; right: 4px; top: 50%;
  height: 6px; margin-top: -3px;
  border-radius: 3px;
  background: var(--chip);
}
.lid__route i {
  position: relative;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--plate);
  border: 4px solid var(--chip);
}
/* проездной проходит турникет: карточка уходит вверх, затем поднимается крышка */
.lid--metro.lid--open { transition-delay: .22s; }
.lid--metro.lid--open .lid__face { transform: translateY(-36px); }

/* ── Обличье футляра: коробка, перевязанная шёлковой лентой, бирка «Кому» ── */
.lid--ringbox .lid__face {
  display: grid; place-items: center;
  max-width: 320px;
  aspect-ratio: 1;
  padding: 0;
  border: 1.5px solid var(--rule);
  border-radius: 18px;
  /* лента крест-накрест: две полосы шёлка поверх бархата */
  background:
    linear-gradient(90deg, transparent calc(50% - 15px), var(--paper) calc(50% - 15px) calc(50% + 15px), transparent calc(50% + 15px)),
    linear-gradient(transparent calc(50% - 15px), var(--paper) calc(50% - 15px) calc(50% + 15px), transparent calc(50% + 15px)),
    var(--back);
  box-shadow:
    0 6px 0 color-mix(in srgb, var(--rule) 22%, var(--back)),
    0 30px 36px -18px color-mix(in srgb, var(--rule) 65%, transparent);
}
.lid__tag {
  position: relative;
  width: 78%;
  padding: 22px 18px 20px;
  border-radius: 10px;
  background: var(--paper);
  color: var(--ink);
  box-shadow:
    inset 0 0 0 6px var(--paper),
    inset 0 0 0 7.5px color-mix(in srgb, var(--ink) 25%, var(--paper)),
    0 10px 14px -8px color-mix(in srgb, var(--rule) 60%, transparent);
  transform: rotate(-3deg);
  transition: transform .4s cubic-bezier(.5, 0, .3, 1);
}
.lid--ringbox .lid__title { color: var(--ink); font-size: clamp(1.5rem, 9cqi, 2.3rem); }
.lid--ringbox .lid__for { margin-top: 10px; color: var(--ink-soft); }
.lid--ringbox .lid__for b { color: var(--ink); }
/* бирка поворачивается, затем крышка коробки поднимается */
.lid--ringbox.lid--open { transition-delay: .3s; }
.lid--ringbox.lid--open .lid__tag { transform: rotate(6deg) translateY(-8px); }

/* ── Обличье карты: свиток под сургучом на море ───────────────── */
.lid--map {
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40'%3E%3Cpath d='M4 12 q4 -4 8 0 t8 0 M36 32 q4 -4 8 0 t8 0' fill='none' stroke='%23ecdfc0' stroke-opacity='.22' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E") 0 0 / 64px 40px,
    var(--field);
}
.lid--map .lid__face {
  max-width: 340px;
  margin: 22px 0;
  padding: 46px 26px 64px;
  border: none;
  border-radius: 0;
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 26px 34px -18px color-mix(in srgb, var(--rule) 95%, transparent);
}
/* скатанные концы свитка: валик чуть шире листа, с линией витка */
.lid--map .lid__face::before,
.lid--map .lid__face::after {
  content: "";
  position: absolute; left: -10px; right: -10px;
  height: 24px;
  border-radius: 12px;
  background: var(--paper-edge);
  box-shadow:
    inset 0 -5px 0 color-mix(in srgb, var(--ink) 16%, var(--paper-edge)),
    inset 0 2px 0 color-mix(in srgb, var(--paper) 70%, var(--paper-edge)),
    0 6px 8px -4px color-mix(in srgb, var(--rule) 70%, transparent);
}
.lid--map .lid__face::before { top: -14px; }
.lid--map .lid__face::after  { bottom: -14px; }
.lid--map .lid__hint { margin-top: 64px; }
.lid--map .lid__title { color: var(--ink); font-size: clamp(1.6rem, 10cqi, 2.6rem); }
.lid--map .lid__for { color: var(--ink-soft); }
.lid--map .lid__for b { color: var(--ink); }
.lid__seal--map {
  position: absolute; left: 50%; bottom: -36px;
  margin-left: -42px;
  z-index: 1;
  --seal-face: 'Kurale';
  transform: rotate(-6deg);
  transition: opacity .2s, transform .3s cubic-bezier(.7, 0, .84, 0);
}
/* сургуч ломается, потом свиток уходит вверх */
.lid--map.lid--open { transition-delay: .3s; }
.lid--map.lid--open .lid__seal--map { opacity: 0; transform: rotate(-6deg) scale(1.3); }

/* ── Обличье колоды: новая колода в бандероли ───────────────── */
.lid--tarot .lid__face {
  display: flex; flex-direction: column; justify-content: center;
  width: 100%; max-width: 300px;
  aspect-ratio: 5 / 7.4;
  padding: 0;
  border: none;
  border-radius: 12px;
  background:
    repeating-linear-gradient(45deg,  transparent 0 11px, color-mix(in srgb, var(--paper) 34%, var(--back)) 11px 12.5px),
    repeating-linear-gradient(-45deg, transparent 0 11px, color-mix(in srgb, var(--paper) 34%, var(--back)) 11px 12.5px),
    var(--back);
  /* срез колоды: слои карт под верхней */
  box-shadow:
    inset 0 0 0 9px var(--back),
    inset 0 0 0 11px var(--paper),
    0 3px 0 var(--paper-edge),
    0 6px 0 var(--paper),
    0 9px 0 var(--paper-edge),
    0 12px 0 var(--paper),
    0 30px 36px -18px color-mix(in srgb, var(--rule) 95%, transparent);
}
.lid__band {
  position: relative;
  margin: 0 -10px;
  padding: 22px 22px 20px;
  background: var(--paper);
  color: var(--ink);
  box-shadow:
    inset 0 5px 0 var(--paper), inset 0 6px 0 color-mix(in srgb, var(--ink) 45%, var(--paper)),
    inset 0 -5px 0 var(--paper), inset 0 -6px 0 color-mix(in srgb, var(--ink) 45%, var(--paper)),
    0 6px 10px -6px color-mix(in srgb, var(--rule) 80%, transparent);
  transition: transform .38s cubic-bezier(.5, 0, .3, 1), opacity .38s;
}
.lid--tarot .lid__title { color: var(--ink); font-weight: 700; font-size: clamp(1.4rem, 9cqi, 2.3rem); }
.lid--tarot .lid__for { margin-top: 10px; color: var(--ink-soft); }
.lid--tarot .lid__for b { color: var(--ink); }
/* сначала снимается бандероль, потом поднимается крышка */
.lid--tarot.lid--open { transition-delay: .36s; }
.lid--tarot.lid--open .lid__band { transform: translateX(115%) rotate(4deg); opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .lid { transition: none; }
  .lid__flap, .lid--metro .lid__face, .lid__band, .lid__seal--map, .lid__tag { transition: none; }
}
</style>
