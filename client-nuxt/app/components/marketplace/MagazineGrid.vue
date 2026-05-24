<template>
  <div>
    <div v-if="loading" class="mag__loading">
      <Loader text="Загружаем квесты..." />
    </div>

    <div v-else-if="templates.length" class="mag__grid">
      <!-- Большая карточка — первый квест -->
      <article
        class="mag-card mag-card--big"
        @click="router.push(`/date/${templates[0].slug}`)"
      >
        <div class="mag-card__bg">
          <img
            v-if="isValidImageSrc(templates[0].cover_image)"
            :src="templates[0].cover_image"
            :alt="`${templates[0].title} — свидание-квест для двоих`"
            loading="lazy" decoding="async"
            class="mag-card__photo"
          />
          <div class="mag-card__fallback" :style="glowStyle(templates[0].difficulty)"></div>
          <div class="mag-card__overlay"></div>
        </div>
        <div class="mag-card__body">
          <div class="mag-card__top-row">
            <span class="mag-card__badge" :style="badgeStyle(templates[0].difficulty)">
              {{ diffLabel(templates[0].difficulty) }}
            </span>
            <button
              class="mag-card__preview"
              @click.stop="openQuickView(templates[0])"
              aria-label="Быстрый просмотр"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
              </svg>
            </button>
          </div>
          <div class="mag-card__bottom">
            <div class="mag-card__cat">{{ templates[0].category_name }}</div>
            <h3 class="mag-card__title">{{ templates[0].title }}</h3>
            <p class="mag-card__tagline">{{ templates[0].tagline }}</p>
            <div v-if="templates[0].tags?.length" class="mag-card__tags">
              <span v-for="tag in templates[0].tags.slice(0,2)" :key="tag.id" class="mag-card__tag">{{ tag.name }}</span>
            </div>
            <div class="mag-card__foot">
              <span class="mag-card__price">{{ formatPrice(templates[0].base_price) }}</span>
              <span class="mag-card__meta">⏱ {{ formatDur(templates[0].duration_minutes) }}</span>
              <span v-if="templates[0].orders_count > 0" class="mag-card__orders">🔥 {{ templates[0].orders_count }}</span>
            </div>
          </div>
        </div>
      </article>

      <!-- Две маленьких -->
      <div class="mag__small-row">
        <article
          v-for="t in templates.slice(1, 3)"
          :key="t.id"
          class="mag-card mag-card--sm"
          @click="router.push(`/date/${t.slug}`)"
        >
          <div class="mag-card__bg">
            <img
              v-if="isValidImageSrc(t.cover_image)"
              :src="t.cover_image"
              :alt="`${t.title} — свидание-квест для двоих`"
              loading="lazy" decoding="async"
              class="mag-card__photo"
            />
            <div class="mag-card__fallback" :style="glowStyle(t.difficulty)"></div>
            <div class="mag-card__overlay"></div>
          </div>
          <div class="mag-card__body">
            <div class="mag-card__top-row">
              <span class="mag-card__badge" :style="badgeStyle(t.difficulty)">
                {{ diffLabel(t.difficulty) }}
              </span>
              <button
                class="mag-card__preview"
                @click.stop="openQuickView(t)"
                aria-label="Быстрый просмотр"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
                </svg>
              </button>
            </div>
            <div class="mag-card__bottom">
              <div class="mag-card__cat">{{ t.category_name }}</div>
              <h3 class="mag-card__title">{{ t.title }}</h3>
              <div v-if="t.tags?.length" class="mag-card__tags">
                <span v-for="tag in t.tags.slice(0,1)" :key="tag.id" class="mag-card__tag">{{ tag.name }}</span>
              </div>
              <div class="mag-card__foot">
                <span class="mag-card__price">{{ formatPrice(t.base_price) }}</span>
                <span class="mag-card__meta">⏱ {{ formatDur(t.duration_minutes) }}</span>
                <span v-if="t.orders_count > 0" class="mag-card__orders">🔥 {{ t.orders_count }}</span>
              </div>
            </div>
          </div>
        </article>
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
import { ref } from 'vue'

