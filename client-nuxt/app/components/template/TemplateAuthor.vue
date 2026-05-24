<template>
  <div class="ta">
    <h2 class="ta__title">Об авторе</h2>

    <div class="ta__card">
      <!-- Шапка: фото + имя + статс -->
      <div class="ta__header">
        <NuxtLink to="/about" class="ta__avatar-wrap">
          <img
            :src="withAvatarFallback(author.avatar_url)"
            :alt="author.display_name"
            class="ta__avatar"
            @error="onImgError"
          />
        </NuxtLink>

        <div class="ta__info">
          <NuxtLink to="/about" class="ta__name">{{ author.display_name }}</NuxtLink>
          <p class="ta__role">Создатель свиданий-квестов</p>
          <div class="ta__stats">
            <div class="ta__stat">
              <span class="ta__stat-num">{{ author.total_templates || 7 }}</span>
              <span class="ta__stat-lbl">квестов</span>
            </div>
            <div class="ta__stat-div"></div>
            <div class="ta__stat">
              <span class="ta__stat-num">100%</span>
              <span class="ta__stat-lbl">персонально</span>
            </div>
            <div class="ta__stat-div"></div>
            <div class="ta__stat">
              <span class="ta__stat-num">24ч</span>
              <span class="ta__stat-lbl">готовность</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Био -->
      <p v-if="author.bio" class="ta__bio">{{ author.bio }}</p>
      <p v-else class="ta__bio">
        Создаю персональные свидания-квесты с 2024 года. Каждый сценарий — с нуля, под вашу пару. Я знаю как трудно придумать что-то по-настоящему особенное — поэтому беру это на себя.
      </p>

      <!-- Соцсети -->
      <div class="ta__social">
        <a
          href="https://t.me/vinatian00"
          target="_blank" rel="noopener"
          class="ta__social-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
          Написать в Telegram
        </a>
        <NuxtLink to="/about" class="ta__about-link">О Лизе →</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { withAvatarFallback, onImgError } = useImageFallback()

defineProps({
  author: { type: Object, required: true }
})
</script>

<style scoped>
.ta__title {
  font-size: 1.2rem; font-weight: 900; color: #f0ede8;
  margin: 0 0 16px; letter-spacing: -0.01em;
}

.ta__card {
  background: rgba(212,175,55,0.05);
  border: 1px solid rgba(212,175,55,0.15);
  border-radius: 20px; padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
}

/* Header */
.ta__header { display: flex; gap: 16px; align-items: flex-start; }

.ta__avatar-wrap { flex-shrink: 0; text-decoration: none; }
.ta__avatar {
  width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(212,175,55,0.4);
  transition: border-color 0.2s;
}
.ta__avatar-wrap:hover .ta__avatar { border-color: #d4af37; }

.ta__info { flex: 1; min-width: 0; }
.ta__name {
  font-size: 1.1rem; font-weight: 900; color: #f0ede8;
  text-decoration: none; display: block; margin-bottom: 2px;
  transition: color 0.2s;
}
.ta__name:hover { color: #d4af37; }
.ta__role { font-size: 0.8rem; color: rgba(240,237,232,0.4); margin: 0 0 10px; }

.ta__stats { display: flex; align-items: center; gap: 10px; }
.ta__stat { display: flex; flex-direction: column; gap: 1px; }
.ta__stat-num { font-size: 0.9rem; font-weight: 800; color: #d4af37; }
.ta__stat-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(240,237,232,0.35); }
.ta__stat-div { width: 1px; height: 24px; background: rgba(255,255,255,0.08); }

/* Bio */
.ta__bio {
  font-size: 0.88rem; color: rgba(240,237,232,0.6);
  line-height: 1.65; margin: 0;
  padding-left: 12px;
  border-left: 2px solid rgba(212,175,55,0.3);
}

/* Social */
.ta__social { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.ta__social-btn {
  display: inline-flex; align-items: center; gap: 7px;
  background: #d4af37; color: #0a0a0f;
  padding: 10px 16px; border-radius: 100px;
  font-size: 0.85rem; font-weight: 700; text-decoration: none;
  -webkit-tap-highlight-color: transparent; transition: opacity 0.2s;
}
.ta__social-btn:hover { opacity: 0.9; }

.ta__about-link {
  font-size: 0.85rem; font-weight: 700; color: rgba(240,237,232,0.5);
  text-decoration: none; transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.ta__about-link:hover { color: #f0ede8; }
</style>