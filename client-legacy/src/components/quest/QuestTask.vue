<template>
  <div
    class="task"
    :class="{
      'task--done':   isDone,
      'task--active': isActive,
      'task--locked': isLocked,
      [`task--${task.type}`]: true
    }"
    :style="{ '--i': index }"
  >
    <!-- Маркер слева -->
    <div class="task__dot">
      <span v-if="isDone">✓</span>
      <span v-else-if="isLocked">🔒</span>
      <span v-else>{{ typeIcon }}</span>
    </div>

    <div class="task__body">
      <div class="task__title">{{ task.title }}</div>
      <p v-if="task.description" class="task__desc">{{ task.description }}</p>

      <!-- ════ ВЫПОЛНЕНО ════ -->
      <div v-if="isDone" class="task__done">
        <span>{{ theme.copy.taskDone }}</span>
        <span v-if="task.points" class="task__pts">+{{ task.points }} {{ theme.copy.pointsLabel }}</span>
      </div>

      <template v-else-if="isActive">

        <!-- ════ SIMPLE — просто нажать ════ -->
        <template v-if="task.type === 'simple'">
          <template v-if="task.hint">
          <button v-if="!hintShown" class="task__hint-btn" @click="showHint">{{ theme.copy.hintBtn }}</button>
          <div v-else class="task__hint">💡 {{ task.hint }}</div>
        </template>
          <button class="task__action" @click="$emit('complete', task)">
            {{ theme.copy.taskDone }} ✓
          </button>
        </template>

        <!-- ════ RIDDLE — ввести ответ ════ -->
        <template v-else-if="task.type === 'riddle'">
          <div v-if="task.question" class="task__question">{{ task.question }}</div>
          <div class="task__row">
            <input
              v-model="answerInput"
              type="text"
              class="task__input"
              :class="{ shake: isWrong }"
              placeholder="Твой ответ..."
              autocomplete="off" spellcheck="false"
              @keyup.enter="submitAnswer"
            />
            <button class="task__ok" @click="submitAnswer" :disabled="!answerInput.trim()">OK</button>
          </div>
          <div v-if="isWrong" class="task__wrong">Не то, попробуй ещё раз 🤔</div>
          <template v-if="task.hint">
          <button v-if="!hintShown" class="task__hint-btn" @click="showHint">{{ theme.copy.hintBtn }}</button>
          <div v-else class="task__hint">💡 {{ task.hint }}</div>
        </template>
        </template>

        <!-- ════ CODE_PHYSICAL — собрать код с предметов ════ -->
        <template v-else-if="task.type === 'code_physical'">
          <div v-if="task.instruction" class="task__instruction">
            🔍 {{ task.instruction }}
          </div>
          <div class="task__code-hint" v-if="task.code_hint">
            <span class="task__code-hint__label">Предметы:</span>
            {{ task.code_hint }}
          </div>
          <div class="task__row">
            <input
              v-model="answerInput"
              type="text"
              class="task__input task__input--code"
              :class="{ shake: isWrong }"
              :placeholder="task.answer ? task.answer.replace(/\S/g, '_').split('').join(' ') : '_ _ _ _'"
              autocomplete="off" spellcheck="false"
              maxlength="20"
              @keyup.enter="submitAnswer"
            />
            <button class="task__ok" @click="submitAnswer" :disabled="!answerInput.trim()">→</button>
          </div>
          <div v-if="isWrong" class="task__wrong">Неверный код, попробуй ещё</div>
          <template v-if="task.hint">
          <button v-if="!hintShown" class="task__hint-btn" @click="showHint">{{ theme.copy.hintBtn }}</button>
          <div v-else class="task__hint">💡 {{ task.hint }}</div>
        </template>
        </template>

        <!-- ════ LOCATION — прийти в место ════ -->
        <template v-else-if="task.type === 'location'">
          <div v-if="task.location_desc" class="task__location-card">
            <div class="task__location-card__icon">📍</div>
            <div class="task__location-card__text">{{ task.location_desc }}</div>
          </div>
          <div v-if="task.location_hint" class="task__hint">
            💡 {{ task.location_hint }}
          </div>
          <button class="task__action task__action--location" @click="$emit('complete', task)">
            📍 Я здесь!
          </button>
        </template>

        <!-- ════ SELFIE — фото с условием ════ -->
        <template v-else-if="task.type === 'selfie'">
          <div class="task__selfie-condition">
            <span class="task__selfie-condition__emoji">{{ task.selfie_emoji || '🤳' }}</span>
            <span>{{ task.selfie_condition || 'Сделай селфи' }}</span>
          </div>
          <input
            :ref="el => fileInputRef = el"
            type="file" accept="image/*" capture="user"
            style="display:none"
            @change="onFileChange"
          />
          <div v-if="!photoPreview" class="task__photo-zone task__photo-zone--selfie" @click="fileInputRef?.click()">
            <div style="font-size:2rem">🤳</div>
            <div>Нажми чтобы сфотографироваться</div>
          </div>
          <div v-else class="task__photo-preview">
            <img :src="photoPreview" alt="" />
            <button class="task__photo-rm" @click="photoPreview = null">✕</button>
          </div>
          <button v-if="photoPreview" class="task__action" @click="$emit('complete', task)">
            Готово →
          </button>
        </template>

        <!-- ════ PHOTO — обычное фото ════ -->
        <template v-else-if="task.type === 'photo'">
          <p v-if="task.instruction" class="task__instruction">{{ task.instruction }}</p>
          <input
            :ref="el => fileInputRef = el"
            type="file" accept="image/*" capture="environment"
            style="display:none"
            @change="onFileChange"
          />
          <div v-if="!photoPreview" class="task__photo-zone" @click="fileInputRef?.click()">
            <div style="font-size:1.6rem">📷</div>
            <div>{{ theme.copy.photoZone }}</div>
          </div>
          <div v-else class="task__photo-preview">
            <img :src="photoPreview" alt="" />
            <button class="task__photo-rm" @click="photoPreview = null">✕</button>
          </div>
          <button v-if="photoPreview" class="task__action" @click="$emit('complete', task)">Отправить →</button>
        </template>

        <!-- ════ TEXT_ANSWER — свободный ответ ════ -->
        <template v-else-if="task.type === 'text_answer'">
          <div v-if="task.question" class="task__question">{{ task.question }}</div>
          <textarea
            v-model="textAnswer"
            class="task__textarea"
            :placeholder="task.placeholder || 'Напиши свой ответ...'"
            rows="4"
            @input="$emit('answer-change', { task, value: textAnswer })"
          ></textarea>
          <button class="task__action" :disabled="!textAnswer.trim()" @click="submitText">
            Записать ответ ✓
          </button>
        </template>

        <!-- ════ MEDIA ════ -->
        <template v-else-if="task.type === 'media'">
          <div class="task__media">

            <!-- Определяем тип по media_type или по расширению URL -->
            <template v-if="resolvedMediaType(task) === 'video'">
              <video
                :src="mediaFullUrl(task.media_url)"
                controls
                playsinline
                class="task__media__video"
                preload="metadata"
              ></video>
            </template>

            <template v-else-if="resolvedMediaType(task) === 'audio'">
              <div class="task__media__audio-wrap">
                <div class="task__media__audio-icon">🎙️</div>
                <audio
                  :src="mediaFullUrl(task.media_url)"
                  controls
                  class="task__media__audio"
                  preload="metadata"
                ></audio>
              </div>
            </template>

            <!-- Ссылка Telegram (старый формат) -->
            <template v-else-if="task.media_url">
              <a :href="task.media_url" target="_blank" class="task__media__tg-link task__media__tg-link--video">
                <div class="task__media__tg-icon">🎬</div>
                <div class="task__media__tg-text">
                  <div class="task__media__tg-title">Медиа послание</div>
                  <div class="task__media__tg-sub">Нажми чтобы открыть</div>
                </div>
                <div class="task__media__tg-arrow">→</div>
              </a>
            </template>

          </div>
          <button class="task__action" @click="$emit('complete', task)">
            Посмотрел(а) ✓
          </button>
        </template>

        <!-- ════ QR — сканировать код ════ -->
        <template v-else-if="task.type === 'qr'">
          <div class="task__qr-instruction">
            <div class="task__qr-instruction__icon">◻️</div>
            <div>{{ task.qr_instruction || 'Найди предмет с QR-кодом и отсканируй его' }}</div>
          </div>
          <!-- Fallback: ручной ввод кода если сканер недоступен -->
          <div class="task__qr-manual">
            <div class="task__qr-manual__label">Или введи код вручную:</div>
            <div class="task__row">
              <input
                v-model="answerInput"
                class="task__input task__input--code"
                :class="{ shake: isWrong }"
                placeholder="Код с QR-этикетки"
                autocomplete="off"
                @keyup.enter="submitAnswer"
              />
              <button class="task__ok" @click="submitAnswer" :disabled="!answerInput.trim()">→</button>
            </div>
            <div v-if="isWrong" class="task__wrong">Неверный код</div>
          </div>
        </template>

        <!-- ════ MINI_GAME ════ -->
        <template v-else-if="task.type === 'mini_game'">

          <!-- Угадайка (4 варианта) -->
          <template v-if="task.game_type === 'quiz'">
            <div class="task__quiz-question">{{ task.game_question }}</div>
            <div class="task__quiz-options">
              <button
                v-for="(opt, oi) in task.game_options"
                :key="oi"
                class="task__quiz-opt"
                :class="{
                  correct: quizAnswered && oi === task.game_correct,
                  wrong:   quizAnswered && quizPicked === oi && oi !== task.game_correct
                }"
                :disabled="quizAnswered"
                @click="pickQuiz(oi)"
              >
                <span class="task__quiz-opt__letter">{{ 'АБВГ'[oi] }}</span>
                {{ opt }}
              </button>
            </div>
            <div v-if="quizAnswered && quizPicked === task.game_correct" class="task__quiz-result task__quiz-result--right">
              Правильно! 🎉
            </div>
            <div v-if="quizAnswered && quizPicked !== task.game_correct" class="task__quiz-result task__quiz-result--wrong">
              Не угадал(а), правильно: {{ task.game_options[task.game_correct] }}
            </div>
            <button v-if="quizAnswered" class="task__action" @click="$emit('complete', task)">
              Продолжаем →
            </button>
          </template>

          <!-- Найди пары -->
          <template v-else-if="task.game_type === 'pairs'">
            <div class="task__pairs">
              <button
                v-for="(card, ci) in pairsCards"
                :key="ci"
                class="task__pairs__card"
                :class="{
                  flipped:  pairsFlipped.includes(ci),
                  matched:  pairsMatched.includes(ci),
                }"
                :disabled="pairsMatched.includes(ci) || pairsFlipped.length === 2"
                @click="flipCard(ci)"
              >
                <div class="task__pairs__card__inner">
                  <div class="task__pairs__card__back">?</div>
                  <div class="task__pairs__card__front">
                    <img v-if="isCardImage(card.value)" :src="card.value" class="task__pairs__card__img" />
                    <span v-else>{{ card.value }}</span>
                  </div>
                </div>
              </button>
            </div>
            <div v-if="pairsComplete" class="task__quiz-result task__quiz-result--right">
              Все пары найдены! 🎉
            </div>
            <button v-if="pairsComplete" class="task__action" @click="$emit('complete', task)">
              Продолжаем →
            </button>
          </template>

          <!-- ════ PUZZLE — тап→выбор→тап→поставить ════ -->
          <template v-else-if="task.game_type === 'puzzle'">
            <div class="task__puzzle">

              <!-- Превью до старта -->
              <div v-if="!puzzleStarted" class="task__puzzle__intro">
                <div class="task__puzzle__intro-img-wrap">
                  <img :src="task.puzzle_image" class="task__puzzle__intro-img" alt="Пазл" />
                  <div class="task__puzzle__intro-overlay">Запомни картинку</div>
                </div>
                <div class="task__puzzle__intro-meta">{{ puzzleTotalPieces }} частей · тапни чтобы выбрать кусок и поставить на место</div>
                <button class="task__action" @click="initPuzzle">🧩 Начать пазл!</button>
              </div>

              <!-- Игровое поле -->
              <template v-else>
                <!-- Прогресс -->
                <div class="task__puzzle__progress">
                  <div class="task__puzzle__progress-bar">
                    <div class="task__puzzle__progress-fill" :style="{ width: puzzleProgress + '%' }"></div>
                  </div>
                  <span class="task__puzzle__progress-txt">{{ puzzlePlaced }}/{{ puzzleTotalPieces }} собрано</span>
                </div>

                <!-- Поле сборки (сетка слотов) -->
                <div class="task__puzzle__board" :style="{ gridTemplateColumns: `repeat(${puzzleCols}, 1fr)` }">
                  <div
                    v-for="slot in puzzleSlots"
                    :key="'s' + slot.i"
                    class="task__puzzle__slot"
                    :class="{
                      filled:   slot.pieceIdx !== null,
                      correct:  slot.pieceIdx === slot.i,
                      selected: selectedSlot === slot.i,
                      hint:     hintSlot === slot.i
                    }"
                    :style="slotStyle(slot)"
                    @click="onSlotTap(slot.i)"
                  ></div>
                </div>

                <div class="task__puzzle__tip">
                  <template v-if="selectedSlot === null">👆 Тапни на кусок чтобы выбрать</template>
                  <template v-else>👇 Тапни куда поставить выбранный кусок</template>
                </div>

                <!-- Неявная кнопка пропуска -->
                <button v-if="!puzzleComplete" class="task__puzzle__skip" @click="emit('skip-task', task)">
                  Не получается? Пропустить
                </button>

                <div v-if="puzzleComplete" class="task__quiz-result task__quiz-result--right">🎉 Пазл собран!</div>
                <button v-if="puzzleComplete" class="task__action" @click="$emit('complete', task)">Продолжаем →</button>
              </template>
            </div>
          </template>

        </template>

      </template><!-- end isActive -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// ── Props / Emits ────────────────────────────────────────────────
