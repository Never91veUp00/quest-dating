<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <!-- Мобильная версия: только ← Назад -->
    <router-link
      v-if="prevCrumb"
      :to="prevCrumb.to"
      class="breadcrumb-back"
    >
      ← {{ prevCrumb.label }}
    </router-link>

    <!-- Десктопная версия: полная цепочка -->
    <ol class="breadcrumbs-list">
      <li
        v-for="(crumb, index) in crumbs"
        :key="index"
        class="breadcrumb-item"
      >
        <router-link
          v-if="crumb.to && index < crumbs.length - 1"
          :to="crumb.to"
          class="breadcrumb-link"
        >
          {{ crumb.label }}
        </router-link>
        <span v-else class="breadcrumb-current">
          {{ crumb.label }}
        </span>
        <span
          v-if="index < crumbs.length - 1"
          class="breadcrumb-separator"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  crumbs: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(crumb =>
        crumb.label && (typeof crumb.to === 'string' || typeof crumb.to === 'object' || crumb.to === undefined)
      )
    }
  }
})

// Предыдущий пункт (для мобильной кнопки "← Назад")
const prevCrumb = computed(() => {
  if (props.crumbs.length < 2) return null
  return props.crumbs[props.crumbs.length - 2]
})
</script>

<style scoped>
/* Мобильная кнопка — скрыта на десктопе */
.breadcrumb-back {
  display: none;
}

/* Десктоп — полная цепочка */
.breadcrumbs {
  padding: 16px 0;
}

.breadcrumbs-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s;
  padding: 4px 8px;
  border-radius: 4px;
}

.breadcrumb-link:hover {
  background: #f7fafc;
  color: #764ba2;
}

.breadcrumb-current {
  color: #2d3748;
  font-weight: 600;
  padding: 4px 8px;
}

.breadcrumb-separator {
  color: #cbd5e0;
  user-select: none;
}

@media (max-width: 640px) {
  /* Прячем полную цепочку */
  .breadcrumbs-list {
    display: none;
  }

  /* Показываем кнопку ← Назад */
  .breadcrumb-back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #667eea;
    text-decoration: none;
  }

  .breadcrumb-back:active {
    opacity: 0.7;
  }
}
</style>