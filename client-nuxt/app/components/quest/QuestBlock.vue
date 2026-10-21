<template>
  <div class="block" :class="theme.world?.decor && `block--${theme.world.decor}`">
    <!-- Полоса участка: всегда сверху, тап открывает доску -->
    <button
      type="button"
      class="block__strip"
      :aria-label="`${theme.copy.blockPrefix} ${index + 1} из ${total}: ${block.title}. Открыть доску`"
      @click="openBoard(false)"
    >
      <span class="block__strip-text">
        <span class="block__count">{{ theme.copy.blockPrefix }} <b>{{ index + 1 }}</b> из {{ total }}</span>
        <span class="block__strip-title">{{ block.title }}</span>
      </span>
      <span class="block__mini" aria-hidden="true">
        <span
          v-for="(t, ti) in tasks"
          :key="t.id"
          class="block__mini-cell"
          :class="{
            'is-done':   completedIds.includes(t.id),
            'is-wrong':  earnedMap?.[t.id]?.wrong,
            'is-active': ti === activeIdx,
          }"
        ><QuestPumpkin
          v-if="theme.world?.decor === 'diecut'"
          :size="ti === activeIdx ? 20 : 15"
          :state="ti === activeIdx ? 'active' : completedIds.includes(t.id) && !earnedMap?.[t.id]?.wrong ? 'done' : 'back'"
        /><QuestFlask
          v-else-if="theme.world?.decor === 'potion'"
          :size="ti === activeIdx ? 18 : 13"
          :level="completedIds.includes(t.id) && !earnedMap?.[t.id]?.wrong ? .72 : 0"
        /></span>
      </span>
    </button>

    <!-- Доска: момент хода и обзор участка -->
    <transition name="board">
      <section
        v-if="boardOpen"
        class="block__board"
        :class="{ 'block__board--entering': entering }"
        role="dialog"
        aria-modal="true"
        :aria-label="`Доска: ${block.title}`"
        @pointerdown="holdBoard"
        @keydown.esc="closeBoard"
      >
        <!-- Новый участок: крупная плашка «Рецепт 2» с названием, потом доска -->
        <div v-if="entering" class="block__plate" aria-hidden="true">
          <span class="block__plate-no">{{ theme.copy.blockPrefix }} {{ theme.world?.decor === 'tarot' ? roman(index + 1) : index + 1 }}</span>
          <span class="block__plate-title">{{ block.title }}</span>
        </div>
        <div class="block__board-inner">
          <div class="block__meta">
            <span class="block__count">{{ theme.copy.blockPrefix }} <b>{{ index + 1 }}</b> из {{ total }}</span>
            <span class="block__count">{{ theme.copy.cellForms?.[0] ?? 'клетка' }} <b>{{ cellNo }}</b> из {{ tasks.length }}</span>
          </div>
          <h2 class="block__title">{{ block.title }}</h2>
          <p v-if="block.location" class="block__location">
            <QuestIcon name="pin" :size="18" />
            <span>{{ block.location }}</span>
          </p>
          <p v-if="block.description" class="block__desc">{{ block.description }}</p>

          <QuestTrack
            class="block__board-track"
            :tasks="tasks"
            :completedIds="boardCompleted"
            :earnedMap="earnedMap"
            :hasPrev="index > 0"
            :hasNext="!isLast"
            :decor="theme.world?.decor"
            :enter="entering"
            :stampId="stampId"
            @open="reviewIdx = $event"
          />

          <button v-if="index > 0" class="block__back block__board-back" @click="closeBoard(); $emit('prev')">
            <QuestIcon name="back" :size="18" />
            Предыдущий участок
          </button>

          <button ref="boardClose" class="task__action block__board-close" @click="closeBoard">
            {{ activeTask ? 'К заданию' : 'Закрыть доску' }}
          </button>
        </div>
      </section>
    </transition>

    <!-- Карточка: одна активная клетка -->
    <transition name="card" mode="out-in">
      <QuestTask
        v-if="activeTask"
        :key="activeTask.id"
        :task="activeTask"
        :theme="theme"
        :index="activeIdx"
        mode="active"
        @complete="$emit('complete-task', $event)"
        @hint="$emit('use-hint', $event)"
        @skip-task="$emit('skip-task', $event)"
      />

      <article v-else key="done" class="block__done">
        <span v-if="theme.world?.decor === 'tarot'" class="block__frame" aria-hidden="true"></span>
        <span v-else-if="theme.world?.decor === 'ringbox'" class="block__stitch" aria-hidden="true"></span>
        <span v-else-if="theme.world?.decor === 'potion'" class="block__rule" aria-hidden="true"></span>
        <p class="block__done-text">
          {{ isLast ? (theme.copy.allDone ?? 'Все клетки пройдены.') : (theme.copy.blockDone ?? 'Участок пройден. Фишка ждёт у выхода.') }}
        </p>
        <button v-if="!isLast" class="task__action" @click="$emit('next')">
          {{ theme.copy.nextBtn ?? 'Идти дальше' }}
          <QuestIcon name="forward" :size="22" />
        </button>
        <button v-else class="task__action" @click="$emit('finish')">
          {{ finishLabel }}
        </button>
      </article>
    </transition>

    <button v-if="index > 0" class="block__back" @click="$emit('prev')">
      <QuestIcon name="back" :size="18" />
      Предыдущий участок
    </button>

    <!-- Перечитать пройденную клетку -->
    <teleport to="body">
      <transition name="sheet">
        <div
          v-if="reviewTask"
          class="block__sheet"
          :style="cssVars"
          role="dialog"
          aria-modal="true"
          :aria-label="`Клетка ${reviewIdx + 1}: ${reviewTask.title}`"
          @click.self="reviewIdx = null"
          @keydown.esc="reviewIdx = null"
        >
          <div class="block__sheet-panel">
            <QuestTask
              :task="reviewTask"
              :theme="theme"
              :index="reviewIdx"
              :earnedEntry="earnedMap?.[reviewTask.id]"
              mode="review"
            />
            <button ref="closeBtn" class="block__sheet-close" @click="reviewIdx = null">
              Закрыть
            </button>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import QuestTask from './QuestTask.vue'