const props = defineProps({
  task:     { type: Object, required: true },
  theme:    { type: Object, required: true },
  index:    { type: Number, default: 0 },
  isDone:   { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
})
const emit = defineEmits(['complete', 'hint', 'answer-change', 'skip-task'])

// ── State ────────────────────────────────────────────────────────
const hintShown    = ref(false)
const showHint     = () => { hintShown.value = true; emit('hint', props.task) }

const answerInput  = ref('')
const isWrong      = ref(false)
const photoPreview = ref(null)
const fileInputRef = ref(null)
const textAnswer   = ref('')

// ── Quiz ─────────────────────────────────────────────────────────
const quizAnswered = ref(false)
const quizPicked   = ref(null)

const pickQuiz = (idx) => {
  if (quizAnswered.value) return
  quizPicked.value   = idx
  quizAnswered.value = true
}

// ── Pairs ─────────────────────────────────────────────────────────
const pairsCards   = ref([])
const pairsFlipped = ref([])
const pairsMatched = ref([])
const pairsComplete = computed(() =>
  pairsCards.value.length > 0 && pairsMatched.value.length === pairsCards.value.length
)

onMounted(() => {
  if (props.task.type === 'mini_game' && props.task.game_type === 'pairs') {
    // Каждое фото дублируется в две карточки, потом перемешиваются
    const images = props.task.game_images || []
    const cards = images.flatMap((img, i) => [
      { id: i,       value: img, pairId: i },
      { id: i + 100, value: img, pairId: i },
    ])
    pairsCards.value = cards.sort(() => Math.random() - 0.5)
  }
})

let pairsTimer = null

// ── Puzzle ────────────────────────────────────────────────────
// ── PUZZLE — механика тап→выбор→тап→поставить ───────────────
const puzzleStarted = ref(false)
// puzzleSlots[i].pieceIdx — какой кусок стоит в слоте i (null = пусто)
// Изначально куски расставлены случайно по всем слотам
const puzzleSlots   = ref([])   // { i, pieceIdx }
const selectedSlot  = ref(null) // индекс выбранного слота
const hintSlot      = ref(null) // мигающая подсказка при неправильном выборе

// Конфигурация из задания
const puzzleCols = computed(() => {
  const p = props.task.puzzle_pieces || 30
  // 30→5×6, 35→5×7, 42→6×7
  if (p === 42) return 6
  if (p === 35) return 7
  return 6
})
const puzzleRows = computed(() => {
  const p = props.task.puzzle_pieces || 30
  if (p === 42) return 7
  if (p === 35) return 5
  return 5
})
const puzzleTotalPieces = computed(() => puzzleCols.value * puzzleRows.value)

const puzzlePlaced = computed(() =>
  puzzleSlots.value.filter(s => s.pieceIdx === s.i).length
)
const puzzleProgress = computed(() =>
  puzzleTotalPieces.value ? Math.round(puzzlePlaced.value / puzzleTotalPieces.value * 100) : 0
)
const puzzleComplete = computed(() =>
  puzzleTotalPieces.value > 0 && puzzlePlaced.value === puzzleTotalPieces.value
)

// Стиль слота — показывает фрагмент изображения
// Используем background-size + background-position через px
// чтобы точно показать нужный фрагмент без деления на ноль
const slotStyle = (slot) => {
  if (slot.pieceIdx === null || !props.task.puzzle_image) return {}
  const cols = puzzleCols.value
  const rows = puzzleRows.value
  const c = slot.pieceIdx % cols
  const r = Math.floor(slot.pieceIdx / cols)
  // background-size: вся картинка растянута на cols×rows ячеек
  // background-position: смещение в % — каждая ячейка = 1 шаг
  const posX = cols > 1 ? (c / (cols - 1)) * 100 : 0
  const posY = rows > 1 ? (r / (rows - 1)) * 100 : 0
  return {
    backgroundImage:    `url(${props.task.puzzle_image})`,
    backgroundSize:     `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${posX}% ${posY}%`,
  }
}

const initPuzzle = () => {
  const total = puzzleTotalPieces.value
  // Создаём перемешанный массив кусков
  const shuffled = Array.from({ length: total }, (_, i) => i)
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  // Каждый слот получает случайный кусок
  puzzleSlots.value = shuffled.map((pieceIdx, i) => ({ i, pieceIdx }))
  selectedSlot.value = null
  puzzleStarted.value = true
}

// Тап по слоту
const onSlotTap = (slotIdx) => {
  if (puzzleComplete.value) return

  if (selectedSlot.value === null) {
    // Первый тап — выбираем
    selectedSlot.value = slotIdx
    return
  }

  if (selectedSlot.value === slotIdx) {
    // Тап по тому же — снимаем выбор
    selectedSlot.value = null
    return
  }

  // Второй тап — меняем куски местами
  const a = puzzleSlots.value[selectedSlot.value]
  const b = puzzleSlots.value[slotIdx]
  const tmp = a.pieceIdx
  a.pieceIdx = b.pieceIdx
  b.pieceIdx = tmp

  // Вибрация если оба правильно встали
  if (a.pieceIdx === a.i && b.pieceIdx === b.i && 'vibrate' in navigator) {
    navigator.vibrate(40)
  }

  selectedSlot.value = null
}

const isCardImage = (v) => v && (v.startsWith('data:image') || v.startsWith('http'))

const flipCard = (ci) => {
  if (pairsFlipped.value.includes(ci)) return
  if (pairsFlipped.value.length === 2) return

  pairsFlipped.value.push(ci)

  if (pairsFlipped.value.length === 2) {
    const [a, b] = pairsFlipped.value
    const cardA = pairsCards.value[a]
    const cardB = pairsCards.value[b]

    if (cardA.pairId === cardB.pairId) {
      pairsMatched.value.push(a, b)
      pairsFlipped.value = []
    } else {
      pairsTimer = setTimeout(() => {
        pairsFlipped.value = []
      }, 900)
    }
  }
}

// ── Type icon ─────────────────────────────────────────────────────
const typeIcon = computed(() => ({
  simple:        '✓',
  riddle:        '?',
  code_physical: '🔢',
  location:      '📍',
  selfie:        '🤳',
  photo:         '📷',
  text_answer:   '✍️',
  media:         '🎬',
  qr:            '◻️',
  mini_game:     '🎮',
}[props.task.type] || props.index + 1))

// ── Answer submit ─────────────────────────────────────────────────
const submitAnswer = () => {
  const user    = answerInput.value.trim().toLowerCase().replace(/\s+/g, '')
  const correct = (props.task.answer || '').trim().toLowerCase().replace(/\s+/g, '')
  if (!correct || user === correct) {
    emit('complete', props.task)
  } else {
    isWrong.value = true
    setTimeout(() => { isWrong.value = false }, 700)
  }
}

// ── Text submit ───────────────────────────────────────────────────
const submitText = () => {
  if (!textAnswer.value.trim()) return
  emit('complete', { ...props.task, saved_answer: textAnswer.value })
}

// ── Photo ─────────────────────────────────────────────────────────
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { photoPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

// ── Media ─────────────────────────────────────────────────────────
const isYoutube = computed(() => {
  const url = props.task.media_url || ''
  return url.includes('youtube.com') || url.includes('youtu.be')
})

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
const mediaFullUrl = (url) => url?.startsWith('http') ? url : API_BASE + url

const resolvedMediaType = (task) => {
  if (task.media_type === 'video' || task.media_type === 'audio') return task.media_type
  // fallback по расширению URL
  const url = task.media_url || ''
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video'
  if (/\.(mp3|ogg|wav|m4a)(\?|$)/i.test(url)) return 'audio'
  // fallback по пути uploads/media
  if (url.includes('/uploads/media/')) {
    const ext = url.split('.').pop().toLowerCase()
    return ['mp4','webm','mov'].includes(ext) ? 'video' : 'audio'
  }
  return null
}
</script>

<style scoped>
/* ── Task ─────────────────────────────────────────────────────── */
.task {
  background: var(--surf);
  border: 1px solid var(--bord);
  border-left: 3px solid var(--bord);
  border-radius: 12px;
  padding: 16px;
  display: flex; gap: 14px;
  animation: task-in .25s ease both;
  animation-delay: calc(var(--i, 0) * 0.06s);
  transition: opacity .2s, border-color .2s;
}
@keyframes task-in { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

.task--active  { border-left-color: var(--accent); }
.task--active .task__dot { border-color: var(--accent); color: var(--accent); }
.task--done    { opacity: .55; border-left-color: #3cffb4; }
.task--done .task__dot { border-color: #3cffb4; color: #3cffb4; background: rgba(60,255,180,.06); }
.task--locked  { opacity: .3; pointer-events: none; }

/* ── Dot ──────────────────────────────────────────────────────── */
.task__dot {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  border: 1px solid var(--bord);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; color: var(--dim); margin-top: 1px;
}

/* ── Body ─────────────────────────────────────────────────────── */
.task__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.task__title { font-size: .95rem; font-weight: 700; color: #fff; }
.task__desc { font-size: .88rem; color: var(--dim); line-height: 1.6; margin: 0; }
.task__instruction { font-size: .85rem; color: var(--text); font-style: italic; margin: 0; }

.task__done {
  display: flex; align-items: center; justify-content: space-between;
  font-size: .82rem; color: #3cffb4; padding: 6px 0;
}
.task__pts { font-family: var(--font-d); font-size: .72rem; opacity: .8; }

/* ── Row / Input ──────────────────────────────────────────────── */
.task__row { display: flex; gap: 8px; }
.task__question {
  font-size: .88rem; font-style: italic; color: var(--text);
  background: rgba(255,255,255,.03);
  border-left: 2px solid var(--accent);
  padding: 9px 13px; border-radius: 0 8px 8px 0; line-height: 1.5;
}
.task__input {
  flex: 1; background: var(--bg2); border: 1px solid var(--bord);
  border-radius: 8px; padding: 10px 13px; color: #fff;
  font-family: var(--font-b); font-size: .9rem; outline: none; transition: border-color .2s;
}
.task__input:focus { border-color: var(--accent); }
.task__input--code { font-family: var(--font-d); letter-spacing: .2em; text-align: center; font-size: 1rem; }
.task__input.shake { animation: shake .4s ease; border-color: #f87171; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

.task__ok {
  background: var(--accent); border: none; border-radius: 8px;
  color: #000; font-weight: 700; font-family: var(--font-d); font-size: .8rem;
  padding: 0 14px; cursor: pointer;
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 30%, transparent);
  transition: all .2s; white-space: nowrap;
}
.task__ok:disabled { opacity: .4; cursor: default; }

.task__wrong { font-size: .78rem; color: #f87171; }

/* ── Hint ─────────────────────────────────────────────────────── */
.task__hint-btn {
  background: transparent; border: 1px dashed rgba(255,200,0,.3);
  border-radius: 8px; padding: 7px 12px; color: rgba(255,200,0,.7);
  font-size: .78rem; cursor: pointer; text-align: left; transition: all .2s; width: 100%;
}
.task__hint-btn:hover { border-color: rgba(255,200,0,.6); color: #ffc800; }
.task__hint {
  background: rgba(255,200,0,.05); border: 1px solid rgba(255,200,0,.2);
  border-radius: 8px; padding: 9px 13px; font-size: .83rem;
  color: rgba(255,200,0,.9); line-height: 1.5;
}

/* ── Action button ────────────────────────────────────────────── */
.task__action {
  background: transparent; border: 1px solid var(--accent); border-radius: 9px;
  padding: 11px; color: var(--accent); font-family: var(--font-b);
  font-size: .9rem; font-weight: 600; cursor: pointer;
  text-shadow: 0 0 6px var(--accent); transition: all .25s; width: 100%;
}
.task__action:hover:not(:disabled) { background: var(--accent); color: #000; text-shadow: none; }
.task__action:disabled { opacity: .4; cursor: default; }
.task__action--location { border-style: dashed; }

/* ── Location ─────────────────────────────────────────────────── */
.task__location-card {
  display: flex; align-items: flex-start; gap: 12px;
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px; padding: 14px;
}
.task__location-card__icon { font-size: 1.4rem; flex-shrink: 0; }
.task__location-card__text { font-size: .9rem; line-height: 1.55; color: var(--text); }

/* ── Code physical ────────────────────────────────────────────── */
.task__code-hint {
  background: rgba(255,255,255,.03); border: 1px solid var(--bord);
  border-radius: 8px; padding: 10px 13px; font-size: .85rem; line-height: 1.5;
}
.task__code-hint__label { font-size: .7rem; color: var(--dim); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4px; display: block; }

/* ── Selfie ───────────────────────────────────────────────────── */
.task__selfie-condition {
  display: flex; align-items: center; gap: 10px;
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px; padding: 12px 16px;
  font-size: .95rem; font-weight: 600; color: var(--text);
}
.task__selfie-condition__emoji { font-size: 1.5rem; flex-shrink: 0; }

/* ── Photo zones ──────────────────────────────────────────────── */
.task__photo-zone {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: var(--bg2); border: 2px dashed var(--bord); border-radius: 10px;
  padding: 24px; cursor: pointer; transition: border-color .2s; text-align: center;
  font-size: .85rem; color: var(--dim);
}
.task__photo-zone:hover { border-color: var(--accent); }
.task__photo-zone--selfie { border-color: color-mix(in srgb, var(--accent) 40%, transparent); }

.task__photo-preview { position: relative; border-radius: 10px; overflow: hidden; }
.task__photo-preview img { width: 100%; display: block; max-height: 260px; object-fit: cover; }
.task__photo-rm {
  position: absolute; top: 8px; right: 8px;
  background: rgba(0,0,0,.7); border: none; border-radius: 50%;
  width: 26px; height: 26px; color: #fff; font-size: .7rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

/* ── Text answer ──────────────────────────────────────────────── */
.task__textarea {
  width: 100%; background: var(--bg2); border: 1px solid var(--bord);
  border-radius: 8px; padding: 11px 13px; color: #fff; font-family: var(--font-b);
  font-size: .9rem; line-height: 1.6; outline: none; resize: vertical;
  transition: border-color .2s; box-sizing: border-box;
}
.task__textarea:focus { border-color: var(--accent); }

/* ── Media ────────────────────────────────────────────────────── */
.task__media { display: flex; flex-direction: column; gap: 10px; }
.task__media__wrap { position: relative; padding-top: 56.25%; border-radius: 10px; overflow: hidden; }
.task__media__iframe { position: absolute; inset: 0; width: 100%; height: 100%; }
.task__media__video { width: 100%; border-radius: 10px; max-height: 280px; }
.task__media__audio-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; background: var(--bg2); border-radius: 10px; }
.task__media__audio-icon { font-size: 2rem; }
.task__media__audio { width: 100%; }

/* ── QR ───────────────────────────────────────────────────────── */
.task__qr-instruction {
  display: flex; align-items: flex-start; gap: 12px;
  background: var(--bg2); border: 1px solid var(--bord);
  border-radius: 10px; padding: 14px; font-size: .9rem; line-height: 1.5; color: var(--text);
}
.task__qr-instruction__icon { font-size: 1.8rem; flex-shrink: 0; }
.task__qr-manual { display: flex; flex-direction: column; gap: 6px; }
.task__qr-manual__label { font-size: .72rem; color: var(--dim); }

/* ── Quiz ─────────────────────────────────────────────────────── */
.task__quiz-question {
  font-size: .95rem; font-weight: 600; color: var(--text); line-height: 1.5;
  border-left: 2px solid var(--accent); padding-left: 12px;
}
.task__quiz-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.task__quiz-opt {
  background: var(--bg2); border: 1px solid var(--bord); border-radius: 9px;
  padding: 11px 12px; color: var(--text); font-size: .85rem; cursor: pointer;
  text-align: left; display: flex; align-items: center; gap: 8px;
  transition: all .2s;
}
.task__quiz-opt:hover:not(:disabled) { border-color: var(--accent); }
.task__quiz-opt.correct { border-color: #3cffb4; background: rgba(60,255,180,.1); color: #3cffb4; }
.task__quiz-opt.wrong   { border-color: #f87171; background: rgba(248,113,113,.08); color: #f87171; }
.task__quiz-opt:disabled { cursor: default; }
.task__quiz-opt__letter {
  width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--bord);
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 700; flex-shrink: 0; font-family: var(--font-d);
}
.task__quiz-result {
  text-align: center; font-size: .9rem; padding: 8px;
  border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: #3cffb4; background: rgba(60,255,180,.08); }
.task__quiz-result--wrong { color: #f87171; background: rgba(248,113,113,.08); }

/* ── Pairs game ───────────────────────────────────────────────── */
.task__pairs {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
}
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
.task__pairs__card.matched .task__pairs__card__inner {
  transform: rotateY(180deg);
}
.task__pairs__card__back,
.task__pairs__card__front {
  position: absolute; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  backface-visibility: hidden; font-size: .85rem;
  padding: 4px; text-align: center; line-height: 1.3;
}
.task__pairs__card__back { color: var(--accent); font-size: 1.2rem; }
.task__pairs__card__front { transform: rotateY(180deg); color: var(--text); background: color-mix(in srgb, var(--accent) 8%, var(--bg2)); }
.task__pairs__card__img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
</style>

<style scoped>
/* ── Puzzle ───────────────────────────────────────────────────── */
.task__puzzle { display: flex; flex-direction: column; gap: 12px; }

/* Превью до старта */
.task__puzzle__intro { display: flex; flex-direction: column; gap: 10px; }
.task__puzzle__intro-img-wrap { position: relative; border-radius: 10px; overflow: hidden; }
.task__puzzle__intro-img { width: 100%; display: block; max-height: 220px; object-fit: cover; }
.task__puzzle__intro-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.35); color: #fff; font-size: .9rem; font-weight: 700;
  letter-spacing: .05em; pointer-events: none;
}
.task__puzzle__intro-meta { font-size: .8rem; color: var(--dim); text-align: center; }

/* Прогресс */
.task__puzzle__progress { display: flex; align-items: center; gap: 10px; }
.task__puzzle__progress-bar {
  flex: 1; height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden;
}
.task__puzzle__progress-fill {
  height: 100%; background: var(--accent); border-radius: 3px;
  transition: width .3s ease; box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 50%, transparent);
}
.task__puzzle__progress-txt { font-size: .72rem; color: var(--dim); white-space: nowrap; font-family: var(--font-d); }

/* Игровая доска — CSS grid */
.task__puzzle__board {
  display: grid;
  gap: 2px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bord);
  background: var(--bg2);
  touch-action: manipulation; /* предотвращаем zoom по двойному тапу */
}

/* Один слот */
.task__puzzle__slot {
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 2px;
  transition: transform .12s, box-shadow .12s, outline .12s;
  background-color: color-mix(in srgb, var(--bg2) 60%, transparent);
  background-repeat: no-repeat;
  outline: 2px solid transparent;
  user-select: none;
  -webkit-user-select: none;
}
.task__puzzle__slot:active { transform: scale(.94); }

/* Пустой слот */
.task__puzzle__slot:not([style*="url"]) {
  background-color: rgba(255,255,255,.04);
  border: 1px dashed rgba(255,255,255,.08);
}

/* Выбранный */
.task__puzzle__slot.selected {
  outline: 3px solid var(--accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 50%, transparent);
  transform: scale(1.06);
  z-index: 2;
}

/* Правильно установленный */
.task__puzzle__slot.correct {
  outline: 2px solid #3cffb4;
  cursor: default;
}

/* Подсказка — мигает при попытке поменять правильный кусок */
.task__puzzle__slot.hint {
  animation: puzzle-hint .35s ease 2;
}
@keyframes puzzle-hint {
  0%,100% { outline-color: transparent; }
  50%      { outline: 3px solid #f87171; }
}

/* Подсказка под доской */
.task__puzzle__tip {
  text-align: center; font-size: .78rem; color: var(--dim);
  padding: 4px; min-height: 1.4em;
}

/* Неявная кнопка пропуска — специально тусклая и маленькая */
.task__puzzle__skip {
  display: block; margin: 8px auto 0; background: none; border: none;
  color: var(--dim); font-size: .68rem; cursor: pointer;
  opacity: .4; transition: opacity .3s; padding: 6px 12px;
  text-decoration: underline; text-underline-offset: 3px;
}
.task__puzzle__skip:hover { opacity: .7; }

/* ── Mobile improvements ──────────────────────────────────────── */
@media (max-width: 480px) {
  .task { padding: 14px 12px; gap: 10px; }
  .task__dot { width: 24px; height: 24px; font-size: .65rem; }
  .task__title { font-size: .9rem; }
  .task__desc { font-size: .82rem; }
  .task__action { padding: 13px; font-size: .88rem; min-height: 48px; }
  .task__ok { min-height: 48px; padding: 0 16px; }
  .task__input { padding: 12px; font-size: .88rem; min-height: 48px; }
  .task__textarea { font-size: .88rem; }
  .task__quiz-options { grid-template-columns: 1fr; gap: 8px; }
  .task__quiz-opt { padding: 14px; min-height: 48px; }
  .task__pairs { grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .task__photo-zone { padding: 20px 16px; }
  .task__hint-btn { padding: 10px 12px; }
  .task__puzzle__board { gap: 1px; }
  .task__selfie-condition { padding: 10px 12px; font-size: .88rem; }
  .task__location-card { padding: 12px; }
  .task__media__tg-link { padding: 14px; }
}
</style>