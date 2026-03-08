<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    :type="type"
    :disabled="disabled || loading"
    class="btn"
    :class="[
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-loading': loading, 'btn-block': block }
    ]"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <span class="btn-content" :class="{ 'btn-content-hidden': loading }">
      <slot></slot>
    </span>
  </component>
</template>

<script setup>
import { computed, resolveComponent } from 'vue'

const props = defineProps({
  // Вариант кнопки
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(value)
  },
  // Размер
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // Тип кнопки (для form)
  type: {
    type: String,
    default: 'button'
  },
  // Для router-link
  to: {
    type: [String, Object],
    default: null
  },
  // Для обычной ссылки
  href: {
    type: String,
    default: null
  },
  // Состояние загрузки
  loading: {
    type: Boolean,
    default: false
  },
  // Disabled
  disabled: {
    type: Boolean,
    default: false
  },
  // Полная ширина
  block: {
    type: Boolean,
    default: false
  }
})

const tag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-family: inherit;
  border-radius: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sizes */
.btn-small {
  padding: 8px 16px;
  font-size: 0.875rem;
}

.btn-medium {
  padding: 12px 24px;
  font-size: 1rem;
}

.btn-large {
  padding: 16px 32px;
  font-size: 1.125rem;
}

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #edf2f7;
  color: #2d3748;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-ghost {
  background: transparent;
  color: #4a5568;
}

.btn-ghost:hover:not(:disabled) {
  background: #f7fafc;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e53e3e;
}

/* Block */
.btn-block {
  width: 100%;
}

/* Loading */
.btn-loading {
  pointer-events: none;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

@keyframes spin {
  to { transform: translateX(-50%) rotate(360deg); }
}

.btn-content {
  transition: opacity 0.3s;
}

.btn-content-hidden {
  opacity: 0;
}

/* Active state */
.btn:active:not(:disabled) {
  transform: scale(0.98);
}
</style>