<template>
  <div class="of">

    <!-- Прогресс -->
    <div class="of__progress">
      <div
        v-for="(step, i) in STEPS"
        :key="i"
        class="of__step"
        :class="{
          'of__step--active': currentStep === i + 1,
          'of__step--done': currentStep > i + 1
        }"
      >
        <div class="of__step-dot">
          <span v-if="currentStep > i + 1">✓</span>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span class="of__step-label">{{ step }}</span>
      </div>
      <div class="of__progress-line" :style="{ width: progressWidth }"></div>
    </div>

    <form class="of__form">

      <!-- ── Шаг 1: Контакты ── -->
      <transition name="step-fade" mode="out-in">
      <div v-if="currentStep === 1" key="1" class="of__step-body">
        <h2 class="of__step-title">Как с вами связаться?</h2>
        <p class="of__step-sub">Лиза напишет вам для уточнения деталей</p>

        <div class="of__field">
          <label class="of__label">Ваше имя *</label>
          <input v-model="form.client_name" type="text"
            class="of__input" :class="{ 'of__input--error': err.client_name }"
            placeholder="Иван" autocomplete="given-name"
            @input="clearErr('client_name')" />
        </div>
        <div class="of__field">
          <label class="of__label">Email *</label>
          <input v-model="form.client_email" type="email"
            class="of__input" :class="{ 'of__input--error': err.client_email }"
            placeholder="ivan@example.com" autocomplete="email"
            @input="clearErr('client_email')" />
          <p class="of__hint">Пришлём ссылку на готовый квест</p>
        </div>
        <div class="of__field">
          <label class="of__label">Telegram или телефон</label>
          <input v-model="form.client_phone" type="text" class="of__input" placeholder="@username или +7 999 ..." autocomplete="tel" />
          <p class="of__hint">Для быстрой связи по деталям</p>
        </div>
        <div class="of__field">
          <label class="of__label">Когда планируете квест?</label>
          <input v-model="form.event_date" type="date"
            class="of__input" :class="{ 'of__input--error': err.event_date }"
            :min="minDate"
            @change="clearErr('event_date')" />
          <p class="of__hint">Можно уточнить позже — Лиза уточнит при переписке</p>
        </div>
        <div v-if="isCity" class="of__field">
          <label class="of__label">Город *</label>
          <input v-model="form.event_city" type="text"
            class="of__input" :class="{ 'of__input--error': err.event_city }"
            placeholder="Москва"
            @input="clearErr('event_city')" />
          <p class="of__hint">Лиза подберёт маршрут в вашем городе</p>
        </div>
      </div>
      </transition>

      <!-- ── Шаг 2: О паре ── -->
      <transition name="step-fade" mode="out-in">
      <div v-if="currentStep === 2" key="2" class="of__step-body">
        <h2 class="of__step-title">Расскажите о вашей паре</h2>
        <p class="of__step-sub">Это поможет сделать квест личным</p>

        <div class="of__field">
          <label class="of__label">Имя партнёра *</label>
          <input v-model="form.partner_name" type="text"
            class="of__input" :class="{ 'of__input--error': err.partner_name }"
            placeholder="Как зовут вашего партнёра?"
            @input="clearErr('partner_name')" />
        </div>
        <div class="of__field">
          <label class="of__label">Как долго вы вместе?</label>
          <div class="of__pills">
            <button
              v-for="opt in TOGETHER_OPTIONS"
              :key="opt"
              type="button"
              class="of__pill"
              :class="{ 'of__pill--active': form.together === opt }"
              @click="form.together = opt"
            >{{ opt }}</button>
          </div>
        </div>
        <div class="of__field">
          <label class="of__label">Повод для квеста *</label>
          <div class="of__pills" :class="{ 'of__pills--error': err.occasion }">
            <button
              v-for="opt in OCCASION_OPTIONS"
              :key="opt"
              type="button"
              class="of__pill"
              :class="{ 'of__pill--active': form.occasion === opt }"
              @click="form.occasion = opt; clearErr('occasion')"
            >{{ opt }}</button>
          </div>
        </div>
        <div class="of__field">
          <label class="of__label">Чем увлекается партнёр?</label>
          <div class="of__pills of__pills--wrap">
            <button
              v-for="opt in HOBBY_OPTIONS"
              :key="opt"
              type="button"
              class="of__pill"
              :class="{ 'of__pill--active': form.hobbies.includes(opt) }"
              @click="toggleHobby(opt)"
            >{{ opt }}</button>
          </div>
        </div>
        <div class="of__field">
          <label class="of__label">Настроение квеста</label>
          <div class="of__pills">
            <button
              v-for="opt in MOOD_OPTIONS"
              :key="opt.value"
              type="button"
              class="of__pill"
              :class="{ 'of__pill--active': form.mood === opt.value }"
              @click="form.mood = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>
      </div>
      </transition>

      <!-- ── Шаг 3: Детали под категорию ── -->
      <transition name="step-fade" mode="out-in">
      <div v-if="currentStep === 3" key="3" class="of__step-body">
        <h2 class="of__step-title">{{ categoryQuestions.title }}</h2>
        <p class="of__step-sub">{{ categoryQuestions.subtitle }}</p>

        <div
          v-for="q in categoryQuestions.questions"
          :key="q.field"
          class="of__field"
        >
          <label class="of__label">{{ q.label }}</label>

          <!-- Textarea -->
          <textarea
            v-if="q.type === 'textarea'"
            v-model="form.details[q.field]"
            class="of__textarea" :class="{ 'of__input--error': err['d_' + q.field] }"
            :placeholder="q.placeholder"
            rows="3"
            @input="clearErr('d_' + q.field)"
          ></textarea>

          <!-- Pills одиночный выбор -->
          <div v-else-if="q.type === 'pills'"
            class="of__pills of__pills--wrap"
            :class="{ 'of__pills--error': err['d_' + q.field] }">
            <button
              v-for="opt in q.options"
              :key="opt"
              type="button"
              class="of__pill"
              :class="{ 'of__pill--active': form.details[q.field] === opt }"
              @click="form.details[q.field] = opt; clearErr('d_' + q.field)"
            >{{ opt }}</button>
          </div>

          <!-- Обычный input -->
          <input
            v-else
            v-model="form.details[q.field]"
            type="text"
            class="of__input" :class="{ 'of__input--error': err['d_' + q.field] }"
            :placeholder="q.placeholder"
            @input="clearErr('d_' + q.field)"
          />

          <p v-if="q.hint" class="of__hint">{{ q.hint }}</p>
        </div>

        <!-- Дополнительные пожелания -->
        <div class="of__field">
          <label class="of__label">Что ещё важно учесть?</label>
          <textarea
            v-model="form.extra"
            class="of__textarea"
            placeholder="Любые пожелания, ограничения, особые детали..."
            rows="3"
          ></textarea>
        </div>

        <!-- Согласие -->
        <div class="of__field">
          <label class="of__agree" :class="{ 'of__agree--error': err.agree }" @click="form.agree = !form.agree; clearErr('agree')">
            <div class="of__checkbox" :class="{ 'of__checkbox--checked': form.agree, 'of__checkbox--error': err.agree }">
              <span v-if="form.agree">✓</span>
            </div>
            <span>
              Согласен с
              <a href="/terms" target="_blank" @click.stop>условиями</a> и
              <a href="/privacy" target="_blank" @click.stop>политикой конфиденциальности</a>
            </span>
          </label>
        </div>
      </div>
      </transition>

      <!-- Навигация -->
      <div class="of__nav">
        <button
          v-if="currentStep > 1"
          type="button"
          class="of__btn of__btn--back"
          @click="prevStep"
        >← Назад</button>

        <button
          v-if="currentStep < 3"
          type="button"
          class="of__btn of__btn--next"
          :class="{ 'of__btn--shake': shaking }"
          @click="nextStep"
        >Далее →</button>

        <button
          v-if="currentStep === 3"
          type="button"
          class="of__btn of__btn--submit"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? 'Отправка...' : 'Отправить заявку ✓' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'

