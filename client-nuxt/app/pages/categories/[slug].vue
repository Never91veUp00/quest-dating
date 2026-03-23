<template>
  <div class="cp">

    <div v-if="pending" class="cp__loading">
      <Loader text="Загружаем категорию..." />
    </div>

    <div v-else-if="error || !category" class="cp__error">
      <p>😕 Категория не найдена</p>
      <NuxtLink to="/catalog" class="cp__back">← В каталог</NuxtLink>
    </div>

    <template v-else>

      <!-- Hero -->
      <section class="cp__hero">
        <div class="cp__container">
          <NuxtLink to="/catalog" class="cp__back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Все квесты
          </NuxtLink>
          <div class="cp__hero-inner">
            <span class="cp__icon">{{ category.icon }}</span>
            <div>
              <h1 class="cp__title">{{ category.name }}</h1>
              <p class="cp__desc">{{ category.description }}</p>
              <span class="cp__count">{{ category.templates_count }} {{ pluralize(category.templates_count) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Квесты -->
      <div class="cp__container cp__body">

        <!-- Сортировка -->
        <div class="cp__toolbar">
          <span class="cp__toolbar-count">
            {{ templates.length }} {{ pluralize(templates.length) }}
          </span>
          <select v-model="sortBy" @change="handleSortChange" class="cp__sort">
            <option value="newest">Новые</option>
            <option value="rating">По рейтингу</option>
            <option value="orders">Популярные</option>
            <option value="price">По цене</option>
          </select>
        </div>

        <!-- Загрузка -->
        <div v-if="templatesPending" class="cp__loading-inner">
          <Loader text="Загружаем квесты..." />
        </div>

        <!-- Пусто -->
        <div v-else-if="templates.length === 0" class="cp__empty">
          <p>🗂️ В этой категории пока нет квестов</p>
          <NuxtLink to="/catalog" class="cp__back-link">Смотреть все →</NuxtLink>
        </div>

        <!-- Сетка -->
        <div v-else>
          <div class="cp__grid">
            <TemplateCard
              v-for="t in visibleTemplates"
              :key="t.id"
              :template="t"
              @quickView="openQuickView(t)"
            />
          </div>

          <!-- Загрузить ещё -->
          <div v-if="hasMore" class="cp__more">
            <button class="cp__more-btn" @click="visibleCount += pageSize">
              Показать ещё {{ Math.min(pageSize, sortedTemplates.length - visibleCount) }} квестов
            </button>
            <p class="cp__more-hint">Показано {{ visibleCount }} из {{ sortedTemplates.length }}</p>
          </div>
        </div>

        <!-- Другие категории -->
        <div v-if="relatedCategories.length" class="cp__related">
          <h2 class="cp__related-title">Другие категории</h2>
          <div class="cp__related-grid">
            <NuxtLink
              v-for="cat in relatedCategories"
              :key="cat.id"
              :to="`/categories/${cat.slug}`"
              class="cp__related-item"
            >
              <span class="cp__related-icon">{{ cat.icon }}</span>
              <span class="cp__related-name">{{ cat.name }}</span>
              <span class="cp__related-count">{{ cat.templates_count }}</span>
            </NuxtLink>
          </div>
        </div>

      </div>

      <!-- QuickView -->
      <QuickViewModal
        :template="quickViewTemplate"
        :is-open="showQuickView"
        @close="showQuickView = false"
      />

    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const route  = useRoute()
const { getCategory, getDates, getCategories } = useDatesApi()

const { data: categoryRaw, pending, error } = await useAsyncData(
  `category-${route.params.slug}`,
  () => getCategory(route.params.slug),
  { transform: (d) => JSON.parse(JSON.stringify(d)) }
)
const category = computed(() => categoryRaw.value?.data ?? categoryRaw.value ?? null)

const SITE_URL = 'https://questdating.ru'

useSeoMeta({
  title:         () => category.value ? `${category.value.name} — свидание-квест | Quest Dating` : 'Категория | Quest Dating',
  description:   () => category.value?.description ?? null,
  ogTitle:       () => category.value?.name ?? null,
  ogDescription: () => category.value?.description ?? null,
  ogImage:       `${SITE_URL}/og-image.jpg`,
})

if (category.value) {
  useServerHead({
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Каталог квестов', item: `${SITE_URL}/catalog` },
        { '@type': 'ListItem', position: 3, name: category.value.name, item: `${SITE_URL}/categories/${category.value.slug}` },
      ]
    })}]
  })
}

const { data: templatesRaw, pending: templatesPending } = await useAsyncData(
  `category-templates-${route.params.slug}`,
  () => category.value ? getDates({ category: category.value.slug }) : Promise.resolve(null),
  { watch: [() => route.params.slug], transform: (d) => d ? JSON.parse(JSON.stringify(d)) : null }
)
const templates = computed(() => templatesRaw.value?.data ?? templatesRaw.value ?? [])

const { data: categoriesRaw } = await useAsyncData(
  'all-categories-v2',
  () => getCategories(),
  { transform: (d) => JSON.parse(JSON.stringify(d)) }
)
const allCategories = computed(() => categoriesRaw.value?.data ?? categoriesRaw.value ?? [])

const sortBy      = ref(route.query.sort_by || 'newest')
const pageSize    = 6
const visibleCount = ref(pageSize)

