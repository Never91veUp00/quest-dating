<template>
  <Teleport to="body">
    <transition name="sticky-slide">
      <div v-if="visible" class="sticky-cta">
        <div class="sticky-cta__inner">
          <div class="sticky-cta__text">
            <span class="sticky-cta__emoji">💬</span>
            <span>Не можете выбрать? Лиза поможет</span>
          </div>
          <a
            href="https://t.me/vinatian00"
            target="_blank"
            rel="noopener"
            class="sticky-cta__btn"
          >
            Написать →
          </a>
          <button class="sticky-cta__close" @click="dismiss" aria-label="Закрыть">×</button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible   = ref(false)
const dismissed = ref(false)

const onScroll = () => {
  if (dismissed.value) return
  visible.value = window.scrollY > 600
}

const dismiss = () => {
  dismissed.value = true
  visible.value = false
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style>
.sticky-cta {
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 900;
  padding: 0 0 env(safe-area-inset-bottom);
}
.sticky-cta__inner {
  display: flex; align-items: center; gap: 12px;
  background: #111118;
  border-top: 1px solid rgba(212,175,55,0.2);
  padding: 14px 20px;
  backdrop-filter: blur(20px);
}
.sticky-cta__text {
  flex: 1; display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; color: rgba(240,237,232,0.8); font-weight: 600;
}
.sticky-cta__emoji { font-size: 1.1rem; }
.sticky-cta__btn {
  flex-shrink: 0; background: #d4af37; color: #0a0a0f;
  padding: 9px 18px; border-radius: 100px;
  font-weight: 800; font-size: 0.85rem;
  text-decoration: none; -webkit-tap-highlight-color: transparent;
  transition: opacity 0.2s;
}
.sticky-cta__btn:hover { opacity: 0.9; }
.sticky-cta__close {
  flex-shrink: 0; background: none; border: none;
  color: rgba(240,237,232,0.3); font-size: 1.3rem;
  cursor: pointer; padding: 0; line-height: 1;
  -webkit-tap-highlight-color: transparent;
}
.sticky-cta__close:hover { color: rgba(240,237,232,0.6); }

.sticky-slide-enter-active, .sticky-slide-leave-active { transition: transform 0.3s ease, opacity 0.3s; }
.sticky-slide-enter-from, .sticky-slide-leave-to { transform: translateY(100%); opacity: 0; }
</style>