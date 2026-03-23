<template>
  <div class="blog">

    <!-- Hero -->
    <section class="blog__hero">
      <div class="blog__container">
        <div class="blog__hero-badge">✍️ Блог Лизы Петри</div>
        <h1 class="blog__hero-title">Идеи для особых<br><em>вечеров вдвоём</em></h1>
        <p class="blog__hero-sub">Советы, сценарии и истории — чтобы ваши свидания запоминались</p>
      </div>
    </section>

    <div class="blog__container blog__content">

      <!-- Главный пост — большой -->
      <NuxtLink v-if="posts.length" :to="`/blog/${posts[0].slug}`" class="blog__featured">
        <div class="blog__featured-img">
          <img :src="posts[0].image" :alt="posts[0].title" loading="eager" decoding="async" />
          <div class="blog__featured-overlay"></div>
          <span class="blog__cat">{{ posts[0].category }}</span>
        </div>
        <div class="blog__featured-body">
          <div class="blog__meta">
            <time>{{ formatDate(posts[0].date) }}</time>
            <span class="blog__dot">·</span>
            <span>{{ posts[0].readingTime }} мин чтения</span>
          </div>
          <h2 class="blog__featured-title">{{ posts[0].title }}</h2>
          <p class="blog__featured-excerpt">{{ posts[0].excerpt }}</p>
          <span class="blog__read-btn">Читать статью →</span>
        </div>
      </NuxtLink>

      <!-- Промо-вставка после первого поста -->
      <div class="blog__promo">
        <div class="blog__promo-text">
          <span class="blog__promo-emoji">💡</span>
          <span>Хотите готовый квест для вашей пары — уже за 499 ₽?</span>
        </div>
        <NuxtLink to="/catalog" class="blog__promo-btn">Смотреть квесты</NuxtLink>
      </div>

      <!-- Список остальных постов -->
      <div class="blog__list">
        <NuxtLink
          v-for="post in posts.slice(1)"
          :key="post.slug"
          :to="`/blog/${post.slug}`"
          class="blog__item"
        >
          <div class="blog__item-img">
            <img :src="post.image" :alt="post.title" loading="lazy" decoding="async" />
            <span class="blog__item-cat">{{ post.category }}</span>
          </div>
          <div class="blog__item-body">
            <div class="blog__meta">
              <time>{{ formatDate(post.date) }}</time>
              <span class="blog__dot">·</span>
              <span>{{ post.readingTime }} мин</span>
            </div>
            <h2 class="blog__item-title">{{ post.title }}</h2>
            <p class="blog__item-excerpt">{{ post.excerpt }}</p>
            <span class="blog__read-link">Читать →</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Финальный CTA -->
      <div class="blog__cta">
        <h2 class="blog__cta-title">Вдохновились?</h2>
        <p class="blog__cta-sub">Лиза создаст персональный квест для вашей пары за 24 часа</p>
        <NuxtLink to="/catalog" class="blog__cta-btn">Выбрать квест</NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { BLOG_POSTS } from '~/data/blogPosts'

const posts = BLOG_POSTS

useSeoMeta({
  title: 'Блог о свиданиях-квестах — советы и идеи | Quest Dating',
  description: 'Идеи для романтических свиданий-квестов, советы по организации и вдохновляющие истории. Блог Лизы Петри — создателя персональных квестов для пар.',
  ogTitle: 'Блог о свиданиях-квестах | Quest Dating',
})

const formatDate = (iso) => new Date(iso).toLocaleDateString('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric'
})
</script>

