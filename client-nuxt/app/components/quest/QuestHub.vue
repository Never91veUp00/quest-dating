<template>
  <section class="hub" :aria-label="title">
    <header class="hub__head">
      <p class="hub__eyebrow">{{ theme.copy.eyebrow }}</p>
      <h1 class="hub__title">{{ title }}</h1>
      <p class="hub__lead">
        {{ unlocked
          ? 'Всё пройдено. Финал открыт.'
          : 'Проходи участки в любом порядке. Финал откроется, когда пройдены остальные.' }}
      </p>
    </header>

    <!-- «Детектив»: пробковая доска, улики вразнобой вокруг папки финала -->
    <QuestCorkboard
      v-if="theme.world?.decor === 'casefile'"
      :blocks="blocks"
      :theme="theme"
      :completedIds="completedIds"
      @open="$emit('open', $event)"
    />

    <template v-else>
    <!-- Улики: все участки, кроме финала -->
    <ol class="hub__grid">
      <li v-for="c in clues" :key="c.i">
        <button
          type="button"
          class="hub__clue"
          :class="{ 'is-done': c.done }"
          :aria-label="`${theme.copy.blockPrefix} ${c.i + 1}: ${c.block.title}. ${c.done ? 'Пройдено' : c.started ? `${c.passed} из ${c.total}` : 'Не начато'}`"
          @click="$emit('open', c.i)"
        >
          <span class="hub__no">{{ theme.copy.blockPrefix }} {{ theme.world?.decor === 'tarot' ? roman(c.i + 1) : c.i + 1 }}</span>
          <span class="hub__name" :style="{ '--len': longest(c.block.title) }">{{ c.block.title }}</span>
          <span class="hub__state">
            <template v-if="c.done"><QuestIcon name="check" :size="16" /> пройдено</template>
            <template v-else-if="c.started">{{ c.passed }} из {{ c.total }}</template>
            <template v-else>{{ c.total }} {{ taskWord(c.total) }}</template>
          </span>
        </button>
      </li>
    </ol>

    <!-- Финал: заперт, пока не пройдены улики -->
    <button
      type="button"
      class="hub__final"
      :class="{ 'is-locked': !unlocked }"
      :aria-disabled="!unlocked"
      @click="$emit('open', last)"
    >
      <span class="hub__no">Финал</span>
      <span class="hub__name">{{ blocks[last].title }}</span>
      <span v-if="unlocked" class="hub__go">
        Открыть финал <QuestIcon name="forward" :size="20" />
      </span>
      <span v-else class="hub__count">
        <b>{{ done }} из {{ total }}</b> — финал откроется, когда пройдены все
      </span>
    </button>
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import QuestIcon from './QuestIcon.vue'
import QuestCorkboard from './QuestCorkboard.vue'
import { roman } from './themes.js'
import { isBlockDone, finalIndex, cluesDone, cluesTotal, finalUnlocked } from '~/utils/boardFlow.js'

const props = defineProps({
  blocks:       { type: Array,  required: true },
  theme:        { type: Object, required: true },
  title:        { type: String, default: '' },
  completedIds: { type: Array,  default: () => [] },
})
defineEmits(['open'])

const last = computed(() => finalIndex(props.blocks))
const clues = computed(() => props.blocks.slice(0, -1).map((block, i) => {
  const tasks = block.tasks ?? []
  const passed = tasks.filter(t => props.completedIds.includes(t.id)).length
  return {
    i, block, passed,
    total:   tasks.length,
    started: passed > 0,
    done:    isBlockDone(block, props.completedIds),
  }
}))
const done     = computed(() => cluesDone(props.blocks, props.completedIds))
const total    = computed(() => cluesTotal(props.blocks))
const unlocked = computed(() => finalUnlocked(props.blocks, props.completedIds))

// длина самого длинного слова: название ужимается, чтобы слово не рвалось по буквам
const longest = (title = '') => Math.max(6, ...title.split(/\s+/).map(w => w.length))

const taskWord = (n) => {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'задание'
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'задания'
  return 'заданий'
}
</script>

<style scoped>
.hub { display: flex; flex-direction: column; gap: 18px; padding-top: 8px; }

.hub__head { color: var(--field-ink); }
.hub__eyebrow {
  margin: 0;
  font-family: var(--font-d);
  font-size: .78rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--field-ink-soft);
}
.hub__title {
  margin: 6px 0 0;
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: 1.7rem;
  line-height: 1.1;
  text-wrap: balance;
}
.hub__lead {
  margin: 8px 0 0;
  max-width: 34ch;
  font-family: var(--font-b);
  font-size: 1rem;
  line-height: 1.4;
  color: var(--field-ink-soft);
}

.hub__grid {
  list-style: none; margin: 0; padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.hub__clue, .hub__final {
  width: 100%;
  display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
  padding: 14px 14px 12px;
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--rule);
  border-bottom-width: 6px;
  border-radius: 12px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform .15s ease-out;
}
.hub__clue { height: 100%; min-height: 112px; container-type: inline-size; }
.hub__clue:active, .hub__final:active:not(.is-locked) { transform: translateY(2px); }
.hub__clue:focus-visible, .hub__final:focus-visible {
  outline: 3px solid var(--focus, var(--chip));
  outline-offset: 3px;
}
.hub__clue.is-done { background: var(--done); }

.hub__no {
  font-family: var(--font-d);
  font-size: .78rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.hub__name {
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: .98rem;
  /* ~0.76em на букву у широких дисплейных шрифтов: самое длинное слово влезает в карточку */
  font-size: min(.98rem, calc(100cqi / (var(--len, 6) * .76)));
  line-height: 1.15;
  hyphens: auto;
  overflow-wrap: break-word;
}
.hub__state {
  margin-top: auto;
  display: inline-flex; align-items: center; gap: 4px;
  font-family: var(--font-b);
  font-size: .9rem;
  color: var(--ink-soft);
}
.hub__clue.is-done .hub__state { color: var(--ink); }

.hub__final { gap: 8px; padding: 16px 16px 14px; }
.hub__final.is-locked {
  cursor: default;
  background: transparent;
  color: var(--field-ink);
  border-style: dashed;
  border-color: color-mix(in srgb, var(--field-ink) 45%, var(--field));
}
.hub__final.is-locked .hub__no { color: var(--field-ink-soft); }
.hub__final .hub__name { font-size: 1.3rem; }
.hub__count {
  font-family: var(--font-b);
  font-size: .95rem;
  line-height: 1.35;
  color: var(--field-ink-soft);
}
.hub__count b { font-family: var(--font-d); font-weight: var(--font-d-wt, 400); color: var(--field-ink); }
.hub__go {
  align-self: stretch;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 52px;
  margin-top: 4px;
  background: var(--action);
  color: var(--action-ink);
  border-radius: 10px;
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: 1.05rem;
}

@media (min-width: 700px) {
  .hub__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .hub__clue, .hub__final { transition: none; }
}
</style>
