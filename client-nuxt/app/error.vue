<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">

        <div class="error-number">{{ error?.statusCode || '?' }}</div>

        <div class="error-illustration">
          <div class="magnifying-glass">🔍</div>
          <div class="lost-icon">😕</div>
        </div>

        <h1 class="error-title">
          {{ error?.statusCode === 404 ? 'Страница не найдена' : 'Что-то пошло не так' }}
        </h1>
        <p class="error-description">
          {{ error?.statusCode === 404
            ? 'К сожалению, страница, которую вы ищете, не существует или была перемещена.'
            : (error?.message || 'Произошла неожиданная ошибка.') }}
        </p>

        <div class="suggestions">
          <h3 class="suggestions-title">Возможно, вас заинтересует:</h3>
          <div class="suggestions-links">
            <NuxtLink to="/" class="suggestion-link">🏠 Главная страница</NuxtLink>
            <NuxtLink to="/catalog" class="suggestion-link">🎯 Каталог квестов</NuxtLink>
            <NuxtLink to="/about" class="suggestion-link">ℹ️ О нас</NuxtLink>
          </div>
        </div>

        <div class="error-search">
          <p class="search-label">Или воспользуйтесь поиском:</p>
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск квестов..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="btn-search">Найти</button>
          </div>
        </div>

        <div class="back-button-wrapper">
          <button @click="handleError" class="btn-back">← Вернуться назад</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ error: Object })

const searchQuery = ref('')
const router = useRouter()

const handleError = () => clearError({ redirect: '/' })

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    clearError()
    router.push({ path: '/catalog', query: { search: searchQuery.value.trim() } })
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  padding: 40px 20px;
}
.container { max-width: 800px; margin: 0 auto; }
.not-found-content { text-align: center; }
.error-number {
  font-size: 12rem; font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  line-height: 1; margin-bottom: 32px;
  animation: float 3s ease-in-out infinite;
}
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
.error-illustration { position: relative; margin-bottom: 48px; height: 120px; }
.magnifying-glass { font-size: 8rem; animation: search 2s ease-in-out infinite; }
@keyframes search { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }
.lost-icon {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 3rem; animation: shake 0.5s ease-in-out infinite;
}
@keyframes shake {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  25% { transform: translate(-50%, -50%) rotate(-5deg); }
  75% { transform: translate(-50%, -50%) rotate(5deg); }
}
.error-title { font-size: 2.5rem; font-weight: 900; color: #2d3748; margin: 0 0 16px; }
.error-description { font-size: 1.1rem; color: #718096; line-height: 1.6; margin: 0 auto 48px; max-width: 500px; }
.suggestions { margin-bottom: 48px; }
.suggestions-title { font-size: 1.25rem; font-weight: 700; color: #4a5568; margin: 0 0 24px; }
.suggestions-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; max-width: 600px; margin: 0 auto; }
.suggestion-link {
  padding: 16px 24px; background: white; border: 2px solid #e2e8f0; border-radius: 12px;
  color: #4a5568; text-decoration: none; font-weight: 600; transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.suggestion-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; border-color: #667eea;
  transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.3);
}
.error-search { margin-bottom: 48px; }
.search-label { font-size: 1rem; color: #718096; margin: 0 0 16px; }
.search-box { display: flex; gap: 12px; max-width: 500px; margin: 0 auto; }
.search-input { flex: 1; padding: 14px 20px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; transition: border-color 0.3s; outline: none; }
.search-input:focus { border-color: #667eea; }
.btn-search { padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.3s; white-space: nowrap; }
.btn-search:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
.back-button-wrapper { margin-top: 32px; }
.btn-back { padding: 12px 32px; background: white; color: #667eea; border: 2px solid #667eea; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.btn-back:hover { background: #f7fafc; transform: translateY(-2px); }
@media (max-width: 768px) {
  .error-number { font-size: 8rem; }
  .error-title { font-size: 2rem; }
  .error-description { font-size: 1rem; }
  .suggestions-links { grid-template-columns: 1fr; }
  .search-box { flex-direction: column; }
  .btn-search { width: 100%; }
}
</style>