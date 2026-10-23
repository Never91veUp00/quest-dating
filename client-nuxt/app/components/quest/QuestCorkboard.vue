<template>
  <div ref="root" class="cork">
    <div class="cork__field" :style="{ aspectRatio: `1 / ${layout.rows * .5}` }">
      <!-- Хлам на пробке: только для вида, под карточками и без нажатий -->
      <div class="cork__decor cork__scrap" :style="at(deco.scrap)" aria-hidden="true"></div>
      <div class="cork__decor cork__clip" :style="at(deco.clip)" aria-hidden="true">
        <b>ХРОНИКА</b><span class="cork__clip-ph"></span><i></i><i></i><i></i><i></i>
      </div>
      <div class="cork__decor cork__map" :style="at(deco.map)" aria-hidden="true">
        <svg viewBox="0 0 100 80"><path class="cork__map-route" d="M12 64 C30 50 40 58 52 40 S78 22 88 14" /><path class="cork__map-x" d="M84 10l8 8M92 10l-8 8" /></svg>
      </div>
      <div class="cork__decor cork__sticky" :style="at(deco.sticky)" aria-hidden="true">кто, где, когда?</div>
      <div class="cork__decor cork__ring" :style="at(deco.ring)" aria-hidden="true"></div>
      <span class="cork__decor cork__lone" :style="at(deco.lone1)" aria-hidden="true"></span>
      <span class="cork__decor cork__lone" :style="at(deco.lone2)" aria-hidden="true"></span>

      <!-- Нити: от кнопки каждой улики к кнопке финала, под карточками -->
      <svg v-if="threads.length" class="cork__threads" :viewBox="`0 0 ${box.w} ${box.h}`" aria-hidden="true">
        <path v-for="t in threads" :key="t.i" :d="t.d" :class="{ 'is-open': !t.done }" />
      </svg>

      <button
        v-for="c in clues"
        :key="c.i"
        type="button"
        class="cork__clue"
        :class="{ 'is-done': c.done }"
        :style="at(c.pos)"
        :data-pin="c.tape ? null : c.i"
        :aria-label="`${theme.copy.blockPrefix} ${c.i + 1}: ${c.block.title}. ${c.done ? 'Пройдено' : c.started ? `${c.passed} из ${c.total}` : 'Не начато'}`"
        @click="$emit('open', c.i)"
      >
        <span v-if="c.tape" class="cork__tape" aria-hidden="true"></span>
        <span class="cork__photo">
          <span class="cork__no">{{ roman(c.i + 1) }}</span>
          <QuestIcon :name="c.icon" size="56%" />
          <span v-if="c.started && !c.done" class="cork__tally">{{ c.passed }}/{{ c.total }}</span>
          <span v-else-if="c.total > 1" class="cork__tally">×{{ c.total }}</span>
          <span v-if="c.done" class="cork__stamp">{{ stampWord }}</span>
        </span>
        <span class="cork__cap" :style="{ '--len': longest(c.block.title) }">{{ c.block.title }}</span>
      </button>

      <button
        type="button"
        class="cork__final"
        :class="{ 'is-locked': !unlocked }"
        :style="at(layout.final)"
        :aria-disabled="!unlocked"
        :aria-label="unlocked ? `Финал: ${final.title}. Открыть` : `Финал: ${final.title}. Заперт: ${done} из ${total}`"
        data-pin="final"
        @click="$emit('open', last)"
      >
        <span class="cork__final-eyebrow">ФИНАЛ</span>
        <span class="cork__final-title">{{ final.title }}</span>
        <span v-if="unlocked" class="cork__final-go">ОТКРЫТЬ</span>
        <span v-else class="cork__final-count"><b>{{ done }} из {{ total }}</b>улик</span>
      </button>

      <span v-for="p in pins" :key="p.key" class="cork__pin" :style="{ left: `${p.x}px`, top: `${p.y}px` }" aria-hidden="true"></span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import QuestIcon from './QuestIcon.vue'
import { roman } from './themes.js'
import { isBlockDone, finalIndex, cluesDone, cluesTotal, finalUnlocked } from '~/utils/boardFlow.js'
import { corkLayout, clueIcon } from '~/utils/corkboard.js'

const props = defineProps({
  blocks:       { type: Array,  required: true },
  theme:        { type: Object, required: true },
  completedIds: { type: Array,  default: () => [] },
})
defineEmits(['open'])

const last  = computed(() => finalIndex(props.blocks))
const final = computed(() => props.blocks[last.value])
const layout = computed(() => corkLayout(last.value))
const stampWord = 'ОТРАБОТАНО'

