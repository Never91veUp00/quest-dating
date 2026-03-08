<template>
  <div class="order-page">
    <div v-if="loading" class="loading-container">
      <Loader text="Загружаем информацию о квесте..." size="large" />
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">😕</div>
        <h2>Квест не найден</h2>
        <p>{{ error }}</p>
        <NuxtLink to="/catalog" class="btn-back">← Вернуться в каталог</NuxtLink>
      </div>
    </div>

    <div v-else-if="template" class="order-content">
      <div class="container">
        <Breadcrumbs :crumbs="breadcrumbs" />
      </div>

      <section class="order-header">
        <div class="container">
          <h1 class="page-title">Оформление заказа</h1>
          <p class="page-description">
            Заполните форму ниже, и Влад подготовит персональный свидание-квест
          </p>
        </div>
      </section>

      <section class="order-main">
        <div class="container">
          <div class="order-layout">
            <div class="order-form-section">
              <OrderForm
                :template="template"
                @submit="handleOrderSubmit"
                @update:features="selectedFeatures = $event"
                @update:customization="customization = $event"
                @update:featuresData="featuresData = $event"
              />
            </div>
            <aside class="order-summary-section">
              <OrderSummary
                :template="template"
                :selected-features="selectedFeatures"
                :features-data="featuresData"
                :customization="customization"
              />
            </aside>
          </div>
        </div>
      </section>

      <Modal v-model="showSuccessModal" size="medium" :closable="false">
        <div class="success-modal">
          <div class="success-icon">🎉</div>
          <h2 class="success-title">Заказ успешно оформлен!</h2>
          <p class="success-message">
            Влад получил ваш заказ и уже начал работу над вашим свиданием-квестом.
            В течение нескольких часов вы получите на email {{ orderEmail }} готовый квест
            со всеми необходимыми материалами.
          </p>
          <div class="success-details">
            <div class="detail-item">
              <span class="detail-label">Номер заказа:</span>
              <span class="detail-value">#{{ orderId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Квест:</span>
              <span class="detail-value">{{ template.title }}</span>
            </div>
            <div v-if="orderFeatures.length > 0" class="detail-item detail-features">
              <span class="detail-label">Дополнительно:</span>
              <span class="detail-value features-list">
                <span v-for="f in orderFeatures" :key="f.value" class="feature-chip">
                  {{ f.icon }} {{ f.name }} +{{ f.price }} р
                </span>
              </span>
            </div>
            <div class="detail-item detail-total">
              <span class="detail-label">Итого:</span>
              <span class="detail-value total-highlight">{{ formatPrice(orderTotal || template.base_price) }}</span>
            </div>
          </div>
          <div class="success-actions">
            <NuxtLink to="/" class="btn-home">На главную</NuxtLink>
            <NuxtLink to="/catalog" class="btn-browse">Смотреть другие квесты</NuxtLink>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const route  = useRoute()
const toast  = useToast()
const { getDate, createOrder } = useDatesApi()

const template         = ref(null)
const loading          = ref(true)
const error            = ref(null)
const selectedFeatures = ref([])
const featuresData     = ref([])
const customization    = ref({})
const showSuccessModal = ref(false)
const orderId          = ref(null)
const orderEmail       = ref('')
const orderTotal       = ref(0)
const orderFeatures    = ref([])

useSeoMeta({
  title: () => template.value
    ? `Заказать "${template.value.title}" | Quest Dating`
    : 'Оформление заказа | Quest Dating',
})

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Сценарии свиданий-квестов', to: '/catalog' },
  { label: template.value?.title || 'Квест', to: `/date/${route.params.templateSlug}` },
  { label: 'Оформление заказа' },
])

const loadTemplate = async () => {
  loading.value = true
  error.value   = null
  try {
    const res = await getDate(route.params.templateSlug)
    template.value = res?.data ?? res
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить квест'
  } finally {
    loading.value = false
  }
}

const handleOrderSubmit = async (orderData) => {
  try {
    const response = await createOrder({
      ...orderData,
      template_id: template.value.id,
    })
    orderId.value          = response?.data?.id ?? response?.id
    orderEmail.value       = orderData.client_email
    orderTotal.value       = parseFloat(response?.data?.total_price ?? response?.total_price ?? 0)
    orderFeatures.value    = featuresData.value
    showSuccessModal.value = true
  } catch (err) {
    toast.error(err.message || 'Произошла ошибка при оформлении заказа. Попробуйте снова.')
  }
}

onMounted(loadTemplate)
function formatPrice(priceInCents, showCurrency = true) {
  if (priceInCents === null || priceInCents === undefined) {
    return showCurrency ? '0 ₽' : '0'
  }

  const priceInRubles = priceInCents / 100

  if (showCurrency) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(priceInRubles)
  }

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(priceInRubles)
}
</script>

<style scoped>
.order-page { min-height: 100vh; background: #f7fafc; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.loading-container, .error-container { display: flex; justify-content: center; align-items: center; min-height: 60vh; padding: 40px 20px; }
.error-content { text-align: center; max-width: 500px; }
.error-icon { font-size: 5rem; margin-bottom: 24px; }
.error-content h2 { font-size: 2rem; font-weight: 700; color: #2d3748; margin: 0 0 12px 0; }
.error-content p { color: #718096; margin: 0 0 32px 0; }
.btn-back { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; transition: all 0.3s; }
.order-header { background: white; padding: 48px 0; border-bottom: 1px solid #e2e8f0; }
.page-title { font-size: 2.5rem; font-weight: 900; color: #2d3748; margin: 0 0 12px 0; }
.page-description { font-size: 1.1rem; color: #718096; margin: 0; }
.order-main { padding: 48px 0; }
.order-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; align-items: flex-start; }
.success-modal { text-align: center; padding: 20px; }
.success-icon { font-size: 4rem; margin-bottom: 16px; }
.success-title { font-size: 1.75rem; font-weight: 800; color: #2d3748; margin: 0 0 16px 0; }
.success-message { color: #718096; line-height: 1.6; margin: 0 0 24px 0; }
.success-details { background: #f7fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left; }
.detail-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
.detail-item:last-child { border-bottom: none; }
.detail-label { color: #718096; font-size: 0.9rem; }
.detail-value { color: #2d3748; font-weight: 600; }
.detail-total .detail-label, .detail-total .total-highlight { font-size: 1.1rem; font-weight: 800; color: #667eea; }
.features-list { display: flex; flex-wrap: wrap; gap: 6px; }
.feature-chip { background: #edf2f7; border-radius: 6px; padding: 2px 8px; font-size: 0.85rem; color: #4a5568; }
.success-actions { display: flex; gap: 16px; justify-content: center; }
.btn-home, .btn-browse { padding: 12px 24px; border-radius: 10px; font-weight: 600; text-decoration: none; transition: all 0.3s; }
.btn-home { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-browse { background: #edf2f7; color: #4a5568; }
@media (max-width: 1024px) { .order-layout { grid-template-columns: 1fr; } }
@media (max-width: 768px) { .page-title { font-size: 1.75rem; } .success-actions { flex-direction: column; } }
</style>