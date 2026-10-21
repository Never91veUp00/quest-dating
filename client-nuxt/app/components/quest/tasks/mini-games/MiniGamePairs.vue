<template>
  <div>
    <!-- Текстовые пары -->
    <template v-if="task.pairs_mode === 'text' || (!task.pairs_mode && task.pairs && task.pairs.length && (!task.game_images || !task.game_images.length))">
      <div class="task__text-pairs mg-board">
        <QuestMark v-if="mark" :key="mark.key" :decor="decor" :kind="mark.kind" />
        <div class="task__text-pairs__cols">
          <div class="task__text-pairs__col">
            <button
              v-for="(pair, pi) in task.pairs" :key="'l'+pi"
              class="task__text-pairs__item mg-item"
              :class="{ 'is-selected': leftSelected === pi, 'is-matched': matchedLeft.includes(pi), 'is-miss': miss && miss.l === pi }"
              :disabled="matchedLeft.includes(pi)"
              @click="selectLeft(pi)"
            ><span class="task__text-pairs__txt">{{ pair.left }}</span><span v-if="matchedLeft.includes(pi)" class="mg-item__seal">{{ matchedLeft.indexOf(pi) + 1 }}</span></button>
          </div>
          <div class="task__text-pairs__col">
            <button
              v-for="(item, ri) in rightShuffled" :key="'r'+ri"
              class="task__text-pairs__item task__text-pairs__item--right mg-item"
              :class="{ 'is-selected': rightSelected === ri, 'is-matched': matchedRight.includes(ri), 'is-miss': miss && miss.r === ri }"
              :disabled="matchedRight.includes(ri)"
              @click="selectRight(ri)"
            ><span class="task__text-pairs__txt">{{ item.value }}</span><span v-if="matchedRight.includes(ri)" class="mg-item__seal">{{ matchedRight.indexOf(ri) + 1 }}</span></button>
          </div>
        </div>
      </div>
      <p class="task__pairs__tip" aria-live="polite">
        <template v-if="wrongText">Не совпадает, попробуй ещё раз</template>
        <template v-else-if="!textComplete">{{ leftSelected === null && rightSelected === null ? 'Выбери половинку слева или справа' : 'Теперь — её пару' }}</template>
      </p>
      <button v-if="!textComplete" class="mg-skip" @click="$emit('skip-task', task)">
        Не получается? Пропустить
      </button>
      <p v-if="textComplete" class="mg-result" role="status">Все пары найдены</p>
      <button v-if="textComplete" class="task__action" @click="$emit('complete', task)">
        Идти дальше
      </button>
    </template>

    <!-- Фото-пары -->
    <template v-else>
      <div class="task__pairs mg-board" :style="{ '--pairs-cols': task.pairs_grid_size || 4 }">
        <QuestMark v-if="mark" :key="mark.key" :decor="decor" :kind="mark.kind" />
        <button
          v-for="(card, ci) in photoCards" :key="ci"
          class="task__pairs__card"
          :class="{
            flipped:  photoFlipped.includes(ci) || photoMatched.includes(ci),
            matched:  photoMatched.includes(ci),
            selected: photoSelected.includes(ci),
            miss:     photoMiss.includes(ci),
          }"
          :disabled="photoMatched.includes(ci) || photoFlipped.length === 2"
          @click="flipCard(ci)"
        >
          <div class="task__pairs__card__inner">
            <div class="task__pairs__card__back" aria-hidden="true"></div>
            <div class="task__pairs__card__front">
              <img v-if="isImage(card.value)" :src="card.value" class="task__pairs__card__img"
                   @error="e => e.target.style.opacity = '0.25'" />
              <span v-else>{{ card.value }}</span>
            </div>
          </div>
        </button>
      </div>
      <button v-if="!photoComplete" class="mg-skip" @click="$emit('skip-task', task)">
        Не получается? Пропустить
      </button>
      <p v-if="photoComplete" class="mg-result" role="status">Все пары найдены</p>
      <button v-if="photoComplete" class="task__action" @click="$emit('complete', task)">
        Идти дальше
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import QuestMark from '../../QuestMark.vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

// Отметка мира на доске: промах в текстовых парах и собранная игра
const decor = computed(() => props.theme.world?.decor ?? null)
const mark = ref(null)
let markKey = 0
const showMark = (kind) => { mark.value = { kind, key: ++markKey } }

// ── Текстовые пары ───────────────────────────────────────────────
const leftSelected  = ref(null)
const rightSelected = ref(null)
const matchedLeft   = ref([])
const matchedRight  = ref([])
const wrongText     = ref(false)
const miss          = ref(null) // { l, r } — какие две половинки не сошлись, пока видно промах
let missTimer = null

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
    miss.value = { l: li, r: ri }
    showMark('wrong')
    clearTimeout(missTimer)
    missTimer = setTimeout(() => { wrongText.value = false; miss.value = null }, 1000)
  }
  leftSelected.value  = null
  rightSelected.value = null
}

