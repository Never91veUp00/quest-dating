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
  margin: 0 0 12px 0;
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