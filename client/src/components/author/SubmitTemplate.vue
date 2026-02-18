<template>
  <div class="submit-template">
    <h3 class="form-title">Добавить новый шаблон</h3>
    <p class="form-description">
      Заполните информацию о вашем шаблоне квеста
    </p>

    <form @submit.prevent="handleSubmit" class="template-form">
      <!-- Основная информация -->
      <div class="form-section">
        <h4 class="section-title">Основная информация</h4>

        <div class="form-group">
          <label for="title" class="form-label">Название шаблона *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            class="form-input"
            placeholder="Например: Детективное приключение в парке"
            required
          />
        </div>

        <div class="form-group">
          <label for="tagline" class="form-label">Краткое описание *</label>
          <input
            id="tagline"
            v-model="formData.tagline"
            type="text"
            class="form-input"
            placeholder="Одна строка, которая привлечет внимание"
            maxlength="200"
            required
          />
          <span class="char-count">{{ formData.tagline.length }}/200</span>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">Полное описание *</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-textarea"
            rows="5"
            placeholder="Подробно опишите ваш квест, его особенности и что делает его уникальным"
            required
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category" class="form-label">Категория *</label>
            <select id="category" v-model="formData.category_id" class="form-select" required>
              <option value="">Выберите категорию</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="difficulty" class="form-label">Сложность *</label>
            <select id="difficulty" v-model="formData.difficulty" class="form-select" required>
              <option value="">Выберите сложность</option>
              <option value="easy">Легко</option>
              <option value="medium">Средне</option>
              <option value="hard">Сложно</option>
              <option value="expert">Эксперт</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="duration" class="form-label">Длительность (мин) *</label>
            <input
              id="duration"
              v-model.number="formData.duration_minutes"
              type="number"
              class="form-input"
              min="30"
              max="600"
              required
            />
          </div>

          <div class="form-group">
            <label for="location_type" class="form-label">Тип локации *</label>
            <select id="location_type" v-model="formData.location_type" class="form-select" required>
              <option value="">Выберите тип</option>
              <option value="city">По городу</option>
              <option value="park">Парк</option>
              <option value="indoor">В помещении</option>
              <option value="universal">Универсальный</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="min_locations" class="form-label">Мин. локаций *</label>
            <input
              id="min_locations"
              v-model.number="formData.min_locations"
              type="number"
              class="form-input"
              min="1"
              max="20"
              required
            />
          </div>

          <div class="form-group">
            <label for="max_locations" class="form-label">Макс. локаций *</label>
            <input
              id="max_locations"
              v-model.number="formData.max_locations"
              type="number"
              class="form-input"
              min="1"
              max="20"
              required
            />
          </div>
        </div>
      </div>

      <!-- Медиа -->
      <div class="form-section">
        <h4 class="section-title">Изображения</h4>

        <div class="form-group">
          <label for="cover_image" class="form-label">Обложка шаблона *</label>
          <input
            id="cover_image"
            type="file"
            accept="image/*"
            class="form-file"
            @change="handleCoverUpload"
            required
          />
          <p class="form-hint">Рекомендуемый размер: 1200x800px</p>
        </div>

        <div v-if="coverPreview" class="image-preview">
          <img :src="coverPreview" alt="Preview" />
        </div>
      </div>

      <!-- Цена -->
      <div class="form-section">
        <h4 class="section-title">Стоимость</h4>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.is_free" />
            <span>Бесплатный шаблон</span>
          </label>
        </div>

        <div v-if="!formData.is_free" class="form-group">
          <label for="price" class="form-label">Цена (₽) *</label>
          <input
            id="price"
            v-model.number="formData.base_price"
            type="number"
            class="form-input"
            min="0"
            step="100"
            placeholder="2990"
          />
        </div>
      </div>

      <!-- Кнопки -->
      <div class="form-actions">
        <button type="button" @click="saveDraft" class="btn-secondary">
          Сохранить как черновик
        </button>
        <button type="submit" class="btn-primary" :disabled="submitting">
          {{ submitting ? 'Отправка...' : 'Отправить на проверку' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['submit', 'saveDraft'])

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

const formData = reactive({
  title: '',
  tagline: '',
  description: '',
  category_id: '',
  difficulty: '',
  duration_minutes: 120,
  location_type: '',
  min_locations: 3,
  max_locations: 6,
  cover_image: null,
  base_price: 2990,
  is_free: false
})

const coverPreview = ref(null)
const submitting = ref(false)

const handleCoverUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.cover_image = file
    const reader = new FileReader()
    reader.onload = (e) => {
      coverPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    emit('submit', formData)
  } finally {
    submitting.value = false
  }
}

const saveDraft = () => {
  emit('saveDraft', formData)
}
</script>

<style scoped>
.submit-template {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  margin: 0 auto;
}

.form-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.form-description {
  color: #718096;
  margin: 0 0 32px 0;
  font-size: 1.05rem;
}

.template-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  padding: 24px;
  background: #f7fafc;
  border-radius: 12px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-file {
  display: block;
  width: 100%;
  padding: 12px;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.form-file:hover {
  border-color: #667eea;
}

.form-hint {
  font-size: 0.85rem;
  color: #718096;
  margin-top: 6px;
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: -24px;
  font-size: 0.85rem;
  color: #718096;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.image-preview {
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  max-width: 400px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 2px solid #e2e8f0;
}

.btn-primary,
.btn-secondary {
  padding: 14px 32px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f7fafc;
}

@media (max-width: 768px) {
  .submit-template {
    padding: 24px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>