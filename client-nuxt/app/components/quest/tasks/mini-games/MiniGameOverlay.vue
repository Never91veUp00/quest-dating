<template>
  <teleport to="body">
    <transition name="mg-overlay">
      <div v-if="modelValue" class="mg-overlay" :style="cssVars">

        <!-- Header -->
        <div class="mg-overlay__head">
          <div class="mg-overlay__meta">
            <span class="mg-overlay__icon">🎮</span>
            <span class="mg-overlay__label">{{ task.title }}</span>
          </div>
          <button class="mg-overlay__close" @click="$emit('update:modelValue', false)" aria-label="Закрыть">✕</button>
        </div>

        <!-- Game content -->
        <div class="mg-overlay__body">
          <slot />
        </div>

      </div>
    </transition>
  </teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  task:       { type: Object,  required: true },
  cssVars:    { type: Object,  default: () => ({}) },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.mg-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--bg, #060810);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.mg-overlay__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--bord, rgba(255,255,255,.08));
  flex-shrink: 0;
}
.mg-overlay__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.mg-overlay__icon { font-size: 1rem; flex-shrink: 0; }
.mg-overlay__label {
  font-size: .85rem;
  font-weight: 700;
  color: var(--text, #c8d6ef);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mg-overlay__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--bord, rgba(255,255,255,.12));
  background: rgba(255,255,255,.06);
  color: var(--text, #c8d6ef);
  font-size: .85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .15s;
}
.mg-overlay__close:hover { background: rgba(255,255,255,.12); }

/* ── Body ── */
.mg-overlay__body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

/* ── Transition ── */
.mg-overlay-enter-active,
.mg-overlay-leave-active { transition: opacity .22s ease, transform .22s ease; }
.mg-overlay-enter-from,
.mg-overlay-leave-to    { opacity: 0; transform: translateY(24px); }
</style>