const props = defineProps({
  template: { type: Object, default: null }
})
const emit = defineEmits(['submit', 'update:features', 'update:customization', 'update:featuresData'])

const currentStep = ref(1)
const submitting  = ref(false)
const shaking     = ref(false)

// Ошибки — объект с именами полей
const err = reactive({})
const setErr = (field) => { err[field] = true }
const clearErr = (field) => { delete err[field] }
const hasErrors = () => Object.keys(err).length > 0

const STEPS = ['Контакты', 'О паре', 'Детали']

const isCity   = computed(() => props.template?.location_type === 'city')
const catSlug  = computed(() => props.template?.category_slug || '')
const locType  = computed(() => props.template?.location_type || 'indoor')

const form = reactive({
  client_name:  '',
  client_email: '',
  client_phone: '',
  event_date:   '',
  event_city:   '',
  partner_name: '',
  together:     '',
  occasion:     '',
  hobbies:      [],
  mood:         '',
  details:      {},
  extra:        '',
  agree:        false,
})

const TOGETHER_OPTIONS = ['Меньше года', '1–2 года', '2–5 лет', 'Больше 5 лет']
const OCCASION_OPTIONS = ['День рождения', 'Годовщина', 'Просто так', 'Предложение', '14 февраля', '8 марта']
const HOBBY_OPTIONS    = ['Кино', 'Музыка', 'Спорт', 'Путешествия', 'Еда', 'Игры', 'Книги', 'Природа', 'Искусство', 'Технологии']
const MOOD_OPTIONS     = [
  { value: 'romantic', label: '🌹 Романтично' },
  { value: 'fun',      label: '😄 Весело' },
  { value: 'mystery',  label: '🔮 Загадочно' },
  { value: 'touching', label: '💌 Трогательно' },
]

