<template>
  <div class="author-templates">
    <div class="templates-header">
      <h3 class="section-title">Шаблоны автора</h3>
      
      <!-- Фильтры -->
      <div class="templates-filters">
        <select v-model="filterStatus" class="filter-select">
          <option value="all">Все статусы</option>
          <option value="published">Опубликованные</option>
          <option value="draft">Черновики</option>
          <option value="archived">Архивные</option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="newest">Новые</option>
          <option value="popular">Популярные</option>
          <option value="rating">По рейтингу</option>
        </select>
      </div>
    </div>

    <!-- Список шаблонов -->
    <div v-if="loading" class="templates-loading">
      <div class="spinner"></div>
      <p>Загрузка шаблонов...</p>
    </div>

    <div v-else-if="filteredTemplates.length === 0" class="templates-empty">
      <div class="empty-icon">📝</div>
      <h4>Шаблонов пока нет</h4>
      <p>Создайте свой первый шаблон квеста</p>
      <router-link to="/become-author" class="btn-create">
        Создать шаблон
      </router-link>
    </div>

    <div v-else class="templates-grid">
      <div 
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
      >
        <div class="card-image">
          <img :src="template.cover_image || '/images/placeholder.jpg'" :alt="template.title" />
          <div class="status-badge" :class="`status-${template.status}`">
            {{ getStatusLabel(template.status) }}
          </div>
        </div>

        <div class="card-content">
          <h4 class="card-title">{{ template.title }}</h4>
          <p class="card-tagline">{{ template.tagline }}</p>

          <div class="card-stats">
            <span class="stat">👁️ {{ template.views_count || 0 }}</span>
            <span class="stat">🛒 {{ template.orders_count || 0 }}</span>
            <span class="stat">⭐ {{ template.rating?.toFixed(1) || '0.0' }}</span>
          </div>

          <div class="card-actions">
            <router-link :to="`/template/${template.slug}`" class="btn-view">
              Просмотр
            </router-link>
            <button class="btn-edit">Редактировать</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  templates: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const filterStatus = ref('all')
const sortBy = ref('newest')

const filteredTemplates = computed(() => {
  let filtered = [...props.templates]

  // Фильтрация по статусу
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(t => t.status === filterStatus.value)
  }

  // Сортировка
  switch (sortBy.value) {
    case 'popular':
      filtered.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0))
      break
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  return filtered
})

const getStatusLabel = (status) => {
  const labels = {
    published: 'Опубликован',
    draft: 'Черновик',
    review: 'На проверке',
    archived: 'Архив'
  }
  return labels[status] || status
}
</script>

<style scoped>
.author-templates {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.templates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.templates-filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #4a5568;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.filter-select:hover {
  border-color: #667eea;
}

.templates-loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
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

.templates-empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.templates-empty h4 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 12px;
}

.templates-empty p {
  color: #718096;
  margin-bottom: 24px;
}

.btn-create {
  display: inline-block;
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.3s;
}

.btn-create:hover {
  transform: translateY(-2px);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.template-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.template-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-published {
  background: #48bb78;
  color: white;
}

.status-draft {
  background: #ed8936;
  color: white;
}

.status-review {
  background: #4299e1;
  color: white;
}

.status-archived {
  background: #718096;
  color: white;
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tagline {
  font-size: 0.85rem;
  color: #718096;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-stats {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: #718096;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn-view,
.btn-edit {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn-view {
  background: #f7fafc;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-view:hover {
  background: #667eea;
  color: white;
}

.btn-edit {
  background: #667eea;
  color: white;
  border: 2px solid #667eea;
}

.btn-edit:hover {
  background: #764ba2;
  border-color: #764ba2;
}

@media (max-width: 768px) {
  .templates-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>