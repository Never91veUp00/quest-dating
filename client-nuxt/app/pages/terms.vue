<template>
  <div class="legal-page">
    <div class="container">
      <NuxtLink to="/" class="back-link">← На главную</NuxtLink>

      <h1 class="page-title">Условия использования</h1>
      <p class="page-updated">Последнее обновление: январь 2025</p>

      <div class="legal-content">
        <section class="legal-section">
          <h2>1. Общие положения</h2>
          <p>Настоящие Условия использования регулируют отношения между Елизаветой Петровой (далее — «Исполнитель», «я») и пользователем сервиса Quest Dating (далее — «Клиент», «вы»).</p>
          <p>Используя сервис и оформляя заказ, вы соглашаетесь с настоящими условиями в полном объёме. Если вы не согласны — пожалуйста, не оформляйте заказ.</p>
        </section>

        <section class="legal-section">
          <h2>2. Описание услуги</h2>
          <p>Quest Dating — персональный сервис Лизы Петри по созданию свиданий-квестов для пар. Я лично разрабатываю сценарий под ваш запрос с учётом города, даты, интересов и пожеланий.</p>
          <p>Итогом работы является готовый квест в цифровом формате, доступный через веб-приложение по уникальной ссылке и коду доступа.</p>
        </section>

        <section class="legal-section">
          <h2>3. Оформление заказа</h2>
          <p>Заказ считается принятым после получения вами подтверждения на email. Я приступаю к работе после подтверждения заказа и уточнения деталей при необходимости.</p>
          <p>Срок выполнения — от 24 до 48 часов с момента подтверждения. При сложных или нестандартных запросах срок может быть согласован отдельно.</p>
        </section>

        <section class="legal-section">
          <h2>4. Оплата</h2>
          <p>Стоимость указана на сайте и зависит от выбранного сценария свидания-квеста и дополнительных опций. Оплата производится после согласования финального варианта квеста, если иное не оговорено отдельно.</p>
        </section>

        <section class="legal-section">
          <h2>5. Возврат средств</h2>
          <p>Если квест не устроил вас по качеству, я готов доработать его или вернуть оплату. Заявка на возврат принимается в течение 7 дней с момента получения готового квеста.</p>
          <p>Возврат не производится, если квест был запущен и пройден.</p>
        </section>

        <section class="legal-section">
          <h2>6. Интеллектуальная собственность</h2>
          <p>Все сценарии, тексты и материалы квестов являются моей интеллектуальной собственностью. Квест создаётся для личного использования — перепродажа и публичное распространение запрещены.</p>
        </section>

        <section class="legal-section">
          <h2>7. Ограничение ответственности</h2>
          <p>Я не несу ответственности за технические сбои на стороне клиента (сеть, устройство), форс-мажорные обстоятельства, а также за невозможность проведения квеста по причинам, не зависящим от исполнителя.</p>
        </section>

        <section class="legal-section">
          <h2>8. Контакты</h2>
          <p>По всем вопросам, связанным с условиями использования:</p>
          <ul>
            <li>Email: <a href="mailto:vp.vlad00@mail.ru">vp.vlad00@mail.ru</a></li>
            <li>Telegram: <a href="https://t.me/vinatian00" target="_blank">@vinatian00</a></li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
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

.back-link:hover {
  text-decoration: underline;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #2d3748;
  margin: 0 0 8px 0;
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

.legal-section {
  margin-bottom: 40px;
}

.legal-section:last-child {
  margin-bottom: 0;
}

.legal-section h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.legal-section p {
  color: #4a5568;
  line-height: 1.8;
  margin: 0 0 12px 0;
}

.legal-section p:last-child {
  margin-bottom: 0;
}

.legal-section ul {
  color: #4a5568;
  line-height: 1.8;
  padding-left: 20px;
}

.legal-section a {
  color: #667eea;
  text-decoration: none;
}

.legal-section a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .legal-page {
    padding: 24px 0 60px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .legal-content {
    padding: 24px 16px;
  }

  .page-updated {
    margin-bottom: 24px;
  }
}
</style>