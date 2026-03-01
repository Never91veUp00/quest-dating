<template>
  <teleport to="body">
    <transition name="adm-confirm">
      <div v-if="dialog.show" class="adm-confirm-overlay" @click.self="dialog.show = false">
        <div class="adm-confirm">
          <div class="adm-confirm__icon">🗑️</div>
          <h3 class="adm-confirm__title">{{ dialog.title }}</h3>
          <p class="adm-confirm__text">{{ dialog.message }}</p>
          <div class="adm-confirm__actions">
            <button class="adm-confirm__btn adm-confirm__btn--cancel" @click="dialog.show = false">
              Отмена
            </button>
            <button class="adm-confirm__btn adm-confirm__btn--delete" @click="dialog.onConfirm(); dialog.show = false">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
defineProps({
  dialog: { type: Object, required: true }
})
</script>

<style scoped>
.adm-confirm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 3000; padding: 20px;
  backdrop-filter: blur(4px);
}
.adm-confirm {
  background: #1e2130;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; padding: 32px;
  max-width: 400px; width: 100%;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
}
.adm-confirm__icon { font-size: 2.5rem; margin-bottom: 16px; }
.adm-confirm__title { font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0 0 8px; }
.adm-confirm__text { font-size: 0.9rem; color: rgba(255,255,255,0.55); margin: 0 0 28px; line-height: 1.5; }
.adm-confirm__actions { display: flex; gap: 12px; }
.adm-confirm__btn {
  flex: 1; padding: 11px 0; border-radius: 8px;
  font-weight: 600; font-size: 0.95rem;
  cursor: pointer; border: none; transition: opacity 0.2s, transform 0.15s;
}
.adm-confirm__btn:hover { opacity: 0.85; }
.adm-confirm__btn:active { transform: scale(0.97); }
.adm-confirm__btn--cancel { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }
.adm-confirm__btn--delete { background: #e53e3e; color: #fff; }

.adm-confirm-enter-active, .adm-confirm-leave-active { transition: opacity 0.2s; }
.adm-confirm-enter-from, .adm-confirm-leave-to { opacity: 0; }
.adm-confirm-enter-active .adm-confirm,
.adm-confirm-leave-active .adm-confirm { transition: transform 0.2s; }
.adm-confirm-enter-from .adm-confirm,
.adm-confirm-leave-to .adm-confirm { transform: scale(0.92); }
</style>