const clues = computed(() => props.blocks.slice(0, -1).map((block, i) => {
  const tasks = block.tasks ?? []
  const passed = tasks.filter(t => props.completedIds.includes(t.id)).length
  return {
    i, block, passed,
    total:   tasks.length,
    started: passed > 0,
    done:    isBlockDone(block, props.completedIds),
    icon:    clueIcon(block).icon,
    pos:     layout.value.clues[i],
    // каждую пятую улику держит скотч, а не кнопка
    tape:    i % 5 === 3,
  }
}))
const done     = computed(() => cluesDone(props.blocks, props.completedIds))
const total    = computed(() => cluesTotal(props.blocks))
const unlocked = computed(() => finalUnlocked(props.blocks, props.completedIds))

const at = (p) => ({ '--x': `${p.x}%`, '--y': `${p.y}%`, '--r': `${p.r ?? 0}deg` })

// Хлам раскладывается вокруг финала: доля ряда по вертикали
const deco = computed(() => {
  const { x: fx, y: fy } = layout.value.final
  const h = 100 / layout.value.rows
  return {
    clip:   { x: fx + 14, y: fy - h * .6,  r: 7 },
    sticky: { x: fx - 14, y: fy - h * .5,  r: -6 },
    map:    { x: fx - 17, y: fy + h * .45, r: -9 },
    scrap:  { x: fx + 12, y: fy + h * .57, r: 11 },
    ring:   { x: 86, y: 100 - h * .2 },
    lone1:  { x: 92, y: fy - h * .5 },
    lone2:  { x: 7,  y: 100 - h * .25 },
  }
})

// длина самого длинного слова: подпись ужимается, чтобы слово не рвалось по буквам
const longest = (title = '') => Math.max(6, ...title.split(/\s+/).map(w => w.length))

// ─── Нити и кнопки: меряем карточки после раскладки ──────────────
const root    = ref(null)
const box     = ref({ w: 0, h: 0 })
const pins    = ref([])
const threads = ref([])
const measure = () => {
  const field = root.value?.querySelector('.cork__field')
  if (!field) return
  const f = field.getBoundingClientRect()
  if (!f.width) return
  box.value = { w: Math.round(f.width), h: Math.round(f.height) }
  // кнопка — по центру верхнего края повёрнутой карточки
  const pinOf = (el) => {
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.left + r.width / 2 - f.left), y: Math.round(r.top + 7 - f.top) }
  }
  const finalEl = field.querySelector('.cork__final')
  const fp = pinOf(finalEl)
  const next = [{ key: 'final', ...fp }]
  const lines = []
  field.querySelectorAll('.cork__clue').forEach((el, i) => {
    const p = pinOf(el)
    if (el.dataset.pin != null) next.push({ key: i, ...p })
    // нить провисает: середина чуть ниже прямой
    const mx = (p.x + fp.x) / 2, my = (p.y + fp.y) / 2 + 14
    lines.push({ i, done: clues.value[i]?.done, d: `M${p.x} ${p.y} Q${mx} ${my} ${fp.x} ${fp.y}` })
  })
  pins.value = next
  threads.value = lines
}

let ro = null
onMounted(() => {
  nextTick(measure)
  document.fonts?.ready.then(measure)
  if (window.ResizeObserver && root.value) {
    ro = new ResizeObserver(measure)
    ro.observe(root.value)
  }
})
onUnmounted(() => ro?.disconnect())
watch(() => props.completedIds.length, () => nextTick(measure))
</script>

