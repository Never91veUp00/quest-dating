<template>
  <div class="article-page">
    <div v-if="!post" class="error-container">
      <div class="container">
        <h1>Статья не найдена</h1>
        <NuxtLink to="/blog" class="btn-back">← Вернуться в блог</NuxtLink>
      </div>
    </div>

    <template v-else>
      <section class="article-hero" :style="{ backgroundImage: `url(${post.image})` }">
        <div class="article-hero__overlay" />
        <div class="container">
          <Breadcrumbs :crumbs="breadcrumbs" />
          <div class="article-hero__content">
            <span class="article-category">{{ post.category }}</span>
            <h1 class="article-title">{{ post.title }}</h1>
            <div class="article-meta">
              <img :src="withFallback(AUTHOR_AVATAR)" alt="Лиза Петри" class="author-avatar" @error="onImgError" />
              <span class="author-name">Лиза Петри</span>
              <span class="sep">·</span>
              <time :datetime="post.date">{{ formatDate(post.date) }}</time>
              <span class="sep">·</span>
              <span>{{ post.readingTime }} мин чтения</span>
            </div>
          </div>
        </div>
      </section>

      <div class="article-body">
        <div class="container">
          <div class="article-layout">
            <article class="article-content" v-html="post.content" />
            <aside class="article-sidebar">
              <div class="sidebar-cta">
                <p class="sidebar-cta__text">Хотите свой романтический квест?</p>
                <NuxtLink to="/catalog" class="btn-cta">Смотреть квесты</NuxtLink>
              </div>

              <div class="sidebar-posts">
                <h3 class="sidebar-title">Другие статьи</h3>
                <NuxtLink
                  v-for="other in otherPosts"
                  :key="other.slug"
                  :to="`/blog/${other.slug}`"
                  class="sidebar-post"
                >
                  <img :src="other.image" :alt="other.title" class="sidebar-post__img" />
                  <span class="sidebar-post__title">{{ other.title }}</span>
                </NuxtLink>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { BLOG_POSTS } from '~/data/blogPosts'

const { onImgError, withFallback } = useImageFallback()
const AUTHOR_AVATAR = '/images/avatars/liza.jpg'
const route = useRoute()
const post = BLOG_POSTS.find(p => p.slug === route.params.slug) ?? null

if (!post) {
  throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' })
}

const otherPosts = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 3)

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Блог', to: '/blog' },
  { label: post.title },
]

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
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline:      post.title,
      description:   post.excerpt,
      image:         `https://questdating.ru${post.image}`,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: 'Лиза Петри',
        url: 'https://questdating.ru/about',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Quest Dating',
        url: 'https://questdating.ru',
      },
    })
  }, {
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная',       item: 'https://questdating.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Блог',          item: 'https://questdating.ru/blog' },
        { '@type': 'ListItem', position: 3, name: post.title,      item: `https://questdating.ru/blog/${post.slug}` },
      ]
    })
  }]
})
</script>

<style scoped>
.article-hero {
  position: relative;
  padding: 120px 0 60px;
  background-size: cover;
  background-position: center;
  color: white;
  min-height: 360px;
  display: flex;
  align-items: flex-end;
}

.article-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
  width: 100%;
}

.article-hero__content { margin-top: 24px; }

.article-category {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 12px;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 20px;
  line-height: 1.25;
  max-width: 800px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  opacity: 0.9;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.6);
}

.author-name { font-weight: 600; }
.sep { opacity: 0.5; }

.article-body {
  padding: 48px 0 80px;
  background: #f7fafc;
}

.article-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 48px;
  align-items: start;
}

.article-content {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  line-height: 1.8;
  font-size: 1.05rem;
  color: #2d3748;
}

.article-content :deep(h2) {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 40px 0 16px;
  color: #1a202c;
}

.article-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 28px 0 12px;
  color: #2d3748;
}

.article-content :deep(p) { margin: 0 0 20px; }

.article-content :deep(ul), .article-content :deep(ol) {
  margin: 0 0 20px;
  padding-left: 24px;
}

.article-content :deep(li) { margin-bottom: 8px; }

.article-content :deep(strong) { color: #1a202c; }

.article-content :deep(blockquote) {
  border-left: 4px solid #667eea;
  background: #f0f4ff;
  margin: 24px 0;
  padding: 16px 24px;
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: #4a5568;
}

.article-sidebar { position: sticky; top: 100px; }

.sidebar-cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  text-align: center;
  margin-bottom: 24px;
}

.sidebar-cta__text {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 16px;
}

.btn-cta {
  display: inline-block;
  background: white;
  color: #667eea;
  font-weight: 700;
  padding: 10px 24px;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.2s;
}

.btn-cta:hover { transform: translateY(-2px); }

.sidebar-posts {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 16px;
}

.sidebar-post {
  display: flex;
  gap: 12px;
  align-items: center;
  text-decoration: none;
  color: inherit;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  transition: color 0.2s;
}

.sidebar-post:last-child { border-bottom: none; }
.sidebar-post:hover { color: #667eea; }

.sidebar-post__img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.sidebar-post__title {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.error-container { padding: 120px 0; text-align: center; }
.btn-back { color: #667eea; font-weight: 600; }

@media (max-width: 1024px) {
  .article-layout { grid-template-columns: 1fr; }
  .article-sidebar { position: static; }
}

@media (max-width: 640px) {
  .article-hero { padding: 100px 0 40px; }
  .article-title { font-size: 1.75rem; }
  .article-content { padding: 24px; }
}
</style>