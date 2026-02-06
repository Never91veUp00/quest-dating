<template>
  <div class="order-page">
    <section class="order-hero">
      <div class="container">
        <h1 class="page-title">Создайте свой квест</h1>
        <p class="page-subtitle">
          Расскажите о вашей идее, и мы воплотим её в жизнь
        </p>
      </div>
    </section>

    <section class="order-form-section">
      <div class="container">
        <div class="form-layout">
          <!-- Левая колонка: форма -->
          <div class="form-container">
            <form @submit.prevent="handleSubmit" class="order-form">
              <!-- Шаг 1: Базовая информация -->
              <div class="form-step" v-show="currentStep === 1">
                <h2 class="step-title">
                  <span class="step-number">1</span>
                  Основная информация
                </h2>

                <div class="form-group">
                  <label for="name">Ваше имя *</label>
                  <input
                    id="name"
                    v-model="formData.name"
                    type="text"
                    placeholder="Как к вам обращаться?"
                    required
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label for="email">Email *</label>
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label for="phone">Телефон</label>
                  <input
                    id="phone"
                    v-model="formData.phone"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label for="event_date">Планируемая дата свидания</label>
                  <input
                    id="event_date"
                    v-model="formData.event_date"
                    type="date"
                    :min="minDate"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Шаг 2: Выбор шаблона -->
              <div class="form-step" v-show="currentStep === 2">
                <h2 class="step-title">
                  <span class="step-number">2</span>
                  Выберите тип квеста
                </h2>

                <div class="template-options">
                  <label
                    v-for="template in availableTemplates"
                    :key="template.id"
                    class="template-option"
                    :class="{ selected: formData.template_id === template.id }"
                  >
                    <input
                      type="radio"
                      :value="template.id"
                      v-model="formData.template_id"
                      class="template-radio"
                    />
                    <div class="template-option-content">
                      <div class="template-option-icon">{{ template.icon }}</div>
                      <div class="template-option-info">
                        <h4>{{ template.name }}</h4>
                        <p>{{ template.description }}</p>
                        <div class="template-option-meta">
                          <span>⏱️ {{ template.duration }}</span>
                          <span>📍 {{ template.locations }} точек</span>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    class="template-option template-custom-option"
                    :class="{ selected: formData.template_id === 'custom' }"
                  >
                    <input
                      type="radio"
                      value="custom"
                      v-model="formData.template_id"
                      class="template-radio"
                    />
                    <div class="template-option-content">
                      <div class="template-option-icon">✨</div>
                      <div class="template-option-info">
                        <h4>Свой уникальный сценарий</h4>
                        <p>Создадим квест с нуля под вашу историю</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Шаг 3: Описание идеи -->
              <div class="form-step" v-show="currentStep === 3">
                <h2 class="step-title">
                  <span class="step-number">3</span>
                  Расскажите о вашей идее
                </h2>

                <div class="form-group">
                  <label for="description">Опишите ваше свидание *</label>
                  <textarea
                    id="description"
                    v-model="formData.description"
                    rows="8"
                    placeholder="Расскажите о вашей паре, особенных местах, интересах, что хотите включить в квест..."
                    required
                    class="form-textarea"
                  ></textarea>
                  <div class="char-counter">
                    {{ formData.description.length }} / 1000 символов
                  </div>
                </div>

                <div class="form-group">
                  <label>Дополнительные пожелания</label>
                  <div class="checkbox-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="formData.features.puzzles" />
                      <span>Головоломки и загадки</span>
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="formData.features.photos" />
                      <span>Фото-задания</span>
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="formData.features.surprises" />
                      <span>Скрытые сюрпризы</span>
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="formData.features.achievements" />
                      <span>Система достижений</span>
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="formData.features.timer" />
                      <span>Ограничение по времени</span>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label for="budget">Бюджет</label>
                  <select id="budget" v-model="formData.budget" class="form-select">
                    <option value="">Выберите диапазон</option>
                    <option value="simple">До 3000₽ (Simple)</option>
                    <option value="gamer">3000-6000₽ (Gamer)</option>
                    <option value="premium">6000₽+ (Premium)</option>
                  </select>
                </div>
              </div>

              <!-- Навигация между шагами -->
              <div class="form-navigation">
                <button
                  type="button"
                  v-if="currentStep > 1"
                  @click="previousStep"
                  class="btn btn-secondary"
                >
                  ← Назад
                </button>

                <button
                  type="button"
                  v-if="currentStep < 3"
                  @click="nextStep"
                  class="btn btn-primary"
                  :disabled="!canProceedToNextStep"
                >
                  Далее →
                </button>

                <button
                  type="submit"
                  v-if="currentStep === 3"
                  class="btn btn-primary"
                  :disabled="loading || !isFormValid"
                >
                  <span v-if="loading">Отправка...</span>
                  <span v-else>Отправить заявку ✨</span>
                </button>
              </div>
            </form>

            <!-- Индикатор прогресса -->
            <div class="progress-indicator">
              <div
                v-for="step in 3"
                :key="step"
                class="progress-dot"
                :class="{
                  active: step === currentStep,
                  completed: step < currentStep
                }"
              ></div>
            </div>
          </div>

          <!-- Правая колонка: информация -->
          <div class="order-sidebar">
            <div class="sidebar-card">
              <h3>💡 Как это работает</h3>
              <ol class="sidebar-steps">
                <li>Заполните форму с вашей идеей</li>
                <li>Мы свяжемся в течение 2 часов</li>
                <li>Обсудим детали и подберём формат</li>
                <li>Создадим квест за 24 часа</li>
                <li>Получите ссылку и наслаждайтесь!</li>
              </ol>
            </div>

            <div class="sidebar-card sidebar-testimonial">
              <div class="testimonial-icon">💝</div>
              <p class="testimonial-text">
                "Лучшее свидание в моей жизни! Каждая деталь была продумана"
              </p>
              <p class="testimonial-author">— Анна, Москва</p>
            </div>

            <div class="sidebar-card sidebar-guarantee">
              <h3>✓ Наши гарантии</h3>
              <ul>
                <li>Готовность за 24 часа</li>
                <li>Полный возврат, если не понравится</li>
                <li>Бесплатные правки</li>
                <li>Поддержка 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Модальное окно успешной отправки -->
    <transition name="modal">
      <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
        <div class="modal-content" @click.stop>
          <div class="success-icon">🎉</div>
          <h2>Заявка отправлена!</h2>
          <p>
            Спасибо, {{ formData.name }}! Мы получили вашу заявку и свяжемся 
            с вами в течение 2 часов на {{ formData.email }}.
          </p>
          <p class="modal-note">
            Проверьте папку "Спам", если письмо не пришло в основную папку.
          </p>
          <button @click="closeSuccessModal" class="btn btn-primary">
            Отлично!
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestStore } from '@/store'

