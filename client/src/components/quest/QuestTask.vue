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
          <HintBlock :task="task" :theme="theme" @hint="$emit('hint', task)" />
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
          <HintBlock :task="task" :theme="theme" @hint="$emit('hint', task)" />
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
              placeholder="_ _ _ _"
              autocomplete="off" spellcheck="false"
              maxlength="20"
              @keyup.enter="submitAnswer"
            />
            <button class="task__ok" @click="submitAnswer" :disabled="!answerInput.trim()">→</button>
          </div>
          <div v-if="isWrong" class="task__wrong">Неверный код, попробуй ещё</div>
          <HintBlock :task="task" :theme="theme" @hint="$emit('hint', task)" />
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

        <!-- ════ MEDIA — видео/аудио послание ════ -->
        <template v-else-if="task.type === 'media'">
          <div class="task__media">

            <!-- YouTube embed -->
            <template v-if="isYoutube">
              <div class="task__media__wrap">
                <iframe
                  :src="youtubeEmbed"
                  frameborder="0"
                  allow="autoplay; encrypted-media"
                  allowfullscreen
                  class="task__media__iframe"
                ></iframe>
              </div>
            </template>

            <!-- Нативное видео -->
            <template v-else-if="task.media_type === 'video'">
              <video
                :src="task.media_url"
                controls
                playsinline
                class="task__media__video"
              ></video>
            </template>

            <!-- Аудио -->
            <template v-else-if="task.media_type === 'audio'">
              <div class="task__media__audio-wrap">
                <div class="task__media__audio-icon">🎵</div>
                <audio :src="task.media_url" controls class="task__media__audio"></audio>
              </div>
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
                  <div class="task__pairs__card__front">{{ card.value }}</div>
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

        </template>

      </template><!-- end isActive -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// ── Компонент подсказки ──────────────────────────────────────────
const HintBlock = {
  props: ['task', 'theme'],
  emits: ['hint'],
  setup(props, { emit }) {
    const shown = ref(false)
    return { shown, show: () => { shown.value = true; emit('hint', props.task) } }
  },
  template: `
    <template v-if="task.hint">
      <button v-if="!shown" class="task__hint-btn" @click="show">{{ theme.copy.hintBtn }}</button>
      <div v-else class="task__hint">💡 {{ task.hint }}</div>
    </template>
  `
}

// ── Props / Emits ────────────────────────────────────────────────
const props = defineProps({
  task:     { type: Object, required: true },
  theme:    { type: Object, required: true },
  index:    { type: Number, default: 0 },
  isDone:   { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
})
const emit = defineEmits(['complete', 'hint', 'answer-change'])

// ── State ────────────────────────────────────────────────────────
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
    // Дублируем пары и перемешиваем
    const pairs = (props.task.game_pairs || []).flatMap((p, i) => [
      { id: i, value: p.a, pairId: i },
      { id: i + 100, value: p.b, pairId: i }
    ])
    pairsCards.value = pairs.sort(() => Math.random() - 0.5)
  }
})

let pairsTimer = null
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

const youtubeEmbed = computed(() => {
  const url = props.task.media_url || ''
  const id = url.match(/(?:v=|youtu\.be\/)([^&?\s]+)/)?.[1]
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : ''
})
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
</style>