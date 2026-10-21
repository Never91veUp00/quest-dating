<template>
  <div class="word">
    <p v-if="task.game_question" class="mg-prompt">{{ task.game_question }}</p>

    <!-- Клетки ответа: тап по букве возвращает её в набор -->
    <div class="word__slots mg-board" :class="{ 'is-shake': shake }">
      <QuestMark v-if="mark" :key="mark.key" :decor="decor" :kind="mark.kind" />
      <div v-for="(w, wi) in slots" :key="wi" class="word__row" :style="{ '--n': w.length }">
        <button
          v-for="(_, li) in w" :key="li"
          class="word__slot"
          :class="slotClass(wi, li)"
          :disabled="done || !filled[wi][li]"
          :aria-label="filled[wi][li] ? `Буква ${filled[wi][li].ch}, убрать` : 'Пустая клетка'"
          @click="unplace(wi, li)"
        >{{ filled[wi][li]?.ch }}</button>
      </div>
    </div>

    <!-- Набор фишек: место взятой фишки остаётся пунктиром, раскладка не прыгает -->
    <div v-if="!done" class="word__tiles" role="group" aria-label="Буквы">
      <button
        v-for="t in tiles" :key="t.id"
        class="word__tile mg-item"
        :class="{ 'is-used': used.has(t.id) }"
        :disabled="used.has(t.id) || checking"
        :aria-label="`Буква ${t.ch}`"
        @click="place(t)"
      >{{ used.has(t.id) ? '' : t.ch }}</button>
    </div>

    <button v-if="!done && used.size && !checking" class="word__clear" @click="clearAll">Убрать все буквы</button>

    <p v-if="wrongShown" class="mg-result mg-result--wrong" role="status">Не то слово, попробуй ещё</p>
    <template v-if="done">
      <p class="mg-result" role="status">Слово собрано</p>
      <button class="task__action" @click="$emit('complete', task)">Идти дальше</button>
    </template>
    <button v-else class="mg-skip" @click="$emit('skip-task', task)">Не получается? Пропустить</button>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import QuestMark from '../../QuestMark.vue'
import { wordSlots, wordTiles, isWordMatch } from '~/utils/miniGames'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

const decor = computed(() => props.theme.world?.decor ?? null)
const mark = ref(null)
let markKey = 0
const showMark = (kind) => { mark.value = { kind, key: ++markKey } }

const slots  = wordSlots(props.task.word_answer)
const tiles  = wordTiles(props.task.word_answer, Number(props.task.word_decoys) || 0)
const filled = ref(slots.map(w => w.map(() => null)))
const used   = ref(new Set())
const done   = ref(false)
const checking   = ref(false)
const shake      = ref(false)
const wrongShown = ref(false)
const timers = []
onUnmounted(() => timers.forEach(clearTimeout))

const slotClass = (wi, li) => ({
  'is-filled': !!filled.value[wi][li],
  'is-right':  done.value,
  'is-wrong':  shake.value,
})

const firstEmpty = () => {
  for (let wi = 0; wi < slots.length; wi++) {
    const li = filled.value[wi].indexOf(null)
    if (li >= 0) return [wi, li]
  }
  return null
}

const place = (t) => {
  const at = firstEmpty()
  if (!at || used.value.has(t.id)) return
  wrongShown.value = false
  filled.value[at[0]][at[1]] = t
  used.value = new Set(used.value).add(t.id)
  if (!firstEmpty()) check()
}

const unplace = (wi, li) => {
  const t = filled.value[wi][li]
  if (!t || done.value || checking.value) return
  filled.value[wi][li] = null
  const next = new Set(used.value); next.delete(t.id); used.value = next
}

const clearAll = () => {
  filled.value = slots.map(w => w.map(() => null))
  used.value = new Set()
}

const check = () => {
  const typed = filled.value.flat().map(t => t.ch).join('')
  if (isWordMatch(typed, props.task.word_answer)) {
    done.value = true
    showMark('right')
    return
  }
  // промах: клетки обведены цветом ошибки, затем буквы возвращаются в набор
  checking.value = true
  shake.value = true
  showMark('wrong')
  timers.push(setTimeout(() => {
    shake.value = false
    checking.value = false
    wrongShown.value = true
    clearAll()
  }, 900))
}
</script>

<style scoped>
.word { display: flex; flex-direction: column; gap: 14px; }

/* запас сверху: отметка мира не ложится на первую строку букв */
.word__slots { padding-top: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.word__row {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 46px));
  justify-content: center;
  gap: 6px;
  width: 100%;
}
.word__slot {
  aspect-ratio: 5 / 6;
  display: grid; place-items: center;
  padding: 0;
  background: color-mix(in srgb, var(--paper-edge) 18%, var(--paper));
  border: 0;
  border-bottom: 3px solid color-mix(in srgb, var(--ink) 45%, var(--paper));
  color: var(--ink);
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: clamp(1.05rem, 5.4vw, 1.5rem);
  line-height: 1;
  cursor: pointer;
  transition: border-color .16s, background-color .2s, color .2s;
}
.word__slot:disabled { opacity: 1; cursor: default; }
.word__slot.is-filled { border-bottom-color: var(--mi-sel); background: var(--mi-bg); color: var(--mi-ink); }
.word__slot.is-wrong  { border-bottom-color: var(--wrong); color: var(--wrong); }
.word__slot.is-right  { border-bottom-color: var(--chip); background: var(--mi-done-bg); color: var(--mi-done-ink); }
.word__slot:focus-visible { outline: 3px solid var(--focus, var(--mi-sel)); outline-offset: 2px; }

/* промах: клетки коротко качаются, без отскока */
.word__slots.is-shake .word__row { animation: word-shake .36s cubic-bezier(.3, 0, .3, 1); }
@keyframes word-shake {
  20% { transform: translateX(-5px); }
  50% { transform: translateX(4px); }
  80% { transform: translateX(-2px); }
}

.word__tiles {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: 8px;
  margin-top: 6px;
}
.word__tile.mg-item {
  justify-content: center;
  width: 50px; height: 54px; min-height: 0;
  padding: 0;
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: 1.35rem;
  line-height: 1;
}
.word__tile.mg-item:active:not(:disabled) { transform: translateY(2px); }
/* взятая фишка: пустое место пунктиром — видно, сколько букв ещё в наборе */
.word__tile.mg-item.is-used {
  background: transparent;
  border: 2px dashed color-mix(in srgb, var(--ink) 25%, var(--paper));
  box-shadow: none;
}
.word__tile.mg-item.is-used::before,
.word__tile.mg-item.is-used::after { display: none; }

.word__clear {
  align-self: center;
  padding: 8px 12px;
  background: none; border: none;
  color: var(--ink); font-size: .85rem;
  text-decoration: underline; text-underline-offset: 3px;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .word__slots.is-shake .word__row { animation: none; }
  .word__tile.mg-item:active:not(:disabled) { transform: none; }
}
</style>
