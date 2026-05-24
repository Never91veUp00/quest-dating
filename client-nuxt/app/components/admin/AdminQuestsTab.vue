<template>
  <section class="adm-section">
    <div class="adm-section__head">
      <h1>Квесты</h1>
      <button class="adm-btn adm-btn--primary" @click="$emit('create')">+ Создать квест</button>
    </div>

    <div v-if="loading" class="adm-loading">Загрузка...</div>
    <div v-else-if="!quests.length" class="adm-empty-page">
      <div class="adm-empty-page__icon">🗺️</div>
      <div class="adm-empty-page__text">Квестов пока нет</div>
      <button class="adm-btn adm-btn--primary" @click="$emit('create')">Создать первый квест</button>
    </div>
    <div v-else class="adm-quests-grid">
      <div v-for="q in pagedQuests" :key="q.id" class="adm-quest-card">
        <div class="adm-quest-card__theme" :data-theme="q.theme">
          {{ themeIcon(q.theme) }}
        </div>
        <div class="adm-quest-card__body">
          <div class="adm-quest-card__for">Для {{ q.client_name }}</div>
          <div class="adm-quest-card__title">{{ q.title }}</div>
          <div class="adm-quest-card__meta">
            <span>{{ q.blocks?.length || 0 }} блоков</span>
            <span>·</span>
            <span>{{ q.started_count || 0 }} запусков</span>
          </div>
        </div>
        <div class="adm-quest-card__actions">
          <button class="adm-icon-btn" title="Копировать ссылку" @click="$emit('copy-link', q.slug)">🔗</button>
          <button class="adm-icon-btn" title="Открыть квест"     @click="$emit('open-quest', q.slug)">▶</button>
          <button class="adm-icon-btn" title="Редактировать"     @click="$emit('edit', q.id)">✏️</button>
          <button class="adm-icon-btn adm-icon-btn--danger" title="Удалить" @click="$emit('delete', q)">🗑</button>
        </div>
      </div>
    </div>

  <div v-if="totalQuestPages > 1" class="adm-pagination">
    <button class="adm-pag__btn" :disabled="questPage === 1" @click="questPage--">←</button>
    <span class="adm-pag__info">{{ questPage }} / {{ totalQuestPages }}</span>
    <button class="adm-pag__btn" :disabled="questPage === totalQuestPages" @click="questPage++">→</button>
  </div>
  </section>
</template>

<script setup>
defineEmits(['create', 'edit', 'delete', 'copy-link', 'open-quest'])

import { ref, computed, watch } from 'vue'

const PER_PAGE = 15
const questPage = ref(1)
const props = defineProps({ quests: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
const totalQuestPages = computed(() => Math.ceil((props.quests?.length || 0) / PER_PAGE))
const pagedQuests = computed(() => {
  const list = props.quests || []
  const start = (questPage.value - 1) * PER_PAGE
  return list.slice(start, start + PER_PAGE)
})
watch(() => props.quests, () => { questPage.value = 1 })

const themeIcon = (t) => ({ detective: '🕵️', romantic: '❤️', city: '🏙️', mystery: '🔮' }[t] || '🕵️')
</script>

<style scoped>
.adm-quests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.adm-quest-card {
  background: #1a1f2e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.adm-quest-card:hover { border-color: rgba(102,126,234,0.3); }
.adm-quest-card__theme {
  height: 64px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
  background: rgba(255,255,255,0.03);
}
.adm-quest-card__theme[data-theme="detective"] { background: rgba(255,60,110,0.08); }
.adm-quest-card__theme[data-theme="romantic"]  { background: rgba(255,158,210,0.08); }
.adm-quest-card__theme[data-theme="city"]      { background: rgba(60,255,180,0.08); }
.adm-quest-card__theme[data-theme="mystery"]   { background: rgba(176,108,255,0.08); }
.adm-quest-card__body { padding: 14px 16px; }
.adm-quest-card__for { font-size: 0.72rem; color: #718096; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
.adm-quest-card__title { font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 6px; }
.adm-quest-card__meta { font-size: 0.75rem; color: #4a5568; display: flex; gap: 6px; }
.adm-quest-card__actions {
  display: flex; gap: 4px; padding: 8px 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.adm-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; }
.adm-pag__btn { padding: 6px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; color: #f0ede8; cursor: pointer; font-weight: 700; transition: all 0.2s; }
.adm-pag__btn:hover:not(:disabled) { border-color: #d4af37; color: #d4af37; }
.adm-pag__btn:disabled { opacity: 0.3; cursor: not-allowed; }
.adm-pag__info { font-size: 0.85rem; color: rgba(240,237,232,0.45); min-width: 60px; text-align: center; }
</style>