// Вопросы зависят от типа квеста
const categoryQuestions = computed(() => {
  const loc = locType.value
  const cat = catSlug.value

  if (cat === 'proposal' || props.template?.slug?.includes('proposal')) {
    return {
      title: 'Детали предложения',
      subtitle: 'Этот момент должен быть идеальным',
      questions: [
        { field: 'proposal_place', type: 'textarea', label: 'Где планируете сделать предложение? *', placeholder: 'Опишите место — дома в гостиной, любимое кафе, парк...' },
        { field: 'story', type: 'textarea', label: 'Как вы познакомились? *', placeholder: 'Несколько предложений о вашей истории — квест будет строиться на ней' },
        { field: 'ring', type: 'pills', label: 'Кольцо уже есть?', options: ['Да, куплено', 'Ещё нет', 'Планирую купить'] },
        { field: 'partner_character', type: 'textarea', label: 'Какой характер у партнёра?', placeholder: 'Романтик или прагматик? Любит сюрпризы или предпочитает спокойствие?' },
        { field: 'memorable_moment', type: 'textarea', label: 'Самый важный момент в ваших отношениях', placeholder: 'Что стало поворотным моментом? Куда ездили? Что пережили вместе?' },
      ]
    }
  }

  if (loc === 'city') {
    return {
      title: 'Детали городского квеста',
      subtitle: 'Маршрут будет построен специально для вас',
      questions: [
        { field: 'city_area', type: 'textarea', label: 'Любимые места в городе *', placeholder: 'Парки, кафе, улицы, районы — где вы бывали или хотите побывать вместе' },
        { field: 'transport', type: 'pills', label: 'Как будете передвигаться?', options: ['Пешком', 'На авто', 'Метро/транспорт', 'Всё вместе'] },
        { field: 'duration_pref', type: 'pills', label: 'Желаемая длительность прогулки', options: ['1–2 часа', '2–3 часа', '3–4 часа', 'Полдня'] },
        { field: 'story', type: 'textarea', label: 'Значимые места для вашей пары', placeholder: 'Место первого свидания, любимое кафе, памятное место — включим в маршрут' },
        { field: 'final_spot', type: 'textarea', label: 'Где хотите завершить квест?', placeholder: 'Ресторан, смотровая, дома — финальная точка маршрута' },
      ]
    }
  }

  if (loc === 'indoor') {
    return {
      title: 'Детали домашнего квеста',
      subtitle: 'Квест будет проходить дома — сделаем его уютным и личным',
      questions: [
        { field: 'story', type: 'textarea', label: 'Ваша история знакомства *', placeholder: 'Где познакомились, первое свидание, важные моменты — используем в заданиях' },
        { field: 'inside_jokes', type: 'textarea', label: 'Что-то особенное только для вас двоих', placeholder: 'Шутки, прозвища, любимые фильмы/песни, традиции — сделает квест живым' },
        { field: 'difficulty_pref', type: 'pills', label: 'Партнёр хорошо решает загадки?', options: ['Да, любит сложные', 'Средне', 'Лучше попроще', 'Не знаю'] },
        { field: 'surprise', type: 'textarea', label: 'Финальный сюрприз — что планируете?', placeholder: 'Подарок, ужин, поход в кино — квест должен привести к нему' },
        { field: 'avoid', type: 'textarea', label: 'Что точно не подходит?', placeholder: 'Темы, шутки или форматы которых лучше избежать' },
      ]
    }
  }

  if (cat?.includes('anniversary') || form.occasion === 'Годовщина') {
    return {
      title: 'Детали квеста на годовщину',
      subtitle: 'Путешествие по вашей общей истории',
      questions: [
        { field: 'how_met', type: 'textarea', label: 'Как вы познакомились? *', placeholder: 'Расскажите историю знакомства — квест будет строиться на ней' },
        { field: 'milestones', type: 'textarea', label: 'Важные моменты за эти годы', placeholder: 'Первая поездка, совместное жильё, преодолённые трудности...' },
        { field: 'years', type: 'input', label: 'Сколько лет вместе?', placeholder: 'Например: 3 года' },
        { field: 'partner_character', type: 'textarea', label: 'Что партнёр больше всего ценит в ваших отношениях?', placeholder: 'Стабильность, приключения, нежность, юмор...' },
        { field: 'surprise', type: 'textarea', label: 'Как хотите завершить вечер?', placeholder: 'Ужин, подарок, поездка — финал квеста должен к этому вести' },
      ]
    }
  }

  return {
    title: 'Детали квеста',
    subtitle: 'Чем больше расскажете — тем личнее получится',
    questions: [
      { field: 'story', type: 'textarea', label: 'История вашей пары *', placeholder: 'Как познакомились, важные моменты, что объединяет — основа для сценария' },
      { field: 'partner_character', type: 'textarea', label: 'Расскажите о партнёре', placeholder: 'Характер, увлечения, чувство юмора, что любит и не любит' },
      { field: 'surprise', type: 'textarea', label: 'Что будет в финале квеста?', placeholder: 'Подарок, ужин, предложение, просто особый вечер' },
      { field: 'avoid', type: 'textarea', label: 'Что стоит избежать?', placeholder: 'Темы, форматы или детали которые не подходят' },
    ]
  }
})