<style scoped>
.blog { background: #0a0a0f; color: #f0ede8; min-height: 100vh; padding-bottom: 60px; }
.blog__container { max-width: 600px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 768px) { .blog__container { max-width: 900px; padding: 0 24px; } }

/* Hero */
.blog__hero {
  padding: calc(80px + env(safe-area-inset-top)) 0 40px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.blog__hero-badge {
  display: inline-block; font-size: 0.8rem; font-weight: 700;
  color: #d4af37; background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.25); padding: 4px 12px;
  border-radius: 100px; margin-bottom: 16px;
}
.blog__hero-title {
  font-size: clamp(2rem, 7vw, 3rem); font-weight: 900;
  margin: 0 0 12px; line-height: 1.1; letter-spacing: -0.02em;
}
.blog__hero-title em {
  font-style: normal;
  background: linear-gradient(135deg, #d4af37, #f5d36e);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.blog__hero-sub { font-size: 1rem; color: rgba(240,237,232,0.5); margin: 0; line-height: 1.6; }

/* Content */
.blog__content { padding-top: 28px; display: flex; flex-direction: column; gap: 20px; }

/* Featured post */
.blog__featured {
  display: flex; flex-direction: column;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px; overflow: hidden; text-decoration: none;
  transition: border-color 0.2s; -webkit-tap-highlight-color: transparent;
}
@media (min-width: 640px) { .blog__featured { flex-direction: row; } }
.blog__featured:hover { border-color: rgba(212,175,55,0.3); }

.blog__featured-img {
  position: relative; height: 220px; flex-shrink: 0; background: #111118;
}
@media (min-width: 640px) { .blog__featured-img { width: 280px; height: auto; } }
.blog__featured-img img { width: 100%; height: 100%; object-fit: cover; }
.blog__featured-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%);
}
.blog__cat {
  position: absolute; top: 12px; left: 12px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: #d4af37; background: rgba(10,10,15,0.8); backdrop-filter: blur(8px);
  padding: 4px 10px; border-radius: 100px; border: 1px solid rgba(212,175,55,0.3);
}

.blog__featured-body {
  padding: 20px; display: flex; flex-direction: column; gap: 10px; flex: 1;
}
.blog__meta { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: rgba(240,237,232,0.35); }
.blog__dot { opacity: 0.5; }
.blog__featured-title {
  font-size: clamp(1.1rem, 3.5vw, 1.3rem); font-weight: 900;
  color: #f0ede8; margin: 0; line-height: 1.25; letter-spacing: -0.01em;
}
.blog__featured-excerpt {
  font-size: 0.87rem; color: rgba(240,237,232,0.55); line-height: 1.6; margin: 0; flex: 1;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.blog__read-btn {
  display: inline-block; font-size: 0.85rem; font-weight: 700; color: #d4af37;
  border: 1px solid rgba(212,175,55,0.3); padding: 8px 16px;
  border-radius: 100px; transition: background 0.2s; align-self: flex-start;
}
.blog__featured:hover .blog__read-btn { background: rgba(212,175,55,0.1); }

/* Promo insert */
.blog__promo {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: rgba(212,175,55,0.07); border: 1px solid rgba(212,175,55,0.2);
  border-radius: 14px; padding: 14px 16px; flex-wrap: wrap;
}
.blog__promo-text {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.88rem; color: rgba(240,237,232,0.75); font-weight: 600;
}
.blog__promo-emoji { font-size: 1.1rem; }
.blog__promo-btn {
  flex-shrink: 0; background: #d4af37; color: #0a0a0f;
  padding: 8px 16px; border-radius: 100px;
  font-size: 0.82rem; font-weight: 800; text-decoration: none;
  -webkit-tap-highlight-color: transparent; white-space: nowrap;
}

/* List */
.blog__list { display: flex; flex-direction: column; gap: 12px; }

.blog__item {
  display: flex; gap: 14px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; overflow: hidden; text-decoration: none;
  transition: border-color 0.2s; -webkit-tap-highlight-color: transparent;
}
.blog__item:hover { border-color: rgba(212,175,55,0.25); }

.blog__item-img {
  width: 100px; flex-shrink: 0; position: relative; background: #111118;
}
@media (min-width: 480px) { .blog__item-img { width: 130px; } }
.blog__item-img img { width: 100%; height: 100%; object-fit: cover; }
.blog__item-cat {
  position: absolute; top: 6px; left: 6px;
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  color: #d4af37; background: rgba(10,10,15,0.85);
  padding: 2px 6px; border-radius: 4px;
}

.blog__item-body {
  flex: 1; padding: 12px 12px 12px 0; display: flex; flex-direction: column; gap: 6px; min-width: 0;
}
.blog__item-title {
  font-size: 0.92rem; font-weight: 800; color: #f0ede8;
  margin: 0; line-height: 1.3; letter-spacing: -0.01em;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.blog__item-excerpt {
  font-size: 0.78rem; color: rgba(240,237,232,0.45); line-height: 1.5; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.blog__read-link { font-size: 0.78rem; font-weight: 700; color: #d4af37; margin-top: auto; }

/* CTA */
.blog__cta {
  text-align: center; padding: 40px 20px;
  background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.15);
  border-radius: 20px;
}
.blog__cta-title { font-size: 1.4rem; font-weight: 900; margin: 0 0 8px; letter-spacing: -0.02em; }
.blog__cta-sub { font-size: 0.9rem; color: rgba(240,237,232,0.5); margin: 0 0 20px; }
.blog__cta-btn {
  display: inline-block; background: #d4af37; color: #0a0a0f;
  padding: 14px 32px; border-radius: 100px; font-weight: 800; font-size: 1rem;
  text-decoration: none; -webkit-tap-highlight-color: transparent;
}
</style>