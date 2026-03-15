<template>
  <div class="order-form">

    <!-- Прогресс-бар -->
    <div class="form-progress">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="progress-step"
        :class="{
          active: currentStep === index + 1,
          completed: currentStep > index + 1
        }"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-label">{{ step }}</div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="form-container">

      <!-- Шаг 1: Контактная информация -->
      <div v-if="currentStep === 1" class="form-step">
        <h3 class="step-title">Контактная информация</h3>
        <p class="step-description">Как с вами связаться и когда планируете свидание?</p>

        <div class="form-group">
          <label for="client_name" class="form-label">Ваше имя *</label>
          <input
            id="client_name"
            name="client_name"
            v-model="formData.client_name"
            type="text"
            class="form-input"
            placeholder="Иван"
            :required="currentStep === 1"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="client_email" class="form-label">Email *</label>
            <input
              id="client_email"
              name="client_email"
              v-model="formData.client_email"
              type="email"
              class="form-input"
              placeholder="ivan@example.com"
              :required="currentStep === 1"
            />
          </div>
          <div class="form-group">
            <label for="client_phone" class="form-label">Telegram или телефон</label>
            <input
              id="client_phone"
              name="client_phone"
              v-model="formData.client_phone"
              type="tel"
              class="form-input"
              placeholder="+7 999 123-45-67"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="event_date" class="form-label">Дата свидания *</label>
            <input
              id="event_date"
              name="event_date"
              v-model="formData.event_date"
              type="date"
              class="form-input"
              :min="minDate"
              required
            />
          </div>
          <div class="form-group">
            <label for="event_city" class="form-label">Город</label>
            <input
              id="event_city"
              name="event_city"
              v-model="formData.event_city"
              type="text"
              class="form-input"
              placeholder="Москва"
            />
          </div>
        </div>
      </div>

      <!-- Шаг 2: Кастомизация -->
      <div v-if="currentStep === 2" class="form-step">
        <h3 class="step-title">Настройка квеста</h3>
        <p class="step-description">Выберите дополнительные опции под ваш формат</p>

        <CustomizationOptions
          v-if="template"
          :template="template"
          v-model="formData.customization"
          v-model:selected-features="formData.selected_features"
          @update:featuresData="featuresData = $event; emit('update:featuresData', $event)"
        />
      </div>

      <!-- Шаг 3: Вопросы о паре -->
      <div v-if="currentStep === 3" class="form-step">
        <h3 class="step-title">Расскажите о вашей паре</h3>
        <p class="step-description">Эти детали помогут сделать квест по-настоящему вашим</p>

        <div class="qa-hint">
          💡 Чем честнее и подробнее ответы — тем точнее получится квест. Не бойтесь писать простыми словами.
        </div>

        <div class="form-group">
          <label class="form-label">Как зовут вашу вторую половинку и сколько ей/ему лет?</label>
          <input
            v-model="formData.qa_partner_name"
            type="text"
            class="form-input"
            placeholder="Например: Маша, 26 лет"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Как давно вы вместе? Есть ли какая-то особая дата или повод?</label>
          <textarea
            v-model="formData.qa_occasion"
            class="form-textarea"
            rows="3"
            placeholder="Например: вместе 2 года, это годовщина / просто хочу сделать сюрприз без повода"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Чем увлекается ваша вторая половинка? Что любит, что её/его радует?</label>
          <textarea
            v-model="formData.qa_interests"
            class="form-textarea"
            rows="3"
            placeholder="Например: любит кино, обожает кофе, интересуется историей, фанат настолок..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Есть ли места в вашем городе, которые для вас особенные? Где вы любите бывать вместе?</label>
          <textarea
            v-model="formData.qa_places"
            class="form-textarea"
            rows="3"
            placeholder="Например: парк где познакомились, любимое кафе, набережная..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Как она/он обычно реагирует на сюрпризы? Есть ли что-то чего точно не стоит делать?</label>
          <textarea
            v-model="formData.qa_surprises"
            class="form-textarea"
            rows="3"
            placeholder="Например: любит активности / предпочитает спокойный формат / не любит большие компании..."
          ></textarea>
        </div>
      </div>

      <!-- Шаг 4: Пожелания к квесту -->
      <div v-if="currentStep === 4" class="form-step">
        <h3 class="step-title">Пожелания к квесту</h3>
        <p class="step-description">Что хотите получить в итоге? Любые детали, идеи, настроение</p>

        <div class="form-group">
          <label class="form-label">Какое настроение или атмосферу хотите создать?</label>
          <textarea
            v-model="formData.wish_mood"
            class="form-textarea"
            rows="3"
            placeholder="Например: романтично и нежно / весело и с приключениями / камерно и по-домашнему..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Есть ли конкретные идеи, которые хотите включить в квест?</label>
          <textarea
            v-model="formData.wish_ideas"
            class="form-textarea"
            rows="3"
            placeholder="Необязательно — но если есть идея, записки, задание или финальный сюрприз, расскажите"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Что-то ещё важное, о чём стоит знать?</label>
          <textarea
            v-model="formData.wish_other"
            class="form-textarea"
            rows="3"
            placeholder="Любая деталь которая поможет сделать квест именно для вас двоих"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-label" @click="formData.agree_terms = !formData.agree_terms; termsError = false">
            <div class="checkbox-box" :class="{ checked: formData.agree_terms, error: termsError && !formData.agree_terms }">
              <span v-if="formData.agree_terms" class="checkbox-tick">✓</span>
            </div>
            <span>
              Я согласен с
              <a href="/terms" target="_blank" @click.stop>условиями использования</a> и
              <a href="/privacy" target="_blank" @click.stop>политикой конфиденциальности</a>
            </span>
          </label>
          <p v-if="termsError && !formData.agree_terms" class="terms-error">
            Пожалуйста, примите условия использования чтобы продолжить
          </p>
        </div>
      </div>

      <!-- Навигация -->
      <div class="form-navigation">
        <button
          v-if="currentStep > 1"
          type="button"
          @click="previousStep"
          class="btn-nav btn-prev"
        >
          ← Назад
        </button>

        <button
          v-if="currentStep < 4"
          type="button"
          @click="nextStep"
          class="btn-nav btn-next"
        >
          Далее →
        </button>

        <button
          v-if="currentStep === 4"
          type="submit"
          class="btn-submit"
          :disabled="submitting"
        >
          {{ submitting ? 'Отправка...' : 'Отправить заявку' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  template: { type: Object, default: null }
})

