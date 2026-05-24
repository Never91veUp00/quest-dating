<template>
  <section class="adm-section">
    <div class="adm-section__head">
      <h1>Дашборд</h1>
    </div>

    <div v-if="loading" class="adm-loading">Загрузка...</div>
    <template v-else>
      <div class="adm-stats">
        <div class="adm-stat">
          <div class="adm-stat__n">{{ Number(stats.pending_orders || 0) + Number(stats.confirmed_orders || 0) }}</div>
          <div class="adm-stat__l">Новых заказов</div>
        </div>
        <div class="adm-stat">
          <div class="adm-stat__n">{{ Number(stats.total_orders || 0) }}</div>
          <div class="adm-stat__l">Всего заказов</div>
        </div>
        <div class="adm-stat">
          <div class="adm-stat__n">{{ Number(stats.total_quests || 0) }}</div>
          <div class="adm-stat__l">Квестов создано</div>
        </div>
        <div class="adm-stat adm-stat--accent">
          <div class="adm-stat__n">{{ formatRub(stats.total_revenue) }}</div>
          <div class="adm-stat__l">Выручка</div>
        </div>
      </div>

      <div class="adm-row">
        <div class="adm-card">
          <div class="adm-card__title">Последние заказы</div>
          <div v-if="!recentOrders.length" class="adm-empty">Заказов пока нет</div>
          <div
            v-for="o in recentOrders"
            :key="o.id"
            class="adm-list-item"
            @click="$emit('open-order', o)"
          >
            <div class="adm-list-item__main">
              <span class="adm-list-item__name">{{ o.client_name }}</span>
              <span class="adm-list-item__sub">{{ o.template_title || 'Без шаблона' }}</span>
            </div>
            <div class="adm-list-item__right">
              <span class="adm-status" :class="`adm-status--${o.status}`">{{ statusLabel(o.status) }}</span>
              <span class="adm-list-item__date">{{ formatDate(o.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="adm-card">
          <div class="adm-card__title">Последние квесты</div>
          <div v-if="!recentQuests.length" class="adm-empty">Квестов пока нет</div>
          <div
            v-for="q in recentQuests"
            :key="q.id"
            class="adm-list-item"
            @click="$emit('edit-quest', q.id)"
          >
            <div class="adm-list-item__main">
              <span class="adm-list-item__name">{{ q.client_name }}</span>
              <span class="adm-list-item__sub">{{ q.title }}</span>
            </div>
            <div class="adm-list-item__right">
              <span class="adm-link-btn" @click.stop="$emit('copy-link', q.slug)">Копировать ссылку</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>

function formatRub(v) { return v ? `${Math.round(Number(v) / 100).toLocaleString('ru')} ₽` : '—' }
function statusLabel(s) { return { pending: 'Новый', confirmed: 'Подтверждён', in_progress: 'В работе', completed: 'Выполнен', cancelled: 'Отменён' }[s] || s }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }


defineProps({
  loading:      { type: Boolean, default: false },
  stats:        { type: Object,  default: () => ({}) },
  recentOrders: { type: Array,   default: () => [] },
  recentQuests: { type: Array,   default: () => [] },
})
defineEmits(['open-order', 'edit-quest', 'copy-link'])
</script>

<style scoped>
.adm-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  margin-bottom: 28px;
}
.adm-stat {
  background: #1a1f2e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 20px 24px;
}
.adm-stat--accent { border-color: rgba(102,126,234,0.3); }
.adm-stat__n { font-size: 2rem; font-weight: 900; color: #fff; }
.adm-stat--accent .adm-stat__n { color: #667eea; }
.adm-stat__l { font-size: 0.78rem; color: #718096; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }

.adm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.adm-card { background: #1a1f2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; }
.adm-card__title { font-size: 0.82rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }

.adm-list-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  cursor: pointer; transition: background 0.1s; border-radius: 4px;
}
.adm-list-item:last-child { border-bottom: none; }
.adm-list-item:hover { background: rgba(255,255,255,0.03); }
.adm-list-item__main { display: flex; flex-direction: column; gap: 2px; }
.adm-list-item__name { font-weight: 600; color: #fff; font-size: 0.88rem; }
.adm-list-item__sub { font-size: 0.78rem; color: #718096; }
.adm-list-item__right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.adm-list-item__date { font-size: 0.75rem; color: #4a5568; }

@media (max-width: 1024px) {
  .adm-stats { grid-template-columns: repeat(2, 1fr); }
  .adm-row { grid-template-columns: 1fr; }
}
</style>