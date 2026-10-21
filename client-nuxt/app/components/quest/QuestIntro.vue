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
      <!-- Хеллоуин: приглашение на вечеринку — шапка-вырубка с луной, котом и летучими мышами -->
      <svg v-if="decor === 'diecut'" class="lid__scene" viewBox="0 0 280 96" aria-hidden="true">
        <rect class="lid__scene-sky" width="280" height="96" />
        <circle class="lid__scene-moon" cx="196" cy="44" r="30" />
        <path class="lid__scene-hill" d="M0 96 V78 Q20 70 40 78 T80 76 T120 80 T160 74 T200 80 T240 76 T280 78 V96 Z" />
        <path class="lid__scene-cut" d="M66 80 C62 75 62 66 66 61 C64 59 64 54 65 50 L64 43 L69 47.6 C71 47 76 47 78 47.6 L83 43 L82 50 C83 54 83 59 81 61 C85 66 85 72 82 76 C86 76 89 73 89 69 L91 69 C91 76 87 80 80 79 Z" />
        <path class="lid__scene-cut" transform="translate(186 34) scale(1.1)" d="M0 2 C-3 -2 -6 -2 -8 -6 C-9 -2 -12 -1 -16 -3 C-15 1 -12 4 -8 4 C-6 7 -3 5 -1.5 7.5 L0 5 L1.5 7.5 C3 5 6 7 8 4 C12 4 15 1 16 -3 C12 -1 9 -2 8 -6 C6 -2 3 -2 0 2 Z" />
        <path class="lid__scene-cut" transform="translate(120 22) scale(.75)" d="M0 2 C-3 -2 -6 -2 -8 -6 C-9 -2 -12 -1 -16 -3 C-15 1 -12 4 -8 4 C-6 7 -3 5 -1.5 7.5 L0 5 L1.5 7.5 C3 5 6 7 8 4 C12 4 15 1 16 -3 C12 -1 9 -2 8 -6 C6 -2 3 -2 0 2 Z" />
        <path class="lid__scene-cut" transform="translate(248 16) scale(.6)" d="M0 2 C-3 -2 -6 -2 -8 -6 C-9 -2 -12 -1 -16 -3 C-15 1 -12 4 -8 4 C-6 7 -3 5 -1.5 7.5 L0 5 L1.5 7.5 C3 5 6 7 8 4 C12 4 15 1 16 -3 C12 -1 9 -2 8 -6 C6 -2 3 -2 0 2 Z" />
      </svg>
      <!-- Зельеварня: большой флакон, пробка под сургучом, ярлык с именем — поверх колбы -->
      <QuestFlask v-if="decor === 'potion'" class="lid__flask" :size="260" :level=".38" />
      <span v-if="decor === 'potion'" class="lid__wax" aria-hidden="true"></span>
      <!-- Свиток: скатанные концы сверху и снизу, внизу сургуч -->
      <QuestSeal v-if="decor === 'map'" class="lid__seal lid__seal--map" :size="84" :seed="9" motto="★ КАРТА ★" />
      <!-- Конверт обратной стороной: клапан под сургучом открывается первым -->
      <span v-if="decor === 'letters'" class="lid__flap" aria-hidden="true">
        <QuestSeal class="lid__seal" :size="88" :seed="5" motto="★ ПИСЬМО ★" />
      </span>
      <!-- Колода: верхняя карта рубашкой вверх, поперёк — бумажная бандероль -->
      <!-- Бант на перекрестье ленты -->
      <svg v-if="decor === 'ringbox'" class="lid__bow" viewBox="0 0 80 50" aria-hidden="true">
        <path d="M40 25 C30 6 8 4 8 20 C8 34 28 32 40 25 Z" />
        <path d="M40 25 C50 6 72 4 72 20 C72 34 52 32 40 25 Z" />
        <path d="M37 27 L28 48 L34 46 L38 49 Z M43 27 L52 48 L46 46 L42 49 Z" />
        <rect x="34" y="19" width="12" height="12" rx="3" />
      </svg>
      <div :class="decor === 'tarot' ? 'lid__band' : decor === 'ringbox' ? 'lid__tag' : decor === 'potion' ? 'lid__label' : decor === 'diecut' ? 'lid__invite' : 'lid__text'">
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
import QuestFlask from './QuestFlask.vue'

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