const emit = defineEmits(['submit', 'update:features', 'update:customization', 'update:featuresData'])
const toast = useToast()

const currentStep = ref(1)
const submitting  = ref(false)
const submitted   = ref(false)
const featuresData = ref([])
const termsError  = ref(false)

const steps = ['Контакты', 'Настройка', 'О паре', 'Пожелания']

const formData = reactive({
  template_id:        props.template?.id || null,
  client_name:        '',
  client_email:       '',
  client_phone:       '',
  event_date:         '',
  event_city:         '',
  customization:      {},
  selected_features:  [],
  // Шаг 3 — вопросы о паре
  qa_partner_name:    '',
  qa_occasion:        '',
  qa_interests:       '',
  qa_places:          '',
  qa_surprises:       '',
  // Шаг 4 — пожелания
  wish_mood:          '',
  wish_ideas:         '',
  wish_other:         '',
  agree_terms:        false,
  // Собираем в description для бэкенда
  get description() {
    const parts = []
    if (this.qa_partner_name) parts.push(`Партнёр: ${this.qa_partner_name}`)
    if (this.qa_occasion)     parts.push(`Повод: ${this.qa_occasion}`)
    if (this.qa_interests)    parts.push(`Интересы: ${this.qa_interests}`)
    if (this.qa_places)       parts.push(`Места: ${this.qa_places}`)
    if (this.qa_surprises)    parts.push(`Реакция на сюрпризы: ${this.qa_surprises}`)
    if (this.wish_mood)       parts.push(`Настроение: ${this.wish_mood}`)
    if (this.wish_ideas)      parts.push(`Идеи: ${this.wish_ideas}`)
    if (this.wish_other)      parts.push(`Дополнительно: ${this.wish_other}`)
    return parts.length ? parts.join('\n\n') : 'Пожелания не указаны'
  }
})