import QuestTrack from './QuestTrack.vue'
import QuestIcon from './QuestIcon.vue'
import QuestFlask from './QuestFlask.vue'
import QuestPumpkin from './QuestPumpkin.vue'
import { themeToCssVars, roman } from './themes.js'

const props = defineProps({
  block:        { type: Object, required: true },
  theme:        { type: Object, required: true },
  index:        { type: Number, default: 0 },
  total:        { type: Number, default: 1 },
  completedIds: { type: Array,  default: () => [] },
  earnedMap:    { type: Object, default: () => ({}) },
  isLast:       { type: Boolean, default: false },
})

defineEmits(['prev', 'next', 'finish', 'complete-task', 'use-hint', 'skip-task'])

const tasks = computed(() => props.block.tasks ?? [])

// Открыта всегда первая невыполненная клетка: порядок прохождения прежний
const activeIdx  = computed(() => tasks.value.findIndex(t => !props.completedIds.includes(t.id)))
const activeTask = computed(() => activeIdx.value >= 0 ? tasks.value[activeIdx.value] : null)
const cellNo = computed(() => activeIdx.value >= 0 ? activeIdx.value + 1 : tasks.value.length)

const reviewIdx  = ref(null)
const reviewTask = computed(() => reviewIdx.value === null ? null : tasks.value[reviewIdx.value])
const closeBtn   = ref(null)
watch(reviewTask, async (t) => {
  if (!t) return
  await nextTick()
  closeBtn.value?.focus()
})

// ─── Доска: момент хода ───────────────────────────────────────
// После выполнения задания доска разворачивается, фишка делает ход,
// и через мгновение доска сворачивается в полосу. Тап по доске её удерживает.
// Штамп хлопает на пройденную клетку, пауза — и только потом фишка ходит
const MOMENT_MS = 2000
const HOP_DELAY = 700
const boardOpen      = ref(false)
const boardCompleted = ref([...props.completedIds])
const stampId        = ref(null)
const boardClose     = ref(null)
let autoClose = null
let hopTimer  = null

const clearTimers = () => { clearTimeout(autoClose); clearTimeout(hopTimer) }
// на новом участке доска держится дольше: сначала плашка участка, потом ход фишки
const ENTER_MS = 3000
const openBoard = (moment, ms = MOMENT_MS) => {
  clearTimers()
  boardOpen.value = true
  if (moment) autoClose = setTimeout(closeBoard, ms)
  else nextTick(() => boardClose.value?.focus())
}
const entering = ref(false)
const closeBoard = () => {
  clearTimers()
  boardOpen.value = false
  entering.value = false
  boardCompleted.value = [...props.completedIds]
  stampId.value = null
}
const holdBoard = () => { clearTimeout(autoClose) }

// Копия: плеер дописывает completedIds на месте, ссылка не меняется
watch(() => [...props.completedIds], (now, before = []) => {
  const fresh = now.filter(id => !before.includes(id))
  const inBlock = fresh.some(id => tasks.value.some(t => t.id === id))
  if (!inBlock) { boardCompleted.value = [...now]; return }
  stampId.value = fresh.find(id => tasks.value.some(t => t.id === id))
  // Доска открывается в прежнем состоянии, затем фишка переходит
  openBoard(true)
  hopTimer = setTimeout(() => { boardCompleted.value = [...now] }, HOP_DELAY)
})

// ─── Клавиатура: кнопка-глагол держится над ней ─────────────────
const setKeyboardInset = () => {
  const vv = window.visualViewport
  if (!vv) return
  const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
  document.documentElement.style.setProperty('--kb', `${Math.round(inset)}px`)
}

