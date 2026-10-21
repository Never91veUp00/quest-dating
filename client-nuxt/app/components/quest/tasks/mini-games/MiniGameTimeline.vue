<template>
  <div class="tl">
    <p class="mg-prompt">{{ task.game_question || 'Расставь по порядку: что было раньше — выше' }}</p>
    <p v-if="!done" class="tl__how">Нажми на событие, потом на то, с которым его поменять</p>

    <div class="mg-board">
      <QuestMark v-if="mark" :key="mark.key" :decor="decor" :kind="mark.kind" />
      <TransitionGroup tag="ol" name="tl" class="tl__list">
        <li v-for="(item, pos) in shown" :key="item.i" class="tl__row">
          <span class="tl__num" aria-hidden="true">{{ pos + 1 }}</span>
          <button
            class="tl__item mg-item"
            :class="{
              'is-sel':   selected === pos,
              'is-right': locked.has(item.i),
              'is-wrong': missed.includes(item.i),
            }"
            :disabled="done || locked.has(item.i)"
            :aria-pressed="selected === pos"
            :aria-label="`${pos + 1}. ${item.text}${locked.has(item.i) ? ', на месте' : ''}`"
            @click="tap(pos)"
          >
            <img v-if="item.image" :src="item.image" alt="" class="tl__img" />
            <span class="tl__txt">
              {{ item.text }}
              <span v-if="done && item.caption" class="tl__cap">{{ item.caption }}</span>
            </span>
          </button>
        </li>
      </TransitionGroup>
    </div>

    <template v-if="!done">
      <p v-if="lastScore !== null" class="mg-result mg-result--wrong" role="status">
        На своих местах {{ lastScore }} из {{ items.length }}
      </p>
      <button class="task__action" :disabled="checking" @click="check">Проверить порядок</button>
      <button class="mg-skip" @click="$emit('skip-task', task)">Не получается? Пропустить</button>
    </template>
    <template v-else>
      <p class="mg-result" role="status">Всё по порядку</p>
      <button class="task__action" @click="$emit('complete', task)">Идти дальше</button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import QuestMark from '../../QuestMark.vue'
import { shuffledOrder } from '~/utils/miniGames'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

const decor = computed(() => props.theme.world?.decor ?? null)
const mark = ref(null)
let markKey = 0
const showMark = (kind) => { mark.value = { kind, key: ++markKey } }

// автор вводит события в правильном порядке: индекс i — верное место
const items = (props.task.timeline_items || [])
  .filter(it => it?.text?.trim() || it?.image)
  .map((it, i) => ({ ...it, i }))

const order    = ref(shuffledOrder(items.length).map(i => items[i]))
const shown    = computed(() => order.value)
const selected = ref(null)
const locked   = ref(new Set())
const missed   = ref([])
const checking = ref(false)
const done     = ref(false)
const lastScore = ref(null)
const timers = []
onUnmounted(() => timers.forEach(clearTimeout))

const tap = (pos) => {
  if (done.value || checking.value) return
  if (selected.value === null) { selected.value = pos; return }
  if (selected.value === pos)  { selected.value = null; return }
  const next = [...order.value]
  ;[next[selected.value], next[pos]] = [next[pos], next[selected.value]]
  order.value = next
  selected.value = null
  missed.value = []
}

const check = () => {
  selected.value = null
  const right = new Set(locked.value)
  const wrong = []
  order.value.forEach((it, pos) => (it.i === pos ? right.add(it.i) : wrong.push(it.i)))
  locked.value = right
  if (!wrong.length) {
    done.value = true
    lastScore.value = null
    showMark('right')
    return
  }
  lastScore.value = right.size
  missed.value = wrong
  checking.value = true
  showMark('wrong')
  timers.push(setTimeout(() => { missed.value = []; checking.value = false }, 900))
}
</script>

<style scoped>
.tl { display: flex; flex-direction: column; gap: 12px; }
.tl__how { margin: -4px 0 0; font-size: .85rem; color: var(--ink-soft); }

.tl__list {
  position: relative;
  padding-top: 16px; /* отметка мира не ложится на первое событие */
  display: flex; flex-direction: column; gap: 10px;
  margin: 0; padding: 0; list-style: none;
}
/* ось времени: линия через номера мест */
.tl__list::before {
  content: "";
  position: absolute; left: 15px; top: 30px; bottom: 14px;
  border-left: 2px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
}
.tl__row { position: relative; display: grid; grid-template-columns: 32px 1fr; align-items: center; gap: 10px; }
.tl__num {
  position: relative;
  display: grid; place-items: center;
  width: 32px; height: 32px;
  border: 2px solid color-mix(in srgb, var(--ink) 45%, var(--paper));
  border-radius: 50%;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-variant-numeric: tabular-nums;
  font-size: .95rem;
  line-height: 1;
}

.tl__item.mg-item { width: 100%; min-height: 56px; }
.tl__item.mg-item.is-sel {
  border-color: var(--mi-sel);
  box-shadow: 0 0 0 2px var(--mi-sel), 0 10px 14px -10px color-mix(in srgb, var(--rule) 80%, transparent);
  transform: translateX(6px);
}
.tl__img { width: 48px; height: 48px; flex-shrink: 0; object-fit: cover; border-radius: 3px; }
.tl__txt { flex: 1; min-width: 0; }
.tl__cap {
  display: block; margin-top: 3px;
  font-family: var(--font-d);
  font-size: .82rem;
  color: var(--ink-soft);
  animation: tl-cap .35s cubic-bezier(.2, .7, .2, 1) both;
}
@keyframes tl-cap { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }

/* перестановка: события переезжают на новое место, а не перескакивают */
.tl-move { transition: transform .32s cubic-bezier(.2, .7, .2, 1); }

@media (prefers-reduced-motion: reduce) {
  .tl-move { transition: none; }
  .tl__item.mg-item.is-sel { transform: none; }
  .tl__cap { animation: none; }
}
</style>
