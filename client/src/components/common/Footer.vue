<template>
  <footer class="footer">
    <div class="container">
      <!-- Основной контент футера -->
      <div class="footer-content">
        <!-- О компании -->
        <div class="footer-column">
          <div class="footer-logo">
            <span class="logo-icon">🎯</span>
            <span class="logo-text">Quest Dating</span>
          </div>
          <p class="footer-description">
            Создаем незабываемые квесты для свиданий. 
            Превратите обычное свидание в приключение!
          </p>
          <div class="footer-social">
            <a href="#" class="social-link" aria-label="Instagram">📷</a>
            <a href="#" class="social-link" aria-label="Telegram">✈️</a>
            <a href="#" class="social-link" aria-label="VK">🔵</a>
          </div>
        </div>

        <!-- Навигация -->
        <div class="footer-column">
          <h4 class="footer-title">Навигация</h4>
          <ul class="footer-links">
            <li><router-link to="/">Главная</router-link></li>
            <li><router-link to="/templates">Шаблоны</router-link></li>
            <li><router-link to="/authors">Авторы</router-link></li>
            <li><router-link to="/about">О платформе</router-link></li>
          </ul>
        </div>

        <!-- Для авторов -->
        <div class="footer-column">
          <h4 class="footer-title">Для авторов</h4>
          <ul class="footer-links">
            <li><router-link to="/become-author">Стать автором</router-link></li>
            <li><a href="#">Условия размещения</a></li>
            <li><a href="#">Гайд по созданию</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>

        <!-- Контакты -->
        <div class="footer-column">
          <h4 class="footer-title">Контакты</h4>
          <ul class="footer-contacts">
            <li>
              <span class="contact-icon">📧</span>
              <a href="mailto:info@questdating.com">info@questdating.com</a>
            </li>
            <li>
              <span class="contact-icon">💬</span>
              <a href="#">Поддержка в Telegram</a>
            </li>
            <li>
              <span class="contact-icon">📍</span>
              <span>Москва, Россия</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Подписка на новости -->
      <div class="footer-newsletter">
        <div class="newsletter-content">
          <h4 class="newsletter-title">Подпишитесь на новости</h4>
          <p class="newsletter-text">Получайте новые шаблоны и специальные предложения</p>
        </div>
        <form @submit.prevent="handleSubscribe" class="newsletter-form">
          <input 
            v-model="email"
            type="email" 
            placeholder="Ваш email"
            class="newsletter-input"
            required
          />
          <button type="submit" class="newsletter-button">
            Подписаться
          </button>
        </form>
      </div>

      <!-- Нижний футер -->
      <div class="footer-bottom">
        <p class="copyright">
          © {{ currentYear }} Quest Dating. Все права защищены.
        </p>
        <div class="footer-legal">
          <a href="#">Политика конфиденциальности</a>
          <span class="separator">•</span>
          <a href="#">Условия использования</a>
          <span class="separator">•</span>
          <a href="#">Договор оферты</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'

const email = ref('')
const currentYear = computed(() => new Date().getFullYear())

const handleSubscribe = () => {
  if (email.value) {
    // TODO: Отправка email на сервер
    alert('Спасибо за подписку!')
    email.value = ''
  }
}
</script>

<style scoped>
.footer {
  background: linear-gradient(to bottom, #2d3748 0%, #1a202c 100%);
  color: white;
  padding: 60px 0 0;
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
  gap: 40px;
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 8px;
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

.footer-description {
  color: #cbd5e0;
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0;
}

.footer-social {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  text-decoration: none;
  transition: all 0.3s;
  outline: none; /* ← ДОБАВЛЕНО */
}

.social-link:hover,
.social-link:focus { /* ← ДОБАВЛЕНО */
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  color: #cbd5e0;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
  outline: none; /* ← ДОБАВЛЕНО */
  display: inline-block; /* ← ДОБАВЛЕНО для подчеркивания */
  position: relative; /* ← ДОБАВЛЕНО */
}

.footer-links a::after { /* ← ДОБАВЛЕНО */
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width 0.3s;
}

.footer-links a:hover,
.footer-links a:focus {
  color: white;
}

.footer-links a:hover::after, /* ← ДОБАВЛЕНО */
.footer-links a:focus::after { /* ← ДОБАВЛЕНО */
  width: 100%;
}

.footer-contacts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-contacts li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e0;
  font-size: 0.95rem;
}

.contact-icon {
  font-size: 1.2rem;
}

.footer-contacts a {
  color: #cbd5e0;
  text-decoration: none;
  transition: color 0.3s;
  outline: none; /* ← ДОБАВЛЕНО */
  position: relative; /* ← ДОБАВЛЕНО */
}

.footer-contacts a::after { /* ← ДОБАВЛЕНО */
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width 0.3s;
}

.footer-contacts a:hover,
.footer-contacts a:focus {
  color: white;
}

.footer-contacts a:hover::after, /* ← ДОБАВЛЕНО */
.footer-contacts a:focus::after { /* ← ДОБАВЛЕНО */
  width: 100%;
}

.footer-newsletter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  padding: 48px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.newsletter-content {
  flex: 1;
}

.newsletter-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.newsletter-text {
  color: #cbd5e0;
  margin: 0;
}

.newsletter-form {
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 500px;
}

.newsletter-input {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
  outline: none; /* ← ДОБАВЛЕНО */
}

.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.newsletter-input:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2); /* ← ДОБАВЛЕНО свечение */
}

.newsletter-button {
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  outline: none; /* ← ДОБАВЛЕНО */
}

.newsletter-button:hover,
.newsletter-button:focus { /* ← ДОБАВЛЕНО */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  color: #cbd5e0;
  font-size: 0.9rem;
}

.copyright {
  margin: 0;
}

.footer-legal {
  display: flex;
  gap: 12px;
  align-items: center;
}

.footer-legal a {
  color: #cbd5e0;
  text-decoration: none;
  transition: color 0.3s;
  outline: none; /* ← ДОБАВЛЕНО */
  position: relative; /* ← ДОБАВЛЕНО */
}

.footer-legal a::after { /* ← ДОБАВЛЕНО */
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: white;
  transition: width 0.3s;
}

.footer-legal a:hover,
.footer-legal a:focus {
  color: white;
}

.footer-legal a:hover::after, /* ← ДОБАВЛЕНО */
.footer-legal a:focus::after { /* ← ДОБАВЛЕНО */
  width: 100%;
}

.separator {
  color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-newsletter {
    flex-direction: column;
    align-items: flex-start;
  }

  .newsletter-form {
    width: 100%;
    max-width: none;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .footer-legal {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>