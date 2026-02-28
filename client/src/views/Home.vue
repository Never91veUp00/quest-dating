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
            Создам персональный квест специально для вас и вашей второй половинки — 
            уникальный сценарий, живые эмоции, готовится от 24 часов.
          </p>
          <div class="hero-actions">
            <router-link to="/templates" class="btn-primary">
              🎯 Выбрать квест
            </router-link>
            <router-link to="/about" class="btn-secondary">
              О создателе
            </router-link>
          </div>

          <!-- Быстрая статистика -->
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-number">10+</div>
              <div class="stat-label">Шаблонов квестов</div>
            </div>
            <div class="stat">
              <div class="stat-number">от 24ч</div>
              <div class="stat-label">Срок выполнения</div>
            </div>
            <div class="stat">
              <div class="stat-number">100%</div>
              <div class="stat-label">Персональный подход</div>
            </div>
          </div>
        </div>

        <div class="hero-image">
          <img src="/images/Love is in the air-bro.svg" alt="Quest Dating — романтический квест" />
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
          <h2 class="section-title"><span class="title-emoji">✨</span> Избранные квесты</h2>
          <router-link to="/templates?featured=true" class="link-more">
            Смотреть все →
          </router-link>
        </div>

        <div class="scroll-fade-wrap">
          <TemplateGrid :templates="featuredTemplates" :loading="featuredLoading" />
        </div>
      </div>
    </section>

    <!-- Популярные шаблоны -->
    <section class="popular-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title"><span class="title-emoji">🔥</span> Популярные квесты</h2>
          <router-link to="/templates?sort_by=orders" class="link-more">
            Смотреть все →
          </router-link>
        </div>

        <div class="scroll-fade-wrap">
          <TemplateGrid :templates="popularTemplates" :loading="popularLoading" />
        </div>
      </div>
    </section>

    <!-- Как это работает -->
    <section class="how-it-works">
      <div class="container">
        <h2 class="section-title">Как это работает</h2>
        <p class="section-description">Всего 4 простых шага до вашего идеального свидания</p>

        <div class="scroll-fade-wrap scroll-fade-wrap--dark">
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
              Я подготовлю персональный квест и отправлю вам все необходимые материалы на email
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
      </div>
    </section>

    <!-- Отзывы -->
    <section class="testimonials-section">
      <div class="container">
        <h2 class="section-title">💬 Что говорят наши клиенты</h2>
        <p class="section-description">Реальные отзывы от пар, которые уже прошли квест</p>

        <div class="scroll-fade-wrap">
        <div class="testimonials-grid">
          <TestimonialCard
            v-for="testimonial in testimonials"
            :key="testimonial.id"
            :testimonial="testimonial"
          />
        </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Готовы создать незабываемое свидание?</h2>
          <p class="cta-description">
            Выберите шаблон — и я адаптирую его специально под вас
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
import TemplateGrid from '@/components/marketplace/TemplateGrid.vue'
import CategoryCard from '@/components/marketplace/CategoryCard.vue'
import TestimonialCard from '@/components/marketplace/TestimonialCard.vue'
import api from '@/services/api'
import Loader from '@/components/common/Loader.vue'
import { useToast } from '@/composables/useToast'

const questStore = useQuestStore()
const toast = useToast()

const categories = ref([])
const featuredTemplates = ref([])
const popularTemplates = ref([])

const categoriesLoading = ref(true)
const featuredLoading = ref(true)
const popularLoading = ref(true)

const testimonials = ref([])
const testimonialsLoading = ref(true)

const AVATARS = ['👫', '💑', '🥰', '💕', '❤️', '✨']

const loadTestimonials = async () => {
  try {
    const res = await api.getFeaturedReviews(6)
    const rows = res.data || res || []
    testimonials.value = rows.map((r, i) => ({
      id:       r.id,
      rating:   r.rating,
      text:     r.comment,
      name:     r.client_name,
      avatar:   AVATARS[i % AVATARS.length],
      template: r.template_title || null
    }))
  } catch {
    // Fallback — показываем заглушки если API недоступен
    testimonials.value = []
  } finally {
    testimonialsLoading.value = false
  }
}

const loadData = async () => {
  loadTestimonials()
  categoriesLoading.value = true
  featuredLoading.value = true
  popularLoading.value = true

  const [cats, featured, popular] = await Promise.allSettled([
    questStore.fetchCategories(),
    questStore.fetchFeaturedTemplates(6),
    questStore.fetchPopularTemplates(6)
  ])

  if (cats.status === 'fulfilled') {
    categories.value = cats.value || []
  } else {
    toast.error('Не удалось загрузить категории')
  }
  categoriesLoading.value = false

  if (featured.status === 'fulfilled') {
    featuredTemplates.value = featured.value || []
  }
  featuredLoading.value = false

  if (popular.status === 'fulfilled') {
    popularTemplates.value = popular.value || []
  }
  popularLoading.value = false
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
  display: flex;
  align-items: center;
  gap: 0;
}

