<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <div class="logo">
            <span class="logo-icon">🎯</span>
            <span class="logo-text">Quest Dating</span>
          </div>
          <p class="footer-description">
            Превращаем обычные свидания в незабываемые приключения
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Instagram">📷</a>
            <a href="#" class="social-link" aria-label="Telegram">✈️</a>
            <a href="#" class="social-link" aria-label="VK">🔵</a>
          </div>
        </div>

        <div class="footer-section">
          <h4 class="footer-title">Навигация</h4>
          <ul class="footer-links">
            <li><router-link to="/">Главная</router-link></li>
            <li><router-link to="/about">О нас</router-link></li>
            <li><router-link to="/#templates">Шаблоны</router-link></li>
            <li><router-link to="/order">Заказать</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="footer-title">Контакты</h4>
          <ul class="footer-contacts">
            <li>📧 hello@questdating.com</li>
            <li>📱 +7 (999) 123-45-67</li>
            <li>📍 Москва, Россия</li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="footer-title">Подписка</h4>
          <p class="newsletter-text">Получайте идеи для свиданий и специальные предложения</p>
          <form class="newsletter-form" @submit.prevent="handleSubscribe">
            <input 
              type="email" 
              v-model="email"
              placeholder="Ваш email" 
              class="newsletter-input"
              required
            />
            <button type="submit" class="newsletter-btn">→</button>
          </form>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
          © {{ currentYear }} Quest Dating. Все права защищены.
        </p>
        <div class="footer-legal">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Условия использования</a>
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
  console.log('Subscribe:', email.value)
  // TODO: API call для подписки
  alert('Спасибо за подписку!')
  email.value = ''
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: white;
  padding: 60px 0 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 16px;
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
  color: #a0aec0;
  line-height: 1.6;
  margin-bottom: 20px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  text-decoration: none;
  transition: all 0.3s;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.footer-links,
.footer-contacts {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li,
.footer-contacts li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #a0aec0;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #667eea;
}

.footer-contacts li {
  color: #a0aec0;
}

.newsletter-text {
  color: #a0aec0;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.newsletter-form {
  display: flex;
  gap: 8px;
}

.newsletter-input {
  flex: 1;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.95rem;
}

.newsletter-input::placeholder {
  color: #a0aec0;
}

.newsletter-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.newsletter-btn:hover {
  transform: scale(1.05);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.copyright {
  color: #a0aec0;
  font-size: 0.9rem;
}

.footer-legal {
  display: flex;
  gap: 24px;
}

.footer-legal a {
  color: #a0aec0;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.footer-legal a:hover {
  color: #667eea;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .footer-legal {
    flex-direction: column;
    gap: 12px;
  }
}
</style>