onMounted(() => {
  // Свежий участок: показываем доску, фишка заезжает на первую клетку
  if (!tasks.value.some(t => props.completedIds.includes(t.id))) {
    entering.value = true
    openBoard(true, ENTER_MS)
  }
  window.visualViewport?.addEventListener('resize', setKeyboardInset)
  window.visualViewport?.addEventListener('scroll', setKeyboardInset)
})
onUnmounted(() => {
  clearTimers()
  window.visualViewport?.removeEventListener('resize', setKeyboardInset)
  window.visualViewport?.removeEventListener('scroll', setKeyboardInset)
  document.documentElement.style.removeProperty('--kb')
})

// Шторка живёт в <body>, поэтому токены темы передаём ей явно
const cssVars = computed(() => themeToCssVars(props.theme))

const finishLabel = computed(() => ({
  detective: 'Закрыть дело',
  romantic:  'Завершить',
  mystery:   'Открыть расклад',
  city:      'На конечную',
  treasure:  'К кладу',
  proposal:  'К главному',
  potion:    'Снять с огня',
  halloween: 'Домой',
}[props.theme.id] || 'Завершить'))
</script>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Полоса участка ───────────────────────────────────────────── */
.block__strip {
  display: flex; align-items: center; gap: 14px;
  width: 100%;
  min-height: 60px;
  padding: 8px 4px;
  background: none;
  border: none;
  border-bottom: 2px dashed color-mix(in srgb, var(--field-ink) 28%, var(--field));
  color: var(--field-ink);
  text-align: left;
  cursor: pointer;
}
.block__strip:focus-visible { outline: 3px solid var(--field-ink); outline-offset: 2px; border-radius: 8px; }
.block__strip-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.block__strip-title {
  font-family: var(--font-d);
  font-size: 1.1rem;
  line-height: 1.15;
  color: var(--field-ink);
  text-wrap: balance;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Мини-трасса: клетки на нитке, как на доске */
.block__mini { position: relative; display: flex; align-items: center; gap: 9px; flex-shrink: 0; padding: 0 2px; }
.block__mini::before {
  content: "";
  position: absolute; left: 0; right: 0; top: 50%;
  height: 2px; margin-top: -1px;
  background: color-mix(in srgb, var(--field-ink) 30%, var(--field));
}
.block__mini-cell {
  position: relative;
  z-index: 1;
  width: 16px; height: 16px;
  border-radius: 3px;
  background: var(--back);
  border: 2px solid color-mix(in srgb, var(--field-ink) 30%, var(--back));
}
.block__mini-cell.is-done   { background: var(--done); border-color: var(--rule); }
.block__mini-cell.is-active { width: 22px; height: 22px; background: var(--plate); border-color: var(--rule); }
.block__mini-cell.is-active::after {
  content: "";
  position: absolute; top: -7px; right: -7px;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--chip);
  border: 2px solid var(--rule);
}

/* Обличье дела: красная нить, заметки чуть повёрнуты, фишка — кнопка сверху */
.block--casefile .block__mini::before {
  height: 3px; margin-top: -1.5px;
  background: var(--chip);
  box-shadow: 0 2px 2px color-mix(in srgb, var(--rule) 45%, transparent);
}
/* волокна скрутки поверх основы */
.block--casefile .block__mini::after {
  content: "";
  position: absolute; left: 0; right: 0; top: 50%;
  margin-top: -.5px;
  border-top: 1px dashed color-mix(in srgb, var(--chip) 62%, #f4d9cf);
}
.block--casefile .block__mini-cell {
  border: none;
  border-radius: 2px;
  box-shadow: 0 4px 5px -3px color-mix(in srgb, var(--rule) 80%, transparent);
}
.block--casefile .block__mini-cell:nth-child(odd)  { transform: rotate(-6deg); }
.block--casefile .block__mini-cell:nth-child(even) { transform: rotate(5deg); }
.block--casefile .block__mini-cell.is-active::after {
  top: -8px; right: auto; left: 50%;
  margin-left: -6px;
}

/* Обличье схемы: станции на зелёной линии */
.block--metro .block__mini::before {
  height: 5px; margin-top: -2.5px;
  border-radius: 3px;
  background: var(--chip);
}
.block--metro .block__mini-cell {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--back);
  border: 3px solid var(--rule);
}
.block--metro .block__mini-cell.is-done { background: var(--chip); border-color: var(--field); box-shadow: 0 0 0 2px var(--chip); }
.block--metro .block__mini-cell.is-active { width: 20px; height: 20px; background: var(--plate); border: 5px solid var(--chip); }
.block--metro .block__mini-cell.is-active::after {
  top: -13px; right: auto; left: 50%;
  width: 16px; height: 9px; margin-left: -8px;
  border: none;
  border-radius: 5px 5px 2px 2px;
  background: var(--rule);
}

