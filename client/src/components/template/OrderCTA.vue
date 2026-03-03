<template>
  <div class="order-cta" :class="{ sticky: isSticky }">
    <div class="cta-content">
      <!-- Цена -->
      <div class="cta-price">
        <div class="price-label">Стоимость</div>
        <PriceTag :price="template.base_price" :isFree="template.is_free" />
      </div>

      <!-- Кнопка заказа -->
      <router-link 
        :to="`/order/${template.slug}`"
        class="btn-order"
        data-testid="order-button"
      >
        🎯 Заказать квест
      </router-link>

      <!-- Дополнительная информация -->
      <div class="cta-details">
        <div class="detail-item">
          <span class="detail-icon">✓</span>
          <span>Готовность за 24 часа</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">✓</span>
          <span>Персональная адаптация</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">✓</span>
          <span>Поддержка 24/7</span>
        </div>
      </div>

      <!-- Гарантии -->
      <div class="cta-guarantee">
        <div class="guarantee-icon">🛡️</div>
        <div class="guarantee-text">
          <strong>Гарантия качества</strong>
          <p>Возврат денег в течение 7 дней, если квест не понравился</p>
        </div>
      </div>

      <!-- Счетчик заказов -->
      <div class="cta-social-proof">
        <div class="proof-icon">👥</div>
        <div class="proof-text">
          <strong>{{ template.orders_count || 0 }}</strong> человек уже заказали этот квест
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import PriceTag from '../marketplace/PriceTag.vue'

defineProps({
  template: {
    type: Object,
    required: true
  }
})

const isSticky = ref(false)

const handleScroll = () => {
  isSticky.value = window.scrollY > 300
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.order-cta {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.order-cta.sticky {
  position: sticky;
  top: 100px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.cta-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cta-price {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.price-label {
  font-size: 0.9rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.btn-order {
  padding: 18px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-order:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.cta-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #4a5568;
}

.detail-icon {
  width: 20px;
  height: 20px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.cta-guarantee {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #fbbf24;
  border-radius: 8px;
}

.guarantee-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.guarantee-text strong {
  color: #78350f;
  display: block;
  margin-bottom: 4px;
}

.guarantee-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #92400e;
  line-height: 1.4;
}

.cta-social-proof {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
}

.proof-icon {
  font-size: 1.5rem;
}

.proof-text {
  font-size: 0.85rem;
  color: #166534;
}

.proof-text strong {
  color: #15803d;
  font-size: 1rem;
}

@media (max-width: 1024px) {
  .order-cta.sticky {
    position: static;
  }
}
</style>