const progressWidth = computed(() => `${((currentStep.value - 1) / (STEPS.length - 1)) * 100}%`)

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const toggleHobby = (h) => {
  const i = form.hobbies.indexOf(h)
  if (i > -1) form.hobbies.splice(i, 1)
  else form.hobbies.push(h)
}

// Подсветить невалидные поля и скроллнуть к первому
const triggerShake = () => {
  shaking.value = true
  setTimeout(() => { shaking.value = false }, 500)
}

const scrollToFirstError = async () => {
  await nextTick()
  const el = document.querySelector('.of__input--error, .of__pills--error, .of__checkbox--error')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const validate = () => {
  // Сброс старых ошибок текущего шага
  Object.keys(err).forEach(k => delete err[k])

  let valid = true

  if (currentStep.value === 1) {
    if (!form.client_name.trim())   { setErr('client_name'); valid = false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client_email)) { setErr('client_email'); valid = false }
    if (isCity.value && !form.event_city.trim()) { setErr('event_city'); valid = false }
  }

  if (currentStep.value === 2) {
    if (!form.partner_name.trim())  { setErr('partner_name'); valid = false }
    if (!form.occasion)             { setErr('occasion'); valid = false }
  }

  if (currentStep.value === 3) {
    const firstRequired = categoryQuestions.value.questions.find(q => q.label.includes('*'))
    if (firstRequired && !form.details[firstRequired.field]?.trim()) {
      setErr('d_' + firstRequired.field); valid = false
    }
    if (!form.agree) { setErr('agree'); valid = false }
  }

  return valid
}

