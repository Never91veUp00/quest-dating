<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="container">
      <div class="header-content">

        <NuxtLink to="/" class="logo">
          <span class="logo-icon">🎯</span>
          <span class="logo-text">Quest Dating</span>
        </NuxtLink>

        <!-- Навигация Desktop -->
        <nav class="nav-desktop">
          <NuxtLink to="/" class="nav-link">Главная</NuxtLink>
          <NuxtLink to="/catalog" class="nav-link">Квесты</NuxtLink>
          <NuxtLink to="/about" class="nav-link">О создателе</NuxtLink>
          <!-- ❌ Удалено: /authors, /about (О платформе) -->
        </nav>

        <div class="header-actions">
          <!-- ❌ Было: /become-author "Стать автором" -->
          <NuxtLink to="/catalog" class="btn-author">
            Заказать свидание-квест
          </NuxtLink>
          <button @click="toggleMobileMenu" class="btn-mobile-menu">
            <span class="hamburger" :class="{ active: mobileMenuOpen }">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Мобильное меню -->
    <transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <nav class="mobile-nav">
          <NuxtLink to="/" class="mobile-nav-link" @click="closeMobileMenu">
            Главная
          </NuxtLink>
          <NuxtLink to="/catalog" class="mobile-nav-link" @click="closeMobileMenu">
            Квесты
          </NuxtLink>
          <NuxtLink to="/about" class="mobile-nav-link" @click="closeMobileMenu">
            О создателе
          </NuxtLink>
          <!-- ❌ Удалено: /authors -->
          <!-- ❌ Было: /become-author "Стать автором" -->
          <NuxtLink to="/catalog" class="mobile-nav-link highlighted" @click="closeMobileMenu">
            Заказать свидание-квест
          </NuxtLink>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.header.scrolled {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-bottom-color: #e2e8f0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  font-weight: 800;
  font-size: 1.5rem;
  color: #2d3748;
  transition: transform 0.3s;
  outline: none; /* ← ДОБАВЛЕНО */
}

.logo:hover {
  transform: scale(1.05);
}

.logo:focus {
  outline: none; /* ← ДОБАВЛЕНО */
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-desktop {
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: #4a5568;
  font-weight: 600;
  font-size: 1rem;
  transition: color 0.3s;
  position: relative;
  outline: none; /* ← ДОБАВЛЕНО */
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.nav-link:hover {
  color: #667eea;
}

.nav-link:hover::after,
.nav-link.router-link-active::after,
.nav-link:focus::after { /* ← ДОБАВЛЕНО */
  width: 100%;
}

.nav-link.router-link-active,
.nav-link:focus { /* ← ДОБАВЛЕНО */
  color: #667eea;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-author {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  outline: none; /* ← ДОБАВЛЕНО */
}

.btn-author:hover,
.btn-author:focus { /* ← ДОБАВЛЕНО */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-mobile-menu {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  outline: none; /* ← ДОБАВЛЕНО */
}

.btn-mobile-menu:focus {
  outline: none; /* ← ДОБАВЛЕНО */
}

.hamburger {
  width: 28px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.hamburger span {
  width: 100%;
  height: 3px;
  background: #2d3748;
  border-radius: 2px;
  transition: all 0.3s;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.mobile-menu {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 999;
  overflow-y: auto;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.mobile-nav-link {
  padding: 16px 20px;
  text-decoration: none;
  color: #2d3748;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: all 0.3s;
  outline: none; /* ← ДОБАВЛЕНО */
}

.mobile-nav-link:hover,
.mobile-nav-link:focus, /* ← ДОБАВЛЕНО */
.mobile-nav-link.router-link-active {
  background: #f7fafc;
  color: #667eea;
}

.mobile-nav-link.highlighted {
  margin-top: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.mobile-nav-link.highlighted:hover,
.mobile-nav-link.highlighted:focus { /* ← ДОБАВЛЕНО */
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.3s;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .nav-desktop {
    display: none;
  }

  .btn-author {
    display: none;
  }

  .btn-mobile-menu {
    display: block;
  }
}
</style>