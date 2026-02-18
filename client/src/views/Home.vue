<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            Превратите свидание в <span class="gradient-text">незабываемое приключение</span>
          </h1>
          <p class="hero-description">
            Готовые шаблоны квестов от профессиональных авторов. 
            Выберите, настройте под себя и удивите свою вторую половинку!
          </p>
          <div class="hero-actions">
            <router-link to="/templates" class="btn-primary">
              🎯 Выбрать квест
            </router-link>
            <router-link to="/about" class="btn-secondary">
              Узнать больше
            </router-link>
          </div>

          <!-- Быстрая статистика -->
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-number">150+</div>
              <div class="stat-label">Шаблонов квестов</div>
            </div>
            <div class="stat">
              <div class="stat-number">50+</div>
              <div class="stat-label">Авторов</div>
            </div>
            <div class="stat">
              <div class="stat-number">1000+</div>
              <div class="stat-label">Довольных пар</div>
            </div>
          </div>
        </div>

        <div class="hero-image">
          <!-- <img src="/images/hero-illustration.svg" alt="Quest Dating" /> -->
          <img src="/images/placeholder.svg" alt="Hero">
        </div>
      </div>
    </section>

    <!-- Категории -->
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">Популярные категории</h2>
        <p class="section-description">Найдите идеальный квест для вашего свидания</p>

        <div v-if="categoriesLoading" class="loading-state">
          <Loader text="Загружаем категории..." />
        </div>

        <div v-else class="categories-grid">
          <CategoryCard
            v-for="category in categories"
            :key="category.id"
            :category="category"
          />
        </div>
      </div>
    </section>

    <!-- Избранные шаблоны -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">✨ Избранные квесты</h2>
            <p class="section-description">Лучшие шаблоны от наших авторов</p>
          </div>
          <router-link to="/templates?featured=true" class="link-more">
            Смотреть все →
          </router-link>
        </div>

        <div v-if="featuredLoading" class="loading-state">
          <Loader text="Загружаем квесты..." />
        </div>

        <div v-else class="templates-grid">
          <TemplateCard
            v-for="template in featuredTemplates"
            :key="template.id"
            :template="template"
          />
        </div>
      </div>
    </section>

    <!-- Популярные шаблоны -->
    <section class="popular-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">🔥 Популярные квесты</h2>
            <p class="section-description">Что заказывают чаще всего</p>
          </div>
          <router-link to="/templates?sort_by=orders" class="link-more">
            Смотреть все →
          </router-link>
        </div>

        <div v-if="popularLoading" class="loading-state">
          <Loader text="Загружаем квесты..." />
        </div>

        <div v-else class="templates-grid">
          <TemplateCard
            v-for="template in popularTemplates"
            :key="template.id"
            :template="template"
          />
        </div>
      </div>
    </section>

    <!-- Как это работает -->
    <section class="how-it-works">
      <div class="container">
        <h2 class="section-title">Как это работает</h2>
        <p class="section-description">Всего 4 простых шага до вашего идеального свидания</p>

        <div class="steps-grid">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-icon">🔍</div>
            <h3 class="step-title">Выберите квест</h3>
            <p class="step-description">
              Просмотрите каталог готовых шаблонов и найдите подходящий для вашего свидания
            </p>
          </div>

          <div class="step">
            <div class="step-number">2</div>
            <div class="step-icon">✏️</div>
            <h3 class="step-title">Настройте под себя</h3>
            <p class="step-description">
              Укажите детали: локацию, дату, особые пожелания. Мы адаптируем квест специально для вас
            </p>
          </div>

          <div class="step">
            <div class="step-number">3</div>
            <div class="step-icon">⏱️</div>
            <h3 class="step-title">Получите за 24 часа</h3>
            <p class="step-description">
              Мы подготовим персональный квест и отправим вам все необходимые материалы
            </p>
          </div>

          <div class="step">
            <div class="step-number">4</div>
            <div class="step-icon">🎉</div>
            <h3 class="step-title">Наслаждайтесь приключением</h3>
            <p class="step-description">
              Проведите незабываемое свидание и создайте особенные воспоминания вместе
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Отзывы -->
    <section class="testimonials-section">
      <div class="container">
        <h2 class="section-title">💬 Что говорят наши клиенты</h2>
        <p class="section-description">Реальные отзывы от довольных пар</p>

        <div class="testimonials-grid">
          <TestimonialCard
            v-for="testimonial in testimonials"
            :key="testimonial.id"
            :testimonial="testimonial"
          />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Готовы создать незабываемое свидание?</h2>
          <p class="cta-description">
            Более 150 готовых шаблонов квестов ждут вас
          </p>
          <router-link to="/templates" class="btn-cta">
            🎯 Выбрать квест сейчас
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuestStore } from '@/store'
import TemplateCard from '@/components/marketplace/TemplateCard.vue'
import CategoryCard from '@/components/marketplace/CategoryCard.vue'
import TestimonialCard from '@/components/marketplace/TestimonialCard.vue'
import Loader from '@/components/common/Loader.vue'