/* Обличье переписки: конверты на атласной ленте */
.block--letters .block__mini::before {
  height: 4px; margin-top: -2px;
  background: var(--chip);
  box-shadow: 0 2px 2px color-mix(in srgb, var(--rule) 40%, transparent);
}
.block--letters .block__mini::after {
  content: "";
  position: absolute; left: 0; right: 0; top: 50%;
  margin-top: -2px;
  border-top: 1px solid color-mix(in srgb, var(--chip) 45%, var(--paper));
}
.block--letters .block__mini-cell {
  width: 19px; height: 13px;
  border: none;
  border-radius: 1px;
  box-shadow: 0 3px 4px -2px color-mix(in srgb, var(--rule) 80%, transparent);
}
.block--letters .block__mini-cell.is-active { width: 25px; height: 18px; }
.block--letters .block__mini-cell.is-active::after {
  top: -10px; right: auto; left: 50%;
  margin-left: -6px;
}

/* Обличье колоды: карты в ряд на сукне, рубашки киноварью */
.block--tarot .block__mini::before {
  height: 0; margin-top: 0;
  border-top: 1.5px dotted color-mix(in srgb, var(--field-ink) 40%, var(--field));
  background: none;
}
.block--tarot .block__mini { gap: 7px; }
.block--tarot .block__mini-cell {
  width: 12px; height: 18px;
  border: none;
  border-radius: 2px;
  box-shadow: 0 3px 4px -2px color-mix(in srgb, var(--rule) 90%, transparent);
}
.block--tarot .block__mini-cell:not(.is-done):not(.is-active) {
  background: var(--back);
  box-shadow: inset 0 0 0 1.5px var(--back), inset 0 0 0 2.5px var(--paper), 0 3px 4px -2px color-mix(in srgb, var(--rule) 90%, transparent);
}
.block--tarot .block__mini-cell.is-done { background: var(--done); }
.block--tarot .block__mini-cell.is-active { width: 17px; height: 25px; background: var(--plate); }
.block--tarot .block__mini-cell.is-active::after {
  top: -11px; right: auto; left: 50%;
  width: 8px; height: 8px; margin-left: -4px;
  border-radius: 1px;
  border: 1.5px solid var(--paper);
  transform: rotate(45deg);
}

/* Обличье карты: метки на пунктире, пройденные перечёркнуты, флажок над текущей */
.block--map .block__mini::before {
  height: 0; margin-top: 0;
  border-top: 2px dashed color-mix(in srgb, var(--field-ink) 55%, var(--field));
  background: none;
}
.block--map .block__mini-cell {
  width: 13px; height: 13px;
  border-radius: 50%;
  background: var(--paper);
  border: 1.5px solid var(--rule);
}
.block--map .block__mini-cell.is-done {
  background:
    linear-gradient(45deg,  transparent calc(50% - 1.2px), var(--chip) calc(50% - 1.2px) calc(50% + 1.2px), transparent calc(50% + 1.2px)),
    linear-gradient(-45deg, transparent calc(50% - 1.2px), var(--chip) calc(50% - 1.2px) calc(50% + 1.2px), transparent calc(50% + 1.2px)),
    var(--paper);
}
.block--map .block__mini-cell.is-done.is-wrong {
  background: linear-gradient(transparent calc(50% - 1px), var(--ink-soft) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)) center / 60% 100% no-repeat, var(--paper);
}
.block--map .block__mini-cell.is-active { width: 20px; height: 20px; }
.block--map .block__mini-cell.is-active::after {
  top: -15px; right: -9px;
  width: 9px; height: 7px;
  border: none; border-radius: 0;
  /* вымпел над полосой лежит на море: меловой, чтобы читался */
  background: var(--field-ink);
  clip-path: polygon(0 0, 100% 50%, 0 100%);
}

/* Обличье вырубки: тыковки на нити, вырезанные — с лицом */
.block--diecut .block__mini::before {
  height: 0; margin-top: 0;
  border-top: 1.5px dotted color-mix(in srgb, var(--field-ink) 50%, var(--field));
  background: none;
}
.block--diecut .block__mini-cell,
.block--diecut .block__mini-cell.is-done,
.block--diecut .block__mini-cell.is-active {
  width: auto; height: auto;
  border: none;
  border-radius: 0;
  background: none;
  --pk-line: 2;
}
.block--diecut .block__mini-cell.is-active::after {
  top: -10px; right: auto; left: 50%;
  width: 7px; height: 7px; margin-left: -3.5px;
  border: none;
  border-radius: 50%;
  background: var(--field-ink);
}

/* Обличье зельеварни: флакончики на трубке, наполненные — янтарные */
.block--potion .block__mini::before {
  height: 4px; margin-top: -2px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--chip) 45%, var(--paper-edge));
  box-shadow: 0 0 0 1.2px var(--rule);
}
/* флакончик рисует себя сам: у клетки полосы нет плашки */
.block--potion .block__mini-cell,
.block--potion .block__mini-cell.is-done,
.block--potion .block__mini-cell.is-active {
  width: auto; height: auto;
  border: none;
  border-radius: 0;
  background: none;
  --fl-line: 1.8;
}
.block--potion .block__mini-cell.is-active::after {
  top: -14px; right: auto; left: 50%;
  width: 9px; height: 9px; margin-left: -4.5px;
  border: 1.2px solid var(--rule);
  border-radius: 50% 0 50% 50%;
  transform: rotate(-45deg);
}

