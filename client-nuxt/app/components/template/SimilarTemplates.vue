<template>
  <div class="st">
    <div class="st__head">
      <h2 class="st__title">Похожие квесты</h2>
      <NuxtLink to="/catalog" class="st__all">Все →</NuxtLink>
    </div>

    <div v-if="loading" class="st__loading">
      <Loader text="" />
    </div>

    <div v-else-if="templates.length === 0" class="st__empty">
      Больше квестов в каталоге
    </div>

    <div v-else class="st__scroll">
      <div
        v-for="t in templates"
        :key="t.id"
        class="st__card"
        @click="router.push(`/date/${t.slug}`)"
      >
        <!-- Фото/глоу -->
        <div class="st__card-img">
          <img
            v-if="isValidImageSrc(t.cover_image)"
            :src="t.cover_image"
            :alt="`${t.title} — свидание-квест для двоих`"
            loading="lazy"
            decoding="async"
            class="st__card-photo"
          />
          <div v-else class="st__card-fallback" :style="glowStyle(t.difficulty)"></div>
          <div class="st__card-overlay"></div>
        </div>

        <!-- Быстрый просмотр -->
        <button
          class="st__card-eye"
          @click.stop="openQuickView(t)"
          aria-label="Быстрый просмотр"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>

        <!-- Инфо -->
        <div class="st__card-body">
          <div class="st__card-cat">{{ t.category_name }}</div>
          <h3 class="st__card-title">{{ t.title }}</h3>
          <div v-if="t.tags?.length" class="st__card-tags">
            <span v-for="tag in t.tags.slice(0,2)" :key="tag.id" class="st__card-tag">{{ tag.name }}</span>
            <span v-if="t.tags.length > 2" class="st__card-tag st__card-tag--more">+{{ t.tags.length - 2 }}</span>
          </div>
          <div class="st__card-foot">
            <span class="st__card-price">{{ formatPrice(t.base_price) }}</span>
            <span class="st__card-time">⏱ {{ formatDur(t.duration_minutes) }}</span>
            <span v-if="t.orders_count > 0" class="st__card-orders">🔥 {{ t.orders_count }}</span>
          </div>
        </div>
      </div>
    </div>

    <QuickViewModal
      :template="quickViewTemplate"
      :is-open="showQuickView"
      @close="showQuickView = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  templateSlug: { type: String, required: true }
})

const router = useRouter()
const { getSimilarDates } = useDatesApi()
const { isValidImageSrc } = useImageFallback()

const templates         = ref([])
const loading           = ref(true)
const showQuickView     = ref(false)
const quickViewTemplate = ref(null)
const openQuickView = (t) => { quickViewTemplate.value = t; showQuickView.value = true }

onMounted(async () => {
  try {
    const res = await getSimilarDates(props.templateSlug)
    templates.value = (res?.data || res || []).slice(0, 6)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const DIFF_GLOW = {
  easy:   '#10b981', medium: '#d4af37', hard: '#f97316', expert: '#ef4444'
}
const glowStyle   = (d) => ({ background: `radial-gradient(ellipse at top right, ${(DIFF_GLOW[d]||'#d4af37')}25 0%, #0a0a0f 70%)` })
const formatPrice = (v) => v ? `${Math.round(Number(v)/100).toLocaleString('ru')} ₽` : '—'
const formatDur   = (m) => { if (!m) return ''; const h=Math.floor(m/60),mn=m%60; return h>0?(mn>0?`${h}ч ${mn}м`:`${h}ч`):`${mn}м` }
</script>

<style scoped>
.st__head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.st__title { font-size: 1.2rem; font-weight: 900; color: #f0ede8; margin: 0; letter-spacing: -0.01em; }
.st__all { font-size: 0.9rem; font-weight: 700; color: #d4af37; text-decoration: none; }

.st__loading { padding: 32px 0; text-align: center; }
.st__empty { font-size: 0.85rem; color: rgba(240,237,232,0.35); padding: 16px 0; }

/* Сетка 2 колонки */
.st__scroll {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* Карточка */
.st__card {
  position: relative;
  border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column; height: 100%;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: transform 0.2s; background: #0f0f14;
}
.st__card:hover { transform: scale(1.02); }

/* Фото — фиксированная высота */
.st__card-img {
  position: relative; height: 130px; flex-shrink: 0; overflow: hidden;
}
.st__card-photo { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.st__card-fallback { position: absolute; inset: 0; }
.st__card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%);
}

.st__card-eye {
  position: absolute; top: 8px; right: 8px; z-index: 3;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer; opacity: 0; transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.st__card:hover .st__card-eye { opacity: 1; }
@media (hover: none) { .st__card-eye { opacity: 1; } }

/* Тело — растёт */
.st__card-body {
  display: flex; flex-direction: column; flex: 1;
  padding: 10px; background: #111118;
}
.st__card-cat {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
  color: rgba(255,255,255,0.4); margin-bottom: 2px;
}
.st__card-title {
  font-size: 12px; font-weight: 800; color: #fff; flex: 1;
  line-height: 1.2; margin: 0 0 6px; letter-spacing: -0.01em;
}
.st__card-tags { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 5px; }
.st__card-tag { font-size: 9px; font-weight: 600; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 2px 6px; border-radius: 4px; }
.st__card-tag--more { background: rgba(212,175,55,0.15); color: #d4af37; }
.st__card-foot { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.st__card-orders { font-size: 10px; font-weight: 700; color: #fb923c; }
.st__card-price { font-size: 13px; font-weight: 900; color: #d4af37; }
.st__card-time { font-size: 10px; color: rgba(255,255,255,0.4); }
</style>