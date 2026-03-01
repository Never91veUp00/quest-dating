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
            v-for="o in filteredOrders"
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
              <button
                v-else
                class="adm-btn adm-btn--sm adm-btn--warning"
                @click.stop="$emit('row-action', o)"
              >🔧 Редактировать</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatRub, formatDate, statusLabel } from '@/utils/adminHelpers'

const props = defineProps({
  orders:  { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
})
defineEmits(['open-order', 'create-quest', 'row-action'])

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
</script>