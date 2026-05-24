<template>
  <div v-if="template" class="liza-pick" @click="router.push(`/date/${template.slug}`)">
    <!-- Фото/глоу -->
    <div class="liza-pick__img">
      <img
        v-if="isValidImageSrc(template.cover_image)"
        :src="template.cover_image"
        :alt="`${template.title} — свидание-квест для двоих`"
        loading="lazy"
        class="liza-pick__photo"
      />
      <div v-else class="liza-pick__fallback"></div>
      <div class="liza-pick__img-overlay"></div>
    </div>

    <!-- Контент -->
    <div class="liza-pick__body">
      <div class="liza-pick__header">
        <div class="liza-pick__avatar-wrap">
          <img :src="`/uploads/avatars/liza.jpg`" alt="Лиза Петри" class="liza-pick__avatar" />
        </div>
        <div>
          <div class="liza-pick__who">Лиза Петри рекомендует</div>
          <div class="liza-pick__badge">⭐ Выбор автора</div>
        </div>
      </div>

      <h3 class="liza-pick__title">{{ template.title }}</h3>
      <p class="liza-pick__quote">
        «Если не знаете с чего начать — возьмите этот. Он подходит почти для любого повода и всегда производит впечатление.»
      </p>

      <div class="liza-pick__foot">
        <span class="liza-pick__price">{{ formatPrice(template.base_price) }}</span>
        <NuxtLink :to="`/date/${template.slug}`" class="liza-pick__btn" @click.stop>
          Смотреть →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  template: { type: Object, default: null }
})

const router = useRouter()
const { isValidImageSrc } = useImageFallback()

const formatPrice = (v) => v ? `${Math.round(Number(v) / 100).toLocaleString('ru')} ₽` : '—'
</script>

<style scoped>
.liza-pick {
  display: flex; gap: 16px; align-items: stretch;
  background: rgba(212,175,55,0.06);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 20px; overflow: hidden;
  cursor: pointer; transition: border-color 0.2s;
  -webkit-tap-highlight-color: transparent;
  margin-bottom: 24px;
}
.liza-pick:hover { border-color: rgba(212,175,55,0.5); }

.liza-pick__img {
  width: 120px; flex-shrink: 0; position: relative; background: #0f0f14;
}
@media (max-width: 480px) { .liza-pick__img { width: 90px; } }

.liza-pick__photo { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.liza-pick__fallback {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at top right, #d4af3730 0%, #0a0a0f 70%);
}
.liza-pick__img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to right, transparent 60%, rgba(10,10,15,0.3) 100%);
}

.liza-pick__body { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 8px; }

.liza-pick__header { display: flex; align-items: center; gap: 10px; }
.liza-pick__avatar-wrap {
  width: 36px; height: 36px; border-radius: 50%; overflow: hidden;
  border: 2px solid rgba(212,175,55,0.4); flex-shrink: 0;
}
.liza-pick__avatar { width: 100%; height: 100%; object-fit: cover; }
.liza-pick__who { font-size: 11px; color: rgba(240,237,232,0.45); }
.liza-pick__badge { font-size: 11px; font-weight: 700; color: #d4af37; }

.liza-pick__title {
  font-size: 1rem; font-weight: 900; color: #f0ede8;
  margin: 0; line-height: 1.2; letter-spacing: -0.01em;
}

.liza-pick__quote {
  font-size: 0.8rem; color: rgba(240,237,232,0.5);
  line-height: 1.5; margin: 0; font-style: italic;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.liza-pick__foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.liza-pick__price { font-size: 1.1rem; font-weight: 900; color: #d4af37; }
.liza-pick__btn {
  font-size: 0.8rem; font-weight: 700; color: #d4af37;
  text-decoration: none; border: 1px solid rgba(212,175,55,0.3);
  padding: 5px 12px; border-radius: 100px; transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.liza-pick__btn:hover { background: rgba(212,175,55,0.1); }
</style>