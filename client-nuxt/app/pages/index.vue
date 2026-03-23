<template>
  <div class="home">

    <!-- ═══ HERO ═══ -->
    <section class="hero">
      <div class="hero__bg">
        <div class="hero__orb hero__orb--1"></div>
        <div class="hero__orb hero__orb--2"></div>
        <div class="hero__grain"></div>
      </div>
      <div class="hero__inner">
        <div class="hero__badge">💍 Персональные квесты-сюрпризы</div>
        <h1 class="hero__title">
          Удивите<br>
          <em>по-настоящему</em>
        </h1>
        <p class="hero__sub">
          Лиза Петри создаёт свидания-квесты специально под вашу пару.<br>
          Не шаблон — а история. Готово за 24 часа.
        </p>
        <NuxtLink to="/catalog" class="hero__cta">
          Выбрать квест
          <span class="hero__cta-arrow">→</span>
        </NuxtLink>
        <div class="hero__proof">
          <div class="hero__proof-avatars">
            <span>👤</span><span>👤</span><span>👤</span>
          </div>
          <span class="hero__proof-text">{{ (stats?.total_orders > 5 ? stats.total_orders : 89) }}+ пар уже провели незабываемый вечер</span>
        </div>
      </div>
    </section>

    <!-- ═══ БОЛЬ ═══ -->
    <section class="pain">
      <div class="container">
        <p class="pain__label">Знакомо?</p>
        <div class="pain__list">
          <div class="pain__item">
            <span class="pain__x">✗</span>
            <span>Рестораны — предсказуемо и безлично</span>
          </div>
          <div class="pain__item">
            <span class="pain__x">✗</span>
            <span>Цветы и конфеты уже не удивляют</span>
          </div>
          <div class="pain__item">
            <span class="pain__x">✗</span>
            <span>Хочется чего-то особенного — но не знаете что</span>
          </div>
        </div>
        <p class="pain__answer">Для этого и существуют свидания-квесты ↓</p>
      </div>
    </section>

    <!-- ═══ ЧТО ЭТО ═══ -->
    <section class="what">
      <div class="container">
        <h2 class="what__title">Что такое<br>свидание-квест?</h2>
        <div class="what__cards">
          <div class="what__card">
            <div class="what__card-icon">🗺️</div>
            <div class="what__card-text">
              <strong>Персональный сценарий</strong>
              Написанный специально под вашу пару — с вашими местами и деталями
            </div>
          </div>
          <div class="what__card">
            <div class="what__card-icon">🔐</div>
            <div class="what__card-text">
              <strong>Цепочка заданий</strong>
              Загадки, шифры, вопросы — каждый шаг ведёт к следующему сюрпризу
            </div>
          </div>
          <div class="what__card">
            <div class="what__card-icon">✨</div>
            <div class="what__card-text">
              <strong>Незабываемый финал</strong>
              Момент который ваша пара будет вспоминать годами
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ КВЕСТЫ ═══ -->
    <section class="quests">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Готовые квесты</h2>
          <NuxtLink to="/catalog" class="link-more">Все →</NuxtLink>
        </div>
        <MagazineGrid :templates="featuredTemplates" :loading="homePending" />
      </div>
    </section>

        <!-- ═══ КАК РАБОТАЕТ ═══ -->
    <section class="how">
      <div class="container">
        <h2 class="how__title">Как это<br>работает</h2>
        <div class="how__steps">
          <div class="how__step">
            <div class="how__num">01</div>
            <div class="how__step-body">
              <strong>Выбираете квест</strong>
              <span>Или заказываете персональный с нуля</span>
            </div>
          </div>
          <div class="how__line"></div>
          <div class="how__step">
            <div class="how__num">02</div>
            <div class="how__step-body">
              <strong>Рассказываете о паре</strong>
              <span>Лиза задаёт вопросы и пишет сценарий</span>
            </div>
          </div>
          <div class="how__line"></div>
          <div class="how__step">
            <div class="how__num">03</div>
            <div class="how__step-body">
              <strong>Получаете за 24 часа</strong>
              <span>Ссылку на квест — можно делиться сразу</span>
            </div>
          </div>
          <div class="how__line"></div>
          <div class="how__step">
            <div class="how__num">04</div>
            <div class="how__step-body">
              <strong>Проводите вечер</strong>
              <span>Партнёр проходит квест — вы наблюдаете реакцию</span>
            </div>
          </div>
        </div>
        <NuxtLink to="/catalog" class="how__cta">Попробовать за 499 ₽</NuxtLink>
      </div>
    </section>

    <!-- ═══ ПОВОДЫ ═══ -->
    <section class="occasions">
      <div class="container">
        <h2 class="occasions__title">Для любого повода</h2>
        <div class="occasions__grid">
          <NuxtLink to="/categories/home-quests" class="occasions__item">
            <span class="occasions__emoji">🏠</span>
            <span>Вечер дома</span>
          </NuxtLink>
          <NuxtLink to="/categories/home-quests" class="occasions__item">
            <span class="occasions__emoji">💍</span>
            <span>Предложение</span>
          </NuxtLink>
          <NuxtLink to="/categories/home-quests" class="occasions__item">
            <span class="occasions__emoji">🎂</span>
            <span>День рождения</span>
          </NuxtLink>
          <NuxtLink to="/categories/home-quests" class="occasions__item">
            <span class="occasions__emoji">💑</span>
            <span>Годовщина</span>
          </NuxtLink>
          <NuxtLink to="/categories/home-quests" class="occasions__item">
            <span class="occasions__emoji">🌹</span>
            <span>14 февраля</span>
          </NuxtLink>
          <NuxtLink to="/categories/home-quests" class="occasions__item">
            <span class="occasions__emoji">🌷</span>
            <span>8 марта</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══ ОТЗЫВЫ ═══ -->
    <section class="reviews" v-if="testimonials.length">
      <div class="container">
        <div class="reviews__head">
          <h2 class="reviews__title">Что говорят пары</h2>
          <button
            v-if="testimonials.length > reviewsLimit"
            class="reviews__all"
            @click="reviewsExpanded = !reviewsExpanded"
          >{{ reviewsExpanded ? 'Свернуть' : `Все ${testimonials.length} →` }}</button>
        </div>
        <div class="reviews__list">
          <div v-for="t in visibleTestimonials" :key="t.id" class="reviews__item">
            <div class="reviews__stars">★★★★★</div>
            <p class="reviews__text">«{{ t.text }}»</p>
            <div class="reviews__name">— {{ t.name }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ АВТОР ═══ -->
    <section class="author">
      <div class="container">
        <div class="author__inner">
          <div class="author__photo">
            <img :src="`/uploads/avatars/liza.jpg`" alt="Лиза Петри" />
          </div>
          <div class="author__body">
            <p class="author__label">Автор квестов</p>
            <h2 class="author__name">Лиза Петри</h2>
            <p class="author__bio">
              Создаю персональные свидания-квесты с 2024 года.
              Каждый сценарий — с нуля под вашу пару.
              Я знаю как трудно придумать что-то по-настоящему особенное.
            </p>
            <NuxtLink to="/about" class="author__link">Узнать больше →</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ БЛОГ ═══ -->
    <section class="blog">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Идеи и советы</h2>
          <NuxtLink to="/blog" class="link-more">Все →</NuxtLink>
        </div>
        <div class="blog__list">
          <NuxtLink
            v-for="post in blogPreview"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="blog__item"
          >
            <span class="blog__cat">{{ post.category }}</span>
            <span class="blog__title">{{ post.title }}</span>
            <span class="blog__arrow">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══ ФИНАЛЬНЫЙ CTA ═══ -->
    <section class="final-cta">
      <div class="container">
        <h2 class="final-cta__title">Готовы удивить?</h2>
        <p class="final-cta__sub">Квест готов за 24 часа. Начните с 499 ₽.</p>
        <NuxtLink to="/catalog" class="final-cta__btn">Выбрать квест</NuxtLink>
        <p class="final-cta__guarantee">💬 Не понравится — вернём деньги</p>
      </div>
    </section>

  </div>

</template>

<script setup>
import { computed } from 'vue'
import { BLOG_POSTS } from '~/data/blogPosts'

const router = useRouter()
const { getCategories, getFeaturedDates, getPopularDates, getStats, getFeaturedReviews } = useDatesApi()
const { isValidImageSrc } = useImageFallback()

const DIFF = {
  easy:   { label: 'Лёгкий',  glow: '#10b981', badge: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#6ee7b7' },
  medium: { label: 'Средний', glow: '#d4af37', badge: 'rgba(212,175,55,0.15)',  border: 'rgba(212,175,55,0.4)',  color: '#fcd34d' },
  hard:   { label: 'Сложный', glow: '#f97316', badge: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.4)',  color: '#fdba74' },
  expert: { label: 'Эксперт', glow: '#ef4444', badge: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   color: '#fca5a5' },
}
const diffLabel = (d) => (DIFF[d] || DIFF.medium).label
const glowStyle = (d) => ({ background: `radial-gradient(ellipse at top right, ${(DIFF[d]||DIFF.medium).glow}25 0%, #0a0a0f 70%)` })
const badgeStyle = (d) => { const dd = DIFF[d]||DIFF.medium; return { background: dd.badge, borderColor: dd.border, color: dd.color } }
const formatPrice = (v) => v ? `${Math.round(Number(v)/100).toLocaleString('ru')} ₽` : '—'
const formatDur = (m) => { if (!m) return ''; const h=Math.floor(m/60),mn=m%60; return h>0?(mn>0?`${h}ч ${mn}м`:`${h}ч`):`${mn}м` }

useSeoMeta({
  title:         'Quest Dating — персональные свидания-квесты',
  description:   'Лиза Петри создаёт персональный квест для вашего свидания. Уникальный сценарий под вашу пару — готов за 24 часа. От 499 рублей.',
  ogTitle:       'Quest Dating — персональные свидания-квесты',
  ogDescription: 'Удивите партнёра по-настоящему. Персональные романтические квесты от Лизы Петри.',
})

function cleanTemplates(data) { return data }

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
    _ts:        Date.now(),
  }
},
  {
    getCachedData(key, nuxtApp) {
      const cached = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
      if (!cached) return undefined
      const age = Date.now() - (cached._ts ?? 0)
      return age < 5 * 60 * 1000 ? cached : undefined
    }
  }
)

