<template>
  <div class="pagination">
    <button 
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="pagination-btn pagination-prev"
    >
      ← Назад
    </button>

    <div class="pagination-numbers">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        class="pagination-number"
        :class="{ active: page === currentPage }"
      >
        {{ page }}
      </button>
    </div>

    <button 
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="pagination-btn pagination-next"
    >
      Вперед →
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  maxVisible: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['page-change'])

const visiblePages = computed(() => {
  const pages = []
  const halfMax = Math.floor(props.maxVisible / 2)
  
  let start = Math.max(1, props.currentPage - halfMax)
  let end = Math.min(props.totalPages, start + props.maxVisible - 1)
  
  if (end - start + 1 < props.maxVisible) {
    start = Math.max(1, end - props.maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 40px 0;
}

.pagination-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 8px;
}

.pagination-number {
  width: 44px;
  height: 44px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-number:hover {
  border-color: #667eea;
  color: #667eea;
}

.pagination-number.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

@media (max-width: 640px) {
  .pagination-btn {
    padding: 8px 12px;
    font-size: 0.875rem;
  }

  .pagination-number {
    width: 36px;
    height: 36px;
    font-size: 0.875rem;
  }
}
</style>