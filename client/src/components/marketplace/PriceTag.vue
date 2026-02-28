<template>
  <div class="price-tag">
    <span v-if="isFree" class="price-free">
      Бесплатно
    </span>
    <span v-else class="price-amount">
      {{ formattedPrice }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  price: {
    type: Number,
    required: true
  },
  isFree: {
    type: Boolean,
    default: false
  }
})

const formattedPrice = computed(() => {
  if (props.isFree) return 'Бесплатно'
  
  // Цена хранится в копейках, конвертируем в рубли
  const priceInRubles = props.price / 100
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(priceInRubles)
})
</script>

<style scoped>
.price-tag {
  font-weight: 700;
  font-size: 1.25rem;
}

@media (max-width: 640px) {
  .price-tag {
    font-size: 0.82rem;
  }
}

.price-free {
  color: #48bb78;
}

.price-amount {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>