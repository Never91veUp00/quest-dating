import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Импортируем глобальные стили
import './assets/styles/main.css'
import './assets/styles/variables.css'
import './assets/styles/animations.css'
import './assets/styles/admin.css'

// Создаём приложение
const app = createApp(App)

// Подключаем Pinia (state management)
const pinia = createPinia()
app.use(pinia)

// Подключаем роутер
app.use(router)

// Глобальные обработчики ошибок
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
  console.error('Component instance:', instance)
  
  // TODO: Отправка ошибок в систему мониторинга (Sentry, etc.)
}

app.config.warnHandler = (msg, instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn('Warning:', msg)
    console.warn('Trace:', trace)
  }
}

// Глобальные свойства (опционально)
app.config.globalProperties.$appName = 'Quest Dating'
app.config.globalProperties.$version = '1.0.0'

// Монтируем приложение
app.mount('#app')

// Логирование в режиме разработки
if (import.meta.env.DEV) {
  console.log('🎯 Quest Dating Application Started')
  console.log('Environment:', import.meta.env.MODE)
  console.log('API URL:', import.meta.env.VITE_API_URL)
}

// Service Worker (PWA) - опционально
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration)
      })
      .catch(error => {
        console.log('SW registration failed:', error)
      })
  })
}