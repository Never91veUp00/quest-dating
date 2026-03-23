<template>
  <div class="art">

    <div v-if="!post" class="art__error">
      <h1>Статья не найдена</h1>
      <NuxtLink to="/blog" class="art__back">← В блог</NuxtLink>
    </div>

    <template v-else>

      <!-- Hero с фото -->
      <section class="art__hero" :style="post.image ? `--bg: url(${post.image})` : ''">
        <div class="art__hero-bg"></div>
        <div class="art__container">
          <NuxtLink to="/blog" class="art__back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Блог
          </NuxtLink>
          <span class="art__cat">{{ post.category }}</span>
          <h1 class="art__title">{{ post.title }}</h1>
          <div class="art__meta">
            <img :src="`/uploads/avatars/liza.jpg`" alt="Лиза Петри" class="art__author-img" @error="e => e.target.style.display='none'" />
            <span class="art__author">Лиза Петри</span>
            <span class="art__sep">·</span>
            <time>{{ formatDate(post.date) }}</time>
            <span class="art__sep">·</span>
            <span>{{ post.readingTime }} мин чтения</span>
          </div>
        </div>
      </section>

      <!-- Тело статьи -->
      <div class="art__container art__body">
        <div class="art__layout">

          <!-- Контент -->
          <article class="art__content" v-html="post.content"></article>

          <!-- Inline CTA (вставляется через CSS после половины контента — sticky) -->
          <aside class="art__aside">
            <div class="art__cta-card">
              <div class="art__cta-icon">💍</div>
              <h3 class="art__cta-title">Хотите такой квест?</h3>
              <p class="art__cta-text">Лиза создаст персональный сценарий для вашей пары за 24 часа — от 499 ₽</p>
              <NuxtLink to="/catalog" class="art__cta-btn">Смотреть квесты</NuxtLink>
              <a href="https://t.me/vinatian00" target="_blank" rel="noopener" class="art__cta-tg">
                Написать Лизе →
              </a>
            </div>

            <!-- Другие статьи -->
            <div class="art__other">
              <h4 class="art__other-title">Читать ещё</h4>
              <NuxtLink
                v-for="other in otherPosts"
                :key="other.slug"
                :to="`/blog/${other.slug}`"
                class="art__other-item"
              >
                <div class="art__other-img">
                  <img :src="other.image" :alt="other.title" loading="lazy" />
                </div>
                <span class="art__other-text">{{ other.title }}</span>
              </NuxtLink>
            </div>
          </aside>

        </div>

        <!-- Другие статьи — мобильные -->
        <div class="art__mobile-other">
          <h4 class="art__mobile-other-title">Читать ещё</h4>
          <div class="art__mobile-other-list">
            <NuxtLink
              v-for="other in otherPosts"
              :key="other.slug"
              :to="`/blog/${other.slug}`"
              class="art__other-item"
            >
              <div class="art__other-img">
                <img :src="other.image" :alt="other.title" loading="lazy" />
              </div>
              <span class="art__other-text">{{ other.title }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Mobile CTA — после статьи -->
        <div class="art__mobile-cta">
          <div class="art__mobile-cta-inner">
            <p>Вдохновились? Лиза создаст квест для вас за 24 часа</p>
            <NuxtLink to="/catalog" class="art__cta-btn">Выбрать квест</NuxtLink>
          </div>
        </div>

      </div>

    </template>
  </div>
</template>

<script setup>
import { BLOG_POSTS } from '~/data/blogPosts'

const { onImgError } = useImageFallback()
const route = useRoute()
const post = BLOG_POSTS.find(p => p.slug === route.params.slug) ?? null

if (!post) {
  throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' })
}

const otherPosts = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 3)

const formatDate = (iso) => new Date(iso).toLocaleDateString('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric'
})

useSeoMeta({
  title:         `${post.title} | Блог Quest Dating`,
  description:   post.excerpt,
  ogTitle:       post.title,
  ogDescription: post.excerpt,
  ogImage:       `https://questdating.ru${post.image}`,
  ogType:        'article',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: post.title, description: post.excerpt,
      image: `https://questdating.ru${post.image}`,
      datePublished: post.date,
      author: { '@type': 'Person', name: 'Лиза Петри', url: 'https://questdating.ru/about' },
      publisher: { '@type': 'Organization', name: 'Quest Dating', url: 'https://questdating.ru' },
    })
  }]
})
</script>

<style scoped>
.art { background: #0a0a0f; color: #f0ede8; min-height: 100vh; }
.art__container { max-width: 600px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 1024px) { .art__container { max-width: 1100px; padding: 0 24px; } }

/* Error */
.art__error { text-align: center; padding: 100px 20px; }
.art__back { color: #d4af37; text-decoration: none; font-weight: 700; }

/* Hero */
.art__hero {
  position: relative; min-height: 50svh;
  display: flex; align-items: flex-end;
  padding-bottom: 32px;
  background: var(--bg) center/cover no-repeat, #111118;
  padding-top: calc(70px + env(safe-area-inset-top));
}
.art__hero-bg {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.75) 100%);
}
.art__container { position: relative; z-index: 2; }