// ── Фото-пары ────────────────────────────────────────────────────
const photoCards    = ref([])
const photoFlipped  = ref([])
const photoMatched  = ref([])
const photoSelected = ref([]) // карточки с акцентной рамкой (явный контроль)
const photoMiss     = ref([]) // открытая пара не сошлась — до того, как карточки закроются
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

onUnmounted(() => { if (flipTimer) clearTimeout(flipTimer); clearTimeout(missTimer) })

watch(() => textComplete.value || photoComplete.value, (done) => { if (done) showMark('right') })

const isImage = (v) => v && (v.startsWith('data:image') || v.startsWith('http') || v.startsWith('/'))

const flipCard = (ci) => {
  if (photoFlipped.value.includes(ci) || photoFlipped.value.length === 2) return
  photoFlipped.value = [...photoFlipped.value, ci]
  photoSelected.value = [...photoSelected.value, ci]
  if (photoFlipped.value.length === 2) {
    const [a, b] = photoFlipped.value
    photoSelected.value = [] // убираем рамки немедленно при проверке
    if (photoCards.value[a].pairId === photoCards.value[b].pairId) {
      photoMatched.value = [...photoMatched.value, a, b]
      photoFlipped.value = []
    } else {
      photoMiss.value = [a, b]
      flipTimer = setTimeout(() => {
        photoFlipped.value = []
        photoMiss.value = []
      }, 900)
    }
  }
}
</script>

<style scoped>
.task__text-pairs { margin-bottom: 6px; }
.task__text-pairs__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.task__text-pairs__col { display: flex; flex-direction: column; gap: 10px; }
.task__text-pairs__item { width: 100%; height: 100%; }
.task__text-pairs__txt { flex: 1; }
.task__pairs__tip {
  margin: 4px 0 0; min-height: 1.4em;
  text-align: center; font-size: .85rem; color: var(--ink-soft);
}


.task__pairs {
  display: grid; grid-template-columns: repeat(var(--pairs-cols, 4), 1fr); gap: 6px; margin-bottom: 12px;
  width: 100%; max-width: 440px; margin-inline: auto; /* на десктопе сетка влезает в экран без прокрутки */
  isolation: isolate;
  transform: translateZ(0); /* форсируем отдельный GPU-слой для всего грида */
}
.task__pairs__card {
  aspect-ratio: 3/4; background: transparent; border: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
  border-radius: 8px; cursor: pointer;
  transition: border-color .2s; padding: 0;
  outline: none; /* убираем браузерный focus-outline */
  -webkit-tap-highlight-color: transparent; /* убираем подсветку тапа на iOS */
}
/* hover только на устройствах с мышью — на мобиле hover "прилипает" после тапа */
@media (hover: hover) {
  .task__pairs__card:hover:not(:disabled):not(.selected) { border-color: var(--action); }
}
.task__pairs__card:focus-visible:not(.selected) { border-color: var(--action); }
.task__pairs__card:disabled:not(.matched) { opacity: 1; }
.task__pairs__card.selected { border-color: var(--action); }
.task__pairs__card.matched  { border-color: var(--ink-soft); opacity: .6; cursor: default; }
.task__pairs__card__inner {
  width: 100%; height: 100%; position: relative;
  transform-style: preserve-3d; transition: transform .35s;
  will-change: transform;
  /* НЕТ overflow:hidden — убивает preserve-3d */
}
.task__pairs__card.flipped .task__pairs__card__inner,
.task__pairs__card.matched .task__pairs__card__inner { transform: rotateY(180deg); }
.task__pairs__card__back,
.task__pairs__card__front {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  font-size: .85rem; padding: 4px; text-align: center; line-height: 1.3;
  border-radius: 7px;
  /* clip-path вместо overflow:hidden — не ломает 3D */
  clip-path: inset(0 round 7px);
}
/* рубашка по умолчанию: штриховка без знака вопроса; миры задают свою в MiniGameOverlay */
.task__pairs__card__back {
  background:
    repeating-linear-gradient(45deg, transparent 0 6px, color-mix(in srgb, var(--ink) 14%, transparent) 6px 7px),
    color-mix(in srgb, var(--paper-edge) 45%, var(--paper));
}
.task__pairs__card__front {
  transform: rotateY(180deg); color: var(--ink);
  background: color-mix(in srgb, var(--action) 8%, color-mix(in srgb, var(--paper) 86%, var(--ink)));
}
.task__pairs__card__img { width: 100%; height: 100%; object-fit: cover; }
/* промах в фото-парах: открытая пара обведена краской ошибки, пока не закроется */
.task__pairs__card.miss { border-color: var(--wrong); border-width: 3px; }

.mg-result { margin-top: 10px; margin-bottom: 16px; }
</style>
