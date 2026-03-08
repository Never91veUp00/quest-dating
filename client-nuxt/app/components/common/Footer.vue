<template>
  <footer class="footer" itemscope itemtype="https://schema.org/LocalBusiness">
    <div class="container">
      <div class="footer-content">
        <!-- О сервисе -->
        <div class="footer-column footer-column--wide">
          <div class="footer-logo" itemprop="name">
            <span class="logo-icon">🎯</span>
            <span class="logo-text">Quest Dating</span>
          </div>
          <p class="footer-description" itemprop="description">
            Персональные романтические квесты для свиданий.
            Каждый квест создаётся вручную — с уникальным сценарием, заданиями на локациях, загадками и сюрпризами, адаптированными под вашу пару.
          </p>
          <div class="footer-social">
            <a href="https://t.me/vinatian00" target="_blank" rel="noopener noreferrer" class="social-link social-link--tg" aria-label="Telegram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
            </a>
            <a href="https://vk.com/vladislav_petrov2000" target="_blank" rel="noopener noreferrer" class="social-link social-link--vk" aria-label="ВКонтакте">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.6-.188 1.37 1.254 2.185 1.808.617.42 1.085.328 1.085.328l2.18-.03s1.14-.071.6-.97c-.045-.074-.32-.668-1.645-1.89-1.388-1.28-1.202-1.073.47-3.29.996-1.354 1.394-2.18 1.27-2.534-.118-.338-.847-.249-.847-.249l-2.454.015s-.182-.025-.317.056c-.133.08-.218.264-.218.264s-.39 1.04-.91 1.926c-1.1 1.873-1.54 1.972-1.72 1.856-.418-.272-.314-1.092-.314-1.674 0-1.82.275-2.58-.537-2.776-.27-.065-.468-.108-1.155-.115-.882-.01-1.63.003-2.053.21-.281.138-.498.444-.366.461.163.022.532.1.728.364.252.342.244 1.108.244 1.108s.145 2.14-.34 2.405c-.332.183-.788-.19-1.767-1.9-.502-.876-.88-1.843-.88-1.843s-.073-.18-.203-.276C9.16 7.14 8.976 7.1 8.976 7.1l-2.334.015s-.35.01-.478.162C6.04 7.424 6.155 7.7 6.155 7.7s1.83 4.283 3.902 6.444c1.9 1.982 4.058 1.852 4.058 1.852h.978c.32-.032.482-.206.482-.206"/></svg>
            </a>
            <a href="mailto:vp.vlad00@mail.ru" class="social-link social-link--email" aria-label="Email">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>
        </div>

        <!-- Навигация -->
        <nav class="footer-column" aria-label="Навигация по сайту">
          <h4 class="footer-title">Навигация</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/">Главная</NuxtLink></li>
            <li><NuxtLink to="/catalog">Каталог квестов</NuxtLink></li>
            <li><NuxtLink to="/about">О создателе</NuxtLink></li>
          </ul>
          <h4 class="footer-title footer-title--legal">Документы</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/terms">Условия использования</NuxtLink></li>
            <li><NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink></li>
          </ul>
        </nav>

        <!-- Услуги — ключевые слова для SEO -->
        <div class="footer-column">
          <h4 class="footer-title">Услуги</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/catalog">Квест на свидание</NuxtLink></li>
            <li><NuxtLink to="/catalog">Романтический сюрприз</NuxtLink></li>
            <li><NuxtLink to="/catalog">Квест на годовщину</NuxtLink></li>
            <li><NuxtLink to="/catalog">Квест на день рождения</NuxtLink></li>
          </ul>
        </div>

        <!-- Контакты -->
        <div class="footer-column" itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
          <h4 class="footer-title">Контакты</h4>
          <ul class="footer-contacts">
            <li>
              <span class="contact-icon">💬</span>
              <a href="https://t.me/vinatian00" target="_blank" rel="noopener noreferrer">Написать в Telegram</a>
            </li>
            <li>
              <span class="contact-icon">📧</span>
              <a href="mailto:vp.vlad00@mail.ru" itemprop="email">vp.vlad00@mail.ru</a>
            </li>
            <li>
              <span class="contact-icon">📍</span>
              <span><span itemprop="addressLocality">Москва</span>, <span itemprop="addressCountry">Россия</span></span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Нижний футер -->
      <div class="footer-bottom">
        <p class="copyright">
          © {{ currentYear }} Quest Dating · Влад и Лиза Петровы
        </p>
        <nav class="footer-legal" aria-label="Правовые документы">
          <NuxtLink to="/terms">Условия использования</NuxtLink>
          <span class="footer-legal__sep" aria-hidden="true">·</span>
          <NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink>
        </nav>
        <p class="footer-made">
          Сделано с ❤️ для тех, кто любит удивлять
        </p>
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
  background: linear-gradient(to bottom, #2d3748 0%, #1a202c 100%);
  color: white;
  padding: 56px 0 0;
  margin-top: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 36px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 1.4rem;
  margin-bottom: 4px;
}

.logo-icon { font-size: 1.8rem; }

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: #a0aec0;
  line-height: 1.65;
  font-size: 0.9rem;
  margin: 0;
}

.footer-social {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.social-link {
  width: 38px; height: 38px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #a0aec0;
  text-decoration: none;
  transition: all 0.25s;
  outline: none;
}
.social-link:hover, .social-link:focus { transform: translateY(-2px); }
.social-link--tg:hover { background: #229ED9; color: #fff; }
.social-link--vk:hover { background: #0077FF; color: #fff; }
.social-link--email:hover { background: rgba(102, 126, 234, 0.3); color: #fff; }

.footer-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #e2e8f0;
}

.footer-links {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 10px;
}

.footer-links a {
  color: #a0aec0; text-decoration: none;
  font-size: 0.9rem; transition: color 0.2s;
  outline: none;
}
.footer-links a:hover, .footer-links a:focus { color: white; }

.footer-contacts {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 10px;
}

.footer-contacts li {
  display: flex; align-items: center; gap: 8px;
  color: #a0aec0; font-size: 0.9rem;
}

.contact-icon { font-size: 1.1rem; }

.footer-contacts a {
  color: #a0aec0; text-decoration: none;
  transition: color 0.2s; outline: none;
}
.footer-contacts a:hover, .footer-contacts a:focus { color: white; }

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  color: #718096;
  font-size: 0.85rem;
}

.copyright { margin: 0; }

.footer-legal {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.footer-legal a {
  color: #718096;
  text-decoration: none;
  transition: color 0.2s;
  outline: none;
}
.footer-legal a:hover, .footer-legal a:focus { color: #a0aec0; }

.footer-legal__sep { color: #4a5568; }

.footer-title--legal {
  margin-top: 8px;
}

.footer-made { margin: 0; font-style: italic; }

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .footer { padding: 40px 0 0; margin-top: 48px; }
  .footer-content { grid-template-columns: 1fr; gap: 28px; }
  .footer-bottom {
    flex-direction: column; gap: 10px;
    text-align: center;
  }
  .footer-legal { justify-content: center; flex-wrap: wrap; }
}
</style>