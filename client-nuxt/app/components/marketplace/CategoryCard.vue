<template>
  <NuxtLink 
    :to="`/categories/${category.slug}`"
    class="category-card"
    :style="{ '--category-color': category.color }"
    :prefetch="false"
  >
    <div class="category-icon">{{ category.icon }}</div>
    <div class="category-content">
      <h3 class="category-name">{{ category.name }}</h3>
      <p class="category-description">{{ category.description }}</p>
      <div class="category-meta">
        <span class="templates-count">
          {{ category.templates_count }} {{ pluralize(category.templates_count, 'шаблон', 'шаблона', 'шаблонов') }}
        </span>
      </div>
    </div>
    <div class="category-arrow">→</div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  category: {
    type: Object,
    required: true
  }
})

const pluralize = (count, one, few, many) => {
  const mod10 = count % 10
  const mod100 = count % 100
  
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
</script>

<style scoped>
.category-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 32px 28px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--category-color, #667eea);
  transform: scaleY(0);
  transition: transform 0.3s;
}

.category-card:hover {
  border-color: var(--category-color, #667eea);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.category-card:hover::before {
  transform: scaleY(1);
}

.category-icon {
  font-size: 3.5rem;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.category-card:hover .category-icon {
  transform: scale(1.1);
}

.category-content {
  flex: 1;
}

.category-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.category-description {
  color: #718096;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.templates-count {
  font-size: 0.9rem;
  color: var(--category-color, #667eea);
  font-weight: 600;
}

.category-arrow {
  font-size: 1.5rem;
  color: #cbd5e0;
  flex-shrink: 0;
  transition: all 0.3s;
}

.category-card:hover .category-arrow {
  color: var(--category-color, #667eea);
  transform: translateX(4px);
}

@media (max-width: 640px) {
  .category-card {
    padding: 14px 16px;
    border-radius: 14px;
    gap: 12px;
    border-width: 1.5px;
  }

  .category-icon {
    font-size: 2rem;
  }

  .category-name {
    font-size: 1rem;
    margin-bottom: 4px;
  }

  .category-description {
    display: none;
  }

  .category-meta {
    margin-top: 0;
  }

  .templates-count {
    font-size: .8rem;
  }

  .category-arrow {
    font-size: 1.1rem;
  }
}
</style>