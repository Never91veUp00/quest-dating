<template>
  <aside class="adm-sidebar">
    <div class="adm-sidebar__logo">🗝️ Admin</div>
    <nav class="adm-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="adm-nav__item"
        :class="{ active: modelValue === tab.id }"
        @click="$emit('update:modelValue', tab.id)"
      >
        <span class="adm-nav__icon">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
        <span v-if="tab.id === 'orders' && pendingCount" class="adm-nav__badge">
          {{ pendingCount }}
        </span>
      </button>
    </nav>
    <button class="adm-logout" @click="$emit('logout')">Выйти</button>
  </aside>
</template>

<script setup>
defineProps({
  modelValue:   { type: String, required: true },
  pendingCount: { type: Number, default: 0 },
})
defineEmits(['update:modelValue', 'logout'])

const tabs = [
  { id: 'dashboard', icon: '📊', label: 'Дашборд' },
  { id: 'orders',    icon: '📋', label: 'Заказы' },
  { id: 'quests',    icon: '🗺️', label: 'Квесты' },
  { id: 'templates', icon: '📦', label: 'Сценарии' },
]
</script>

<style scoped>
.adm-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #1a1f2e;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: sticky;
  top: 0;
  height: 100vh;
}
.adm-sidebar__logo {
  font-size: 1.1rem;
  font-weight: 800;
  color: #fff;
  padding: 0 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 12px;
}
.adm-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 0 10px; }
.adm-nav__item {
  display: flex; align-items: center; gap: 10px;
  background: transparent; border: none;
  color: #718096; padding: 10px 12px; border-radius: 8px;
  cursor: pointer; font-size: 0.88rem; font-weight: 500;
  transition: all 0.15s; text-align: left; width: 100%;
}
.adm-nav__item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.adm-nav__item.active { background: rgba(102,126,234,0.15); color: #667eea; }
.adm-nav__icon { font-size: 1rem; }
.adm-nav__badge {
  margin-left: auto;
  background: #e53e3e;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
}
.adm-logout {
  margin: 16px 10px 0;
  background: transparent; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 9px 12px; color: #718096;
  font-size: 0.82rem; cursor: pointer; transition: all 0.15s;
}
.adm-logout:hover { color: #fc8181; border-color: rgba(252,129,129,0.3); }

@media (max-width: 768px) {
  .adm-sidebar { display: none; }
}
</style>