/* Обличье футляра: маленькие футляры на нити, открытые — с камешком */
.block--ringbox .block__mini::before {
  height: 0; margin-top: 0;
  border-top: 1.5px dashed color-mix(in srgb, var(--field-ink) 45%, var(--field));
  background: none;
}
.block--ringbox .block__mini-cell {
  width: 14px; height: 13px;
  border: 1.2px solid var(--rule);
  border-radius: 4px 4px 3px 3px;
  background: var(--back);
}
.block--ringbox .block__mini-cell.is-done {
  background:
    radial-gradient(circle at 50% 38%, var(--chip) 0 2.2px, transparent 2.6px),
    linear-gradient(var(--paper) 0 50%, var(--back) 50%);
}
/* откинутая крышка — бархатная ступенька над открытым футляром */
.block--ringbox .block__mini-cell.is-done::before {
  content: "";
  position: absolute; left: 1px; right: 1px; bottom: calc(100% + 1px);
  height: 4px;
  border: 1.2px solid var(--rule);
  border-radius: 3px 3px 0 0;
  background: var(--back);
}
.block--ringbox .block__mini-cell.is-done.is-wrong { background: linear-gradient(var(--paper) 0 50%, var(--back) 50%); }
.block--ringbox .block__mini-cell.is-active { width: 20px; height: 18px; }
.block--ringbox .block__mini-cell.is-active::after {
  top: -12px; right: auto; left: 50%;
  width: 10px; height: 10px; margin-left: -5px;
  border: 1.2px solid var(--rule);
  background: var(--paper);
}