const showQuickView     = ref(false)
const quickViewTemplate = ref(null)
const openQuickView = (t) => { quickViewTemplate.value = t; showQuickView.value = true }

const sortedTemplates = computed(() => {
  const s = [...templates.value]
  switch (sortBy.value) {
    case 'rating':  return s.sort((a, b) => (b.rating || 0)       - (a.rating || 0))
    case 'orders':  return s.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0))
    case 'price':   return s.sort((a, b) => (a.base_price || 0)   - (b.base_price || 0))
    default:        return s.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
  }
})

const visibleTemplates = computed(() => sortedTemplates.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < sortedTemplates.value.length)

const relatedCategories = computed(() =>
  allCategories.value.filter(c => c.id !== category.value?.id).slice(0, 6)
)

const handleSortChange = () => { visibleCount.value = pageSize }

const pluralize = (n) =>
  ['квест', 'квеста', 'квестов'][n % 100 > 10 && n % 100 < 20 ? 2 : [2, 0, 1, 1, 1, 2][Math.min(n % 10, 5)]]
</script>

<style scoped>
.cp { background: #0a0a0f; color: #f0ede8; min-height: 100vh; padding-bottom: 60px; overflow-x: hidden; }
.cp__container { max-width: 600px; margin: 0 auto; padding: 0 16px; width: 100%; box-sizing: border-box; }
@media (min-width: 768px) { .cp__container { max-width: 900px; padding: 0 24px; } }
@media (min-width: 1200px) { .cp__container { max-width: 1100px; } }

/* States */
.cp__loading, .cp__error {
  min-height: 60vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px; padding: 40px 20px; text-align: center;
}
.cp__error p { font-size: 1.1rem; color: rgba(240,237,232,0.6); margin: 0; }
.cp__back { color: #d4af37; text-decoration: none; font-weight: 700; }

/* Hero */
.cp__hero {
  padding: calc(64px + env(safe-area-inset-top) + 16px) 0 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);
}
.cp__back-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.8rem; color: rgba(240,237,232,0.4); text-decoration: none; margin-bottom: 16px;
  -webkit-tap-highlight-color: transparent;
}
.cp__back-link:hover { color: #f0ede8; }

.cp__hero-inner { display: flex; align-items: flex-start; gap: 16px; }
.cp__icon { font-size: 2.5rem; flex-shrink: 0; margin-top: 4px; }
.cp__title {
  font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 900;
  margin: 0 0 6px; letter-spacing: -0.02em;
}
.cp__desc { font-size: 0.9rem; color: rgba(240,237,232,0.55); margin: 0 0 8px; line-height: 1.6; white-space: pre-line; max-width: 640px; }
.cp__count { font-size: 0.78rem; color: rgba(240,237,232,0.3); font-weight: 600; }

/* Body */
.cp__body { padding-top: 20px; }

/* Toolbar */
.cp__toolbar {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px;
}
.cp__toolbar-count {
  font-size: 0.88rem; font-weight: 700; color: rgba(240,237,232,0.6);
  white-space: nowrap;
}
.cp__sort {
  padding: 6px 10px; font-size: 0.82rem;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; color: #f0ede8; cursor: pointer;
  margin-left: auto; width: auto; max-width: 120px;
  -webkit-appearance: none; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(240,237,232,0.4)'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 8px center;
  padding-right: 24px;
}
.cp__sort option { background: #1a1a24; }

/* Grid */
.cp__loading-inner { padding: 40px 0; text-align: center; }
.cp__empty { text-align: center; padding: 48px 0; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.cp__empty p { color: rgba(240,237,232,0.4); margin: 0; }

.cp__grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;
}
@media (min-width: 640px)  { .cp__grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
@media (min-width: 1024px) { .cp__grid { grid-template-columns: repeat(4, 1fr); gap: 18px; } }

/* Load more */
.cp__more { text-align: center; padding: 8px 0 20px; }
.cp__more-btn {
  padding: 13px 28px; border-radius: 100px; width: 100%; max-width: 320px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
  color: #f0ede8; font-weight: 700; font-size: 0.9rem; cursor: pointer;
  transition: border-color 0.2s; -webkit-tap-highlight-color: transparent;
}
.cp__more-btn:hover { border-color: #d4af37; }
.cp__more-hint { font-size: 0.75rem; color: rgba(240,237,232,0.25); margin: 8px 0 0; }

/* Related */
.cp__related { margin-top: 40px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); }
.cp__related-title { font-size: 1.1rem; font-weight: 900; color: #f0ede8; margin: 0 0 16px; }
.cp__related-grid { display: flex; flex-direction: column; gap: 8px; }
@media (min-width: 640px) { .cp__related-grid { display: grid; grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .cp__related-grid { grid-template-columns: repeat(3, 1fr); } }

.cp__related-item {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 12px; text-decoration: none;
  -webkit-tap-highlight-color: transparent; transition: border-color 0.2s;
}
.cp__related-item:hover { border-color: rgba(212,175,55,0.3); }
.cp__related-icon { font-size: 1.4rem; flex-shrink: 0; }
.cp__related-name { flex: 1; font-size: 0.85rem; font-weight: 700; color: rgba(240,237,232,0.7); line-height: 1.3; }
.cp__related-count {
  flex-shrink: 0; font-size: 0.72rem; font-weight: 700;
  background: rgba(212,175,55,0.1); color: #d4af37;
  padding: 2px 7px; border-radius: 100px;
}
</style>