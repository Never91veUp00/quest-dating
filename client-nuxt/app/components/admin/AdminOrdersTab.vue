<template>
  <section class="adm-section">
    <div class="adm-section__head">
      <h1>Заказы</h1>
      <div class="adm-search">
        <span class="adm-search__icon">🔍</span>
        <input
          v-model="search"
          class="adm-search__input"
          placeholder="Имя, email, телефон, #id..."
          @keyup.esc="search = ''"
        />
        <button v-if="search" class="adm-search__clear" @click="search = ''">✕</button>
      </div>
      <div class="adm-filter">
        <button
          v-for="f in statusFilters"
          :key="f.value"
          class="adm-filter__btn"
          :class="{ active: statusFilter === f.value }"
          @click="statusFilter = f.value"
        >{{ f.label }}<span v-if="f.count" class="adm-filter__count">{{ f.count }}</span></button>
      </div>
    </div>

    <div v-if="loading" class="adm-loading">Загрузка...</div>
    <div v-else-if="!filteredOrders.length" class="adm-empty-page">Заказов пока нет</div>
    <div v-else class="adm-table-wrap">
      <table class="adm-table">
        <thead>
          <tr>
            <th>#</th><th>Клиент</th><th>Шаблон</th>
            <th>Сумма</th><th>Статус</th><th>Дата</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="o in pagedOrders"
            :key="o.id"
            class="adm-table__row"
            @click="$emit('open-order', o)"
          >
            <td class="adm-table__id">#{{ o.id }}</td>
            <td>
              <div class="adm-table__name">{{ o.client_name }}</div>
              <div class="adm-table__sub">{{ o.client_email }}</div>
            </td>
            <td>{{ o.template_title || '—' }}</td>
            <td class="adm-table__price">{{ formatRub(o.total_price) }}</td>
            <td><span class="adm-status" :class="`adm-status--${o.status}`">{{ statusLabel(o.status) }}</span></td>
            <td class="adm-table__date">{{ formatDate(o.created_at) }}</td>
            <td>
              <button
                v-if="o.status === 'pending'"
                class="adm-btn adm-btn--sm adm-btn--primary"
                @click.stop="$emit('open-order', o)"
              >✓ Подтвердить</button>
              <button
                v-else-if="o.status === 'confirmed'"
                class="adm-btn adm-btn--sm adm-btn--primary"
                @click.stop="$emit('create-quest', o)"
              >✏️ Создать квест</button>
              <template v-else>
                <button
                  class="adm-btn adm-btn--sm adm-btn--warning"
                  @click.stop="$emit('row-action', o)"
                >🔧 Редактировать</button>
                <button
                  v-if="o.status === 'cancelled'"
                  class="adm-btn adm-btn--sm adm-btn--danger"
                  @click.stop="confirmDelete(o)"
                >🗑 Удалить</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Пагинация -->
    <div v-if="totalOrderPages > 1" class="adm-pagination">
      <button class="adm-pag__btn" :disabled="orderPage === 1" @click="orderPage--">←</button>
      <span class="adm-pag__info">{{ orderPage }} / {{ totalOrderPages }}</span>
      <button class="adm-pag__btn" :disabled="orderPage === totalOrderPages" @click="orderPage++">→</button>
    </div>
    <!-- Диалог удаления -->
    <div v-if="deleteTarget !== null" class="adm-confirm-overlay" @click.self="deleteTarget = null">
      <div class="adm-confirm">
        <h3 class="adm-confirm__title">Удалить заказ #{{ deleteTarget?.id }}?</h3>
        <p class="adm-confirm__text">Заказ от <strong>{{ deleteTarget?.client_name }}</strong> будет удалён безвозвратно.</p>
        <div class="adm-confirm__actions">
          <button class="adm-btn adm-btn--ghost" @click="deleteTarget = null">Отмена</button>
          <button class="adm-btn adm-btn--danger" :disabled="deleting" @click="executeDelete">{{ deleting ? 'Удаление...' : 'Удалить' }}</button>
        </div>
      </div>
    </div>
  </section>

</template>

<script setup>
import { ref, computed, watch } from 'vue'

const { del } = useApi()

function formatRub(v) { return v ? `${Math.round(Number(v) / 100).toLocaleString('ru')} ₽` : '—' }
function statusLabel(s) { return { pending: 'Новый', confirmed: 'Подтверждён', in_progress: 'В работе', completed: 'Выполнен', cancelled: 'Отменён' }[s] || s }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }


const props = defineProps({
  orders:  { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['open-order', 'create-quest', 'row-action', 'deleted'])

const deleteTarget = ref(null)
const deleting     = ref(false)
const confirmDelete = (order) => { deleteTarget.value = order }
const executeDelete = async () => {
  if (!deleteTarget.value || deleting.value) return
  deleting.value = true
  try {
    await del(`/admin/orders/${deleteTarget.value.id}`)
    emit('deleted', deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) { console.error('Delete failed:', e) }
  finally { deleting.value = false }
}

const search       = ref('')
const statusFilter = ref('all')

const STATUS_LABELS = {
  all: 'Все', pending: 'Новые', confirmed: 'Подтверждённые',
  in_progress: 'В работе', completed: 'Выполненные', cancelled: 'Отменённые'
}

const statusFilters = computed(() => {
  const counts = {}
  props.orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
  return Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value, label,
    count: value === 'all' ? props.orders.length : (counts[value] || 0)
  }))
})

const filteredOrders = computed(() => {
  let list = props.orders
  if (statusFilter.value !== 'all') list = list.filter(o => o.status === statusFilter.value)
  const q = search.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(o =>
    o.client_name?.toLowerCase().includes(q)  ||
    o.client_email?.toLowerCase().includes(q) ||
    o.client_phone?.includes(q)               ||
    String(o.id).includes(q)                  ||
    o.description?.toLowerCase().includes(q)
  )
})

const PER_PAGE = 15
const orderPage = ref(1)
const totalOrderPages = computed(() => Math.ceil(filteredOrders.value.length / PER_PAGE))
const pagedOrders = computed(() => {
  const start = (orderPage.value - 1) * PER_PAGE
  return filteredOrders.value.slice(start, start + PER_PAGE)
})

// Сбрасываем страницу при смене фильтра/поиска
watch([search, statusFilter], () => { orderPage.value = 1 })
</script>

<style scoped>
.adm-confirm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
  z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.adm-confirm {
  background: #16161f; border: 1px solid rgba(239,68,68,0.3);
  border-radius: 20px; padding: 28px 24px;
  max-width: 400px; width: 100%;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
  animation: confirm-pop 0.2s ease;
}
@keyframes confirm-pop {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.adm-btn--danger { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
.adm-btn--danger:hover:not(:disabled) { background: rgba(239,68,68,0.25); }
.adm-btn--ghost { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(240,237,232,0.5); }
.adm-btn--ghost:hover { color: #f0ede8; }
.adm-confirm__title { font-size: 1.1rem; font-weight: 900; color: #f0ede8; margin: 0 0 10px; }
.adm-confirm__text { font-size: 0.9rem; color: rgba(240,237,232,0.55); margin: 0 0 24px; line-height: 1.5; }
.adm-confirm__text strong { color: #f0ede8; }
.adm-confirm__actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>