watch(() => formData.selected_features, (val) => emit('update:features', val), { deep: true })
watch(() => formData.customization,     (val) => emit('update:customization', val), { deep: true })

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const previousStep = () => {
  currentStep.value--
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const validateCurrentStep = () => {
  if (currentStep.value === 1) {
    if (!formData.client_name.trim()) {
      toast.error('Пожалуйста, введите ваше имя')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      toast.error('Пожалуйста, введите корректный email')
      return false
    }
    if (!formData.event_date) {
      toast.error('Пожалуйста, укажите дату свидания')
      return false
    }
  }
  if (currentStep.value === 4) {
    if (!formData.agree_terms) {
      termsError.value = true
      toast.error('Необходимо согласиться с условиями использования')
      return false
    }
    termsError.value = false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateCurrentStep()) return
  if (submitting.value || submitted.value) return
  submitting.value = true
  try {
    await emit('submit', formData)
    submitted.value = true
  } catch (error) {
    console.error('Error submitting order:', error)
    toast.error(error.message || 'Произошла ошибка. Пожалуйста, попробуйте снова.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-form { max-width: 800px; margin: 0 auto; }

.form-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 48px;
  position: relative;
}
.form-progress::before {
  content: '';
  position: absolute;
  top: 20px; left: 20px; right: 20px;
  height: 2px;
  background: #e2e8f0;
  z-index: 0;
}
.progress-step {
  display: flex; flex-direction: column;
  align-items: center; gap: 8px;
  position: relative; z-index: 1;
}
.step-number {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #718096;
  transition: all 0.3s;
}
.progress-step.active .step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea; color: white; transform: scale(1.1);
}
.progress-step.completed .step-number {
  background: #48bb78; border-color: #48bb78; color: white; font-size: 0;
}
.progress-step.completed .step-number::after { content: '✓'; font-size: 1rem; }
.step-label { font-size: 0.85rem; color: #718096; font-weight: 600; }
.progress-step.active .step-label { color: #667eea; }

.form-container {
  background: white; border-radius: 16px; padding: 40px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.form-step { animation: fadeIn 0.3s; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.step-title { font-size: 1.75rem; font-weight: 700; color: #2d3748; margin: 0 0 8px; }
.step-description { color: #718096; margin: 0 0 28px; font-size: 1.05rem; }

.qa-hint {
  background: #f0f4ff;
  border-left: 3px solid #667eea;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 28px;
  line-height: 1.5;
}

.form-group { margin-bottom: 24px; position: relative; }
.form-label { display: block; font-weight: 600; color: #4a5568; margin-bottom: 8px; font-size: 0.95rem; }

.form-input, .form-textarea {
  width: 100%; padding: 12px 16px;
  border: 2px solid #e2e8f0; border-radius: 8px;
  font-size: 1rem; transition: border-color 0.3s; font-family: inherit;
  box-sizing: border-box;
}
.form-input:focus, .form-textarea:focus { outline: none; border-color: #667eea; }
.form-textarea { resize: vertical; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.checkbox-label {
  display: flex; align-items: flex-start; gap: 12px;
  cursor: pointer; font-size: 0.95rem; color: #4a5568;
  line-height: 1.5; user-select: none;
}
.checkbox-box {
  width: 20px; height: 20px; min-width: 20px;
  border: 2px solid #cbd5e0; border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  margin-top: 1px; transition: all 0.2s; background: white;
}
.checkbox-box.checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}
.checkbox-box.error {
  border-color: #e53e3e;
  background: #fff5f5;
  animation: shake 0.3s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.terms-error {
  color: #e53e3e;
  font-size: 0.85rem;
  margin: 6px 0 0 32px;
}
.checkbox-tick { color: white; font-size: 0.75rem; font-weight: 700; line-height: 1; }
.checkbox-label:hover .checkbox-box:not(.checked) { border-color: #667eea; }
.checkbox-label a { color: #667eea; text-decoration: none; }
.checkbox-label a:hover { text-decoration: underline; }

.form-navigation {
  display: flex; gap: 16px; justify-content: space-between;
  margin-top: 32px; padding-top: 32px; border-top: 2px solid #e2e8f0;
}
.btn-nav, .btn-submit {
  padding: 14px 32px; border-radius: 50px;
  font-weight: 600; font-size: 1rem;
  cursor: pointer; transition: all 0.3s; border: none;
  letter-spacing: 0.02em;
}
.btn-prev { background: white; color: #667eea; border: 2px solid #667eea; }
.btn-prev:hover { background: #f7fafc; }
.btn-next { background: #667eea; color: white; margin-left: auto; }
.btn-next:hover { background: #764ba2; transform: translateY(-2px); }
.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; box-shadow: 0 6px 20px rgba(102,126,234,0.4); margin-left: auto;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102,126,234,0.5); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
  .form-container { padding: 24px 20px; }
  .form-row { grid-template-columns: 1fr; }
  .step-label { display: none; }
  .form-navigation { flex-direction: column; }
  .btn-next, .btn-submit { margin-left: 0; }
}
</style>