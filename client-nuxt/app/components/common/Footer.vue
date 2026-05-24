<template>
  <footer class="footer" itemscope itemtype="https://schema.org/LocalBusiness">
    <span itemprop="name" style="display:none">Quest Dating</span>
    <span itemprop="telephone" style="display:none">+79035101495</span>
    <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress" style="display:none"><span itemprop="addressCountry">RU</span></span>
    <div class="footer__inner">

      <!-- Top: logo + tagline -->
      <div class="footer__top">
        <NuxtLink to="/" class="footer__logo">
          <span>🎯</span>
          <span class="footer__logo-text">Quest Dating</span>
        </NuxtLink>
        <p class="footer__tagline">Персональные свидания-квесты от Лизы Петри</p>
      </div>

      <!-- Nav grid -->
      <div class="footer__nav">
        <div class="footer__nav-col">
          <p class="footer__nav-title">Квесты</p>
          <NuxtLink to="/catalog" class="footer__nav-link">Все квесты</NuxtLink>
          <NuxtLink to="/catalog?featured=true" class="footer__nav-link">Избранные</NuxtLink>
          <NuxtLink to="/categories/home-quests" class="footer__nav-link">Домашние</NuxtLink>
          <NuxtLink to="/categories/city-quests" class="footer__nav-link">Городские</NuxtLink>
        </div>
        <div class="footer__nav-col">
          <p class="footer__nav-title">Поводы</p>
          <NuxtLink to="/catalog" class="footer__nav-link">Годовщина</NuxtLink>
          <NuxtLink to="/catalog" class="footer__nav-link">День рождения</NuxtLink>
          <NuxtLink to="/catalog" class="footer__nav-link">Предложение</NuxtLink>
          <NuxtLink to="/catalog" class="footer__nav-link">14 февраля</NuxtLink>
        </div>
        <div class="footer__nav-col">
          <p class="footer__nav-title">О нас</p>
          <NuxtLink to="/about" class="footer__nav-link">О Лизе</NuxtLink>
          <NuxtLink to="/blog" class="footer__nav-link">Блог</NuxtLink>
          <NuxtLink to="/terms" class="footer__nav-link">Условия</NuxtLink>
          <NuxtLink to="/privacy" class="footer__nav-link">Конфиденциальность</NuxtLink>
        </div>
      </div>

      <!-- Divider -->
      <div class="footer__divider"></div>

      <!-- Bottom -->
      <div class="footer__bottom">
        <p class="footer__copy">© {{ currentYear }} Quest Dating · Лиза Петри</p>
        <div class="footer__social">
          <a href="https://t.me/vinatian00" target="_blank" rel="noopener noreferrer" class="footer__social-link" aria-label="Telegram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
            Telegram
          </a>
          <a href="mailto:vp.vlad00@mail.ru" class="footer__social-link" aria-label="Email">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Email
          </a>
          <a href="https://vk.com/vladislav_petrov2000" target="_blank" rel="noopener noreferrer" class="footer__social-link" aria-label="ВКонтакте">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.6-.188 1.37 1.254 2.185 1.808.617.42 1.085.328 1.085.328l2.18-.03s1.14-.071.6-.97c-.045-.074-.32-.668-1.645-1.89-1.388-1.28-1.202-1.073.47-3.29.996-1.354 1.394-2.18 1.27-2.534-.118-.338-.847-.249-.847-.249l-2.454.015s-.182-.025-.317.056c-.133.08-.218.264-.218.264s-.39 1.04-.91 1.926c-1.1 1.873-1.54 1.972-1.72 1.856-.418-.272-.314-1.092-.314-1.674 0-1.82.275-2.58-.537-2.776-.27-.065-.468-.108-1.155-.115-.882-.01-1.63.003-2.053.21-.281.138-.498.444-.366.461.163.022.532.1.728.364.252.342.244 1.108.244 1.108s.145 2.14-.34 2.405c-.332.183-.788-.19-1.767-1.9-.502-.876-.88-1.843-.88-1.843s-.073-.18-.203-.276C9.16 7.14 8.976 7.1 8.976 7.1l-2.334.015s-.35.01-.478.162C6.04 7.424 6.155 7.7 6.155 7.7s1.83 4.283 3.902 6.444c1.9 1.982 4.058 1.852 4.058 1.852h.978c.32-.032.482-.206.482-.206"/></svg>
            VK
          </a>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: #050508;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-bottom: env(safe-area-inset-bottom);
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 20px 32px;
}

/* Top */
.footer__top { margin-bottom: 40px; }

.footer__logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 10px;
}
.footer__logo-text {
  background: linear-gradient(135deg, #d4af37, #f5d36e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer__tagline {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(240,237,232,0.4);
  line-height: 1.5;
}

/* Nav */
.footer__nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 480px) {
  .footer__nav { grid-template-columns: repeat(2, 1fr); }
}

.footer__nav-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer__nav-title {
  margin: 0 0 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(240,237,232,0.35);
}

.footer__nav-link {
  text-decoration: none;
  color: rgba(240,237,232,0.55);
  font-size: 0.9rem;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.footer__nav-link:hover { color: #f0ede8; }

/* Divider */
.footer__divider {
  height: 1px;
  background: rgba(255,255,255,0.06);
  margin-bottom: 24px;
}

/* Bottom */
.footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.footer__copy {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(240,237,232,0.25);
}

.footer__social {
  display: flex;
  gap: 16px;
}

.footer__social-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(240,237,232,0.35);
  text-decoration: none;
  font-size: 0.82rem;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.footer__social-link:hover { color: #d4af37; }
</style>