<style scoped>
/* Пробка в деревянной раме: плоская печать, крапинки точками */
.cork {
  --cork: #94714b;
  --cork-frame: #3e2f25;
  --pin-hi: #d9574f;
  position: relative;
  border: 9px solid var(--cork-frame);
  border-radius: 4px;
  padding: 14px 8px 18px;
  background:
    radial-gradient(circle at 20% 30%, #7d5d3c 0 1.2px, transparent 1.6px) 0 0 / 11px 13px,
    radial-gradient(circle at 70% 60%, #a8845a 0 1.4px, transparent 1.8px) 0 0 / 17px 15px,
    radial-gradient(circle at 40% 80%, #6f5136 0 1px, transparent 1.4px) 0 0 / 23px 19px,
    var(--cork);
  box-shadow: inset 0 0 0 1px var(--rule), inset 0 3px 0 color-mix(in srgb, var(--rule) 25%, transparent);
  overflow: clip;
}
.cork__field { position: relative; }
.cork__field > :is(.cork__decor, .cork__clue, .cork__final) {
  position: absolute;
  left: var(--x); top: var(--y);
  transform: translate(-50%, -50%) rotate(var(--r, 0deg));
}

/* ── Хлам ── */
.cork__decor { pointer-events: none; }
.cork__scrap {
  width: 22%; aspect-ratio: 1 / 1.2;
  padding: 10px 8px;
  background: #e9e1cf;
  background-image: repeating-linear-gradient(to bottom, transparent 0 9px, color-mix(in srgb, var(--ink) 22%, transparent) 9px 10px);
  background-origin: content-box; background-clip: content-box;
  box-shadow: 0 0 0 8px #e9e1cf, 0 6px 10px -6px color-mix(in srgb, var(--rule) 70%, transparent);
}
.cork__clip {
  width: 27%; aspect-ratio: 1 / 1.05;
  padding: 7px 6px;
  background: #e2dccb;
  box-shadow: 0 5px 8px -5px color-mix(in srgb, var(--rule) 70%, transparent);
  clip-path: polygon(0 3%, 9% 0, 22% 4%, 37% 0, 52% 3%, 68% 0, 83% 4%, 100% 1%, 98% 22%, 100% 47%, 97% 72%, 100% 97%, 80% 100%, 61% 96%, 42% 100%, 24% 97%, 5% 100%, 2% 76%, 0 51%, 3% 26%);
}
.cork__clip b { display: block; margin-bottom: 4px; font-family: var(--font-d); font-weight: 400; font-size: 7px; letter-spacing: .08em; color: #3a312a; }
.cork__clip i { display: block; height: 3px; margin: 3px 0; background: #9c9384; }
.cork__clip i:nth-child(3n) { width: 70%; }
.cork__clip-ph { display: block; height: 24px; margin: 5px 0; background: #8e8576; }
.cork__map {
  width: 30%; aspect-ratio: 1.25;
  overflow: hidden;
  background: #d9cba5;
  background-image:
    linear-gradient(28deg, transparent 46%, #efe6cc 46% 54%, transparent 54%),
    linear-gradient(-62deg, transparent 47%, #efe6cc 47% 53%, transparent 53%),
    linear-gradient(90deg, transparent 30%, #b7c4a0 30% 52%, transparent 52%);
  box-shadow: 0 5px 8px -5px color-mix(in srgb, var(--rule) 70%, transparent);
}
.cork__map svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.cork__map-route { fill: none; stroke: var(--chip); stroke-width: 2.2; stroke-dasharray: 4 4; }
.cork__map-x { fill: none; stroke: var(--chip); stroke-width: 2.4; }
.cork__sticky {
  width: 19%; aspect-ratio: 1;
  padding: 6px;
  overflow: hidden;
  background: #e7cf7a;
  color: #3a2e1f;
  font-family: var(--font-b);
  font-style: italic;
  font-size: 8.5px;
  line-height: 1.15;
  box-shadow: 0 4px 6px -4px color-mix(in srgb, var(--rule) 70%, transparent);
}
.cork__ring {
  width: 18%; aspect-ratio: 1;
  border-radius: 50%;
  border: 3px solid color-mix(in srgb, #4a301a 45%, transparent);
  box-shadow: inset 0 0 0 2px color-mix(in srgb, #4a301a 18%, transparent);
}
.cork__lone {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #e3d6a4 0 22%, #b49a4e 24% 100%);
  box-shadow: 0 2px 2px color-mix(in srgb, var(--rule) 55%, transparent);
}

/* ── Нити и кнопки ── */
.cork__threads { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.cork__threads path { fill: none; stroke: var(--chip); stroke-width: 1.8; stroke-linecap: round; }
.cork__threads path.is-open { stroke-dasharray: 3 4; opacity: .75; }
.cork__pin {
  position: absolute; z-index: 3;
  width: 14px; height: 14px; margin: -7px 0 0 -7px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--pin-hi) 0 22%, var(--chip) 24% 100%);
  box-shadow: 0 2px 2px color-mix(in srgb, var(--rule) 55%, transparent);
  pointer-events: none;
}

/* ── Улика: полароид ── */
.cork__clue {
  z-index: 1;
  width: 24%;
  padding: 5px 5px 6px;
  background: var(--paper);
  color: var(--ink);
  border: none;
  border-radius: 2px;
  box-shadow: 0 6px 10px -6px color-mix(in srgb, var(--rule) 75%, transparent);
  font: inherit;
  text-align: left;
  cursor: pointer;
  container-type: inline-size;
}
.cork__clue:focus-visible, .cork__final:focus-visible { outline: 3px solid var(--paper); outline-offset: 3px; }
.cork__tape {
  position: absolute; top: -6px; left: 50%;
  width: 38px; height: 13px;
  background: color-mix(in srgb, #efe6cf 70%, transparent);
  transform: translateX(-50%) rotate(-6deg);
}
.cork__photo {
  position: relative;
  display: grid; place-items: center;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--back);
  color: color-mix(in srgb, var(--paper) 86%, var(--back));
}
.cork__photo :deep(.qicon) { stroke-width: 1.7; }
.cork__no {
  position: absolute; left: 4px; top: 2px;
  font-family: var(--font-d);
  font-size: 9px;
  color: color-mix(in srgb, var(--paper) 70%, var(--back));
}
.cork__tally {
  position: absolute; right: 5px; bottom: 3px;
  font-family: var(--font-d);
  font-size: 11px;
  color: var(--paper);
}
.cork__clue.is-done .cork__photo { background: var(--done); color: color-mix(in srgb, var(--ink) 35%, var(--done)); }
.cork__clue.is-done .cork__tally { color: var(--ink-soft); }
.cork__stamp {
  position: absolute; left: 4px; right: 4px; top: 50%;
  padding: 2px 0;
  border: 2px solid var(--chip);
  background: color-mix(in srgb, var(--done) 60%, transparent);
  color: var(--chip);
  font-family: var(--font-d);
  /* слово штампа целиком влезает в повёрнутую плашку на любом полароиде */
  font-size: min(11px, 8.2cqi);
  text-align: center;
  white-space: nowrap;
  transform: translateY(-50%) rotate(-14deg);
}
.cork__cap {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.3em;
  margin-top: 5px;
  font-size: 10px;
  /* ~0.6em на букву у текстового шрифта: самое длинное слово влезает в подпись */
  font-size: min(11px, calc(100cqi / (var(--len, 6) * .6)));
  line-height: 1.15;
  hyphens: auto;
  overflow-wrap: break-word;
}

/* ── Финал: папка дела ── */
.cork__final {
  z-index: 1;
  width: 31%;
  padding: 12px 8px 10px;
  background: var(--paper);
  color: var(--ink);
  border: none;
  border-radius: 3px 10px 3px 3px;
  box-shadow: 0 8px 14px -8px color-mix(in srgb, var(--rule) 80%, transparent);
  font: inherit;
  text-align: center;
  cursor: pointer;
}
.cork__final::before {
  content: "";
  position: absolute; top: -9px; left: 10px;
  width: 46px; height: 12px;
  background: inherit;
  border-radius: 4px 4px 0 0;
}
.cork__final.is-locked { background: var(--paper-edge); cursor: default; }
.cork__final-eyebrow, .cork__final-title, .cork__final-go, .cork__final-count { display: block; }
.cork__final-eyebrow { font-family: var(--font-d); font-size: 9px; letter-spacing: .12em; }
.cork__final-title { margin-top: 6px; font-family: var(--font-d); font-size: 15px; line-height: 1.1; }
.cork__final-count { margin-top: 8px; font-size: 12px; color: var(--ink-soft); }
.cork__final-count b { display: block; font-family: var(--font-d); font-weight: 400; font-size: 20px; line-height: 1; color: var(--chip); }
.cork__final-go {
  margin-top: 8px;
  padding: 9px 4px;
  border-radius: 3px;
  background: var(--action);
  color: var(--action-ink);
  font-family: var(--font-d);
  font-size: 11px;
  letter-spacing: .06em;
}

@media (min-width: 700px) {
  /* margin: auto в колонке флекса сжимает доску до содержимого — ширину задаём явно */
  .cork { width: 100%; max-width: 640px; margin: 0 auto; padding: 28px 24px 32px; }
  .cork__no { font-size: 11px; }
  .cork__tally { font-size: 14px; }
  .cork__sticky { font-size: 13px; padding: 10px; }
  .cork__clip { padding: 12px 10px; }
  .cork__clip b { font-size: 11px; }
  .cork__clip i { height: 5px; margin: 5px 0; }
  .cork__clip-ph { height: 40px; }
  .cork__final-eyebrow { font-size: 11px; }
  .cork__final-title { font-size: 22px; }
  .cork__final-count { font-size: 14px; }
  .cork__final-count b { font-size: 28px; }
  .cork__final-go { font-size: 14px; }
  .cork__cap { font-size: min(14px, calc(100cqi / (var(--len, 6) * .6))); }
}
</style>
