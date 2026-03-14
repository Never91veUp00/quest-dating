<template>
  <div class="legal-page">
    <div class="container">
      <NuxtLink to="/" class="back-link">← На главную</NuxtLink>

      <h1 class="page-title">Политика конфиденциальности</h1>
      <p class="page-updated">Последнее обновление: январь 2025</p>

      <div class="legal-content">
        <section class="legal-section">
          <h2>1. Кто собирает данные</h2>
          <p>Персональные данные обрабатываются Лизой Петри в рамках сервиса Quest Dating. Лиза Петри — самозанятая, Россия — организатор свиданий и автор сценариев свиданий-квестов.</p>
          <p>По вопросам о персональных данных: <a href="mailto:vp.vlad00@mail.ru">vp.vlad00@mail.ru</a> или Telegram <a href="https://t.me/vinatian00" target="_blank">@vinatian00</a>.</p>
        </section>

        <section class="legal-section">
          <h2>2. Какие данные собираются</h2>
          <p>При оформлении заказа Лиза собирает следующие данные:</p>
          <ul>
            <li>Имя</li>
            <li>Email-адрес</li>
            <li>Telegram или телефон (необязательно)</li>
            <li>Дата и город свидания</li>
            <li>Ответы на вопросы о паре и пожелания к квесту</li>
          </ul>
          <p>Дополнительно автоматически фиксируются дата заказа и выбранный сценарий.</p>
        </section>

        <section class="legal-section">
          <h2>3. Зачем используются данные</h2>
          <p>Исключительно для создания персонального свидания-квеста и связи по заказу. Данные не передаются третьим лицам.</p>
        </section>

        <section class="legal-section">
          <h2>4. Хранение</h2>
          <p>На защищённом сервере, 3 года с момента последнего заказа или до вашего запроса на удаление.</p>
        </section>

        <section class="legal-section">
          <h2>5. Ваши права</h2>
          <p>Запросить, исправить или удалить свои данные можно в любой момент — напишите Лизе на <a href="mailto:vp.vlad00@mail.ru">vp.vlad00@mail.ru</a>.</p>
        </section>

        <section class="legal-section">
          <h2>6. Cookies</h2>
          <p>Только технические cookies для работы сайта (авторизация, сессия). Маркетинговые cookies не используются.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Политика конфиденциальности | Quest Dating',
})
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  padding: 40px 0 80px;
  background: #f7fafc;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-link {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 32px;
}

.back-link:hover { text-decoration: underline; }

.page-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
}

.page-updated {
  color: #718096;
  font-size: 0.9rem;
  margin: 0 0 48px 0;
}

.legal-content {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.legal-section { margin-bottom: 40px; }
.legal-section:last-child { margin-bottom: 0; }

.legal-section h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
  letter-spacing: -0.01em;
}

.legal-section p {
  color: #4a5568;
  line-height: 1.8;
  margin: 0 0 12px 0;
}

.legal-section p:last-child { margin-bottom: 0; }

.legal-section ul {
  color: #4a5568;
  line-height: 1.8;
  padding-left: 20px;
  margin: 0 0 12px 0;
}

.legal-section a { color: #667eea; text-decoration: none; }
.legal-section a:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .legal-page { padding: 24px 0 60px; }
  .page-title { font-size: 1.8rem; }
  .legal-content { padding: 24px 16px; }
  .page-updated { margin-bottom: 24px; }
}
</style>