const route = useRoute()
const questStore = useQuestStore()

const currentStep = ref(1)
const loading = ref(false)
const showSuccessModal = ref(false)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  event_date: '',
  template_id: null,
  description: '',
  budget: '',
  features: {
    puzzles: true,
    photos: false,
    surprises: true,
    achievements: false,
    timer: false
  }
})

const availableTemplates = ref([
  {
    id: 1,
    name: 'Детектив по городу',
    description: 'Расследуйте романтическую тайну по городу',
    icon: '🕵️',
    duration: '3 часа',
    locations: 5
  },
  {
    id: 2,
    name: 'Охотник за сокровищами',
    description: 'Найдите сокровища по подсказкам',
    icon: '🗺️',
    duration: '2 часа',
    locations: 4
  },
  {
    id: 3,
    name: 'Машина времени',
    description: 'Путешествие по вашей истории',
    icon: '⏰',
    duration: '2.5 часа',
    locations: 6
  },
  {
    id: 4,
    name: 'Escape Room',
    description: 'Квест с ограниченным временем',
    icon: '🔐',
    duration: '1.5 часа',
    locations: 3
  }
])

const minDate = computed(() => {
  const today = new Date()
  today.setDate(today.getDate() + 2) // Минимум через 2 дня
  return today.toISOString().split('T')[0]
})

