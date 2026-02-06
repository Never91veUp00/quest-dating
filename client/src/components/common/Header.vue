<template>
  <header class="header" :class="{ 'header-scrolled': isScrolled }">
    <div class="container">
      <router-link to="/" class="logo">
        <span class="logo-icon">🎯</span>
        <span class="logo-text">Quest Dating</span>
      </router-link>

      <nav class="nav" :class="{ 'nav-open': mobileMenuOpen }">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          class="nav-link"
          @click="closeMobileMenu"
        >
          {{ link.label }}
        </router-link>
        <router-link to="/order" class="btn btn-primary-small" @click="closeMobileMenu">
          Создать квест
        </router-link>
      </nav>

      <button class="mobile-menu-toggle" @click="toggleMobileMenu">
        <span class="hamburger" :class="{ 'hamburger-open': mobileMenuOpen }"></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)

const navLinks = [
  { path: '/', label: 'Главная' },
  { path: '/about', label: 'О нас' },
  { path: '/#templates', label: 'Шаблоны' },
  { path: '/#pricing', label: 'Цены' }
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 800;
  color: #2d3748;
  transition: transform 0.2s;
}

.logo:hover {
  transform: scale(1.05);
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

.nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: #4a5568;
  font-weight: 600;
  transition: color 0.2s;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.nav-link:hover {
  color: #667eea;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.router-link-active {
  color: #667eea;
}

.btn-primary-small {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.hamburger {
  display: block;
  width: 28px;
  height: 2px;
  background: #2d3748;
  position: relative;
  transition: background 0.3s;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 28px;
  height: 2px;
  background: #2d3748;
  transition: all 0.3s;
}

.hamburger::before {
  top: -8px;
}

.hamburger::after {
  top: 8px;
}

.hamburger-open {
  background: transparent;
}

.hamburger-open::before {
  transform: rotate(45deg);
  top: 0;
}

.hamburger-open::after {
  transform: rotate(-45deg);
  top: 0;
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
  }

  .nav {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    flex-direction: column;
    padding: 40px;
    gap: 24px;
    transform: translateX(100%);
    transition: transform 0.3s;
  }

  .nav-open {
    transform: translateX(0);
  }

  .nav-link::after {
    display: none;
  }

  .btn-primary-small {
    width: 100%;
    text-align: center;
  }
}
</style>