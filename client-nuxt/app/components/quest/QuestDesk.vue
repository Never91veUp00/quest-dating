<template>
  <div ref="root" class="desk">
    <div class="desk__field" :style="{ aspectRatio: `1 / ${layout.ratio}` }">
      <!-- Вещи на столе: только для вида, под записками и без нажатий -->
      <div class="desk__decor desk__candle" :style="at(deco.candle)" aria-hidden="true"><i class="desk__saucer"></i><i class="desk__wax"></i><i class="desk__flame"></i></div>
      <div class="desk__decor desk__cup" :style="at(deco.cup)" aria-hidden="true"></div>
      <div class="desk__decor desk__sprig" :style="at(deco.sprig)" aria-hidden="true">
        <svg viewBox="0 0 120 40"><path class="desk__stem" d="M2 30 C40 26 70 18 112 8" /><g class="desk__leaf"><ellipse cx="34" cy="24" rx="9" ry="3.2" transform="rotate(-30 34 24)" /><ellipse cx="54" cy="25" rx="8" ry="3" transform="rotate(25 54 25)" /><ellipse cx="72" cy="15" rx="8" ry="3" transform="rotate(-35 72 15)" /></g><circle class="desk__bud" cx="112" cy="8" r="7" /><circle class="desk__bud-hi" cx="108" cy="5" r="4.5" /></svg>
      </div>
      <div class="desk__decor desk__pen" :style="at(deco.pen)" aria-hidden="true">
        <svg viewBox="0 0 200 14"><path class="desk__pen-body" d="M8 7 L30 2 H168 a6 5 0 0 1 0 10 H30 Z" /><path class="desk__pen-gold" d="M168 2.4h18v9.2h-18z M120 2.6h3v8.8h-3z" /><path class="desk__pen-nib" d="M0 7 L10 4 L10 10 Z" /></svg>
      </div>
      <i v-for="p in deco.petals" :key="p.k" class="desk__decor desk__petal" :style="at(p)" aria-hidden="true"></i>

      <!-- Записки-главы: сложенная, конверт, открытка — по очереди -->
      <button
        v-for="n in notes"
        :key="n.i"
        type="button"
        class="desk__note"
        :class="[`desk__note--${n.kind}`, { 'is-done': n.done, 'is-hint': hinting && !n.done }]"
        :style="{ ...at(n.pos), '--d': `${n.hintK * .28}s` }"
        :aria-label="`${theme.copy.blockPrefix} ${n.i + 1}: ${n.block.title}. ${n.done ? 'Прочитано' : n.started ? `${n.passed} из ${n.total}` : 'Не начато'}`"
        @click="$emit('open', n.i, $event.currentTarget)"
      >
        <span class="desk__paper">
          <!-- конверт: клапан закрыт под сургучом или откинут, письмо выглядывает -->
          <template v-if="n.kind === 'env'">
            <span v-if="n.done" class="desk__letter"><svg class="desk__lines" viewBox="0 0 80 22" aria-hidden="true"><path :d="SCRIBBLE[0]" /><path :d="SCRIBBLE[1]" /></svg></span>
            <svg class="desk__flap" viewBox="0 0 145 100" preserveAspectRatio="none" aria-hidden="true"><path :d="n.done ? 'M0 0 L72.5 -46 L145 0' : 'M0 0 L72.5 54 L145 0'" /></svg>
            <span v-if="!n.done" class="desk__seal" aria-hidden="true"><svg viewBox="0 0 20 18"><path :d="HEART" /></svg></span>
            <svg v-else class="desk__postmark" viewBox="0 0 60 40" aria-hidden="true"><circle cx="22" cy="20" r="13" /><circle cx="22" cy="20" r="9.5" /><path d="M38 12 q5-3 10 0 t10 0M38 20 q5-3 10 0 t10 0M38 28 q5-3 10 0 t10 0" /></svg>
          </template>
          <!-- открытка обратной стороной: адрес и марка; прочитана — марку гасит штемпель -->
          <template v-else-if="n.kind === 'card'">
            <span class="desk__stamp" aria-hidden="true">{{ roman(n.i + 1) }}</span>
            <span class="desk__addr" aria-hidden="true"></span>
            <svg v-if="n.done" class="desk__postmark" viewBox="0 0 60 40" aria-hidden="true"><circle cx="22" cy="20" r="13" /><circle cx="22" cy="20" r="9.5" /><path d="M38 12 q5-3 10 0 t10 0M38 20 q5-3 10 0 t10 0M38 28 q5-3 10 0 t10 0" /></svg>
          </template>
          <!-- сложенная записка: стоит домиком, на сгибе сердечко; прочитана — раскрыта -->
          <template v-else>
            <svg v-if="!n.done" class="desk__heart" viewBox="0 0 20 18" aria-hidden="true"><path :d="HEART" /></svg>
            <svg v-else class="desk__lines" viewBox="0 0 80 40" aria-hidden="true"><path v-for="d in SCRIBBLE" :key="d" :d="d" /></svg>
          </template>

          <span v-if="n.kind !== 'card'" class="desk__no">{{ roman(n.i + 1) }}</span>
          <span class="desk__title" :style="{ '--len': longest(n.block.title) }">{{ n.block.title }}</span>
          <span v-if="n.started && !n.done" class="desk__tally">{{ n.passed }}/{{ n.total }}</span>
          <span v-if="n.done && n.kind === 'fold'" class="desk__read">{{ readWord }}</span>
          <span class="desk__corner" aria-hidden="true"></span>
        </span>
      </button>

      <!-- Финал: связка писем под лентой и сургучом. Тап по запертой — связка вздрагивает;
           когда главы прочитаны, лента соскальзывает, сургуч отходит -->
      <button
        type="button"
        class="desk__final"
        :class="{ 'is-locked': locked, 'is-opening': stage === 'opening' }"
        :style="at(layout.final)"
        :aria-disabled="locked"
        :aria-label="locked ? `Последнее письмо запечатано. Откроется, когда прочитаны главы: ${done} из ${total}` : `Последнее письмо: ${final.title}. Открыть`"
        @click="onFinal"
      >
        <span :key="shakeKey" class="desk__stack" :class="{ 'is-shaking': shakeKey > 0 && locked }">
          <span class="desk__env"></span><span class="desk__env"></span>
          <span class="desk__env"><span class="desk__kicker">ПОСЛЕДНЕЕ</span></span>
          <span class="desk__ties" aria-hidden="true">
            <span class="desk__rib desk__rib--v"></span><span class="desk__rib desk__rib--h"></span>
            <svg class="desk__bow" viewBox="0 0 100 60"><path d="M50 30 C34 6 6 8 8 26 C10 42 34 40 50 30Z" /><path d="M50 30 C66 6 94 8 92 26 C90 42 66 40 50 30Z" /><path class="desk__bow-tails" d="M48 32 L36 58 L44 55 L50 60 Z M52 32 L66 58 L58 55 L52 60Z" /></svg>
            <span class="desk__wax"><svg viewBox="0 0 20 18"><path :d="HEART" /></svg></span>
          </span>
          <span v-if="!locked" class="desk__go">ОТКРЫТЬ</span>
          <span class="desk__tag">
            <template v-if="locked"><b>{{ done }} из {{ total }}</b><i>не вскрывать до последней главы</i></template>
            <i v-else class="desk__tag-title">{{ final.title }}</i>
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { roman } from './themes.js'
import { isBlockDone, finalIndex, cluesDone, cluesTotal, finalUnlocked } from '~/utils/boardFlow.js'
import { deskLayout, noteKind } from '~/utils/desk.js'