.stat {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  position: relative;
}

.stat + .stat::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: rgba(255,255,255,0.3);
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 900;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.8;
  line-height: 1.3;
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
  /* padding: 0 20px; */
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
  white-space: nowrap;
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

/* Mobile card-stack (cardholder) */
@media (max-width: 640px) {
  .categories-grid.stack-mode {
    display: block;
    position: relative;
    /* height set by JS via --stack-height, fallback below */
  }
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
  padding-top: 24px;
}

.step {
  text-align: center;
  position: relative;
  padding: 44px 24px 28px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
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
    gap: 0;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .stat-label {
    font-size: 0.65rem;
  }

  /* Hero image becomes background on mobile */
  .hero {
    background:
      linear-gradient(
        to bottom,
        rgba(102, 126, 234, 0.82) 0%,
        rgba(118, 75, 162, 0.88) 100%
      ),
      url('/images/Love is in the air-bro.svg') center / cover no-repeat;
    padding: 72px 0 48px;
  }

  .hero-image {
    display: none;
  }

  .hero .container {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    margin-bottom: 10px;
  }

  .section-header .section-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .title-emoji {
    display: none;
  }

  .link-more {
    font-size: 0.65rem;
    opacity: 0.55;
    letter-spacing: 0.01em;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  /* ── Section titles ── */
  .section-title {
    font-size: 1.2rem;
  }

  .section-description {
    display: none;
  }

  /* ── Categories ── */
  .categories-section {
    padding: 28px 0;
  }

  .categories-section .container {
    padding: 0;
  }

  .categories-section .section-title,
  .categories-section .section-description {
    padding: 0 20px;
  }

  /* Card-stack / cardholder effect for categories */
  .categories-grid {
    display: flex;
    flex-direction: column;
    padding: 0 20px;
    gap: 0;
  }

  .categories-grid > *:not(:first-child) {
    margin-top: -18px;
  }

  /* Each card slightly smaller and more opaque as it goes down */
  .categories-grid > *:nth-child(1) { z-index: 5; position: relative; transform: rotate(-0.5deg); }
  .categories-grid > *:nth-child(2) { z-index: 4; position: relative; transform: rotate(0.3deg); }
  .categories-grid > *:nth-child(3) { z-index: 3; position: relative; transform: rotate(-0.4deg); }
  .categories-grid > *:nth-child(4) { z-index: 2; position: relative; transform: rotate(0.5deg); }
  .categories-grid > *:nth-child(5) { z-index: 1; position: relative; transform: rotate(-0.3deg); }

  /* On tap/hover — lift the card */
  .categories-grid > *:hover,
  .categories-grid > *:focus-within {
    transform: translateY(-8px) rotate(0deg) !important;
    z-index: 10 !important;
    box-shadow: 0 16px 40px rgba(0,0,0,0.18);
  }

  /* ── Featured & Popular ── */
  .featured-section,
  .popular-section {
    padding: 28px 0;
  }

  .featured-section .section-header,
  .popular-section .section-header {
    padding-left: 20px;
    padding-right: 20px;
  }

  /* Fade: only on the inner template-grid (not wrapper) using sibling trick */

  /* ── How it works ── */
  .how-it-works {
    padding: 28px 0;
  }

  .steps-grid {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    gap: 16px;
    padding-bottom: 12px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin: 0 -20px;
    padding-left: 20px;
  }

  .steps-grid::-webkit-scrollbar { display: none; }

  .step {
    flex: 0 0 160px;
    scroll-snap-align: start;
    padding: 36px 12px 14px;
    align-self: stretch;
  }

  .steps-grid {
    padding-top: 20px;
  }

  .step-icon {
    font-size: 1.7rem;
    margin-bottom: 6px;
  }

  .step-title {
    font-size: 0.82rem;
  }

  .step-description {
    font-size: 0.73rem;
  }

  /* ── Testimonials ── */
  .testimonials-section {
    padding: 28px 0;
  }

  .testimonials-grid {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    gap: 16px;
    padding-bottom: 12px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin: 0 -20px;
    padding-left: 20px;
  }


  .testimonials-grid::-webkit-scrollbar { display: none; }


  .testimonials-grid > * {
    flex: 0 0 240px;
    scroll-snap-align: start;
    align-self: stretch;
  }
}



</style>