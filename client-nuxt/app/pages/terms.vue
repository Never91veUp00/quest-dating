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
  min-height: 100vh; background: #0a0a0f; color: #f0ede8;
  padding: calc(80px + env(safe-area-inset-top)) 0 80px;
}
.container { max-width: 680px; margin: 0 auto; padding: 0 16px; }
.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  color: rgba(240,237,232,0.45); text-decoration: none;
  font-size: 0.82rem; font-weight: 600; margin-bottom: 28px;
  -webkit-tap-highlight-color: transparent;
}
.back-link:hover { color: #f0ede8; }
.page-title {
  font-size: clamp(1.6rem, 5vw, 2.2rem); font-weight: 900;
  color: #f0ede8; margin: 0 0 6px; letter-spacing: -0.02em;
}
.page-updated { font-size: 0.8rem; color: rgba(240,237,232,0.3); margin: 0 0 32px; }
.legal-content { display: flex; flex-direction: column; gap: 28px; }
.legal-section h2 {
  font-size: 0.95rem; font-weight: 800; color: #f0ede8;
  margin: 0 0 10px; padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.legal-section p { color: rgba(240,237,232,0.6); line-height: 1.75; margin: 0 0 8px; font-size: 0.88rem; }
.legal-section p:last-child { margin-bottom: 0; }
.legal-section ul, .legal-section ol { color: rgba(240,237,232,0.6); line-height: 1.75; padding-left: 18px; margin: 0 0 8px; font-size: 0.88rem; }
.legal-section li { margin-bottom: 3px; }
.legal-section a { color: #d4af37; text-decoration: none; }
.legal-section a:hover { text-decoration: underline; }
.legal-section strong { color: #f0ede8; font-weight: 700; }
</style>