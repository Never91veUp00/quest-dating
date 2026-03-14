<template>
  <div class="order-summary" :class="{ sticky: isSticky }">
    <h3 class="summary-title">Сводка заказа</h3>

    <!-- Шаблон -->
    <div class="summary-section">
      <div class="template-preview">
        <img 
          :src="template.cover_image || withFallback(null)" 
          :alt="template.title"
          class="template-image"
        />
        <div class="template-info">
          <h4 class="template-title">{{ template.title }}</h4>
          <p class="template-category">{{ template.category_name }}</p>
        </div>
      </div>
    </div>

    <!-- Характеристики -->
    <div class="summary-section">
      <h4 class="section-title">Характеристики</h4>
      <ul class="summary-list">
        <li class="summary-item">
          <span class="item-label">Сложность:</span>
          <DifficultyBadge :difficulty="template.difficulty" />
        </li>
        <li class="summary-item">
          <span class="item-label">Длительность:</span>
          <span class="item-value">{{ formatDuration(template.duration_minutes) }}</span>
        </li>
        <li class="summary-item">
          <span class="item-label">Локаций:</span>
          <span class="item-value">{{ template.min_locations }}-{{ template.max_locations }}</span>
        </li>
        <li class="summary-item">
          <span class="item-label">Тип:</span>
          <span class="item-value">{{ getLocationType(template.location_type) }}</span>
        </li>
      </ul>
    </div>

    <!-- Выбранные опции -->
    <div v-if="selectedFeatures.length > 0" class="summary-section">
      <h4 class="section-title">Дополнительно</h4>
      <ul class="summary-list">
        <li 
          v-for="feature in featuresData"
          :key="feature.value"
          class="summary-item"
        >
          <span class="item-label">{{ feature.icon }} {{ feature.name }}</span>
          <span class="item-value">+{{ feature.price }} ₽</span>
        </li>
      </ul>
    </div>

    <!-- Ценообразование -->
    <div class="summary-section">
      <h4 class="section-title">Стоимость</h4>
      <div class="price-breakdown">
        <div class="price-item">
          <span class="price-label">Базовая стоимость:</span>
          <span class="price-value">{{ formatPrice(basePrice) }}</span>
        </div>
        <div v-if="additionalCosts > 0" class="price-item">
          <span class="price-label">Дополнительно:</span>
          <span class="price-value">{{ formatPrice(additionalCosts) }}</span>
        </div>
        <div class="price-total">
          <span class="total-label">Итого:</span>
          <span class="total-value">{{ formatPrice(totalPrice) }}</span>
        </div>
      </div>
    </div>

    <!-- Гарантии -->
    <div class="summary-guarantees">
      <div class="guarantee-item">
        <span class="guarantee-icon">✓</span>
        <span class="guarantee-text">Готовность за 24 часа</span>
      </div>
      <div class="guarantee-item">
        <span class="guarantee-icon">✓</span>
        <span class="guarantee-text">Бесплатные правки</span>
      </div>
      <div class="guarantee-item">
        <span class="guarantee-icon">✓</span>
        <span class="guarantee-text">Возврат средств 7 дней</span>
      </div>
    </div>

    <!-- Контакты -->
    <div class="summary-contact">
      <p class="contact-text">Есть вопросы?</p>
      <a href="mailto:vp.vlad00@mail.ru" class="contact-link">
        📧 vp.vlad00@mail.ru
      </a>
      <a href="https://t.me/vinatian00" target="_blank" class="contact-link">
        💬 @vinatian00
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const { withFallback, onImgError } = useImageFallback()
const props = defineProps({
  template: {
    type: Object,
    required: true
  },
  selectedFeatures: {
    type: Array,
    default: () => []
  },
  featuresData: {
    type: Array,
    default: () => []
  },
  customization: {
    type: Object,
    default: () => ({})
  }
})

const isSticky = ref(false)

const basePrice = computed(() => {
  return props.template.base_price || 0
})

const additionalCosts = computed(() => {
  // TODO: Рассчитать дополнительные расходы на основе выбранных опций
  return props.featuresData.reduce((sum, f) => sum + (f.price * 100), 0) // цены в копейках
})

const totalPrice = computed(() => {
  return basePrice.value + additionalCosts.value
})

const formatPrice = (priceInCents) => {
  const priceInRubles = priceInCents / 100
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(priceInRubles)
}

const formatDuration = (minutes) => {
  if (!minutes) return 'Не указано'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
  }
  return `${mins}м`
}

const getLocationType = (type) => {
  const types = {
    city: 'По городу',
    park: 'Парк',
    indoor: 'В помещении',
    universal: 'Универсальный'
  }
  return types[type] || type
}

const handleScroll = () => {
  isSticky.value = window.scrollY > 200
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.order-summary {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.order-summary.sticky {
  position: sticky;
  top: 100px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.summary-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.summary-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.template-preview {
  display: flex;
  gap: 12px;
}

.template-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.template-info {
  flex: 1;
}

.template-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.template-category {
  font-size: 0.85rem;
  color: #718096;
  margin: 0;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #4a5568;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  gap: 12px;
}

.item-label {
  color: #718096;
}

.item-value {
  color: #2d3748;
  font-weight: 600;
  text-align: right;
}

.item-icon {
  width: 18px;
  height: 18px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.price-label {
  color: #718096;
}

.price-value {
  color: #2d3748;
  font-weight: 600;
}

.price-total {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 2px solid #e2e8f0;
}

.total-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.summary-guarantees {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.guarantee-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #4a5568;
  margin-bottom: 8px;
}

.guarantee-item:last-child {
  margin-bottom: 0;
}

.guarantee-icon {
  width: 18px;
  height: 18px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.summary-contact {
  text-align: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.contact-text {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #718096;
}

.contact-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.contact-link:hover {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .order-summary.sticky {
    position: static;
  }
}
</style>