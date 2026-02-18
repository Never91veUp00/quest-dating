<template>
  <div id="app" :class="{ 'mobile-menu-open': mobileMenuOpen }">
    <!-- Header -->
    <Header @toggle-mobile-menu="handleMobileMenuToggle" />

    <!-- Main Content -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Scroll to Top Button -->
    <transition name="fade">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="scroll-to-top"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </transition>

    <!-- Global Loader (для глобальных операций) -->
    <transition name="fade">
      <div v-if="globalLoading" class="global-loader">
        <Loader text="Загрузка..." size="large" overlay />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestStore } from '@/store'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import Loader from '@/components/common/Loader.vue'

const route = useRoute()
const questStore = useQuestStore()

const mobileMenuOpen = ref(false)
const showScrollTop = ref(false)
const globalLoading = ref(false)

// Обработка мобильного меню
const handleMobileMenuToggle = (isOpen) => {
  mobileMenuOpen.value = isOpen
  
  // Блокируем/разблокируем прокрутку body
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Отслеживание прокрутки для кнопки "Наверх"
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

// Прокрутка наверх
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Закрытие мобильного меню при смене роута
watch(() => route.path, () => {
  if (mobileMenuOpen.value) {
    handleMobileMenuToggle(false)
  }
})

// Предзагрузка данных при монтировании приложения
const preloadData = async () => {
  try {
    // Загружаем категории и теги для фильтров
    await Promise.all([
      questStore.fetchCategories(),
      questStore.fetchPopularTags()
    ])
  } catch (error) {
    console.error('Error preloading data:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  preloadData()
  
  // Устанавливаем мета-теги по умолчанию
  document.title = 'Quest Dating - Маркетплейс шаблонов квестов для свиданий'
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  line-height: 1.6;
  color: #2d3748;
  background: #ffffff;
}

/* App Container */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  position: relative;
}

/* Mobile Menu Open State */
#app.mobile-menu-open {
  overflow: hidden;
  height: 100vh;
}

/* Scroll to Top Button */
.scroll-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-to-top:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.scroll-to-top:active {
  transform: translateY(-2px);
}

/* Global Loader */
.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Links */
a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #764ba2;
}

/* Selection */
::selection {
  background: #667eea;
  color: white;
}

::-moz-selection {
  background: #667eea;
  color: white;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: #f7fafc;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 6px;
  border: 3px solid #f7fafc;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Focus Styles */
*:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

button:focus,
a:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Disabled Elements */
button:disabled,
input:disabled,
textarea:disabled,
select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Responsive Typography */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }

  .scroll-to-top {
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
}

/* Print Styles */
@media print {
  .scroll-to-top,
  header,
  footer {
    display: none;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Dark Mode Support (future) */
@media (prefers-color-scheme: dark) {
  /* 
  body {
    background: #1a202c;
    color: #e2e8f0;
  }
  */
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 3rem; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mb-5 { margin-bottom: 3rem; }

.pt-0 { padding-top: 0; }
.pt-1 { padding-top: 0.25rem; }
.pt-2 { padding-top: 0.5rem; }
.pt-3 { padding-top: 1rem; }
.pt-4 { padding-top: 1.5rem; }
.pt-5 { padding-top: 3rem; }

.pb-0 { padding-bottom: 0; }
.pb-1 { padding-bottom: 0.25rem; }
.pb-2 { padding-bottom: 0.5rem; }
.pb-3 { padding-bottom: 1rem; }
.pb-4 { padding-bottom: 1.5rem; }
.pb-5 { padding-bottom: 3rem; }

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Container Helper */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
}
</style>