const questStore = useQuestStore()

const categories = ref([])
const featuredTemplates = ref([])
const popularTemplates = ref([])

const categoriesLoading = ref(true)
const featuredLoading = ref(true)
const popularLoading = ref(true)

// Фейковые отзывы для демонстрации
const testimonials = ref([
  {
    id: 1,
    rating: 5,
    text: 'Это было лучшее свидание в моей жизни! Квест был идеально продуман, каждая локация - сюрприз. Моя девушка была в восторге!',
    author: 'Алексей',
    template: 'Романтический детектив'
  },
  {
    id: 2,
    rating: 5,
    text: 'Заказали квест на годовщину отношений. Организация на высшем уровне, все прошло гладко. Очень рекомендую!',
    author: 'Мария',
    template: 'Тайна старого города'
  },
  {
    id: 3,
    rating: 5,
    text: 'Впервые пробовали такой формат свидания. Получили море эмоций и впечатлений! Уже планируем следующий квест.',
    author: 'Дмитрий',
    template: 'Приключение в парке'
  }
])

const loadData = async () => {
  try {
    // Загружаем категории
    categoriesLoading.value = true
    categories.value = await questStore.fetchCategories()
    categoriesLoading.value = false

    // Загружаем избранные шаблоны
    featuredLoading.value = true
    featuredTemplates.value = await questStore.fetchFeaturedTemplates(6)
    featuredLoading.value = false

    // Загружаем популярные шаблоны
    popularLoading.value = true
    popularTemplates.value = await questStore.fetchPopularTemplates(6)
    popularLoading.value = false
  } catch (error) {
    console.error('Error loading home page data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0 80px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/images/pattern.svg') repeat;
  opacity: 0.1;
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.2;
  margin: 0 0 24px 0;
}

.gradient-text {
  background: linear-gradient(to right, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0 0 32px 0;
  opacity: 0.95;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.btn-primary,
.btn-secondary {
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.hero-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Sections */
.categories-section,
.featured-section,
.popular-section,
.how-it-works,
.testimonials-section {
  padding: 80px 0;
}

.categories-section {
  background: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 12px 0;
  text-align: center;
}

.section-description {
  font-size: 1.1rem;
  color: #718096;
  text-align: center;
  margin: 0 0 48px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
}

.section-header .section-title,
.section-header .section-description {
  text-align: left;
  margin-bottom: 0;
}

.section-header .section-description {
  margin-top: 8px;
}

.link-more {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s;
}

.link-more:hover {
  color: #764ba2;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

/* How it works */
.how-it-works {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.step {
  text-align: center;
  position: relative;
  padding: 32px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.step:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.step-number {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.step-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.step-description {
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

/* Testimonials */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 16px 0;
}

.cta-description {
  font-size: 1.25rem;
  margin: 0 0 32px 0;
  opacity: 0.95;
}

.btn-cta {
  padding: 18px 48px;
  background: white;
  color: #667eea;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .hero .container {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .hero-image {
    order: -1;
  }

  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 60px 0 40px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-stats {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }
}
</style>