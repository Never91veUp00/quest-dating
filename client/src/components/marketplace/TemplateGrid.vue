<template>
  <div class="template-grid-wrapper">
    <!-- Loader -->
    <div v-if="loading" class="grid-loading">
      <div class="spinner"></div>
      <p>Загружаем шаблоны...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!templates || templates.length === 0" class="grid-empty">
      <div class="empty-icon">🔍</div>
      <h3>Шаблоны не найдены</h3>
      <p>Попробуйте изменить фильтры поиска</p>
      <button @click="$emit('resetFilters')" class="btn-reset">
        Сбросить фильтры
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="template-grid">
      <TemplateCard
        v-for="template in templates"
        :key="template.id"
        :template="template"
        @quickView="handleQuickView"
      />
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="pagination && pagination.pages > 1"
      :current-page="pagination.page"
      :total-pages="pagination.pages"
      @page-change="handlePageChange"
    />

    <!-- Quick View Modal -->
    <QuickViewModal
      v-if="showQuickView"
      :template="selectedTemplate"
      @close="showQuickView = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TemplateCard from './TemplateCard.vue'
import Pagination from '../common/Pagination.vue'
import QuickViewModal from './QuickViewModal.vue'

defineProps({
  templates: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['pageChange', 'resetFilters'])

const showQuickView = ref(false)
const selectedTemplate = ref(null)

const handleQuickView = (template) => {
  selectedTemplate.value = template
  showQuickView.value = true
}

const handlePageChange = (page) => {
  emit('pageChange', page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.template-grid-wrapper {
  width: 100%;
}

.grid-loading {
  text-align: center;
  padding: 80px 20px;
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

.grid-empty {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.grid-empty h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 12px;
}

.grid-empty p {
  color: #718096;
  margin-bottom: 24px;
}

.btn-reset {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reset:hover {
  background: #764ba2;
  transform: translateY(-2px);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
}

@media (max-width: 768px) {
  .template-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>