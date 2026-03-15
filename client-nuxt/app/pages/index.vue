<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            Превратите свидание в <span class="gradient-text">незабываемое приключение</span>
          </h1>
          <p class="hero-description">
            Персональный сценарий для двоих — с вашими местами, вашей историей<br class="br-desktop"> и эмоциями, которые хочется помнить.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/catalog" class="btn-primary"> Выбрать квест</NuxtLink>
            <NuxtLink to="/about" class="btn-secondary">О создателе</NuxtLink>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-number">{{ stats?.total_templates ?? '...' }}</div>
              <div class="stat-label">Готовых сценариев</div>
            </div>
            <div class="stat">
              <div class="stat-number">за 24ч</div>
              <div class="stat-label">Срок создания</div>
            </div>
            <div class="stat">
              <div class="stat-number">с 2024</div>
              <div class="stat-label">Создаём квесты</div>
            </div>
          </div>
          <p class="hero-process">Общаемся с парой, уточняем детали, погружаемся в вашу историю</p>
        </div>
        <div class="hero-image">
          <img :src="heroImg" alt="Quest Dating — романтический свидание-квест" />
        </div>
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">Популярные категории</h2>
        <p class="section-description">Найдите идеальный квест для вашего свидания</p>
        <div v-if="homePending" class="loading-state">
          <Loader text="Загружаем категории..." />
        </div>
        <div v-else class="categories-grid">
          <CategoryCard v-for="cat in categories" :key="cat.id" :category="cat" />
        </div>
      </div>
    </section>

    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title"><span class="title-emoji"></span> Избранные квесты</h2>
          <NuxtLink to="/catalog?featured=true" class="link-more">Смотреть все </NuxtLink>
        </div>
        <div class="scroll-fade-wrap">
          <TemplateGrid :templates="featuredTemplates" :loading="homePending" :scroll="true" />
        </div>
      </div>
    </section>

    <section class="popular-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title"><span class="title-emoji"></span> Популярные квесты</h2>
          <NuxtLink to="/catalog?sort_by=orders" class="link-more">Смотреть все </NuxtLink>
        </div>
        <div class="scroll-fade-wrap">
          <TemplateGrid :templates="popularTemplates" :loading="homePending" :scroll="true" />
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <div class="container">
        <h2 class="section-title">Как это работает</h2>
        <p class="section-description">Всего 4 простых шага до вашего идеального свидания</p>
        <div class="scroll-fade-wrap scroll-fade-wrap--dark">
          <div class="steps-grid">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-icon"></div>
              <h3 class="step-title">Выберите квест</h3>
              <p class="step-description">Просмотрите каталог готовых шаблонов и найдите подходящий для вашего свидания</p>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-icon"></div>
              <h3 class="step-title">Настройте под себя</h3>
              <p class="step-description">Укажите детали: локацию, дату, особые пожелания. Мы адаптируем квест специально для вас</p>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-icon"></div>
              <h3 class="step-title">Получите за 24 часа</h3>
              <p class="step-description">Я подготовлю персональный квест и отправлю вам все необходимые материалы на email</p>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <div class="step-icon"></div>
              <h3 class="step-title">Наслаждайтесь приключением</h3>
              <p class="step-description">Проведите незабываемое свидание и создайте особенные воспоминания вместе</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="testimonials-section">
      <div class="container">
        <h2 class="section-title"> Что говорят наши клиенты</h2>
        <p class="section-description">Реальные отзывы от пар, которые уже прошли квест</p>
        <div class="scroll-fade-wrap">
          <div class="testimonials-grid">
            <TestimonialCard v-for="t in testimonials" :key="t.id" :testimonial="t" />
          </div>
        </div>
      </div>
    </section>


    <section class="blog-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title"><span class="title-emoji">✍️</span> Блог о свиданиях-квестах</h2>
          <NuxtLink to="/blog" class="link-more">Все статьи →</NuxtLink>
        </div>
        <p class="section-description">Идеи, советы и истории от Лизы Петри</p>
        <div class="blog-preview-grid">
          <NuxtLink
            v-for="post in blogPreview"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="blog-preview-card"
          >
            <div class="blog-preview-img">
              <img :src="post.image" :alt="post.title" loading="lazy" />
            </div>
            <div class="blog-preview-body">
              <span class="blog-preview-cat">{{ post.category }}</span>
              <h3 class="blog-preview-title">{{ post.title }}</h3>
              <span class="blog-preview-link">Читать →</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Готовы создать незабываемое свидание?</h2>
          <p class="cta-description">Выберите шаблон  и я адаптирую его специально под вас</p>
          <NuxtLink to="/catalog" class="btn-cta"> Выбрать квест сейчас</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BLOG_POSTS } from '~/data/blogPosts'

