<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <!-- Мобильная версия: только ← Назад -->
    <NuxtLink
      v-if="prevCrumb"
      :to="prevCrumb.to"
      class="breadcrumb-back"
    >
      ← {{ prevCrumb.label }}
    </NuxtLink>
    <!-- Десктопная версия: полная цепочка -->
    <ol class="breadcrumbs-list">
      <li
        v-for="(crumb, index) in crumbs"
        :key="index"
        class="breadcrumb-item"
      >
        <NuxtLink
          v-if="crumb.to && index < crumbs.length - 1"
          :to="crumb.to"
          class="breadcrumb-link"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
        <span v-if="index < crumbs.length - 1" class="breadcrumb-separator" aria-hidden="true">›</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  crumbs: {
    type: Array,
    default: () => []
  }
})

// Предыдущий крамб для мобильной кнопки "← Назад"
const prevCrumb = computed(() => {
  const withLinks = props.crumbs.filter(c => c.to)
  return withLinks.length > 0 ? withLinks[withLinks.length - 1] : null
})
</script>

<style scoped>
.breadcrumbs {
  padding: 16px 0;
  margin-bottom: 8px;
}

/* Десктоп — показываем полную цепочку */
.breadcrumbs-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumb-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.breadcrumb-current {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #cbd5e0;
  font-size: 0.9rem;
  user-select: none;
}

/* Мобильная кнопка "← Назад" — скрыта на десктопе */
.breadcrumb-back {
  display: none;
  align-items: center;
  gap: 6px;
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.2s;
}

.breadcrumb-back:hover {
  color: #764ba2;
}

@media (max-width: 768px) {
  .breadcrumbs-list {
    display: none;
  }

  .breadcrumb-back {
    display: flex;
  }
}
</style>