const nextStep = async () => {
  if (validate()) {
    currentStep.value++
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    triggerShake()
    scrollToFirstError()
  }
}

const prevStep = () => {
  currentStep.value--
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const buildDescription = () => {
  const parts = []
  if (form.partner_name)  parts.push(`Партнёр: ${form.partner_name}`)
  if (form.together)      parts.push(`Вместе: ${form.together}`)
  if (form.occasion)      parts.push(`Повод: ${form.occasion}`)
  if (form.hobbies.length) parts.push(`Увлечения: ${form.hobbies.join(', ')}`)
  if (form.mood)          parts.push(`Настроение: ${form.mood}`)

  const cq = categoryQuestions.value
  cq.questions.forEach(q => {
    const val = form.details[q.field]
    if (val?.trim()) parts.push(`${q.label.replace(' *', '')}: ${val}`)
  })

  if (form.extra?.trim()) parts.push(`Дополнительно: ${form.extra}`)
  return parts.join('\n\n')
}

const handleSubmit = async () => {
  if (!validate()) { triggerShake(); scrollToFirstError(); return }
  if (submitting.value) return
  submitting.value = true
  try {
    if (typeof window !== 'undefined' && window.ym) ym(108293057, 'reachGoal', 'order_form_submit')
    await emit('submit', {
      template_id:  props.template?.id,
      client_name:  form.client_name,
      client_email: form.client_email,
      client_phone: form.client_phone,
      event_date:   form.event_date,
      event_city:   form.event_city,
      description:  buildDescription(),
      customization: {},
      selected_features: [],
    })
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.of { color: #f0ede8; }

/* Прогресс */
.of__progress {
  display: flex; align-items: center; justify-content: space-between;
  position: relative; margin-bottom: 28px; padding: 0 8px;
}
.of__progress-line {
  position: absolute; top: 14px; left: 8px;
  height: 2px; background: #d4af37;
  transition: width 0.4s ease; z-index: 0;
}
.of__step {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  position: relative; z-index: 1;
}
.of__step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: rgba(240,237,232,0.4);
  transition: all 0.3s;
}
.of__step--active .of__step-dot {
  background: #d4af37; border-color: #d4af37; color: #0a0a0f;
  transform: scale(1.1);
}
.of__step--done .of__step-dot {
  background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #4ade80;
}
.of__step-label { font-size: 0.7rem; color: rgba(240,237,232,0.35); font-weight: 600; }
.of__step--active .of__step-label { color: #d4af37; }

/* Form */
.of__form {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px; padding: 24px 20px;
}

.of__step-body { animation: step-in 0.25s ease; }
@keyframes step-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.of__step-title { font-size: 1.2rem; font-weight: 900; color: #f0ede8; margin: 0 0 4px; letter-spacing: -0.01em; }
.of__step-sub { font-size: 0.85rem; color: rgba(240,237,232,0.45); margin: 0 0 24px; }

/* Fields */
.of__field { margin-bottom: 20px; }
.of__label { display: block; font-size: 0.85rem; font-weight: 700; color: rgba(240,237,232,0.75); margin-bottom: 8px; }

.of__input, .of__textarea {
  width: 100%; padding: 12px 14px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; font-size: 0.95rem; color: #f0ede8;
  transition: border-color 0.25s, box-shadow 0.25s; font-family: inherit;
  box-sizing: border-box;
}
.of__input::placeholder, .of__textarea::placeholder { color: rgba(240,237,232,0.25); }
.of__input:focus, .of__textarea:focus { outline: none; border-color: #d4af37; }
.of__textarea { resize: vertical; min-height: 80px; }
.of__hint { font-size: 0.75rem; color: rgba(240,237,232,0.3); margin: 5px 0 0; }

/* ── Error state — мягкое розовое свечение ── */
.of__input--error {
  border-color: rgba(251, 113, 133, 0.55) !important;
  box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.08), inset 0 0 0 1px rgba(251, 113, 133, 0.1);
  animation: field-pulse 0.4s ease;
}
.of__pills--error {
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(251, 113, 133, 0.45);
  box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.07);
  animation: field-pulse 0.4s ease;
}
@keyframes field-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(251,113,133,0.25); }
  40%  { box-shadow: 0 0 0 6px rgba(251,113,133,0.1); }
  100% { box-shadow: 0 0 0 3px rgba(251,113,133,0.07); }
}

/* Pills */
.of__pills { display: flex; gap: 8px; flex-wrap: wrap; }
.of__pill {
  padding: 7px 14px; border-radius: 100px; font-size: 0.82rem; font-weight: 600;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(240,237,232,0.6); cursor: pointer; transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.of__pill:hover { border-color: rgba(255,255,255,0.2); color: #f0ede8; }
.of__pill--active {
  background: rgba(212,175,55,0.15); border-color: rgba(212,175,55,0.5); color: #d4af37;
}

/* Agree */
.of__agree {
  display: flex; align-items: flex-start; gap: 10px;
  cursor: pointer; font-size: 0.82rem; color: rgba(240,237,232,0.55); line-height: 1.5;
  user-select: none;
}
.of__checkbox {
  width: 20px; height: 20px; min-width: 20px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; color: #4ade80; transition: all 0.2s; margin-top: 1px;
}
.of__checkbox--checked { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); }
.of__checkbox--error {
  border-color: rgba(251,113,133,0.6) !important;
  box-shadow: 0 0 0 3px rgba(251,113,133,0.1);
  animation: field-pulse 0.4s ease;
}
.of__agree--error { color: rgba(240,237,232,0.8); }
.of__agree a { color: #d4af37; text-decoration: none; }

/* Navigation */
.of__nav {
  display: flex; gap: 10px; justify-content: space-between;
  margin-top: 24px; padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.of__btn {
  padding: 13px 24px; border-radius: 100px; font-size: 0.9rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s; border: none;
  -webkit-tap-highlight-color: transparent;
}
.of__btn--back {
  background: transparent; border: 1px solid rgba(255,255,255,0.12);
  color: rgba(240,237,232,0.5);
}
.of__btn--back:hover { color: #f0ede8; border-color: rgba(255,255,255,0.25); }
.of__btn--next {
  background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4);
  color: #d4af37; margin-left: auto;
}
.of__btn--next:hover { background: rgba(212,175,55,0.25); }
.of__btn--submit {
  background: #d4af37; color: #0a0a0f; margin-left: auto;
  box-shadow: 0 4px 20px rgba(212,175,55,0.3);
}
.of__btn--submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.of__btn--submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Shake кнопки при невалидной форме */
.of__btn--shake { animation: btn-shake 0.4s ease; }
@keyframes btn-shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-5px); }
  40%     { transform: translateX(5px); }
  60%     { transform: translateX(-3px); }
  80%     { transform: translateX(3px); }
}

/* Transition */
.step-fade-enter-active, .step-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.step-fade-enter-from { opacity: 0; transform: translateX(20px); }
.step-fade-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