const featuredTemplates = computed(() => homeData.value?.featured?.data ?? homeData.value?.featured ?? [])
const stats             = computed(() => homeData.value?.stats?.data ?? homeData.value?.stats ?? {})
const reviewsLimit    = 4
const reviewsExpanded = ref(false)
const visibleTestimonials = computed(() =>
  reviewsExpanded.value ? testimonials.value : testimonials.value.slice(0, reviewsLimit)
)

const blogPreview       = computed(() => BLOG_POSTS.slice(0, 4))

const testimonials = computed(() => {
  const rows = homeData.value?.reviews?.data ?? homeData.value?.reviews ?? []
  return rows.slice(0, 4).map(r => ({
    id:   r.id,
    rating: r.rating,
    text: r.comment,
    name: r.client_name,
  }))
})
</script>

<style scoped>
/* ── Base ─────────────────────────────────── */
.home { background: #0a0a0f; color: #f0ede8; font-family: 'Helvetica Neue', Arial, sans-serif; }
.container { max-width: 480px; margin: 0 auto; padding: 0 20px; }
@media (min-width: 768px) { .container { max-width: 900px; } }
@media (min-width: 1200px) { .container { max-width: 1100px; } }

.section-title { font-size: 1.6rem; font-weight: 800; color: #f0ede8; margin: 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.link-more { color: #d4af37; font-weight: 600; text-decoration: none; font-size: 1rem; }

/* ── Hero ─────────────────────────────────── */
.hero { position: relative; min-height: 100svh; display: flex; align-items: center; overflow: hidden; }
.hero__bg { position: absolute; inset: 0; }
.hero__orb { position: absolute; border-radius: 50%; filter: blur(80px); }
.hero__orb--1 { width: 400px; height: 400px; background: rgba(212,175,55,0.15); top: -100px; right: -100px; }
.hero__orb--2 { width: 300px; height: 300px; background: rgba(180,80,180,0.1); bottom: 0; left: -80px; }
.hero__grain { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); }

.hero__inner { position: relative; z-index: 2; padding: 100px 20px 80px; max-width: 480px; margin: 0 auto; width: 100%; }
@media (min-width: 768px) { .hero__inner { max-width: 900px; padding: 120px 20px; } }

.hero__badge { display: inline-block; background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.3); color: #d4af37; padding: 6px 16px; border-radius: 100px; font-size: 0.85rem; font-weight: 600; margin-bottom: 28px; }

.hero__title { font-size: clamp(3rem, 14vw, 6rem); font-weight: 900; line-height: 1.05; margin: 0 0 20px; letter-spacing: -0.02em; }
.hero__title em { font-style: normal; background: linear-gradient(135deg, #d4af37, #f5d36e, #b8860b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.hero__sub { font-size: clamp(1rem, 3.5vw, 1.2rem); color: rgba(240,237,232,0.7); line-height: 1.7; margin: 0 0 36px; max-width: 460px; }

.hero__cta { display: inline-flex; align-items: center; gap: 12px; background: #d4af37; color: #0a0a0f; padding: 16px 32px; border-radius: 100px; font-weight: 800; font-size: 1.1rem; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 8px 32px rgba(212,175,55,0.3); }
.hero__cta:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(212,175,55,0.4); }
.hero__cta-arrow { font-size: 1.3rem; }

.hero__proof { display: flex; align-items: center; gap: 12px; margin-top: 28px; }
.hero__proof-avatars { display: flex; }
.hero__proof-avatars span { font-size: 1.4rem; margin-right: -4px; }
.hero__proof-text { font-size: 0.85rem; color: rgba(240,237,232,0.6); }

/* ── Pain ─────────────────────────────────── */
.pain { padding: 60px 0; border-top: 1px solid rgba(255,255,255,0.06); }
.pain__label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(240,237,232,0.4); margin: 0 0 20px; }
.pain__list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
.pain__item { display: flex; align-items: flex-start; gap: 12px; font-size: 1rem; color: rgba(240,237,232,0.65); line-height: 1.5; }
.pain__x { color: #e05b5b; font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }
.pain__answer { font-size: 1.1rem; font-weight: 700; color: #d4af37; margin: 0; }

/* ── What ─────────────────────────────────── */
.what { padding: 60px 0; background: rgba(255,255,255,0.02); }
.what__title { font-size: clamp(2rem, 8vw, 3rem); font-weight: 900; line-height: 1.1; margin: 0 0 36px; letter-spacing: -0.01em; }
.what__cards { display: flex; flex-direction: column; gap: 16px; }
@media (min-width: 768px) { .what__cards { flex-direction: row; } }
.what__card { display: flex; align-items: flex-start; gap: 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; }
.what__card-icon { font-size: 2rem; flex-shrink: 0; }
.what__card-text { font-size: 0.95rem; color: rgba(240,237,232,0.75); line-height: 1.6; }
.what__card-text strong { display: block; color: #f0ede8; font-weight: 700; margin-bottom: 4px; font-size: 1rem; }

/* ── Quests ───────────────────────────────── */
.quests { padding: 60px 0; }

/* ── How ──────────────────────────────────── */
.how { padding: 60px 0; }
.how__title { font-size: clamp(2rem, 8vw, 3rem); font-weight: 900; line-height: 1.1; margin: 0 0 40px; letter-spacing: -0.01em; }
.how__steps { display: flex; flex-direction: column; gap: 0; }
.how__step { display: flex; align-items: flex-start; gap: 20px; padding: 16px 0; }
.how__num { font-size: 2.5rem; font-weight: 900; color: #d4af37; line-height: 1; flex-shrink: 0; width: 56px; }
.how__step-body { display: flex; flex-direction: column; gap: 4px; padding-top: 6px; }
.how__step-body strong { font-size: 1.05rem; font-weight: 700; color: #f0ede8; }
.how__step-body span { font-size: 0.9rem; color: rgba(240,237,232,0.55); line-height: 1.5; }
.how__line { width: 1px; height: 24px; background: rgba(212,175,55,0.2); margin-left: 28px; }
.how__cta { display: block; text-align: center; background: transparent; border: 2px solid #d4af37; color: #d4af37; padding: 16px 32px; border-radius: 100px; font-weight: 800; font-size: 1.1rem; text-decoration: none; margin-top: 40px; transition: background 0.2s, color 0.2s; }
.how__cta:hover { background: #d4af37; color: #0a0a0f; }

/* ── Occasions ────────────────────────────── */
.occasions { padding: 60px 0; background: rgba(255,255,255,0.02); }
.occasions__title { font-size: 1.6rem; font-weight: 800; margin: 0 0 28px; }
.occasions__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media (min-width: 768px) { .occasions__grid { grid-template-columns: repeat(6, 1fr); } }
.occasions__item { display: flex; flex-direction: column; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px 12px; text-decoration: none; color: rgba(240,237,232,0.8); font-size: 0.85rem; font-weight: 600; text-align: center; transition: border-color 0.2s, background 0.2s; }
.occasions__item:hover { border-color: rgba(212,175,55,0.4); background: rgba(212,175,55,0.06); }
.occasions__emoji { font-size: 1.8rem; }

/* ── Reviews ──────────────────────────────── */
.reviews { padding: 60px 0; }
.reviews__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.reviews__title { font-size: 1.6rem; font-weight: 800; margin: 0; }
.reviews__all { font-size: 0.85rem; font-weight: 700; color: #d4af37; background: none; border: 1px solid rgba(212,175,55,0.3); padding: 6px 14px; border-radius: 100px; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background 0.2s; }
.reviews__all:hover { background: rgba(212,175,55,0.1); }
/* old title removed */
.reviews__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.reviews__all { font-size: 0.85rem; font-weight: 700; color: #d4af37; background: none; border: 1px solid rgba(212,175,55,0.3); padding: 6px 14px; border-radius: 100px; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background 0.2s; }
.reviews__all:hover { background: rgba(212,175,55,0.1); }
.reviews__list { display: flex; flex-direction: column; gap: 16px; }
@media (min-width: 768px) { .reviews__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.reviews__all { font-size: 0.85rem; font-weight: 700; color: #d4af37; background: none; border: 1px solid rgba(212,175,55,0.3); padding: 6px 14px; border-radius: 100px; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background 0.2s; }
.reviews__all:hover { background: rgba(212,175,55,0.1); }
.reviews__list { display: grid; grid-template-columns: repeat(2, 1fr); } }
.reviews__item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; }
.reviews__stars { color: #d4af37; font-size: 1rem; margin-bottom: 10px; letter-spacing: 2px; }
.reviews__text { font-size: 0.95rem; color: rgba(240,237,232,0.8); line-height: 1.6; margin: 0 0 12px; font-style: italic; }
.reviews__name { font-size: 0.85rem; color: rgba(240,237,232,0.45); font-weight: 600; }

/* ── Author ───────────────────────────────── */
.author { padding: 60px 0; background: rgba(212,175,55,0.05); border-top: 1px solid rgba(212,175,55,0.15); border-bottom: 1px solid rgba(212,175,55,0.15); }
.author__inner { display: flex; gap: 24px; align-items: flex-start; }
.author__photo { width: 80px; height: 80px; flex-shrink: 0; border-radius: 50%; overflow: hidden; border: 2px solid rgba(212,175,55,0.4); }
.author__photo img { width: 100%; height: 100%; object-fit: cover; }
@media (min-width: 768px) { .author__photo { width: 120px; height: 120px; } }
.author__label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #d4af37; margin: 0 0 4px; }
.author__name { font-size: 1.4rem; font-weight: 900; margin: 0 0 10px; }
.author__bio { font-size: 0.9rem; color: rgba(240,237,232,0.65); line-height: 1.6; margin: 0 0 14px; }
.author__link { color: #d4af37; font-weight: 700; text-decoration: none; font-size: 0.9rem; }

/* ── Blog ─────────────────────────────────── */
.blog { padding: 60px 0; }
.blog__list { display: flex; flex-direction: column; gap: 2px; }
.blog__item { display: flex; align-items: center; gap: 12px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06); text-decoration: none; color: #f0ede8; transition: color 0.2s; }
.blog__item:hover { color: #d4af37; }
.blog__cat { flex-shrink: 0; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #d4af37; background: rgba(212,175,55,0.1); padding: 3px 8px; border-radius: 4px; }
.blog__title { flex: 1; font-size: 0.95rem; line-height: 1.4; }
.blog__arrow { flex-shrink: 0; font-size: 1rem; opacity: 0.4; }

/* ── Final CTA ────────────────────────────── */
.final-cta { padding: 80px 0; text-align: center; background: radial-gradient(ellipse at center, rgba(212,175,55,0.12) 0%, transparent 70%); }
.final-cta__title { font-size: clamp(2rem, 8vw, 3rem); font-weight: 900; margin: 0 0 12px; letter-spacing: -0.02em; }
.final-cta__sub { font-size: 1.1rem; color: rgba(240,237,232,0.6); margin: 0 0 32px; }
.final-cta__btn { display: inline-block; background: #d4af37; color: #0a0a0f; padding: 18px 48px; border-radius: 100px; font-weight: 800; font-size: 1.2rem; text-decoration: none; box-shadow: 0 8px 32px rgba(212,175,55,0.35); transition: transform 0.2s, box-shadow 0.2s; }
.final-cta__btn:hover { transform: translateY(-2px); box-shadow: 0 12px 48px rgba(212,175,55,0.5); }
.final-cta__guarantee { margin: 20px 0 0; font-size: 0.85rem; color: rgba(240,237,232,0.4); }
</style>