/* ── Доска: момент хода и обзор ───────────────────────────────── */
.block__board {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: var(--field);
  color: var(--field-ink);
  overflow-y: auto;
  padding: 76px 16px max(24px, env(safe-area-inset-bottom));
}
.block--map .block__board {
  /* роза ветров в море под островом — меловой контур, как на старых картах */
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%23ecdfc0' stroke-opacity='.5' stroke-width='.7' stroke-linejoin='round'%3E%3Ccircle cx='20' cy='20' r='13'/%3E%3Ccircle cx='20' cy='20' r='16.5'/%3E%3Cpath d='M20 1 L23 17 L39 20 L23 23 L20 39 L17 23 L1 20 L17 17 Z M20 8 L21.6 18.4 L32 20 L21.6 21.6 L20 32 L18.4 21.6 L8 20 L18.4 18.4 Z' transform='rotate(45 20 20)'/%3E%3Cpath d='M20 1 L23 17 L39 20 L23 23 L20 39 L17 23 L1 20 L17 17 Z'/%3E%3C/g%3E%3Cpath d='M20 1 L23 17 L20 20 Z M39 20 L23 23 L20 20 Z M20 39 L17 23 L20 20 Z M1 20 L17 17 L20 20 Z' fill='%23ecdfc0' fill-opacity='.45'/%3E%3C/svg%3E") right 18% bottom 130px / 132px no-repeat,
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40'%3E%3Cpath d='M4 12 q4 -4 8 0 t8 0 M36 32 q4 -4 8 0 t8 0' fill='none' stroke='%23ecdfc0' stroke-opacity='.22' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E") 0 0 / 64px 40px,
    var(--field);
}
/* на новом участке трасса проявляется, когда плашка уходит */
.block__board--entering .block__board-track { animation: track-in .45s cubic-bezier(.16, 1, .3, 1) 1s both; }
@keyframes track-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .block__board--entering .block__board-track,
  .block__board--entering .block__meta, .block__board--entering .block__title,
  .block__board--entering .block__location, .block__board--entering .block__desc { animation: none; }
}
/* Плашка начала участка: бумага мира поверх доски, держится ~1 с и уходит */
.block__plate {
  position: absolute; left: 16px; right: 16px; top: 50%;
  z-index: 2;
  max-width: 420px; margin: 0 auto;
  padding: 22px 20px 20px;
  transform: translateY(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  text-align: center;
  background: var(--paper);
  color: var(--ink);
  border-radius: 12px;
  box-shadow: 0 20px 30px -18px color-mix(in srgb, var(--rule) 90%, transparent);
  pointer-events: none;
  /* после непрозрачной доски: вход доски занимает .3 с */
  animation: plate-life 1.25s cubic-bezier(.2, .7, .2, 1) .3s both;
}
/* шапка доски и трасса проявляются, когда плашка уходит — название не печатается дважды */
.block__board--entering .block__meta,
.block__board--entering .block__title,
.block__board--entering .block__location,
.block__board--entering .block__desc { animation: track-in .45s cubic-bezier(.16, 1, .3, 1) 1.3s both; }

/* плашка — предмет своего мира, а не одна карточка на всех */
.block--casefile .block__plate { border-radius: 2px; }
.block--casefile .block__plate::before,
.block--casefile .block__plate::after {
  content: ""; position: absolute; top: -10px;
  width: 72px; height: 22px;
  background: color-mix(in srgb, var(--paper-edge) 70%, transparent);
}
.block--casefile .block__plate::before { left: 14px; transform: rotate(-6deg); }
.block--casefile .block__plate::after  { right: 14px; transform: rotate(5deg); }
.block--letters .block__plate { border-radius: 2px; margin-top: 10px; }
.block--letters .block__plate::before {
  content: ""; position: absolute; left: 50%; bottom: 100%;
  width: 62%; height: 18px; transform: translateX(-50%);
  background: var(--paper-edge);
  clip-path: polygon(0 100%, 50% 0, 100% 100%);
}
.block--metro .block__plate {
  border-radius: 6px;
  padding-top: 40px;
  box-shadow: inset 0 12px 0 var(--chip), 0 20px 30px -18px color-mix(in srgb, var(--rule) 60%, transparent);
}
.block--metro .block__plate::before {
  content: ""; position: absolute; left: 14px; right: 14px; top: 25px;
  border-top: 2px dashed color-mix(in srgb, var(--ink) 35%, var(--paper));
}
.block--tarot .block__plate {
  border-radius: 8px;
  padding: 28px 24px 26px;
  box-shadow:
    inset 0 0 0 8px var(--paper), inset 0 0 0 9.5px color-mix(in srgb, var(--ink) 70%, var(--paper)),
    inset 0 0 0 12.5px var(--paper), inset 0 0 0 13.5px color-mix(in srgb, var(--ink) 40%, var(--paper)),
    0 20px 30px -18px color-mix(in srgb, var(--rule) 90%, transparent);
}
.block--map .block__plate { border-radius: 0; }
.block--map .block__plate::before,
.block--map .block__plate::after {
  content: ""; position: absolute; left: 0; right: 0; height: 7px;
  background: var(--paper);
}
.block--map .block__plate::before { bottom: calc(100% - 1px); clip-path: polygon(0 100%, 0.0% 43%, 3.8% 28%, 7.7% 70%, 11.5% 21%, 15.4% 61%, 19.2% 46%, 23.1% 20%, 26.9% 58%, 30.8% 18%, 34.6% 52%, 38.5% 21%, 42.3% 23%, 46.2% 51%, 50.0% 85%, 53.8% 26%, 57.7% 34%, 61.5% 68%, 65.4% 96%, 69.2% 64%, 73.1% 49%, 76.9% 98%, 80.8% 19%, 84.6% 88%, 88.5% 40%, 92.3% 27%, 96.2% 25%, 100.0% 41%, 100% 100%); }
.block--map .block__plate::after  { top: calc(100% - 1px);    clip-path: polygon(0 0, 0.0% 69%, 3.8% 15%, 7.7% 49%, 11.5% 54%, 15.4% 32%, 19.2% 47%, 23.1% 5%, 26.9% 5%, 30.8% 18%, 34.6% 58%, 38.5% 36%, 42.3% 27%, 46.2% 50%, 50.0% 39%, 53.8% 25%, 57.7% 68%, 61.5% 59%, 65.4% 21%, 69.2% 49%, 73.1% 45%, 76.9% 74%, 80.8% 62%, 84.6% 24%, 88.5% 83%, 92.3% 10%, 96.2% 36%, 100.0% 64%, 100% 0); }
.block--ringbox .block__plate {
  border-radius: 12px;
  outline: 1.5px dashed color-mix(in srgb, var(--ink) 28%, var(--paper));
  outline-offset: -8px;
}
.block--potion .block__plate {
  border-radius: 0;
  isolation: isolate;
  background: var(--rule);
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
}
.block--potion .block__plate::before {
  content: ""; position: absolute; inset: 1.5px; z-index: -1;
  background: var(--paper);
  clip-path: polygon(13.4px 0, calc(100% - 13.4px) 0, 100% 13.4px, 100% calc(100% - 13.4px), calc(100% - 13.4px) 100%, 13.4px 100%, 0 calc(100% - 13.4px), 0 13.4px);
}
.block--diecut .block__plate {
  border-radius: 0;
  background:
    radial-gradient(circle at 0 0,       transparent 11px, var(--paper) 11.5px) top left     / 51% 51% no-repeat,
    radial-gradient(circle at 100% 0,    transparent 11px, var(--paper) 11.5px) top right    / 51% 51% no-repeat,
    radial-gradient(circle at 0 100%,    transparent 11px, var(--paper) 11.5px) bottom left  / 51% 51% no-repeat,
    radial-gradient(circle at 100% 100%, transparent 11px, var(--paper) 11.5px) bottom right / 51% 51% no-repeat;
  box-shadow: none;
  filter: drop-shadow(0 14px 14px color-mix(in srgb, var(--rule) 80%, transparent));
}
.block__plate-no {
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: clamp(2rem, 11vw, 3rem);
  line-height: 1;
}
.block__plate-title { font-family: var(--font-b); font-size: 1.1rem; color: var(--ink-soft); }
@keyframes plate-life {
  0%   { opacity: 0; transform: translateY(-40%) scale(.96); }
  18%  { opacity: 1; transform: translateY(-50%) scale(1); }
  72%  { opacity: 1; transform: translateY(-50%) scale(1); }
  100% { opacity: 0; transform: translateY(-58%) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .block__plate { animation: plate-fade 1.25s linear both; }
  @keyframes plate-fade { 0%, 80% { opacity: 1; } 100% { opacity: 0; } }
}
.block__board-inner {
  max-width: 600px; margin: 0 auto;
  min-height: 100%;
  display: flex; flex-direction: column;
}
.block__board-track { margin-top: 18px; height: clamp(200px, 34svh, 300px); }
.block__board-close { margin-top: auto; }
.block__board-close:focus-visible { outline-color: var(--field-ink); }
.block__board-back { margin: 8px 0 16px; }

.board-enter-active { transition: opacity .3s ease-out, transform .45s cubic-bezier(.16, 1, .3, 1); }
.board-leave-active { transition: opacity .25s ease-in, transform .3s ease-in; }
.board-enter-from   { opacity: 0; transform: translateY(-24px); }
.board-leave-to     { opacity: 0; transform: translateY(-40px); }

.block__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--font-b);
  font-size: .9rem;
  color: var(--field-ink-soft);
  font-variant-numeric: tabular-nums;
}
.block__count b {
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  color: var(--field-ink);
  font-size: 1.05rem;
}

