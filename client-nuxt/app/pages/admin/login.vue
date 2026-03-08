<template>
  <div class="login-root">
    <div class="login-card">
      <div class="login-logo">🗝️</div>
      <h1 class="login-title">Admin</h1>
      <p class="login-sub">Quest Dating</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="login-field">
          <label>Логин</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            autofocus
            :disabled="loading"
          />
        </div>
        <div class="login-field">
          <label>Пароль</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="login-error">{{ error }}</div>

        <button type="submit" class="login-btn" :disabled="loading || !username || !password">
          <span v-if="loading" class="login-spinner"></span>
          <span v-else>Войти →</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'


const router = useRouter()
const auth   = useAuthStore()

// Редирект если уже залогинен
if (auth.isAuthenticated) {
  await navigateTo('/admin')
}

const username = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

const handleLogin = async () => {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    await navigateTo('/admin')
  } catch (e) {
    error.value = auth.error || e.message || 'Неверный логин или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f1117;
  padding: 20px;
}
.login-card {
  background: #1a1f2e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 360px;
  text-align: center;
}
.login-logo { font-size: 3rem; margin-bottom: 12px; }
.login-title { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0 0 4px; }
.login-sub { font-size: 0.85rem; color: #4a5568; margin: 0 0 36px; }
.login-form { display: flex; flex-direction: column; gap: 16px; text-align: left; }
.login-field { display: flex; flex-direction: column; gap: 6px; }
.login-field label { font-size: 0.8rem; color: #718096; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
.login-field input {
  background: #0f1117;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 11px 14px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}
.login-field input:focus { border-color: #667eea; }
.login-field input:disabled { opacity: 0.5; }
.login-error {
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.85rem;
  color: #fc8181;
}
.login-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  padding: 13px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
.login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(102,126,234,0.4); }
.login-btn:disabled { opacity: 0.5; cursor: default; }
.login-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>