const canProceedToNextStep = computed(() => {
  if (currentStep.value === 1) {
    return formData.value.name && formData.value.email
  }
  if (currentStep.value === 2) {
    return formData.value.template_id !== null
  }
  return true
})

const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.email &&
    formData.value.template_id &&
    formData.value.description.length >= 50
  )
})

const nextStep = () => {
  if (canProceedToNextStep.value && currentStep.value < 3) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true

  try {
    // Подготовка данных для отправки
    const orderData = {
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      description: formData.value.description,
      template_id: formData.value.template_id === 'custom' ? null : formData.value.template_id,
      event_date: formData.value.event_date || null,
      budget: formData.value.budget,
      features: formData.value.features
    }

    await questStore.createOrder(orderData)
    
    showSuccessModal.value = true
    resetForm()
  } catch (error) {
    console.error('Order submission failed:', error)
    alert('Произошла ошибка при отправке заявки. Попробуйте ещё раз.')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    event_date: '',
    template_id: null,
    description: '',
    budget: '',
    features: {
      puzzles: true,
      photos: false,
      surprises: true,
      achievements: false,
      timer: false
    }
  }
  currentStep.value = 1
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

onMounted(() => {
  // Предзаполнение из query params
  if (route.query.template) {
    formData.value.template_id = parseInt(route.query.template)
    currentStep.value = 2
  }
  if (route.query.plan) {
    formData.value.budget = route.query.plan
  }
})
</script>

<style scoped>
.order-page {
  padding-top: 80px;
  background: #f7fafc;
  min-height: 100vh;
}

.order-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.page-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
}

.order-form-section {
  padding: 60px 0 100px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.form-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  align-items: start;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.step-title {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 32px;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
}

.char-counter {
  text-align: right;
  font-size: 0.85rem;
  color: #718096;
  margin-top: 4px;
}

.template-options {
  display: grid;
  gap: 16px;
}

.template-option {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: block;
}

.template-option:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.02);
}

.template-option.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.template-radio {
  display: none;
}

.template-option-content {
  display: flex;
  gap: 20px;
  align-items: center;
}

.template-option-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.template-option-info h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 6px;
}

.template-option-info p {
  color: #718096;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.template-option-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #4a5568;
}

.template-custom-option {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #667eea;
}

.checkbox-group {
  display: grid;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #4a5568;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.form-navigation {
  display: flex;
  gap: 16px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 2px solid #e2e8f0;
}

.form-navigation .btn {
  flex: 1;
  padding: 16px;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.progress-indicator {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s;
}

.progress-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 32px;
  border-radius: 6px;
}

.progress-dot.completed {
  background: #48bb78;
}

.order-sidebar {
  position: sticky;
  top: 100px;
  display: grid;
  gap: 20px;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.sidebar-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
}

.sidebar-steps {
  padding-left: 20px;
  margin: 0;
}

.sidebar-steps li {
  color: #4a5568;
  line-height: 1.8;
  margin-bottom: 8px;
}

.sidebar-testimonial {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.testimonial-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.testimonial-text {
  font-style: italic;
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 12px;
}

.testimonial-author {
  font-size: 0.9rem;
  opacity: 0.9;
}

.sidebar-guarantee ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-guarantee li {
  color: #4a5568;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-guarantee li:last-child {
  border-bottom: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 48px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.success-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.modal-content h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 16px;
}

.modal-content p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 12px;
}

.modal-note {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 24px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@media (max-width: 1024px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .order-sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .form-container {
    padding: 32px 24px;
  }

  .page-title {
    font-size: 2rem;
  }

  .step-title {
    font-size: 1.5rem;
  }

  .template-option-content {
    flex-direction: column;
    text-align: center;
  }

  .form-navigation {
    flex-direction: column;
  }
}
</style>