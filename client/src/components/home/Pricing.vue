<template>
  <section id="pricing" class="pricing">
    <div class="container">
      <h2 class="section-title">Прозрачные цены</h2>
      <p class="section-subtitle">
        Выберите подходящий вариант для вашего особенного дня
      </p>

      <div class="pricing-toggle">
        <button 
          :class="{ active: !isAnnual }" 
          @click="isAnnual = false"
        >
          Разовые квесты
        </button>
        <button 
          :class="{ active: isAnnual }" 
          @click="isAnnual = true"
        >
          Подписка
          <span class="badge">-20%</span>
        </button>
      </div>

      <div class="pricing-cards">
        <div 
          v-for="(plan, index) in pricingPlans" 
          :key="index"
          class="pricing-card"
          :class="{ 'pricing-featured': plan.featured }"
        >
          <div v-if="plan.featured" class="featured-badge">
            ⭐ Популярный выбор
          </div>

          <div class="plan-header">
            <h3 class="plan-name">{{ plan.name }}</h3>
            <div class="plan-price">
              <span class="currency">₽</span>
              <span class="amount">{{ isAnnual && plan.monthlyPrice ? plan.monthlyPrice : plan.price }}</span>
              <span class="period" v-if="isAnnual && plan.monthlyPrice">/месяц</span>
            </div>
            <p class="plan-description">{{ plan.description }}</p>
          </div>

          <ul class="plan-features">
            <li 
              v-for="(feature, idx) in plan.features" 
              :key="idx"
              class="feature-item"
            >
              <span class="feature-icon">✓</span>
              {{ feature }}
            </li>
          </ul>

          <button 
            class="plan-button"
            :class="{ 'plan-button-featured': plan.featured }"
            @click="selectPlan(plan)"
          >
            {{ plan.buttonText || 'Выбрать план' }}
          </button>

          <p v-if="isAnnual && plan.monthlyPrice" class="annual-note">
            {{ plan.price * 12 }}₽ в год (экономия {{ (plan.price * 12 * 0.2).toFixed(0) }}₽)
          </p>
        </div>
      </div>

      <div class="pricing-faq">
        <h3>Часто задаваемые вопросы</h3>
        <div class="faq-grid">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="faq-item"
            @click="toggleFaq(index)"
          >
            <div class="faq-question">
              <span>{{ faq.question }}</span>
              <span class="faq-icon" :class="{ 'faq-open': openFaq === index }">▼</span>
            </div>
            <transition name="faq-slide">
              <div v-if="openFaq === index" class="faq-answer">
                {{ faq.answer }}
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAnnual = ref(false)
const openFaq = ref(null)

const pricingPlans = [
  {
    name: 'Simple',
    price: 2990,
    description: 'Идеально для первого свидания',
    features: [
      'Один готовый шаблон',
      '3 локации на карте',
      '3 простых задания',
      'Базовая персонализация',
      'Доступ на 7 дней',
      'Поддержка 24/7'
    ],
    buttonText: 'Начать'
  },
  {
    name: 'Gamer',
    price: 5990,
    monthlyPrice: 4790,
    description: 'Полное погружение в квест',
    featured: true,
    features: [
      'Любой шаблон или свой сценарий',
      'До 7 локаций',
      '7+ разнообразных заданий',
      'Загадки и головоломки',
      'Система достижений',
      'Таймеры и подсказки',
      'Кастомный дизайн',
      'Доступ на 30 дней',
      'Приоритетная поддержка'
    ],
    buttonText: 'Популярный выбор'
  },
  {
    name: 'Premium',
    price: 9990,
    monthlyPrice: 7990,
    description: 'Максимальная персонализация',
    features: [
      'Полностью уникальный квест',
      'Неограниченное количество локаций',
      'Сложные интерактивные задания',
      'Мультимедиа контент',
      'Реальные QR-коды в локациях',
      'Партнёрские сюрпризы',
      'Белый лейбл (без брендинга)',
      'Доступ на 90 дней',
      'Личный менеджер'
    ],
    buttonText: 'VIP квест'
  }
]