const props = defineProps({
  templates: { type: Array, default: () => [] },
  loading:   { type: Boolean, default: false },
})

const router = useRouter()
const { isValidImageSrc } = useImageFallback()

const showQuickView    = ref(false)
const quickViewTemplate = ref(null)

const openQuickView = (t) => {
  quickViewTemplate.value = t
  showQuickView.value = true
}

const DIFF = {
  easy:   { label: 'Лёгкий',  glow: '#10b981', badge: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#6ee7b7' },
  medium: { label: 'Средний', glow: '#d4af37', badge: 'rgba(212,175,55,0.15)',  border: 'rgba(212,175,55,0.4)',  color: '#fcd34d' },
  hard:   { label: 'Сложный', glow: '#f97316', badge: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.4)',  color: '#fdba74' },
  expert: { label: 'Эксперт', glow: '#ef4444', badge: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   color: '#fca5a5' },
}

const diffLabel  = (d) => (DIFF[d] || DIFF.medium).label
const glowStyle  = (d) => ({ background: `radial-gradient(ellipse at top right, ${(DIFF[d]||DIFF.medium).glow}25 0%, #0a0a0f 70%)` })
const badgeStyle = (d) => { const dd = DIFF[d]||DIFF.medium; return { background: dd.badge, borderColor: dd.border, color: dd.color } }
const formatPrice = (v) => v ? `${Math.round(Number(v)/100).toLocaleString('ru')} ₽` : '—'
const formatDur   = (m) => { if (!m) return ''; const h=Math.floor(m/60),mn=m%60; return h>0?(mn>0?`${h}ч ${mn}м`:`${h}ч`):`${mn}м` }
</script>

<style scoped>
.mag__loading { padding: 40px 0; text-align: center; }
.mag__grid { display: flex; flex-direction: column; gap: 10px; }
.mag__small-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.mag-card {
  position: relative; border-radius: 20px; overflow: hidden;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: transform 0.2s;
}
.mag-card:hover { transform: scale(1.01); }
.mag-card--big { aspect-ratio: 16/9; }
.mag-card--sm  { aspect-ratio: 4/5; }

.mag-card__bg { position: absolute; inset: 0; background: #0f0f14; }
.mag-card__photo { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.mag-card__fallback { position: absolute; inset: 0; }
.mag-card__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.82) 100%);
}

.mag-card__body {
  position: relative; z-index: 2; height: 100%;
  display: flex; flex-direction: column; justify-content: space-between; padding: 14px;
}

.mag-card__top-row { display: flex; justify-content: space-between; align-items: flex-start; }

.mag-card__badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  padding: 3px 8px; border-radius: 100px; border: 1px solid; backdrop-filter: blur(8px);
}

.mag-card__preview {
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.7); cursor: pointer; backdrop-filter: blur(8px);
  -webkit-tap-highlight-color: transparent; flex-shrink: 0; transition: background 0.2s;
}
.mag-card__preview:hover { background: rgba(255,255,255,0.2); }

.mag-card__bottom {}
.mag-card__cat { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
.mag-card__title {
  font-size: clamp(14px, 4vw, 18px); font-weight: 900; color: #fff;
  line-height: 1.15; margin: 0 0 4px; letter-spacing: -0.01em;
}
.mag-card--sm .mag-card__title { font-size: 13px; }
.mag-card__tagline { font-size: 11px; color: rgba(255,255,255,0.5); margin: 0 0 8px; line-height: 1.4; }
.mag-card__foot { display: flex; justify-content: space-between; align-items: center; }
.mag-card__tags { display: flex; gap: 3px; flex-wrap: wrap; margin-bottom: 5px; }
.mag-card__tag { font-size: 9px; font-weight: 600; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.65); padding: 2px 6px; border-radius: 4px; }
.mag-card__orders { font-size: 10px; font-weight: 700; color: #fb923c; margin-left: auto; }
.mag-card__price { font-size: 16px; font-weight: 900; color: #d4af37; }
.mag-card--sm .mag-card__price { font-size: 14px; }
.mag-card__meta { font-size: 11px; color: rgba(255,255,255,0.4); }
</style>