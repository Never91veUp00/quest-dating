<template>
  <div>
    <!-- Текстовые пары -->
    <template v-if="task.pairs_mode === 'text' || (!task.pairs_mode && task.pairs && task.pairs.length && (!task.game_images || !task.game_images.length))">
      <div class="task__text-pairs">
        <div class="task__text-pairs__cols">
          <div class="task__text-pairs__col">
            <button
              v-for="(pair, pi) in task.pairs" :key="'l'+pi"
              class="task__text-pairs__item"
              :class="{ selected: leftSelected === pi, matched: matchedLeft.includes(pi) }"
              :disabled="matchedLeft.includes(pi)"
              @click="selectLeft(pi)"
            >{{ pair.left }}</button>
          </div>
          <div class="task__text-pairs__col">
            <button
              v-for="(item, ri) in rightShuffled" :key="'r'+ri"
              class="task__text-pairs__item task__text-pairs__item--right"
              :class="{ selected: rightSelected === ri, matched: matchedRight.includes(ri) }"
              :disabled="matchedRight.includes(ri)"
              @click="selectRight(ri)"
            >{{ item.value }}</button>
          </div>
        </div>
      </div>
      <div v-if="wrongText" class="task__quiz-result task__quiz-result--wrong">
        Не совпадает, попробуй ещё раз
      </div>
      <button v-if="!textComplete" class="task__pairs__skip" @click="$emit('skip-task', task)">
        Не получается? Пропустить
      </button>
      <div v-if="textComplete" class="task__quiz-result task__quiz-result--right">
        Все пары найдены! 🎉
      </div>
      <button v-if="textComplete" class="task__action" @click="$emit('complete', task)">
        Продолжаем →
      </button>
    </template>

    <!-- Фото-пары -->
    <template v-else>
      <div class="task__pairs" :style="{ '--pairs-cols': task.pairs_grid_size || 4 }">
        <button
          v-for="(card, ci) in photoCards" :key="ci"
          class="task__pairs__card"
          :class="{ flipped: photoFlipped.includes(ci), matched: photoMatched.includes(ci) }"
          :disabled="photoMatched.includes(ci) || photoFlipped.length === 2"
          @click="flipCard(ci)"
        >
          <div class="task__pairs__card__inner">
            <div class="task__pairs__card__back">?</div>
            <div class="task__pairs__card__front">
              <img v-if="isImage(card.value)" :src="card.value" class="task__pairs__card__img"
                   @error="e => e.target.style.opacity = '0.25'" />
              <span v-else>{{ card.value }}</span>
            </div>
          </div>
        </button>
      </div>
      <button v-if="!photoComplete" class="task__pairs__skip" @click="$emit('skip-task', task)">
        Не получается? Пропустить
      </button>
      <div v-if="photoComplete" class="task__quiz-result task__quiz-result--right">
        Все пары найдены! 🎉
      </div>
      <button v-if="photoComplete" class="task__action" @click="$emit('complete', task)">
        Продолжаем →
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

// ── Текстовые пары ───────────────────────────────────────────────
const leftSelected  = ref(null)
const rightSelected = ref(null)
const matchedLeft   = ref([])
const matchedRight  = ref([])
const wrongText     = ref(false)

const rightShuffled = computed(() => {
  if (!props.task.pairs) return []
  return props.task.pairs
    .map((p, i) => ({ value: p.right, originalIdx: i }))
    .sort(() => Math.random() - 0.5)
})
const textComplete = computed(() =>
  props.task.pairs && matchedLeft.value.length === props.task.pairs.length
)

const selectLeft = (pi) => {
  wrongText.value = false
  leftSelected.value = pi
  if (rightSelected.value !== null) checkPair()
}
const selectRight = (ri) => {
  wrongText.value = false
  rightSelected.value = ri
  if (leftSelected.value !== null) checkPair()
}
const checkPair = () => {
  const li = leftSelected.value
  const ri = rightSelected.value
  const rightItem = rightShuffled.value[ri]
  if (rightItem.originalIdx === li) {
    matchedLeft.value  = [...matchedLeft.value, li]
    matchedRight.value = [...matchedRight.value, ri]
  } else {
    wrongText.value = true
    setTimeout(() => { wrongText.value = false }, 1000)
  }
  leftSelected.value  = null
  rightSelected.value = null
}

