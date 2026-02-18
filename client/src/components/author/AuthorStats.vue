<template>
  <div class="author-stats">
    <h3 class="stats-title">Статистика автора</h3>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total_templates || 0 }}</div>
          <div class="stat-label">Всего шаблонов</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.published_templates || 0 }}</div>
          <div class="stat-label">Опубликовано</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatRating(stats.average_rating) }}</div>
          <div class="stat-label">Средний рейтинг</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total_orders || 0 }}</div>
          <div class="stat-label">Заказов</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.total_views) }}</div>
          <div class="stat-label">Просмотров</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatRevenue(stats.total_revenue) }}</div>
          <div class="stat-label">Общий доход</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({
      total_templates: 0,
      published_templates: 0,
      average_rating: 0,
      total_orders: 0,
      total_views: 0,
      total_revenue: 0
    })
  }
})

const formatRating = (rating) => {
  if (!rating) return '0.0'
  return rating.toFixed(1)
}

const formatNumber = (num) => {
  if (!num) return 0
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num
}

const formatRevenue = (revenue) => {
  if (!revenue) return '0 ₽'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(revenue / 100) // конвертируем из копеек
}
</script>

<style scoped>
.author-stats {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stats-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 24px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>