const props = defineProps({
  blocks:       { type: Array,  required: true },
  theme:        { type: Object, required: true },
  completedIds: { type: Array,  default: () => [] },
  celebrate:    { type: Boolean, default: false },   // финал только что открылся: лента соскальзывает на глазах
})
const emit = defineEmits(['open', 'celebrated'])

const HEART = 'M10 17 C4 12 0 9 0 5 A5 5 0 0 1 10 3 A5 5 0 0 1 20 5 C20 9 16 12 10 17Z'
// строчки письма от руки: волна, а не текст
const SCRIBBLE = [
  'M0 4 q6-3 12 0 t12 0 t12 0 t12 0 t12 0',
  'M0 14 q5-3 10 0 t10 0 t10 0 t10 0 t10 0 t10 0',
  'M0 24 q6-3 12 0 t12 0 t12 0',
]
const readWord = 'прочитано'

const last   = computed(() => finalIndex(props.blocks))
const final  = computed(() => props.blocks[last.value])
const layout = computed(() => deskLayout(last.value))

const notes = computed(() => {
  let hintK = 0
  return props.blocks.slice(0, -1).map((block, i) => {
    const tasks = block.tasks ?? []
    const passed = tasks.filter(t => props.completedIds.includes(t.id)).length
    const done = isBlockDone(block, props.completedIds)
    return {
      i, block, passed, done,
      total:   tasks.length,
      started: passed > 0,
      kind:    noteKind(i),
      pos:     layout.value.notes[i],
      // уголки приподнимаются по очереди только у непрочитанных
      hintK:   done ? 0 : hintK++,
    }
  })
})
const done     = computed(() => cluesDone(props.blocks, props.completedIds))
const total    = computed(() => cluesTotal(props.blocks))
const unlocked = computed(() => finalUnlocked(props.blocks, props.completedIds))

