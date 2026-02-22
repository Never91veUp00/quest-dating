<template>
  <div class="order-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <Loader text="Загружаем информацию о шаблоне..." size="large" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">😞</div>
        <h2>Шаблон не найден</h2>
        <p>{{ error }}</p>
        <router-link to="/templates" class="btn-back">
          ← Вернуться к каталогу
        </router-link>
      </div>
    </div>

    <!-- Order Content -->
    <div v-else-if="template" class="order-content">
      <!-- Breadcrumbs -->
      <div class="container">
        <Breadcrumbs :crumbs="breadcrumbs" />
      </div>

      <!-- Header -->
      <section class="order-header">
        <div class="container">
          <h1 class="page-title">Оформление заказа</h1>
          <p class="page-description">
            Заполните форму ниже, и мы подготовим для вас персональный квест
          </p>
        </div>
      </section>

      <!-- Main Content -->
      <section class="order-main">
        <div class="container">
          <div class="order-layout">
            <!-- Order Form -->
            <div class="order-form-section">
              <OrderForm
                :template="template"
                @submit="handleOrderSubmit"
                @update:features="selectedFeatures = $event"
                @update:customization="customization = $event"
                @update:featuresData="featuresData = $event"
              />
            </div>

            <!-- Order Summary -->
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

      <!-- Success Modal -->
      <Modal v-model="showSuccessModal" size="medium" :closable="false">
        <div class="success-modal">
          <div class="success-icon">🎉</div>
          <h2 class="success-title">Заказ успешно оформлен!</h2>
          <p class="success-message">
            Мы получили ваш заказ и уже начали работу над квестом. 
            В течение нескольких дней вы получите на email {{ orderEmail }} готовый квест 
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

            <!-- Выбранные фичи -->
            <div v-if="orderFeatures.length > 0" class="detail-item detail-features">
              <span class="detail-label">Дополнительно:</span>
              <span class="detail-value features-list">
                <span v-for="f in orderFeatures" :key="f.value" class="feature-chip">
                  {{ f.icon }} {{ f.name }} +{{ f.price }} ₽
                </span>
              </span>
            </div>

            <div class="detail-item detail-total">
              <span class="detail-label">Итого:</span>
              <span class="detail-value total-highlight">{{ formatPrice(orderTotal || template.base_price) }}</span>
            </div>
          </div>
          <div class="success-actions">
            <router-link to="/" class="btn-home">
              На главную
            </router-link>
            <router-link to="/templates" class="btn-browse">
              Смотреть другие квесты
            </router-link>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestStore } from '@/store'
import { formatPrice } from '@/utils/formatters'
import { useToast } from '@/composables/useToast'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import Loader from '@/components/common/Loader.vue'
import Modal from '@/components/common/Modal.vue'
import OrderForm from '@/components/order/OrderForm.vue'
import OrderSummary from '@/components/order/OrderSummary.vue'

const route = useRoute()
const questStore = useQuestStore()
const toast = useToast()

const template = ref(null)
const loading = ref(true)
const error = ref(null)
const selectedFeatures = ref([])
const featuresData = ref([])  // полные объекты с name и price
const customization = ref({})
const showSuccessModal = ref(false)
const orderId = ref(null)
const orderEmail = ref('')
const orderTotal = ref(0)
const orderFeatures = ref([])

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Шаблоны', to: '/templates' },
  { label: template.value?.title || 'Шаблон', to: `/template/${route.params.templateSlug}` },
  { label: 'Оформление заказа' }
])

const loadTemplate = async () => {
  loading.value = true
  error.value = null

  try {
    const slug = route.params.templateSlug
    template.value = await questStore.fetchTemplate(slug)

    // Обновить meta tags
    if (template.value) {
      document.title = `Заказать "${template.value.title}" - Quest Dating`
    }
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить шаблон'
    console.error('Error loading template:', err)
  } finally {
    loading.value = false
  }
}

const handleOrderSubmit = async (orderData) => {
  try {
    const completeOrderData = {
      ...orderData,
      template_id: template.value.id
    }

    const response = await questStore.createOrder(completeOrderData)

    orderId.value = response.id
    orderEmail.value = orderData.client_email
    orderTotal.value = parseFloat(response.total_price)
    orderFeatures.value = featuresData.value

    showSuccessModal.value = true
  } catch (err) {
    console.error('Error creating order:', err)
    toast.error(err.message || 'Произошла ошибка при оформлении заказа. Попробуйте снова.')
  }
}

onMounted(() => {
  loadTemplate()
})
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 24px;
}

.error-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.error-content p {
  color: #718096;
  margin: 0 0 32px 0;
}

.btn-back {
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Header */
.order-header {
  background: white;
  padding: 40px 0;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.page-description {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

/* Main Content */
.order-main {
  padding: 60px 0 80px;
}

.order-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
}

.order-form-section {
  min-width: 0; /* Prevent grid overflow */
}

.order-summary-section {
  position: sticky;
  top: 100px;
  align-self: flex-start;
}

/* Success Modal */
.success-modal {
  text-align: center;
  padding: 20px;
}

.success-icon {
  font-size: 5rem;
  margin-bottom: 24px;
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.success-title {
  font-size: 2rem;
  font-weight: 900;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.success-message {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4a5568;
  margin: 0 0 32px 0;
}

.success-details {
  background: #f7fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #718096;
  font-weight: 500;
}

.detail-value {
  color: #2d3748;
  font-weight: 700;
}

.detail-features {
  align-items: flex-start;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.feature-chip {
  font-size: 0.85rem;
  color: #48bb78;
  font-weight: 600;
}

.detail-total {
  padding-top: 12px;
  margin-top: 4px;
  border-top: 2px solid #e2e8f0;
}

.total-highlight {
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-home,
.btn-browse {
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-home {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-browse {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-browse:hover {
  background: #f7fafc;
}

/* Responsive */
@media (max-width: 1024px) {
  .order-layout {
    grid-template-columns: 1fr;
  }

  .order-summary-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
  }

  .success-title {
    font-size: 1.5rem;
  }

  .success-message {
    font-size: 1rem;
  }

  .success-actions {
    flex-direction: column;
  }
}
</style>