.art__back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.82rem; font-weight: 700; color: rgba(255,255,255,0.6);
  text-decoration: none; margin-bottom: 16px;
  -webkit-tap-highlight-color: transparent;
}
.art__back-btn:hover { color: #fff; }

.art__cat {
  display: block; font-size: 0.75rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: #d4af37; margin-bottom: 10px;
}
.art__title {
  font-size: clamp(1.6rem, 5vw, 2.4rem); font-weight: 900;
  color: #fff; margin: 0 0 16px; line-height: 1.15; letter-spacing: -0.02em;
}
.art__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.art__author-img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(212,175,55,0.4); }
.art__author { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.85); }
.art__sep { color: rgba(255,255,255,0.3); }
.art__meta time, .art__meta span { font-size: 0.8rem; color: rgba(255,255,255,0.5); }

/* Body */
.art__body { padding: 32px 16px 60px; }
@media (min-width: 1024px) { .art__body { padding: 40px 24px 80px; } }

.art__layout {
  display: grid; grid-template-columns: 1fr;
  gap: 32px;
}
@media (min-width: 1024px) {
  .art__layout { grid-template-columns: 1fr 300px; gap: 48px; }
}

/* Article content */
.art__content {
  font-size: 1rem; line-height: 1.8; color: rgba(240,237,232,0.8);
  max-width: 680px;
}
.art__content :deep(h2) {
  font-size: 1.3rem; font-weight: 900; color: #f0ede8;
  margin: 32px 0 12px; letter-spacing: -0.01em;
}
.art__content :deep(h3) {
  font-size: 1.05rem; font-weight: 800; color: #f0ede8;
  margin: 24px 0 8px;
}
.art__content :deep(p) { margin: 0 0 16px; }
.art__content :deep(strong) { color: #f0ede8; font-weight: 700; }
.art__content :deep(blockquote) {
  border-left: 3px solid #d4af37; padding: 12px 16px;
  background: rgba(212,175,55,0.07); border-radius: 0 10px 10px 0;
  color: rgba(240,237,232,0.7); font-style: italic; margin: 20px 0;
}
.art__content :deep(ul), .art__content :deep(ol) {
  padding-left: 20px; margin: 0 0 16px;
}
.art__content :deep(li) { margin-bottom: 6px; }
.art__content :deep(a) { color: #d4af37; text-decoration: underline; text-decoration-color: rgba(212,175,55,0.4); }

/* Aside */
.art__aside { display: none; }
@media (min-width: 1024px) { .art__aside { display: block; } }

.art__cta-card {
  background: rgba(212,175,55,0.07); border: 1px solid rgba(212,175,55,0.2);
  border-radius: 20px; padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
  position: sticky; top: 90px;
}
.art__cta-icon { font-size: 2rem; }
.art__cta-title { font-size: 1rem; font-weight: 900; color: #f0ede8; margin: 0; }
.art__cta-text { font-size: 0.82rem; color: rgba(240,237,232,0.55); margin: 0; line-height: 1.5; }
.art__cta-btn {
  display: block; text-align: center; background: #d4af37; color: #0a0a0f;
  padding: 12px; border-radius: 100px; font-weight: 800; font-size: 0.9rem;
  text-decoration: none; -webkit-tap-highlight-color: transparent;
}
.art__cta-tg {
  display: block; text-align: center; font-size: 0.82rem; font-weight: 700;
  color: rgba(240,237,232,0.5); text-decoration: none;
}
.art__cta-tg:hover { color: #f0ede8; }

.art__other { margin-top: 24px; }
.art__other-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(240,237,232,0.3); margin: 0 0 12px; }
.art__other-item {
  display: flex; gap: 10px; align-items: center;
  text-decoration: none; padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  -webkit-tap-highlight-color: transparent;
}
.art__other-item:last-child { border-bottom: none; }
.art__other-img { width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #111118; }
.art__other-img img { width: 100%; height: 100%; object-fit: cover; }
.art__other-text { font-size: 0.8rem; font-weight: 600; color: rgba(240,237,232,0.6); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.art__other-item:hover .art__other-text { color: #f0ede8; }

/* Mobile CTA */
.art__mobile-other {
  margin-top: 32px; padding: 20px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
}
@media (min-width: 1024px) { .art__mobile-other { display: none; } }
.art__mobile-other-title {
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: rgba(240,237,232,0.3); margin: 0 0 14px;
}
.art__mobile-other-list { display: flex; flex-direction: column; }

.art__mobile-cta {
  margin-top: 32px;
  background: rgba(212,175,55,0.07); border: 1px solid rgba(212,175,55,0.2);
  border-radius: 20px; padding: 20px; text-align: center;
}
@media (min-width: 1024px) { .art__mobile-cta { display: none; } }
.art__mobile-cta-inner { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.art__mobile-cta p { font-size: 0.9rem; color: rgba(240,237,232,0.65); margin: 0; line-height: 1.5; }
</style>