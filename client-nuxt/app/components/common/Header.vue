<template>
  <header class="header" :class="{ scrolled: isScrolled, 'menu-open': mobileMenuOpen }">
    <div class="header__inner">

      <NuxtLink to="/" class="logo" @click="closeMobileMenu">
        <span class="logo__icon">🎯</span>
        <span class="logo__text">Quest Dating</span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="nav-desktop">
        <NuxtLink to="/" class="nav-link">Главная</NuxtLink>
        <NuxtLink to="/catalog" class="nav-link">Свидания-квесты</NuxtLink>
        <NuxtLink to="/about" class="nav-link">О Лизе</NuxtLink>
        <NuxtLink to="/blog" class="nav-link">Блог</NuxtLink>
      </nav>

      <div class="header__actions">
        <NuxtLink to="/catalog" class="btn-cta">Заказать квест</NuxtLink>
        <button @click="toggleMobileMenu" class="btn-burger" :aria-label="mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'">
          <span class="burger" :class="{ active: mobileMenuOpen }">
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>
    </div>

  </header>

  <!-- Mobile menu — вне header чтобы не растягивать fixed блок -->
  <Teleport to="body">
    <transition name="menu-fade">
      <div v-if="mobileMenuOpen" class="mobile-menu" @click.self="closeMobileMenu">
        <nav class="mobile-nav">
          <NuxtLink to="/" class="mobile-nav__link" @click="closeMobileMenu">Главная</NuxtLink>
          <NuxtLink to="/catalog" class="mobile-nav__link" @click="closeMobileMenu">Свидания-квесты</NuxtLink>
          <NuxtLink to="/about" class="mobile-nav__link" @click="closeMobileMenu">О Лизе</NuxtLink>
          <NuxtLink to="/blog" class="mobile-nav__link" @click="closeMobileMenu">Блог</NuxtLink>
          <NuxtLink to="/catalog" class="mobile-nav__cta" @click="closeMobileMenu">
            Заказать квест →
          </NuxtLink>
        </nav>
        <div class="mobile-menu__footer">
          <p>Свидания-квесты от Лизы Петри</p>
          <p>от 499 ₽ · готово за 24 часа</p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)

const handleScroll = () => { isScrolled.value = window.scrollY > 20 }

const scrollY = ref(0)

const toggleMobileMenu = () => {
  if (!mobileMenuOpen.value) {
    scrollY.value = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY.value}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.overflow = ''
    window.scrollTo(0, scrollY.value)
  }
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  if (mobileMenuOpen.value) {
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.overflow = ''
    window.scrollTo(0, scrollY.value)
  }
  mobileMenuOpen.value = false
}

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1002;
  background: transparent;
  transition: background 0.3s, backdrop-filter 0.3s;
  /* Safe area для iPhone с Dynamic Island */
  padding-top: env(safe-area-inset-top);
}

.header.scrolled {
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.header.menu-open {
  background: rgba(10, 10, 15, 0.98);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  z-index: 2;
}
.logo__icon { font-size: 1.4rem; }
.logo__text {
  font-weight: 800;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #d4af37, #f5d36e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

/* Desktop nav */
.nav-desktop {
  display: none;
}
@media (min-width: 768px) {
  .nav-desktop {
    display: flex;
    gap: 28px;
  }
}
.nav-link {
  text-decoration: none;
  color: rgba(240,237,232,0.7);
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: #f0ede8;
}

/* Actions */
.header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2;
}

.btn-cta {
  display: none;
}
@media (min-width: 768px) {
  .btn-cta {
    display: inline-block;
    padding: 9px 20px;
    background: #d4af37;
    color: #0a0a0f;
    border-radius: 100px;
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
    transition: transform 0.2s, opacity 0.2s;
  }
  .btn-cta:hover { opacity: 0.9; transform: translateY(-1px); }
}

/* Burger */
.btn-burger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
@media (min-width: 768px) { .btn-burger { display: none; } }

.burger {
  width: 18px;
  height: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}
.burger span {
  width: 100%;
  height: 2px;
  background: #f0ede8;
  border-radius: 2px;
  transition: all 0.25s;
  transform-origin: center;
}
.burger.active span:nth-child(1) { transform: rotate(45deg) translate(4px, 5px); }
.burger.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.burger.active span:nth-child(3) { transform: rotate(-45deg) translate(4px, -5px); }

/* Mobile menu */
.mobile-menu {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #0a0a0f;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  padding-top: calc(64px + env(safe-area-inset-top));
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: max(40px, env(safe-area-inset-bottom));
  overflow-y: auto;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  padding-top: 40px;
  justify-content: flex-start;
}

.mobile-nav__link {
  text-decoration: none;
  color: rgba(240,237,232,0.65);
  font-size: clamp(2rem, 8vw, 2.8rem);
  font-weight: 800;
  line-height: 1.2;
  padding: 8px 0;
  transition: color 0.2s;
  letter-spacing: -0.02em;
  -webkit-tap-highlight-color: transparent;
}
.mobile-nav__link:hover,
.mobile-nav__link.router-link-active {
  color: #f0ede8;
}

.mobile-nav__cta {
  display: inline-block;
  margin-top: 32px;
  background: #d4af37;
  color: #0a0a0f;
  padding: 16px 32px;
  border-radius: 100px;
  font-weight: 800;
  font-size: 1.1rem;
  text-decoration: none;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
}

.mobile-menu__footer {
  color: rgba(240,237,232,0.3);
  font-size: 0.8rem;
  line-height: 1.6;
}

/* Transitions */
.menu-fade-enter-active,
.menu-fade-leave-active { transition: opacity 0.25s; }
.menu-fade-enter-from,
.menu-fade-leave-to { opacity: 0; }

/* Mobile menu — глобальные стили (Teleport выносит вне scoped) */
</style>
<style>
.mobile-menu {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #0a0a0f;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  padding-top: calc(64px + env(safe-area-inset-top));
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: max(40px, env(safe-area-inset-bottom));
  overflow-y: auto;
}
.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  padding-top: 40px;
}
.mobile-nav__link {
  text-decoration: none;
  color: rgba(240,237,232,0.65);
  font-size: clamp(2rem, 8vw, 2.8rem);
  font-weight: 800;
  line-height: 1.2;
  padding: 8px 0;
  transition: color 0.2s;
  letter-spacing: -0.02em;
  -webkit-tap-highlight-color: transparent;
  display: block;
}
.mobile-nav__link:hover,
.mobile-nav__link.router-link-active { color: #f0ede8; }
.mobile-nav__cta {
  display: inline-block;
  margin-top: 32px;
  background: #d4af37;
  color: #0a0a0f;
  padding: 16px 32px;
  border-radius: 100px;
  font-weight: 800;
  font-size: 1.1rem;
  text-decoration: none;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
}
.mobile-menu__footer {
  color: rgba(240,237,232,0.3);
  font-size: 0.8rem;
  line-height: 1.6;
  padding-top: 24px;
}
.mobile-menu__footer p { margin: 0; }
.menu-fade-enter-active,
.menu-fade-leave-active { transition: opacity 0.25s; }
.menu-fade-enter-from,
.menu-fade-leave-to { opacity: 0; }
</style>