.block__title {
  margin: 14px 0 0;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: clamp(1.55rem, 7vw, 2.1rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--field-ink);
  text-wrap: balance;
}

.block__location {
  display: flex; align-items: center; gap: 6px;
  margin: 8px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  color: var(--field-ink-soft);
}

.block__desc {
  margin: 10px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  line-height: 1.5;
  color: var(--field-ink-soft);
}

/* ── Участок пройден ──────────────────────────────────────────── */
/* во вырубке конец дома — та же кремовая карточка с вогнутыми углами */
.block--diecut .block__done {
  border: none;
  border-radius: 0;
  background:
    radial-gradient(circle at 0 0,       transparent 11px, var(--paper) 11.5px) top left     / 51% 51% no-repeat,
    radial-gradient(circle at 100% 0,    transparent 11px, var(--paper) 11.5px) top right    / 51% 51% no-repeat,
    radial-gradient(circle at 0 100%,    transparent 11px, var(--paper) 11.5px) bottom left  / 51% 51% no-repeat,
    radial-gradient(circle at 100% 100%, transparent 11px, var(--paper) 11.5px) bottom right / 51% 51% no-repeat;
  box-shadow: none;
  filter: drop-shadow(0 14px 14px color-mix(in srgb, var(--rule) 80%, transparent));
  padding: 22px 20px 20px;
}
/* в зельеварне конец рецепта — тоже страница рецепта */
.block--potion .block__done {
  position: relative;
  border: none;
  border-radius: 6px;
  box-shadow:
    0 1px 0 var(--paper-edge),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
  padding: 26px 20px 20px;
}
/* шапка страницы рецепта: двойная линейка под заголовком, как в старой книге */
.block__rule {
  position: absolute; left: 18px; right: 18px; top: 10px;
  height: 4px;
  border-top: 1.5px solid color-mix(in srgb, var(--ink) 55%, var(--paper));
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
  pointer-events: none;
}
/* в футляре конец момента — шёлковая карточка с прострочкой */
.block--ringbox .block__done {
  position: relative;
  border: none;
  border-radius: 12px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rule) 14%, transparent),
    0 16px 24px -16px color-mix(in srgb, var(--rule) 55%, transparent);
  padding: 24px 22px 22px;
}
.block__stitch {
  position: absolute;
  pointer-events: none;
}
/* прострочка подкладки: пунктирный шов, отступивший от края */
.block__stitch { inset: 7px; border: 1.5px dashed color-mix(in srgb, var(--ink) 28%, var(--paper)); border-radius: 7px; }
/* на карте конец острова — тоже обрывок пергамента с рваным краем */
.block--map .block__done {
  position: relative;
  margin: 8px 0;
  border: none;
  border-radius: 0;
  box-shadow: 0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
}
.block--map .block__done::before,
.block--map .block__done::after {
  content: "";
  position: absolute; left: 0; right: 0;
  height: 7px;
  background: var(--paper);
  pointer-events: none;
}
.block--map .block__done::before { bottom: calc(100% - 1px); clip-path: polygon(0 100%, 0.0% 43%, 3.8% 28%, 7.7% 70%, 11.5% 21%, 15.4% 61%, 19.2% 46%, 23.1% 20%, 26.9% 58%, 30.8% 18%, 34.6% 52%, 38.5% 21%, 42.3% 23%, 46.2% 51%, 50.0% 85%, 53.8% 26%, 57.7% 34%, 61.5% 68%, 65.4% 96%, 69.2% 64%, 73.1% 49%, 76.9% 98%, 80.8% 19%, 84.6% 88%, 88.5% 40%, 92.3% 27%, 96.2% 25%, 100.0% 41%, 100% 100%); }
.block--map .block__done::after  { top: calc(100% - 1px);    clip-path: polygon(0 0, 0.0% 69%, 3.8% 15%, 7.7% 49%, 11.5% 54%, 15.4% 32%, 19.2% 47%, 23.1% 5%, 26.9% 5%, 30.8% 18%, 34.6% 58%, 38.5% 36%, 42.3% 27%, 46.2% 50%, 50.0% 39%, 53.8% 25%, 57.7% 68%, 61.5% 59%, 65.4% 21%, 69.2% 49%, 73.1% 45%, 76.9% 74%, 80.8% 62%, 84.6% 24%, 88.5% 83%, 92.3% 10%, 96.2% 36%, 100.0% 64%, 100% 0); }
/* в колоде конец расклада — тоже карта: без контура, с гравированной рамкой */
.block--tarot .block__done {
  position: relative;
  border: none;
  border-radius: 8px;
  padding: 28px 24px 24px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rule) 50%, transparent),
    0 2px 0 var(--paper-edge),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
}
.block__frame,
.block__frame::after {
  position: absolute;
  border-radius: 4px;
  pointer-events: none;
}
.block__frame { inset: 8px; border: 1.5px solid color-mix(in srgb, var(--ink) 70%, var(--paper)); }
.block__frame::after {
  content: "";
  inset: 3px;
  border: 1px solid color-mix(in srgb, var(--ink) 40%, var(--paper));
  border-radius: 2px;
}
.block__done {
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--rule);
  border-bottom-width: 7px;
  border-radius: 14px;
  padding: 20px 18px 18px;
  display: flex; flex-direction: column; gap: 16px;
}
.block__done-text {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.15rem;
  line-height: 1.4;
}

