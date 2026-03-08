<template>
  <div class="search-bar" :class="{ focused: isFocused, expanded: isExpanded }">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="search-input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="handleSearch"
        @keyup.esc="handleClear"
      />
      <button
        v-if="searchQuery"
        @click="handleClear"
        class="search-clear"
        aria-label="Очистить"
      >
        ✕
      </button>
    </div>

    <!-- Кнопка поиска -->
    <button 
      v-if="showButton"
      @click="handleSearch"
      class="search-button"
      :disabled="!searchQuery"
    >
      {{ buttonText }}
    </button>

    <!-- Dropdown с подсказками/результатами -->
    <transition name="dropdown">
      <div 
        v-if="showDropdown && (suggestions.length > 0 || recentSearches.length > 0)"
        class="search-dropdown"
      >
        <!-- Недавние поиски -->
        <div v-if="!searchQuery && recentSearches.length > 0" class="dropdown-section">
          <div class="dropdown-header">
            <span class="dropdown-title">Недавние поиски</span>
            <button @click="clearRecent" class="dropdown-clear">Очистить</button>
          </div>
          <ul class="dropdown-list">
            <li 
              v-for="(search, index) in recentSearches"
              :key="'recent-' + index"
              @click="selectSuggestion(search)"
              class="dropdown-item"
            >
              <span class="item-icon">🕐</span>
              <span class="item-text">{{ search }}</span>
            </li>
          </ul>
        </div>

        <!-- Подсказки -->
        <div v-if="searchQuery && suggestions.length > 0" class="dropdown-section">
          <div class="dropdown-header">
            <span class="dropdown-title">Предложения</span>
          </div>
          <ul class="dropdown-list">
            <li 
              v-for="(suggestion, index) in suggestions"
              :key="'suggestion-' + index"
              @click="selectSuggestion(suggestion)"
              class="dropdown-item"
            >
              <span class="item-icon">🔍</span>
              <span class="item-text" v-html="highlightMatch(suggestion)"></span>
            </li>
          </ul>
        </div>

        <!-- Популярные категории -->
        <div v-if="!searchQuery && popularCategories.length > 0" class="dropdown-section">
          <div class="dropdown-header">
            <span class="dropdown-title">Популярные категории</span>
          </div>
          <ul class="dropdown-list">
            <li 
              v-for="category in popularCategories"
              :key="'category-' + category.id"
              @click="selectCategory(category)"
              class="dropdown-item"
            >
              <span class="item-icon">{{ category.icon }}</span>
              <span class="item-text">{{ category.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Поиск квестов...'
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  popularCategories: {
    type: Array,
    default: () => []
  },
  showButton: {
    type: Boolean,
    default: true
  },
  buttonText: {
    type: String,
    default: 'Найти'
  },
  expandOnFocus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'input', 'select-suggestion', 'select-category'])

const searchInput = ref(null)
const searchQuery = ref(props.modelValue)
const isFocused = ref(false)
const isExpanded = ref(false)
const recentSearches = ref([])

const showDropdown = computed(() => {
  return isFocused.value && (
    searchQuery.value.length > 0 || 
    recentSearches.value.length > 0 || 
    props.popularCategories.length > 0
  )
})

// Загрузить недавние поиски из localStorage (только на клиенте)
const loadRecentSearches = () => {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem('quest-recent-searches')
    if (stored) {
      recentSearches.value = JSON.parse(stored).slice(0, 5)
    }
  } catch (e) {
    console.error('Failed to load recent searches:', e)
  }
}

// Сохранить поиск в недавние
const saveToRecent = (query) => {
  if (typeof window === 'undefined') return
  if (!query || query.trim().length === 0) return
  
  const trimmed = query.trim()
  const filtered = recentSearches.value.filter(s => s !== trimmed)
  recentSearches.value = [trimmed, ...filtered].slice(0, 5)
  
  try {
    localStorage.setItem('quest-recent-searches', JSON.stringify(recentSearches.value))
  } catch (e) {
    console.error('Failed to save recent search:', e)
  }
}

const handleInput = () => {
  emit('update:modelValue', searchQuery.value)
  emit('input', searchQuery.value)
}

const handleFocus = () => {
  isFocused.value = true
  if (props.expandOnFocus) {
    isExpanded.value = true
  }
  loadRecentSearches()
}

const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false
    if (props.expandOnFocus && !searchQuery.value) {
      isExpanded.value = false
    }
  }, 200)
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    saveToRecent(searchQuery.value)
    emit('search', searchQuery.value)
  }
}

const handleClear = () => {
  searchQuery.value = ''
  emit('update:modelValue', '')
  emit('input', '')
  searchInput.value?.focus()
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  emit('update:modelValue', suggestion)
  emit('select-suggestion', suggestion)
  saveToRecent(suggestion)
  emit('search', suggestion)
}

const selectCategory = (category) => {
  emit('select-category', category)
}

const clearRecent = () => {
  recentSearches.value = []
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('quest-recent-searches')
  } catch (e) {
    console.error('Failed to clear recent searches:', e)
  }
}

const escapeHtml = (str) => {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
}

const highlightMatch = (text) => {
  if (!searchQuery.value) return escapeHtml(text)
  const safeText = escapeHtml(text)
  const query = searchQuery.value.toLowerCase()
  const lowerText = safeText.toLowerCase()
  const idx = lowerText.indexOf(query)
  if (idx === -1) return safeText
  const before = safeText.slice(0, idx)
  const match  = safeText.slice(idx, idx + query.length)
  const after  = safeText.slice(idx + query.length)
  return before + '<strong>' + match + '</strong>' + after
}

watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

// Загрузить недавние поиски только на клиенте
onMounted(() => {
  loadRecentSearches()
})
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  transition: all 0.3s;
}

.search-bar.expanded {
  max-width: 600px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s;
}

.search-bar.focused .search-input-wrapper {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.search-icon {
  font-size: 1.2rem;
  color: #718096;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #2d3748;
  background: transparent;
}

.search-input::placeholder {
  color: #a0aec0;
}

.search-clear {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e2e8f0;
  border: none;
  color: #718096;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}

.search-clear:hover {
  background: #cbd5e0;
  color: #2d3748;
}

.search-button {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-50%) scale(1.05);
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
}

.dropdown-section {
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-section:last-child {
  border-bottom: none;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
}

.dropdown-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-clear {
  font-size: 0.75rem;
  color: #667eea;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.dropdown-clear:hover {
  color: #764ba2;
}

.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f7fafc;
}

.item-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  color: #2d3748;
  font-size: 0.95rem;
}

.item-text :deep(strong) {
  color: #667eea;
  font-weight: 700;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 640px) {
  .search-input-wrapper {
    padding: 10px 14px;
  }

  .search-input {
    font-size: 0.9rem;
  }

  .search-button {
    position: static;
    transform: none;
    width: 100%;
    margin-top: 8px;
  }

  .search-button:hover:not(:disabled) {
    transform: none;
  }
}
</style>