const heroImg = '/images/love-in-the-air.svg'
const { getCategories, getFeaturedDates, getPopularDates, getStats, getFeaturedReviews } = useDatesApi()

useSeoMeta({
  title:         'Quest Dating  персональные свидания-квесты',
  description:   'Создам персональный квест для вашего свидания. Уникальный сценарий под вашу пару  готов за 24 часа.',
  ogTitle:       'Quest Dating  персональные свидания-квесты',
  ogDescription: 'Превратите свидание в незабываемое приключение. Персональные романтические квесты от Влада.',
})

// cleanTemplates — просто пробрасываем данные как есть
// Проверка existsSync убрана: в Docker путь отличается, а @error на img покажет placeholder
function cleanTemplates(data) {
  return data
}

const { data: homeData, pending: homePending } = await useAsyncData('home-all', async () => {
  const [cats, feat, pop, st, rev] = await Promise.allSettled([
    getCategories(),
    getFeaturedDates({ limit: 6 }),
    getPopularDates({ limit: 6 }),
    getStats(),
    getFeaturedReviews(6),
  ])
  return {
    categories: cats.status === 'fulfilled' ? cats.value : null,
    featured:   feat.status === 'fulfilled' ? cleanTemplates(feat.value) : null,
    popular:    pop.status  === 'fulfilled' ? cleanTemplates(pop.value)  : null,
    stats:      st.status   === 'fulfilled' ? st.value   : null,
    reviews:    rev.status  === 'fulfilled' ? rev.value  : null,
  }
})

const categories        = computed(() => homeData.value?.categories?.data ?? homeData.value?.categories ?? [])
const featuredTemplates = computed(() => homeData.value?.featured?.data   ?? homeData.value?.featured   ?? [])
const popularTemplates  = computed(() => homeData.value?.popular?.data    ?? homeData.value?.popular    ?? [])
const stats             = computed(() => homeData.value?.stats?.data      ?? homeData.value?.stats      ?? {})

const AVATARS = ['', '', '', '', '', '']
const blogPreview = computed(() => BLOG_POSTS.slice(0, 3))

const testimonials = computed(() => {
  const rows = homeData.value?.reviews?.data ?? homeData.value?.reviews ?? []
  return rows.map((r, i) => ({
    id:       r.id,
    rating:   r.rating,
    text:     r.comment,
    name:     r.client_name,
    avatar:   AVATARS[i % AVATARS.length],
    template: r.template_title || null,
  }))
})
</script>

<style scoped>
.hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0 80px; position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; inset: 0; background: url('/images/pattern.svg') repeat; opacity: 0.1; }
.hero .container { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
.hero-content { max-width: 600px; }
.hero-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 3.5rem;
  font-weight: 600;
  line-height: 1.15;
  margin: 0 0 20px 0;
  letter-spacing: -0.01em;
}
.gradient-text {
  font-style: italic;
  font-weight: 900;
  font-size: 1.18em;
  line-height: 1.1;
  display: inline-block;
  background: linear-gradient(to right, #fde68a, #fb923c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 16px rgba(251,146,60,0.45));
}
.hero-description { font-size: 1.1rem; line-height: 1.7; margin: 0 0 32px 0; opacity: 0.88; font-weight: 300; }
.hero-actions { display: flex; gap: 16px; margin-bottom: 48px; }
.btn-primary, .btn-secondary {
  padding: 15px 32px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
  letter-spacing: 0.02em;
}
.btn-primary {
  background: white;
  color: #764ba2;
  box-shadow: 0 8px 28px rgba(0,0,0,0.18);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.25); }
