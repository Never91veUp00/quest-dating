<template>
  <section id="templates" class="templates">
    <div class="container">
      <h2 class="section-title">Готовые шаблоны квестов</h2>
      <p class="section-subtitle">
        Выберите подходящий сценарий или создайте свой уникальный
      </p>

      <div v-if="loading" class="loading">
        <div class="spinner-large"></div>
        <p>Загружаем шаблоны...</p>
      </div>

      <div v-else class="templates-grid">
        <div 
          v-for="template in templates" 
          :key="template.id"
          class="template-card"
          @click="selectTemplate(template)"
        >
          <div class="template-image">
            <div class="template-badge" :class="`badge-${template.difficulty}`">
              {{ difficultyLabel(template.difficulty) }}
            </div>
            <div class="template-icon">{{ template.icon }}</div>
          </div>
          
          <div class="template-content">
            <h3 class="template-title">{{ template.name }}</h3>
            <p class="template-description">{{ template.description }}</p>
            
            <div class="template-meta">
              <span class="meta-item">
                <span class="meta-icon">⏱️</span>
                {{ template.duration_minutes }} мин
              </span>
              <span class="meta-item">
                <span class="meta-icon">📍</span>
                {{ template.locations }} точек
              </span>
            </div>

            <button class="template-btn">
              Выбрать шаблон →
            </button>
          </div>
        </div>

        <!-- Кастомный квест -->
        <div class="template-card template-custom">
          <div class="template-image">
            <div class="template-icon">✨</div>
          </div>
          
          <div class="template-content">
            <h3 class="template-title">Свой сценарий</h3>
            <p class="template-description">
              Создадим уникальный квест специально под вашу историю и пожелания
            </p>
            
            <router-link to="/order" class="template-btn template-btn-custom">
              Создать свой →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuestStore } from '@/store'
import { useRouter } from 'vue-router'

const questStore = useQuestStore()
const router = useRouter()

const loading = ref(false)

// Временные данные (пока нет API)
const templates = ref([
  {
    id: 1,
    name: 'Детектив по городу',
    description: 'Расследуйте романтическую тайну, разгадывая улики в разных частях города',
    difficulty: 'medium',
    duration_minutes: 180,
    locations: 5,
    icon: '🕵️'
  },
  {
    id: 2,
    name: 'Охотник за сокровищами',
    description: 'Найдите спрятанные сокровища, следуя подсказкам на карте',
    difficulty: 'easy',
    duration_minutes: 120,
    locations: 4,
    icon: '🗺️'
  },
  {
    id: 3,
    name: 'Машина времени',
    description: 'Путешествие по местам вашей совместной истории с сюрпризами',
    difficulty: 'medium',
    duration_minutes: 150,
    locations: 6,
    icon: '⏰'
  },
  {
    id: 4,
    name: 'Escape Room',
    description: 'Уличный квест с головоломками и ограниченным временем',
    difficulty: 'hard',
    duration_minutes: 90,
    locations: 3,
    icon: '🔐'
  }
])

const difficultyLabel = (difficulty) => {
  const labels = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  }
  return labels[difficulty] || difficulty
}

const selectTemplate = (template) => {
  router.push({
    path: '/order',
    query: { template: template.id }
  })
}

onMounted(async () => {
  // loading.value = true
  // try {
  //   await questStore.fetchTemplates()
  //   templates.value = questStore.templates
  // } catch (error) {
  //   console.error('Failed to load templates:', error)
  // } finally {
  //   loading.value = false
  // }
})
</script>

<style scoped>
.templates {
  padding: 100px 0;
  background: linear-gradient(180deg, #f7fafc 0%, white 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  color: #2d3748;
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 60px;
}

.loading {
  text-align: center;
  padding: 60px 0;
}

.spinner-large {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.template-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
}

.template-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.template-image {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.template-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: white;
  color: #2d3748;
}

.badge-easy {
  background: #48bb78;
  color: white;
}

.badge-medium {
  background: #ed8936;
  color: white;
}

.badge-hard {
  background: #f56565;
  color: white;
}

.template-icon {
  font-size: 5rem;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

.template-content {
  padding: 28px;
}

.template-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2d3748;
}

.template-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #718096;
  margin-bottom: 20px;
}

.template-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #4a5568;
}

.meta-icon {
  font-size: 1.1rem;
}

.template-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: block;
  text-align: center;
}

.template-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.template-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.template-custom .template-image {
  background: rgba(255, 255, 255, 0.2);
}

.template-custom .template-title,
.template-custom .template-description {
  color: white;
}

.template-btn-custom {
  background: white;
  color: #667eea;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>