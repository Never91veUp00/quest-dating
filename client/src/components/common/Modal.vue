<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :class="`modal-${size}`" @click.stop>
          <!-- Drag handle (мобиль) -->
          <div class="modal-handle"></div>

          <!-- Header -->
          <div v-if="$slots.header || title" class="modal-header">
            <slot name="header">
              <h3 class="modal-title">{{ title }}</h3>
            </slot>
            <button
              v-if="closable"
              @click="close"
              class="modal-close"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-handle {
  display: none;
}

.modal-small  { max-width: 400px; width: 100%; }
.modal-medium { max-width: 600px; width: 100%; }
.modal-large  { max-width: 900px; width: 100%; }
.modal-full   { max-width: 95vw; width: 100%; max-height: 95vh; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-close:hover {
  background: #f7fafc;
  color: #2d3748;
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

.modal-footer {
  padding: 20px 28px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* ── Анимация десктоп ── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.92);
}

/* ── Мобиль: bottom sheet ── */
@media (max-width: 640px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal-container {
    width: 100%;
    max-width: 100%;
    max-height: 92dvh;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2);
  }

  /* Drag handle */
  .modal-handle {
    display: block;
    width: 40px;
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    margin: 12px auto 4px;
    flex-shrink: 0;
  }

  .modal-header {
    padding: 12px 20px 16px;
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 16px 20px 24px;
  }

  .modal-footer {
    padding: 12px 20px 28px; /* 28px — отступ от home indicator */
  }

  /* Анимация снизу вверх */
  .modal-enter-active .modal-container,
  .modal-leave-active .modal-container {
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }
  .modal-enter-from .modal-container,
  .modal-leave-to .modal-container {
    transform: translateY(100%);
  }
}
</style>