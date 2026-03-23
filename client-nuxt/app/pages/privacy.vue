<template>
  <div class="legal-page">
    <div class="container">
      <NuxtLink to="/" class="back-link">← На главную</NuxtLink>

      <h1 class="page-title">Политика конфиденциальности</h1>
      <p class="page-updated">Последнее обновление: январь 2025</p>

      <div class="legal-content">
        <section class="legal-section">
          <h2>1. Кто собирает данные</h2>
          <p>Персональные данные обрабатываются Елизаветой Петровой в рамках сервиса Quest Dating. Лиза Петри (Елизавета Петрова) — самозанятая, Россия — организатор свиданий и автор сценариев свиданий-квестов.</p>
          <p>Контакт для вопросов о персональных данных: <a href="mailto:vp.vlad00@mail.ru">vp.vlad00@mail.ru</a></p>
        </section>

        <section class="legal-section">
          <h2>2. Какие данные собираются</h2>
          <p>При оформлении заказа я собираю следующие данные:</p>
          <ul>
            <li>Имя</li>
            <li>Email-адрес</li>
            <li>Номер телефона (необязательно)</li>
            <li>Дата и город события (необязательно)</li>
            <li>Описание пожеланий к квесту</li>
            <li>Согласие на получение рассылки (если дали согласие)</li>
          </ul>
          <p>Дополнительно автоматически фиксируются: дата и время заказа, выбранный сценарий свидания-квеста.</p>
        </section>

        <section class="legal-section">
          <h2>3. Зачем используются данные</h2>
          <p>Собранные данные используются исключительно для:</p>
          <ul>
            <li>Создания персонального квеста по вашему заказу</li>
            <li>Связи с вами по вопросам заказа</li>
            <li>Отправки готового квеста</li>
            <li>Рассылки новостей и спецпредложений — только если вы дали согласие</li>
          </ul>
          <p>Данные не передаются третьим лицам и не используются в рекламных целях без вашего согласия.</p>
        </section>

        <section class="legal-section">
          <h2>4. Хранение данных</h2>
          <p>Данные хранятся на защищённом сервере. Срок хранения — 3 года с момента последнего заказа или до момента вашего запроса на удаление.</p>
        </section>

        <section class="legal-section">
          <h2>5. Рассылка</h2>
          <p>Если вы отметили «Хочу получать новости и специальные предложения», я буду периодически отправлять письма на ваш email. Вы можете отказаться от рассылки в любой момент, написав на <a href="mailto:vp.vlad00@mail.ru">vp.vlad00@mail.ru</a> или перейдя по ссылке отписки в письме.</p>
        </section>

        <section class="legal-section">
          <h2>6. Ваши права</h2>
          <p>Вы имеете право в любой момент:</p>
          <ul>
            <li>Запросить копию ваших данных</li>
            <li>Потребовать исправления неточных данных</li>
            <li>Потребовать удаления ваших данных</li>
            <li>Отозвать согласие на рассылку</li>
          </ul>
          <p>Для реализации любого из этих прав напишите на <a href="mailto:vp.vlad00@mail.ru">vp.vlad00@mail.ru</a> или в Telegram <a href="https://t.me/vinatian00" target="_blank">@vinatian00</a>.</p>
        </section>

        <section class="legal-section">
          <h2>7. Cookies</h2>
          <p>Сайт использует только технические cookies, необходимые для работы (авторизация, сохранение сессии). Маркетинговые и аналитические cookies не используются.</p>
        </section>

        <section class="legal-section">
          <h2>8. Изменения политики</h2>
          <p>Политика может обновляться. Актуальная версия всегда доступна на этой странице. При существенных изменениях клиенты, давшие согласие на рассылку, будут уведомлены по email.</p>
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