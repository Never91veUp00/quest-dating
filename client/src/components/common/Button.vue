<template>
  <button 
    class="btn" 
    :class="[`btn-${variant}`, { 'btn-loading': loading, 'btn-disabled': disabled }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner"></span>
    <span v-else>
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  emit('click', event)
}
</script>

<style scoped>
.btn {
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.btn-secondary:hover:not(.btn-disabled) {
  background: rgba(102, 126, 234, 0.2);
}

.btn-outline {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
}

.btn-outline:hover:not(.btn-disabled) {
  background: #667eea;
  color: white;
}

.btn-ghost {
  background: transparent;
  color: #667eea;
}

.btn-ghost:hover:not(.btn-disabled) {
  background: rgba(102, 126, 234, 0.1);
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  cursor: wait;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>