.block__back {
  align-self: flex-start;
  display: inline-flex; align-items: center; gap: 6px;
  min-height: 44px;
  padding: 0 4px;
  background: none; border: none;
  color: var(--field-ink-soft);
  font-family: var(--font-b);
  font-size: .95rem;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}
.block__back:hover { color: var(--field-ink); }
.block__back:focus-visible { outline: 3px solid var(--field-ink); outline-offset: 2px; border-radius: 6px; }

/* ── Шторка перечитывания ─────────────────────────────────────── */
.block__sheet {
  position: fixed; inset: 0; z-index: 900;
  display: flex; align-items: flex-end; justify-content: center;
  background: color-mix(in srgb, var(--rule) 55%, transparent);
  padding: 12px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
.block__sheet-panel {
  width: 100%; max-width: 520px;
  max-height: 88svh;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 10px;
}
.block__sheet-close {
  min-height: 52px;
  background: var(--field);
  color: var(--field-ink);
  border: 3px solid var(--rule);
  border-radius: 12px;
  font-family: var(--font-d);
  font-size: 1rem;
  cursor: pointer;
}
.block__sheet-close:focus-visible { outline: 3px solid var(--plate); outline-offset: 2px; }
/* в футляре крышка светлая, как поле: фокус — чернилами */
.block--ringbox .block__sheet-close:focus-visible { outline-color: var(--focus); }

/* ── Движение ─────────────────────────────────────────────────── */
.card-enter-active { transition: transform .45s cubic-bezier(.16, 1, .3, 1), opacity .25s ease-out; }
.card-leave-active { transition: transform .2s ease-in, opacity .2s ease-in; }
.card-enter-from   { transform: translateY(28px); opacity: 0; }
.card-leave-to     { transform: translateY(-10px); opacity: 0; }

.sheet-enter-active, .sheet-leave-active { transition: opacity .25s ease-out; }
.sheet-enter-active .block__sheet-panel { transition: transform .4s cubic-bezier(.16, 1, .3, 1); }
.sheet-leave-active .block__sheet-panel { transition: transform .2s ease-in; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .block__sheet-panel, .sheet-leave-to .block__sheet-panel { transform: translateY(40px); }

@media (prefers-reduced-motion: reduce) {
  .card-enter-active, .card-leave-active,
  .sheet-enter-active, .sheet-leave-active,
  .sheet-enter-active .block__sheet-panel, .sheet-leave-active .block__sheet-panel,
  .board-enter-active, .board-leave-active { transition: none; }
}
</style>
