<template>
  <div class="legal-page">
    <div class="container">
      <NuxtLink to="/" class="back-link">← На главную</NuxtLink>

      <h1 class="page-title">Условия использования</h1>
      <p class="page-updated">Последнее обновление: январь 2025</p>

      <div class="legal-content">
        <section class="legal-section">
          <h2>1. Услуга</h2>
          <p>Quest Dating — персональный сервис Лизы Петри по созданию свиданий-квестов для пар. Лиза лично разрабатывает сценарий под ваш запрос: ваш город, ваши места, ваша история.</p>
          <p>Результат — готовый квест в цифровом формате, доступный по уникальной ссылке.</p>
        </section>

        <section class="legal-section">
          <h2>2. Оформление и сроки</h2>
          <p>Заказ считается принятым после подтверждения на email. Лиза приступает к работе после получения ответов на вопросы о паре. Срок создания — от 24 часов с момента подтверждения.</p>
        </section>

        <section class="legal-section">
          <h2>3. Оплата</h2>
          <p>Стоимость указана на сайте. Оплата — после согласования финального варианта квеста, если иное не оговорено отдельно.</p>
        </section>

        <section class="legal-section">
          <h2>4. Возврат</h2>
          <p>Если квест не устроил по качеству — Лиза доработает его или вернёт оплату. Заявка принимается в течение 7 дней с момента получения квеста, при условии что квест не был запущен и пройден.</p>
        </section>

        <section class="legal-section">
          <h2>5. Права на материалы</h2>
          <p>Все сценарии и материалы квестов являются интеллектуальной собственностью Лизы Петри. Квест создаётся для личного использования — перепродажа и публичное распространение запрещены.</p>
        </section>

        <section class="legal-section">
          <h2>6. Контакты</h2>
          <p>Email: <a href="mailto:vp.vlad00@mail.ru">vp.vlad00@mail.ru</a> · Telegram: <a href="https://t.me/vinatian00" target="_blank">@vinatian00</a></p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Условия использования | Quest Dating',
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

.legal-section a { color: #667eea; text-decoration: none; }
.legal-section a:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .legal-page { padding: 24px 0 60px; }
  .page-title { font-size: 1.8rem; }
  .legal-content { padding: 24px 16px; }
  .page-updated { margin-bottom: 24px; }
}
</style>