const faqs = [
  {
    question: 'Как быстро будет готов квест?',
    answer: 'Стандартный срок — 24 часа. Для Premium плана с эксклюзивным сценарием может потребоваться до 48 часов. Срочное изготовление (6-12 часов) доступно за дополнительную плату.'
  },
  {
    question: 'Можно ли изменить квест после создания?',
    answer: 'Да! В течение срока доступа вы можете запросить правки. Мелкие изменения (тексты, время) — бесплатно. Добавление новых локаций или заданий — за дополнительную плату.'
  },
  {
    question: 'Что если партнёр не сможет пройти квест в назначенный день?',
    answer: 'Квест доступен в течение указанного срока (7-90 дней в зависимости от тарифа). Можно пройти в любой удобный день. Также можно продлить доступ.'
  },
  {
    question: 'Нужно ли скачивать приложение?',
    answer: 'Нет! Квест работает в браузере на любом устройстве. Просто откройте ссылку на телефоне — и можно начинать.'
  },
  {
    question: 'Можно ли использовать квест в другом городе?',
    answer: 'Конечно! При заказе укажите нужный город, и мы адаптируем локации. Также есть шаблоны для домашних квестов, которые работают везде.'
  },
  {
    question: 'Что включает партнёрский сюрприз в Premium?',
    answer: 'Мы размещаем реальные подарки или сюрпризы в кафе/магазинах по маршруту (цветы, десерт, записка). Стоимость подарков оплачивается отдельно.'
  }
]

const selectPlan = (plan) => {
  router.push({
    path: '/order',
    query: { 
      plan: plan.name.toLowerCase(),
      subscription: isAnnual.value ? 'annual' : 'onetime'
    }
  })
}

const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index
}
</script>

<style scoped>
.pricing {
  padding: 100px 0;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  color: #2d3748;
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 40px;
}

.pricing-toggle {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 60px;
  background: #f7fafc;
  padding: 6px;
  border-radius: 12px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.pricing-toggle button {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pricing-toggle button.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge {
  background: #48bb78;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
}

.pricing-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px 32px;
  position: relative;
  transition: all 0.3s;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.pricing-featured {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  transform: scale(1.05);
}

.pricing-featured:hover {
  transform: scale(1.05) translateY(-8px);
}

.featured-badge {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.plan-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 2px solid #e2e8f0;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 12px;
}

.currency {
  font-size: 1.5rem;
  color: #4a5568;
}

.amount {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.period {
  font-size: 1rem;
  color: #718096;
}

.plan-description {
  font-size: 0.95rem;
  color: #718096;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
}

.feature-item {
  padding: 12px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.5;
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 700;
  font-size: 0.85rem;
}

.plan-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.plan-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.plan-button-featured {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.annual-note {
  text-align: center;
  font-size: 0.85rem;
  color: #718096;
  margin-top: 12px;
}

.pricing-faq {
  margin-top: 80px;
}

.pricing-faq h3 {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 40px;
  color: #2d3748;
}

.faq-grid {
  display: grid;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.faq-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #2d3748;
  gap: 16px;
}

.faq-icon {
  transition: transform 0.3s;
  color: #667eea;
  flex-shrink: 0;
}

.faq-open {
  transform: rotate(180deg);
}

.faq-answer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  color: #718096;
  line-height: 1.6;
}

.faq-slide-enter-active,
.faq-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.faq-slide-enter-from,
.faq-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
}

.faq-slide-enter-to,
.faq-slide-leave-from {
  opacity: 1;
  max-height: 300px;
}

@media (max-width: 1024px) {
  .pricing-cards {
    grid-template-columns: 1fr;
  }

  .pricing-featured {
    transform: scale(1);
  }

  .pricing-featured:hover {
    transform: translateY(-8px);
  }
}

@media (max-width: 640px) {
  .amount {
    font-size: 2.5rem;
  }

  .pricing-toggle {
    flex-direction: column;
  }
}
</style>