.btn-secondary {
  background: transparent;
  color: white;
  border: 1.5px solid rgba(255,255,255,0.6);
}
.btn-secondary:hover { border-color: white; background: rgba(255,255,255,0.1); }
.hero-process {
  margin-top: 16px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.75);
  font-style: italic;
  letter-spacing: 0.01em;
}

.hero-stats { display: flex; align-items: center; }
.stat { flex: 1; text-align: center; padding: 12px 8px; position: relative; }
.stat + .stat::before { content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 1px; background: rgba(255,255,255,0.3); }
.stat-number { font-size: 1.6rem; font-weight: 900; margin-bottom: 4px; line-height: 1; }
.stat-label { font-size: 0.75rem; opacity: 0.8; line-height: 1.3; }
.hero-image { display: flex; align-items: center; justify-content: center; }
.hero-image img { max-width: 100%; height: auto; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
.categories-section, .featured-section, .popular-section, .how-it-works, .testimonials-section { padding: 80px 0; }
.categories-section { background: #f7fafc; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.section-title { font-size: 2.5rem; font-weight: 800; color: #2d3748; margin: 0 0 12px 0; text-align: center; }
.section-description { font-size: 1.1rem; color: #718096; text-align: center; margin: 0 0 48px 0; }
.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
.section-header .section-title { text-align: left; margin-bottom: 0; }
.link-more { color: #667eea; font-weight: 600; text-decoration: none; font-size: 1.1rem; transition: color 0.3s; white-space: nowrap; }
.link-more:hover { color: #764ba2; }
.loading-state { display: flex; justify-content: center; padding: 60px 20px; }
.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  overflow: hidden;
}

@media (max-width: 900px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.how-it-works { background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); }
.steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; padding-top: 24px; }
.step { text-align: center; position: relative; padding: 44px 24px 28px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: all 0.3s; display: flex; flex-direction: column; align-items: center; }
.step:hover { transform: translateY(-8px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.step-number { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; }
.step-icon { font-size: 4rem; margin-bottom: 20px; }
.step-title { font-size: 1.25rem; font-weight: 700; color: #2d3748; margin: 0 0 12px 0; }
.step-description { color: #718096; line-height: 1.6; margin: 0; }
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
.blog-section { padding: 60px 0; background: white; }
.blog-preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 24px; }
.blog-preview-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-decoration: none; color: inherit; transition: transform 0.3s, box-shadow 0.3s; display: flex; flex-direction: column; }
.blog-preview-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.blog-preview-img { height: 160px; overflow: hidden; }
.blog-preview-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.blog-preview-card:hover .blog-preview-img img { transform: scale(1.05); }
.blog-preview-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.blog-preview-cat { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #667eea; }
.blog-preview-title { font-size: 0.95rem; font-weight: 700; color: #2d3748; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.blog-preview-link { font-size: 0.85rem; font-weight: 600; color: #667eea; margin-top: auto; }

.cta-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 0; text-align: center; }
.cta-content { max-width: 700px; margin: 0 auto; }
.cta-title { font-size: 2.5rem; font-weight: 900; margin: 0 0 16px 0; }
.cta-description { font-size: 1.25rem; margin: 0 0 32px 0; opacity: 0.95; }
.btn-cta { padding: 18px 48px; background: white; color: #667eea; border-radius: 12px; font-weight: 700; font-size: 1.2rem; text-decoration: none; display: inline-block; transition: all 0.3s; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
.btn-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
@media (max-width: 1024px) {
  .hero .container { grid-template-columns: 1fr; gap: 40px; }
  .hero-image { order: -1; }
  .hero-title { font-size: 2.4rem; }
}
@media (max-width: 768px) {
  .blog-section { padding: 40px 0; }
  .blog-preview-grid {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 16px;
    padding-bottom: 12px;
    /* Убираем полосу прокрутки визуально, но оставляем функциональность */
    scrollbar-width: none;
  }
  .blog-preview-grid::-webkit-scrollbar { display: none; }
  .blog-preview-card {
    flex: 0 0 75vw;
    max-width: 300px;
    scroll-snap-align: start;
  }
  .hero { padding: 100px 0 48px; background: linear-gradient(to bottom, rgba(102,126,234,0.82) 0%, rgba(118,75,162,0.88) 100%), url('/images/love-in-the-air.svg') center / cover no-repeat; }
  .hero-image { display: none; }
  .hero .container { grid-template-columns: 1fr; }
  .hero-title { font-size: 1.9rem; }
  .hero-description { font-size: 1rem; }
  .hero-actions { flex-direction: column; }
  .stat-number { font-size: 1.3rem; }
  .stat-label { font-size: 0.65rem; }
  .section-title { font-size: 2rem; }
  .section-header { flex-direction: column; align-items: flex-start; gap: 2px; margin-bottom: 10px; }
  .title-emoji { display: none; }
  .link-more { font-size: 0.65rem; opacity: 0.55; }
  .steps-grid { grid-template-columns: 1fr; }
}
.br-desktop { display: inline; }
@media (max-width: 640px) {
  .br-desktop { display: none; }
  .section-title { font-size: 1.2rem; }
  .section-description { display: none; }
  .categories-section { padding: 28px 0; }
  .categories-section .container { padding: 0; }
  .categories-section .section-title { padding: 0 20px; }
  .categories-grid {
    display: flex;
    flex-direction: column;
    padding: 0 20px;
    gap: 0;
  }
  .categories-grid > *:not(:first-child) { margin-top: -18px; }
  .categories-grid > *:nth-child(1) { z-index: 5; position: relative; transform: rotate(-0.5deg); }
  .categories-grid > *:nth-child(2) { z-index: 4; position: relative; transform: rotate(0.3deg); }
  .categories-grid > *:nth-child(3) { z-index: 3; position: relative; transform: rotate(-0.4deg); }
  .categories-grid > *:nth-child(4) { z-index: 2; position: relative; transform: rotate(0.5deg); }
  .categories-grid > *:nth-child(5) { z-index: 1; position: relative; transform: rotate(-0.3deg); }
  .categories-grid > *:hover, .categories-grid > *:focus-within { transform: translateY(-8px) rotate(0deg) !important; z-index: 10 !important; box-shadow: 0 16px 40px rgba(0,0,0,0.18); }
  .featured-section, .popular-section { padding: 28px 0; }
  .featured-section .container, .popular-section .container { padding: 0; }
  .featured-section .section-header, .popular-section .section-header { padding-left: 20px; padding-right: 20px; }
  .how-it-works { padding: 28px 0; }
  .how-it-works .container, .testimonials-section .container { padding: 0; }
  .how-it-works .section-title { padding-left: 20px; }
  .steps-grid { display: flex; flex-direction: row; overflow-x: auto; gap: 16px; padding-bottom: 12px; padding-top: 20px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .steps-grid::-webkit-scrollbar { display: none; }
  .steps-grid > .step:first-child { margin-left: 20px; }
  .step { flex: 0 0 160px; scroll-snap-align: start; padding: 36px 12px 14px; align-self: stretch; }
  .step-icon { font-size: 1.7rem; margin-bottom: 6px; }
  .step-title { font-size: 0.82rem; }
  .step-description { font-size: 0.73rem; }
  .testimonials-section { padding: 28px 0; }
  .testimonials-section .section-title { padding-left: 20px; }
  .testimonials-grid { display: flex; flex-direction: row; overflow-x: auto; gap: 16px; padding-bottom: 12px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .testimonials-grid::-webkit-scrollbar { display: none; }
  .testimonials-grid > *:first-child { margin-left: 20px; }
  .testimonials-grid > *:not(.scroll-spacer) { flex: 0 0 240px; scroll-snap-align: start; align-self: stretch; }
}
</style>