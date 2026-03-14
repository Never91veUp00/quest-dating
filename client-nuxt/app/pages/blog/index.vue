<template>
  <div class="blog-page">
    <section class="blog-hero">
      <div class="container">
        <h1 class="blog-title">Блог о свиданиях-квестах</h1>
        <p class="blog-subtitle">
          Идеи для романтических вечеров, советы по организации и вдохновляющие истории от Лизы Петри
        </p>
      </div>
    </section>

    <section class="blog-content">
      <div class="container">
        <Breadcrumbs :crumbs="breadcrumbs" />

        <div class="posts-grid">
          <NuxtLink
            v-for="post in posts"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="post-card"
          >
            <div class="post-image">
              <img :src="post.image" :alt="post.title" loading="lazy" />
              <span class="post-category">{{ post.category }}</span>
            </div>
            <div class="post-body">
              <div class="post-meta">
                <time :datetime="post.date">{{ formatDate(post.date) }}</time>
                <span class="post-reading">{{ post.readingTime }} мин чтения</span>
              </div>
              <h2 class="post-title">{{ post.title }}</h2>
              <p class="post-excerpt">{{ post.excerpt }}</p>
              <span class="post-link">Читать статью →</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { BLOG_POSTS } from '~/data/blogPosts'

const posts = BLOG_POSTS

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Блог' },
]

const formatDate = (iso) => new Date(iso).toLocaleDateString('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric'
})

useSeoMeta({
  title: 'Блог о свиданиях-квестах — советы и идеи | Quest Dating',
  description: 'Идеи для романтических свиданий-квестов, советы по организации и вдохновляющие истории. Блог Лизы Петри — создателя персональных квестов для пар.',
  ogTitle: 'Блог о свиданиях-квестах | Quest Dating',
  ogDescription: 'Идеи для романтических свиданий, советы по организации квестов и вдохновляющие истории от Лизы Петри.',
  ogImage: 'https://questdating.ru/og-image.jpg',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Блог Quest Dating',
      description: 'Идеи для романтических свиданий-квестов',
      url: 'https://questdating.ru/blog',
      author: {
        '@type': 'Person',
        name: 'Лиза Петри',
        url: 'https://questdating.ru/about',
      },
    })
  }]
})
</script>

<style scoped>
.blog-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0 60px;
  text-align: center;
}

.blog-title {
  font-size: 3rem;
  font-weight: 900;
  margin: 0 0 16px;
}

.blog-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.blog-content {
  padding: 48px 0 80px;
  background: #f7fafc;
  min-height: 60vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 32px;
}

.post-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

.post-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.post-card:hover .post-image img {
  transform: scale(1.05);
}

.post-category {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
}

.post-body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #718096;
}

.post-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  line-height: 1.4;
}

.post-excerpt {
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-link {
  font-size: 0.9rem;
  font-weight: 600;
  color: #667eea;
}

@media (max-width: 1024px) {
  .posts-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .blog-hero { padding: 100px 0 40px; }
  .blog-title { font-size: 2rem; }
  .posts-grid { grid-template-columns: 1fr; }
}
</style>