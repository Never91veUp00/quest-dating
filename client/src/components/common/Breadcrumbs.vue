<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
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
defineProps({
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
</script>

<style scoped>
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
  .breadcrumbs-list {
    font-size: 0.85rem;
  }
  
  .breadcrumb-item {
    gap: 6px;
  }
}
</style>