// ─── Связка писем ───────────────────────────────────────────────
// stage: idle — как есть; sealed — финал уже открыт, но лента ещё держит
// (сцена впереди); opening — лента соскальзывает, сургуч отходит
const stage = ref(props.celebrate && unlocked.value ? 'sealed' : 'idle')
const locked = computed(() => !unlocked.value || stage.value === 'sealed')
const shakeKey = ref(0)
const onFinal = (e) => {
  if (locked.value) { shakeKey.value++; return }
  emit('open', last.value, e.currentTarget)
}
const sceneTimers = []
const playOpening = () => {
  sceneTimers.push(setTimeout(() => { stage.value = 'opening' }, 700))
  sceneTimers.push(setTimeout(() => { stage.value = 'idle'; emit('celebrated') }, 700 + 1200))
}

const at = (p) => ({ '--x': `${p.x}%`, '--y': `${p.y}%`, '--r': `${p.r ?? 0}deg` })

// Вещи на столе: свеча в углу, у связки — роза и след от чашки, внизу ручка
const deco = computed(() => {
  const { y: fy } = layout.value.final
  return {
    candle: { x: 8, y: 4 / layout.value.ratio },
    sprig:  { x: 9, y: fy + 2, r: 70 },
    cup:    { x: 90, y: fy + 4 },
    pen:    { x: 16, y: 100 - 1.2 / layout.value.ratio, r: -28 },
    petals: [
      { k: 1, x: 22, y: fy - 9, r: 30 },
      { k: 2, x: 80, y: fy - 11, r: -40 },
      { k: 3, x: 74, y: fy + 12, r: 70 },
    ],
  }
})

// длина самого длинного слова: подпись ужимается, чтобы слово не рвалось по буквам
const longest = (title = '') => Math.max(6, ...title.split(/\s+/).map(w => w.length))

// ─── Подсказка: пару секунд ничего не нажимали — у непрочитанных приподнимаются уголки ──
const HINT_MS = 2000
const hinting = ref(false)
let hintTimer = null
const armHint = () => {
  clearTimeout(hintTimer)
  hintTimer = setTimeout(() => { hinting.value = true }, HINT_MS)
}
const onTouch = () => { hinting.value = false; armHint() }

