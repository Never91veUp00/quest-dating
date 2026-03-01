<template>
  <section class="adm-section">
    <div class="adm-section__head">
      <h1>Шаблоны витрины</h1>
      <div class="adm-search">
        <span class="adm-search__icon">🔍</span>
        <input v-model="search" class="adm-search__input" placeholder="Поиск по названию..." @keyup.esc="search = ''" />
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
      <button class="adm-btn adm-btn--primary" @click="$emit('create')">+ Новый шаблон</button>
    </div>

    <div v-if="loading" class="adm-loading">Загрузка...</div>
    <div v-else-if="!filteredTemplates.length" class="adm-empty-page">
      <div class="adm-empty-page__icon">📦</div>
      <div class="adm-empty-page__text">Шаблонов пока нет</div>
      <button class="adm-btn adm-btn--primary" @click="$emit('create')">Создать первый шаблон</button>
    </div>
    <div v-else class="adm-table-wrap">
      <table class="adm-table">
        <thead>
          <tr>
            <th>#</th><th>Название</th><th>Категория</th>
            <th>Сложность</th><th>Длительность</th><th>Цена</th><th>Статус</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filteredTemplates" :key="t.id" class="adm-table__row" @click="$emit('edit', t)">
            <td class="adm-table__id">#{{ t.id }}</td>
            <td>
              <div class="adm-table__name">{{ t.title }}</div>
              <div class="adm-table__sub">{{ t.tagline || '—' }}</div>
            </td>
            <td>{{ t.category_name || '—' }}</td>
            <td><span class="adm-difficulty" :class="`adm-difficulty--${t.difficulty}`">{{ difficultyLabel(t.difficulty) }}</span></td>
            <td>{{ t.duration_minutes }} мин</td>
            <td class="adm-table__price">{{ t.is_free ? 'Бесплатно' : formatRub(t.base_price) }}</td>
            <td><span class="adm-tstatus" :class="`adm-tstatus--${t.status}`">{{ tStatusLabel(t.status) }}</span></td>
            <td @click.stop>
              <div style="display:flex;gap:4px;">
                <button class="adm-icon-btn" title="Редактировать" @click="$emit('edit', t)">✏️</button>
                <button
                  v-if="t.status !== 'published'"
                  class="adm-icon-btn" title="Опубликовать"
                  @click="$emit('quick-status', t, 'published')"
                >✅</button>
                <button
                  v-else
                  class="adm-icon-btn" title="Снять с публикации"
                  @click="$emit('quick-status', t, 'draft')"
                >⏸</button>
                <button class="adm-icon-btn adm-icon-btn--danger" title="Удалить" @click="$emit('delete', t)">🗑</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatRub } from '@/utils/adminHelpers'

const props = defineProps({
  templates: { type: Array,   default: () => [] },
  loading:   { type: Boolean, default: false },
})
defineEmits(['create', 'edit', 'delete', 'quick-status'])

const search       = ref('')
const statusFilter = ref('all')

const TEMPLATE_STATUS_LABELS = { all: 'Все', draft: 'Черновики', published: 'Опубликованы', archived: 'Архив' }
const DIFFICULTY_LABELS      = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный', expert: 'Эксперт' }

const statusFilters = computed(() => {
  const counts = {}
  props.templates.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1 })
  return Object.entries(TEMPLATE_STATUS_LABELS).map(([value, label]) => ({
    value, label,
    count: value === 'all' ? props.templates.length : (counts[value] || 0)
  }))
})

const filteredTemplates = computed(() => {
  let list = props.templates
  if (statusFilter.value !== 'all') list = list.filter(t => t.status === statusFilter.value)
  const q = search.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(t =>
    t.title?.toLowerCase().includes(q) ||
    t.tagline?.toLowerCase().includes(q) ||
    t.category_name?.toLowerCase().includes(q)
  )
})

const difficultyLabel = (d) => DIFFICULTY_LABELS[d] || d
const tStatusLabel    = (s) => ({ draft: 'Черновик', published: 'Опубликован', archived: 'Архив' }[s] || s)
</script>