// ── Фото-пары ────────────────────────────────────────────────────
const photoCards   = ref([])
const photoFlipped = ref([])
const photoMatched = ref([])
let flipTimer = null

const photoComplete = computed(() =>
  photoCards.value.length > 0 && photoMatched.value.length === photoCards.value.length
)

onMounted(() => {
  const images = props.task.game_images || []
  if (images.length) {
    const cards = images.flatMap((img, i) => [
      { id: i,       value: img, pairId: i },
      { id: i + 100, value: img, pairId: i },
    ])
    photoCards.value = cards.sort(() => Math.random() - 0.5)
  }
})

onUnmounted(() => { if (flipTimer) clearTimeout(flipTimer) })

const isImage = (v) => v && (v.startsWith('data:image') || v.startsWith('http') || v.startsWith('/'))

const flipCard = (ci) => {
  if (photoFlipped.value.includes(ci) || photoFlipped.value.length === 2) return
  photoFlipped.value.push(ci)
  if (photoFlipped.value.length === 2) {
    const [a, b] = photoFlipped.value
    if (photoCards.value[a].pairId === photoCards.value[b].pairId) {
      photoMatched.value.push(a, b)
      photoFlipped.value = []
    } else {
      flipTimer = setTimeout(() => { photoFlipped.value = [] }, 900)
    }
  }
}
</script>

<style scoped>
.task__text-pairs { margin: 16px 0; }
.task__text-pairs__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.task__text-pairs__col { display: flex; flex-direction: column; gap: 8px; }
.task__text-pairs__item {
  padding: 12px 14px; border-radius: 10px; font-size: .95rem; text-align: left;
  background: rgba(255,255,255,.08); border: 2px solid transparent;
  color: inherit; cursor: pointer; transition: all .2s; line-height: 1.4;
}
.task__text-pairs__item:hover:not(:disabled) { border-color: var(--accent); }
.task__text-pairs__item.selected { border-color: var(--accent); background: rgba(102,126,234,.15); }
.task__text-pairs__item.matched { border-color: #48bb78; background: rgba(72,187,120,.15); opacity: .7; cursor: default; }
.task__text-pairs__item--right { text-align: center; }

.task__pairs { display: grid; grid-template-columns: repeat(var(--pairs-cols, 4), 1fr); gap: 6px; margin-bottom: 12px; }
.task__pairs__card {
  aspect-ratio: 3/4; background: var(--bg2); border: 1px solid var(--bord);
  border-radius: 8px; cursor: pointer; perspective: 600px;
  transition: border-color .2s; overflow: hidden; padding: 0;
}
.task__pairs__card:hover:not(:disabled) { border-color: var(--accent); }
.task__pairs__card.matched { border-color: #3cffb4; opacity: .6; cursor: default; }
.task__pairs__card__inner {
  width: 100%; height: 100%; position: relative;
  transform-style: preserve-3d; transition: transform .35s;
  display: flex; align-items: center; justify-content: center;
}
.task__pairs__card.flipped .task__pairs__card__inner,
.task__pairs__card.matched .task__pairs__card__inner { transform: rotateY(180deg); }
.task__pairs__card__back,
.task__pairs__card__front {
  position: absolute; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  backface-visibility: hidden; font-size: .85rem;
  padding: 4px; text-align: center; line-height: 1.3;
}
.task__pairs__card__back { color: var(--accent); font-size: 1.2rem; }
.task__pairs__card__front {
  transform: rotateY(180deg); color: var(--text);
  background: color-mix(in srgb, var(--accent) 8%, var(--bg2));
}
.task__pairs__card__img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
.task__quiz-result {
  text-align: center; font-size: .9rem; padding: 8px; border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: #3cffb4; background: rgba(60,255,180,.08); }
.task__quiz-result--wrong { color: #f87171; background: rgba(248,113,113,.08); }

.task__pairs__skip {
  display: block; margin: 8px auto 0; background: none; border: none;
  color: var(--dim); font-size: .68rem; cursor: pointer;
  opacity: .4; transition: opacity .3s; padding: 6px 12px;
  text-decoration: underline; text-underline-offset: 3px;
}
.task__pairs__skip:hover { opacity: .7; }
</style>