const root = ref(null)
onMounted(() => {
  armHint()
  document.addEventListener('pointerdown', onTouch, true)
  if (stage.value === 'sealed') playOpening()
})
onUnmounted(() => {
  clearTimeout(hintTimer)
  sceneTimers.forEach(clearTimeout)
  document.removeEventListener('pointerdown', onTouch, true)
})
</script>

<style scoped>
/* Вечерний письменный стол: орех, свеча в углу даёт тёплое пятно света */
.desk {
  --wood: #4a2c22;
  --wood-dark: #2a1612;
  --candle: 255 190 120;
  --ribbon: var(--chip);
  --ribbon-hi: color-mix(in srgb, var(--chip) 60%, #fff);
  --ribbon-lo: color-mix(in srgb, var(--chip) 80%, var(--ink));
  position: relative;
  border-radius: 6px;
  padding: 10px 8px 14px;
  overflow: clip;
  background:
    radial-gradient(120% 60% at 10% 2%, rgb(var(--candle) / .34), rgb(var(--candle) / .08) 45%, transparent 70%),
    radial-gradient(140% 90% at 50% 120%, color-mix(in srgb, var(--wood-dark) 60%, transparent), transparent 60%),
    repeating-linear-gradient(97deg, transparent 0 7px, rgb(0 0 0 / .07) 7px 9px, rgb(255 220 180 / .03) 9px 15px, rgb(0 0 0 / .05) 15px 23px),
    repeating-linear-gradient(95deg, var(--wood) 0 38px, #51312a 38px 70px, #452820 70px 112px, #4d2e24 112px 150px);
  box-shadow: inset 0 0 0 1px rgb(255 220 190 / .06), inset 0 -40px 60px color-mix(in srgb, var(--wood-dark) 35%, transparent);
}
/* свет свечи чуть дышит */
.desk::after {
  content: "";
  position: absolute; inset: 0;
  pointer-events: none;
  background: radial-gradient(60% 30% at 10% 2%, rgb(var(--candle) / .14), transparent 70%);
  animation: desk-flicker 3.2s ease-in-out infinite;
}
@keyframes desk-flicker { 0%, 100% { opacity: 1; } 40% { opacity: .7; } 55% { opacity: .95; } 70% { opacity: .8; } }

.desk__field { position: relative; }
.desk__field > :is(.desk__decor, .desk__note, .desk__final) {
  position: absolute;
  left: var(--x); top: var(--y);
  transform: translate(-50%, -50%) rotate(var(--r, 0deg));
}
.desk span, .desk i, .desk svg { display: block; }

/* ── Вещи ── */
.desk__decor { pointer-events: none; }
.desk__candle { width: 21%; aspect-ratio: 1; }
.desk__candle i { position: absolute; border-radius: 50%; }
.desk__saucer { inset: 0; background: radial-gradient(circle at 40% 35%, #c9a77a, #8a6a45 70%, #5e4530); box-shadow: 0 6px 12px color-mix(in srgb, var(--wood-dark) 70%, transparent); }
.desk__wax { inset: 22%; background: radial-gradient(circle at 45% 40%, #fff6e6, #eadcc4 60%, #d7c3a2); }
.desk__flame {
  left: 43%; top: 43%; width: 14%; height: 14%;
  background: #fff3c4;
  box-shadow: 0 0 10px 6px rgb(255 210 120 / .8), 0 0 40px 22px rgb(var(--candle) / .35);
  animation: desk-flame 1.6s ease-in-out infinite;
}
@keyframes desk-flame { 50% { box-shadow: 0 0 12px 7px rgb(255 210 120 / .7), 0 0 46px 26px rgb(var(--candle) / .3); transform: translate(1px, -1px); } }
.desk__cup {
  width: 24%; aspect-ratio: 1;
  border-radius: 50%;
  border: 5px solid color-mix(in srgb, var(--seal-deep, #661820) 40%, transparent);
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--seal-deep, #661820) 14%, transparent);
}
.desk__sprig { width: 28%; }
.desk__sprig svg, .desk__pen svg { width: 100%; overflow: visible; filter: drop-shadow(0 3px 2px color-mix(in srgb, var(--wood-dark) 70%, transparent)); }
.desk__stem { fill: none; stroke: #5c6b45; stroke-width: 2; }
.desk__leaf { fill: #6f7d52; }
.desk__bud { fill: var(--seal-wax, #8f2630); }
.desk__bud-hi { fill: color-mix(in srgb, var(--chip) 60%, var(--seal-wax, #8f2630)); }
.desk__pen { width: 46%; }
.desk__pen-body { fill: #20120f; }
.desk__pen-gold { fill: #b9935b; }
.desk__pen-nib { fill: #c9a76a; }
.desk__petal {
  width: 4.5%; aspect-ratio: 1.3;
  border-radius: 60% 60% 50% 50% / 70% 70% 40% 40%;
  background: radial-gradient(circle at 40% 30%, color-mix(in srgb, var(--chip) 70%, #fff), color-mix(in srgb, var(--chip) 80%, var(--seal-wax, #8f2630)));
  box-shadow: 0 2px 3px color-mix(in srgb, var(--wood-dark) 60%, transparent);
}

/* ── Записка ── */
.desk__note {
  z-index: 1;
  width: 30%;
  padding: 0;
  border: none;
  background: none;
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  container-type: inline-size;
  -webkit-tap-highlight-color: transparent;
}
.desk__note:focus-visible, .desk__final:focus-visible { outline: 3px solid var(--paper); outline-offset: 4px; }
.desk__paper { position: relative; }
.desk__no { position: absolute; left: 9cqi; top: 7cqi; font-family: var(--font-d); font-weight: 700; font-size: 14cqi; line-height: 1; }
.desk__title {
  position: absolute; left: 9cqi; right: 8cqi; bottom: 7cqi;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  font-family: var(--font-h);
  /* у рукописного ~0.5em на букву: самое длинное слово влезает в строку */
  font-size: min(13.5cqi, calc(83cqi / (var(--len, 6) * .5)));
  line-height: 1.12;
}
.desk__tally { position: absolute; right: 8cqi; top: 6cqi; font-family: var(--font-h); font-size: 12cqi; color: var(--ink-soft); }
.desk__lines { position: absolute; left: 10cqi; width: 80cqi; overflow: visible; }
.desk__lines path { fill: none; stroke: color-mix(in srgb, var(--seal-wax, #8f2630) 70%, var(--ink)); stroke-width: 1.1; stroke-linecap: round; opacity: .75; }
.desk__postmark { position: absolute; overflow: visible; }
.desk__postmark * { fill: none; stroke: color-mix(in srgb, var(--ink) 80%, var(--seal-wax, #8f2630)); stroke-width: 1.3; opacity: .8; }

/* сложенная: стоит домиком — нижняя половина в тени сгиба */
.desk__note--fold .desk__paper {
  aspect-ratio: 1.02;
  border-radius: 2px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--paper) 100%, #fff) 0 49%, color-mix(in srgb, var(--paper-edge) 50%, var(--paper)) 50%, var(--paper) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .6), 0 10px 14px -4px color-mix(in srgb, var(--wood-dark) 80%, transparent), 0 2px 3px color-mix(in srgb, var(--wood-dark) 50%, transparent);
}
.desk__note--fold .desk__paper::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: color-mix(in srgb, var(--ink-soft) 40%, transparent); }
.desk__heart { position: absolute; left: 50%; top: 50%; width: 18cqi; transform: translate(-50%, -50%); }
.desk__heart path { fill: color-mix(in srgb, var(--chip) 70%, var(--seal-wax, #8f2630)); }
.desk__note--fold.is-done .desk__paper {
  aspect-ratio: .86;
  background: linear-gradient(180deg, var(--paper), color-mix(in srgb, var(--paper-edge) 25%, var(--paper)));
  box-shadow: 0 4px 6px color-mix(in srgb, var(--wood-dark) 65%, transparent);
}
.desk__note--fold.is-done .desk__paper::before { background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--ink-soft) 30%, transparent), transparent); }
.desk__note--fold.is-done .desk__title { top: 25cqi; bottom: auto; }
.desk__note--fold.is-done .desk__lines { top: 58cqi; }
.desk__read { position: absolute; right: 7cqi; bottom: 6cqi; font-family: var(--font-h); font-size: 13cqi; color: var(--seal-wax, #8f2630); transform: rotate(-8deg); }

/* конверт: подпись — адрес снизу, на столе */
.desk__note--env { padding-bottom: 2.2em; }
.desk__note--env .desk__paper {
  aspect-ratio: 1.45;
  border-radius: 2px;
  background: color-mix(in srgb, var(--paper-edge) 70%, var(--paper));
  box-shadow: 0 6px 9px -2px color-mix(in srgb, var(--wood-dark) 80%, transparent), 0 1px 2px color-mix(in srgb, var(--wood-dark) 45%, transparent);
}
.desk__flap { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.desk__flap path { fill: var(--paper-edge); stroke: color-mix(in srgb, var(--ink-soft) 35%, transparent); stroke-width: 1; vector-effect: non-scaling-stroke; }
.desk__seal {
  position: absolute; left: 50%; top: 54%;
  display: grid; place-items: center;
  width: 22cqi; aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 47% 53% 50% 50%;
  background: radial-gradient(circle at 38% 35%, color-mix(in srgb, var(--seal-wax, #8f2630) 80%, #fff), var(--seal-wax, #8f2630) 55%, var(--seal-deep, #661820));
  box-shadow: 0 2px 2px color-mix(in srgb, var(--wood-dark) 60%, transparent);
}
.desk__seal svg, .desk__wax svg { width: 52%; }
.desk__seal path, .desk__wax path { fill: none; stroke: color-mix(in srgb, var(--chip) 50%, var(--paper)); stroke-width: 1.6; }
.desk__note--env .desk__title {
  top: calc(100% + 3cqi); bottom: auto; left: 0; right: 0;
  color: var(--field-ink);
  text-align: center;
  text-shadow: 0 1px 2px var(--wood-dark);
}
.desk__letter {
  position: absolute; left: 8%; right: 8%; top: -30%; height: 64%;
  border-radius: 2px;
  background: var(--paper);
  box-shadow: 0 -1px 2px color-mix(in srgb, var(--wood-dark) 20%, transparent);
}
.desk__letter .desk__lines { top: 22%; left: 10%; width: 80%; }
.desk__note--env .desk__postmark { right: 4%; bottom: 8%; width: 40%; }
/* у конверта номер внизу: верх занят клапаном и письмом */
.desk__note--env .desk__no { top: auto; bottom: 7cqi; }
.desk__note--env .desk__letter { z-index: 1; }

/* открытка: слева название, справа марка и строчки адреса */
.desk__note--card .desk__paper {
  aspect-ratio: 1.5;
  border-radius: 3px;
  background: color-mix(in srgb, var(--paper-edge) 15%, var(--paper));
  box-shadow: 0 6px 9px -2px color-mix(in srgb, var(--wood-dark) 80%, transparent), 0 1px 2px color-mix(in srgb, var(--wood-dark) 45%, transparent);
}
.desk__note--card .desk__paper::before { content: ""; position: absolute; left: 52%; top: 14%; bottom: 14%; width: 1px; background: color-mix(in srgb, var(--ink-soft) 30%, transparent); }
.desk__note--card .desk__title {
  left: 8cqi; right: auto; width: 42cqi; top: 9cqi; bottom: auto;
  -webkit-line-clamp: 3;
  /* узкая половина открытки: длинное слово переносится, а не мельчит */
  font-size: max(11cqi, min(13cqi, calc(42cqi / (var(--len, 6) * .5))));
  hyphens: auto;
  overflow-wrap: break-word;
}
.desk__note--card .desk__tally { top: auto; bottom: 5cqi; }
.desk__stamp {
  position: absolute; right: 8%; top: 10%;
  display: grid; place-items: center;
  width: 24%; aspect-ratio: .82;
  background: color-mix(in srgb, var(--chip) 80%, var(--seal-wax, #8f2630));
  color: var(--paper);
  font-family: var(--font-d); font-weight: 700; font-size: 11cqi;
  /* зубцы марки — пунктир цвета бумаги по краю */
  outline: 2.5px dotted var(--paper);
  outline-offset: -1.5px;
}
.desk__addr { position: absolute; left: 56%; right: 8%; top: 52%; height: 34%; background: repeating-linear-gradient(180deg, transparent 0 8px, color-mix(in srgb, var(--ink-soft) 35%, transparent) 8px 9px); }
.desk__note--card .desk__postmark { right: 2%; top: 2%; width: 44%; }

/* Подсказка: уголок непрочитанной записки приподнимается, будто от сквозняка */
.desk__corner {
  position: absolute; right: 0; bottom: 0;
  width: 22cqi; aspect-ratio: 1;
  pointer-events: none;
  background: linear-gradient(135deg, transparent 50%, color-mix(in srgb, var(--paper-edge) 60%, var(--paper)) 50%, var(--paper) 78%);
  box-shadow: -2px -2px 3px color-mix(in srgb, var(--wood-dark) 25%, transparent);
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
  transform-origin: 100% 100%;
  transform: scale(0);
}
.desk__note.is-hint .desk__corner { animation: desk-lift 3.4s ease-in-out var(--d) infinite; }
@keyframes desk-lift { 0%, 62%, 100% { transform: scale(0); } 74% { transform: scale(1); } 86% { transform: scale(.25); } }

/* ── Финал: связка писем ── */
.desk__final {
  z-index: 1;
  width: 46%;
  padding: 0;
  border: none;
  background: none;
  color: var(--ink);
  font: inherit;
  cursor: pointer;
  container-type: inline-size;
  -webkit-tap-highlight-color: transparent;
}
.desk__final.is-locked { cursor: default; }
.desk__stack { position: relative; aspect-ratio: 1.42; }
.desk__env { position: absolute; inset: 0; border-radius: 3px; box-shadow: 0 2px 3px color-mix(in srgb, var(--wood-dark) 40%, transparent); }
.desk__env:nth-child(1) { background: var(--paper-edge); transform: rotate(-7deg) translate(-3%, 4%); }
.desk__env:nth-child(2) { background: color-mix(in srgb, var(--paper-edge) 70%, var(--paper)); transform: rotate(5deg) translate(3%, 2%); }
.desk__env:nth-child(3) { background: color-mix(in srgb, var(--paper-edge) 25%, var(--paper)); box-shadow: 0 14px 20px -6px color-mix(in srgb, var(--wood-dark) 85%, transparent), 0 2px 3px color-mix(in srgb, var(--wood-dark) 50%, transparent); }
.desk__kicker { position: absolute; left: 6cqi; top: 8cqi; font-family: var(--font-d); font-weight: 700; font-size: 5.4cqi; letter-spacing: .1em; }
.desk__ties { position: absolute; inset: 0; transition: transform .7s cubic-bezier(.55, 0, .8, .2), opacity .5s .3s; }
.desk__rib { position: absolute; box-shadow: 0 1px 2px color-mix(in srgb, var(--wood-dark) 40%, transparent); }
.desk__rib--v { top: -2%; bottom: -2%; left: 70%; width: 9%; background: linear-gradient(90deg, var(--ribbon-lo), var(--ribbon-hi) 40%, var(--ribbon)); }
.desk__rib--h { left: -2%; right: -2%; top: 46%; height: 12%; background: linear-gradient(180deg, var(--ribbon-lo), var(--ribbon-hi) 40%, var(--ribbon)); }
.desk__bow { position: absolute; left: 74.5%; top: 52%; width: 46%; transform: translate(-50%, -50%); overflow: visible; filter: drop-shadow(0 3px 2px color-mix(in srgb, var(--wood-dark) 55%, transparent)); }
.desk__bow path { fill: var(--ribbon-hi); stroke: var(--ribbon-lo); stroke-width: 1; }
.desk__bow .desk__bow-tails { fill: var(--ribbon); }
.desk__wax {
  position: absolute; left: 74.5%; top: 52%;
  display: grid; place-items: center;
  width: 17%; aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 48% 52% 46% 54%;
  background: radial-gradient(circle at 38% 35%, color-mix(in srgb, var(--seal-wax, #8f2630) 80%, #fff), var(--seal-wax, #8f2630) 55%, var(--seal-deep, #661820));
  box-shadow: 0 2px 3px color-mix(in srgb, var(--wood-dark) 60%, transparent);
}
.desk__tag {
  position: absolute; left: -4%; bottom: -26%;
  width: 60%;
  padding: 3.5cqi 4cqi 4cqi 9cqi;
  background: #d9b98f;
  color: var(--ink);
  text-align: left;
  clip-path: polygon(9% 0, 100% 0, 100% 100%, 9% 100%, 0 50%);
  transform: rotate(-6deg);
  filter: drop-shadow(0 3px 3px color-mix(in srgb, var(--wood-dark) 55%, transparent));
}
.desk__tag::before { content: ""; position: absolute; left: 4.5cqi; top: 50%; width: 3cqi; height: 3cqi; margin-top: -1.5cqi; border-radius: 50%; background: var(--wood); }
.desk__tag b { display: block; font-family: var(--font-d); font-weight: 700; font-size: 8.5cqi; line-height: 1; font-variant-numeric: lining-nums; }
.desk__tag i { display: block; font-family: var(--font-h); font-style: normal; font-size: 6.4cqi; line-height: 1.1; }
.desk__tag .desk__tag-title { font-size: 7.6cqi; }
.desk__go {
  position: absolute; left: 50%; top: 52%;
  padding: 4.5cqi 7cqi;
  border-radius: 2px;
  background: var(--action);
  color: var(--action-ink);
  font-family: var(--font-d); font-weight: 700; font-size: 7cqi; letter-spacing: .16em;
  white-space: nowrap;
  transform: translate(-50%, -50%);
  animation: desk-go .35s ease-out both;
}
@keyframes desk-go { from { opacity: 0; transform: translate(-50%, -30%); } }

/* Открыта: лента соскальзывает с края, сургуча нет */
.desk__final:not(.is-locked) .desk__ties { transform: translate(40%, 18%) rotate(16deg); opacity: 0; }
.desk__final.is-opening .desk__go { animation-delay: .8s; }

/* Тап по запертой: связка вздрагивает, лента держит */
.desk__stack.is-shaking { animation: desk-shake .45s ease-in-out; }
@keyframes desk-shake {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(-3deg); }
  45% { transform: rotate(2.5deg); }
  70% { transform: rotate(-1.5deg); }
}

@media (prefers-reduced-motion: reduce) {
  .desk::after, .desk__flame, .desk__stack.is-shaking, .desk__go, .desk__note.is-hint .desk__corner { animation: none; }
  .desk__ties { transition: none; }
}

@media (min-width: 700px) {
  /* margin: auto в колонке флекса сжимает стол до содержимого — ширину задаём явно */
  .desk { width: 100%; max-width: 560px; margin: 0 auto; padding: 22px 20px 26px; }
  .desk__note { width: 27%; }
  .desk__lines path { stroke-width: 1.4; }
}
</style>