/* ── Обличье вырубки: приглашение на вечеринку ──────────────────── */
/* вырубка углов маской: вогнутые углы режут и шапку-сцену; тень маска срезала бы, поэтому без неё */
.lid--diecut .lid__face {
  border: none;
  border-radius: 0;
  padding: 0 0 26px;
  background: var(--paper);
  -webkit-mask:
    radial-gradient(circle at 0 0,       transparent 11px, #000 11.5px) top left     / 51% 51% no-repeat,
    radial-gradient(circle at 100% 0,    transparent 11px, #000 11.5px) top right    / 51% 51% no-repeat,
    radial-gradient(circle at 0 100%,    transparent 11px, #000 11.5px) bottom left  / 51% 51% no-repeat,
    radial-gradient(circle at 100% 100%, transparent 11px, #000 11.5px) bottom right / 51% 51% no-repeat;
          mask:
    radial-gradient(circle at 0 0,       transparent 11px, #000 11.5px) top left     / 51% 51% no-repeat,
    radial-gradient(circle at 100% 0,    transparent 11px, #000 11.5px) top right    / 51% 51% no-repeat,
    radial-gradient(circle at 0 100%,    transparent 11px, #000 11.5px) bottom left  / 51% 51% no-repeat,
    radial-gradient(circle at 100% 100%, transparent 11px, #000 11.5px) bottom right / 51% 51% no-repeat;
  max-width: 320px;
  overflow: hidden;
  transition: transform .4s cubic-bezier(.5, 0, .3, 1);
}
.lid__scene { display: block; width: 100%; height: auto; margin-bottom: 18px; }
.lid__scene-sky  { fill: var(--back); }
.lid__scene-moon { fill: var(--chip); }
/* небо — слой бурого картона, холмы и силуэты — сплошной чёрный картон поверх */
.lid__scene-hill { fill: var(--rule); }
.lid__scene-cut  { fill: var(--rule); }
.lid__invite { padding: 0 22px; }
.lid--diecut .lid__title { color: var(--ink); font-size: clamp(1.6rem, 10cqi, 2.4rem); }
.lid--diecut .lid__for { margin-top: 10px; color: var(--ink-soft); }
.lid--diecut .lid__for b { color: var(--ink); }
/* приглашение наклоняется, затем крышка уходит вверх */
.lid--diecut.lid--open { transition-delay: .3s; }
.lid--diecut.lid--open .lid__face { transform: rotate(-6deg) translateY(-14px); }

/* ── Обличье зельеварни: флакон с ярлыком, пробка выскакивает ─── */
.lid--potion .lid__face {
  display: grid; place-items: center;
  max-width: 300px;
  padding: 0;
  border: none;
  border-radius: 0;
  --fl-line: .8;
}
.lid__flask { filter: drop-shadow(0 26px 22px color-mix(in srgb, var(--rule) 80%, transparent)); }
.lid__flask :deep(.fl__cork) { transition: transform .35s cubic-bezier(.3, 0, .2, 1), opacity .35s; transform-box: fill-box; }
/* сургуч на пробке */
.lid__wax {
  position: absolute; left: 50%; top: 2px;
  width: 50px; height: 22px; margin-left: -25px;
  border-radius: 40% 45% 50% 50% / 50% 50% 60% 60%;
  background: var(--wax);
  box-shadow: inset 0 -4px 0 color-mix(in srgb, var(--rule) 30%, transparent);
  transition: transform .35s cubic-bezier(.3, 0, .2, 1), opacity .35s;
}
/* ярлык поверх колбы: бумага с подрезанными углами */
.lid__label {
  position: absolute; left: 50%; top: 62%;
  width: 78%;
  transform: translate(-50%, -50%) rotate(-2deg);
  padding: 18px 16px 16px;
  isolation: isolate;
  /* контур — сам ярлык, бумага — внутренний слой той же формы: линия идёт и по срезам углов */
  background: var(--rule);
  color: var(--ink);
  clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
}
.lid__label::before {
  content: "";
  position: absolute; inset: 1.5px;
  z-index: -1;
  background: var(--paper);
  clip-path: polygon(11.4px 0, calc(100% - 11.4px) 0, 100% 11.4px, 100% calc(100% - 11.4px), calc(100% - 11.4px) 100%, 11.4px 100%, 0 calc(100% - 11.4px), 0 11.4px);
}
.lid--potion .lid__title { color: var(--ink); font-weight: 700; font-size: clamp(1.4rem, 8cqi, 2.1rem); }
.lid--potion .lid__for { margin-top: 8px; color: var(--ink-soft); }
.lid--potion .lid__for b { color: var(--ink); }
/* пробка выскакивает, затем флакон уходит вверх */
.lid--potion.lid--open { transition-delay: .32s; }
.lid--potion.lid--open .lid__wax,
.lid--potion.lid--open .lid__flask :deep(.fl__cork) { transform: translateY(-34px) rotate(-18deg); opacity: 0; }

/* ── Обличье футляра: коробка, перевязанная шёлковой лентой, бирка «Кому» ── */
.lid--ringbox .lid__face {
  display: grid; place-items: center;
  max-width: 320px;
  aspect-ratio: 1;
  padding: 0;
  border: 1.5px solid var(--rule);
  border-radius: 18px;
  /* гранатовая лента крест-накрест поверх бархата, кромка ленты темнее */
  --ribbon: var(--chip);
  --ribbon-edge: color-mix(in srgb, var(--chip) 70%, var(--rule));
  background:
    linear-gradient(90deg, transparent calc(50% - 15px), var(--ribbon-edge) calc(50% - 15px) calc(50% - 14px), var(--ribbon) calc(50% - 14px) calc(50% + 14px), var(--ribbon-edge) calc(50% + 14px) calc(50% + 15px), transparent calc(50% + 15px)),
    linear-gradient(transparent calc(30% - 15px), var(--ribbon-edge) calc(30% - 15px) calc(30% - 14px), var(--ribbon) calc(30% - 14px) calc(30% + 14px), var(--ribbon-edge) calc(30% + 14px) calc(30% + 15px), transparent calc(30% + 15px)),
    var(--back);
  align-content: end;
  padding-bottom: 26px;
  box-shadow:
    0 6px 0 color-mix(in srgb, var(--rule) 22%, var(--back)),
    0 30px 36px -18px color-mix(in srgb, var(--rule) 65%, transparent);
}
/* бант стоит на перекрестье ленты: 30% высоты коробки */
.lid__bow {
  position: absolute; left: 50%; top: 30%;
  width: 96px; height: 60px;
  margin: -30px 0 0 -48px;
  fill: var(--chip);
  stroke: var(--ribbon-edge);
  stroke-width: 1.2;
  stroke-linejoin: round;
  filter: drop-shadow(0 4px 4px color-mix(in srgb, var(--rule) 35%, transparent));
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
    var(--art-sea-waves) 0 0 / 64px 40px,
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
  .lid__flap, .lid--metro .lid__face, .lid__band, .lid__seal--map, .lid__tag, .lid__wax,
  .lid__flask :deep(.fl__cork), .lid--diecut .lid__face { transition: none; }
}
</style>
