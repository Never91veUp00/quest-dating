<template>
  <div class="err">

    <!-- Фоновые орбы -->
    <div class="err__orb err__orb--1"></div>
    <div class="err__orb err__orb--2"></div>

    <div class="err__inner">

      <!-- Код ошибки -->
      <div class="err__code">{{ error?.statusCode || '?' }}</div>

      <!-- Заголовок -->
      <h1 class="err__title">
        {{ error?.statusCode === 404 ? 'Страница не найдена' : 'Что-то пошло не так' }}
      </h1>
      <p class="err__desc">
        {{ error?.statusCode === 404
          ? 'Эта страница переехала или никогда не существовала. Возможно, вы ищете что-то из каталога?'
          : (error?.message || 'Произошла неожиданная ошибка. Попробуйте обновить страницу.') }}
      </p>

      <!-- Навигация -->
      <div class="err__links">
        <NuxtLink to="/catalog" class="err__btn err__btn--primary" @click="clearError()">
          Перейти в каталог
        </NuxtLink>
        <NuxtLink to="/" class="err__btn err__btn--ghost" @click="clearError()">
          На главную
        </NuxtLink>
      </div>

      <!-- Поиск -->
      <div class="err__search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Найти квест..."
          class="err__input"
          @keyup.enter="handleSearch"
        />
        <button class="err__search-btn" @click="handleSearch">→</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ error: Object })
const searchQuery = ref('')
const router = useRouter()

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  clearError()
  router.push({ path: '/catalog', query: { search: searchQuery.value.trim() } })
}
</script>

<style scoped>
.err {
  min-height: 100vh;
  background: #0a0a0f;
  color: #f0ede8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.err__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.err__orb--1 {
  width: 400px; height: 400px;
  background: rgba(212,175,55,0.12);
  top: -100px; right: -100px;
}
.err__orb--2 {
  width: 300px; height: 300px;
  background: rgba(150,60,180,0.08);
  bottom: -80px; left: -80px;
}

.err__inner {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 480px;
  width: 100%;
}

.err__code {
  font-size: clamp(7rem, 25vw, 11rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #d4af37, #f5d36e, #b8860b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-12px); }
}

.err__title {
  font-size: clamp(1.4rem, 5vw, 2rem);
  font-weight: 900;
  margin: 0 0 14px;
  letter-spacing: -0.02em;
}

.err__desc {
  font-size: 0.95rem;
  color: rgba(240,237,232,0.55);
  line-height: 1.65;
  margin: 0 0 36px;
}

.err__links {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.err__btn {
  padding: 13px 28px;
  border-radius: 100px;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.err__btn--primary {
  background: #d4af37;
  color: #0a0a0f;
  box-shadow: 0 8px 24px rgba(212,175,55,0.3);
}
.err__btn--primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(212,175,55,0.4); }
.err__btn--ghost {
  background: transparent;
  color: rgba(240,237,232,0.7);
  border: 1px solid rgba(255,255,255,0.15);
}
.err__btn--ghost:hover { color: #f0ede8; border-color: rgba(255,255,255,0.3); }

.err__search {
  display: flex;
  gap: 8px;
  max-width: 360px;
  margin: 0 auto;
}
.err__input {
  flex: 1;
  padding: 12px 18px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;
  color: #f0ede8;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.err__input::placeholder { color: rgba(240,237,232,0.35); }
.err__input:focus { border-color: rgba(212,175,55,0.5); }
.err__search-btn {
  width: 44px; height: 44px;
  background: rgba(212,175,55,0.15);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 50%;
  color: #d4af37;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.err__search-btn:hover { background: rgba(212,175,55,0.25); }
</style>