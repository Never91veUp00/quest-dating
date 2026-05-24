<template>
  <div class="payment-info">
    <h4 class="payment-title">Информация об оплате</h4>

    <div class="payment-methods">
      <div class="method-item">
        <div class="method-icon">💳</div>
        <div class="method-content">
          <h5 class="method-name">Банковская карта</h5>
          <p class="method-description">
            Visa, MasterCard, МИР - безопасная оплата через защищенное соединение
          </p>
        </div>
      </div>

      <div class="method-item">
        <div class="method-icon">📱</div>
        <div class="method-content">
          <h5 class="method-name">СБП</h5>
          <p class="method-description">
            Система быстрых платежей - мгновенный перевод
          </p>
        </div>
      </div>

      <div class="method-item">
        <div class="method-icon">💰</div>
        <div class="method-content">
          <h5 class="method-name">ЮMoney</h5>
          <p class="method-description">
            Электронный кошелек ЮMoney (Яндекс.Деньги)
          </p>
        </div>
      </div>
    </div>

    <div class="payment-process">
      <h5 class="process-title">Как происходит оплата:</h5>
      <ol class="process-steps">
        <li>После отправки заявки мы свяжемся с вами для уточнения деталей</li>
        <li>Вы получите ссылку на оплату на указанный email</li>
        <li>После оплаты мы приступим к созданию квеста</li>
        <li>Готовый квест будет доступен в течение 24 часов</li>
      </ol>
    </div>

    <div class="payment-guarantee">
      <div class="guarantee-icon">🛡️</div>
      <div class="guarantee-text">
        <strong>Гарантия возврата средств</strong>
        <p>
          Если квест вам не понравится, мы вернем деньги в течение 7 дней 
          без лишних вопросов
        </p>
      </div>
    </div>

    <div class="payment-security">
      <p class="security-text">
        🔒 Все платежи защищены SSL-шифрованием. 
        Мы не храним данные ваших карт.
      </p>
    </div>
  </div>
</template>

<script setup>
// Компонент не требует логики - только информация
</script>

<style scoped>
.payment-info {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #e2e8f0;
}

.payment-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 20px 0;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.method-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.method-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.method-content {
  flex: 1;
}

.method-name {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.method-description {
  font-size: 0.85rem;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.payment-process {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 8px;
}

.process-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.process-steps {
  margin: 0;
  padding-left: 20px;
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.8;
}

.process-steps li {
  margin-bottom: 8px;
}

.payment-guarantee {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #fbbf24;
  border-radius: 8px;
  margin-bottom: 20px;
}

.guarantee-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.guarantee-text strong {
  color: #78350f;
  display: block;
  margin-bottom: 6px;
  font-size: 1rem;
}

.guarantee-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #92400e;
  line-height: 1.5;
}

.payment-security {
  text-align: center;
  padding: 16px;
  background: #f0fdf4;
  border-radius: 8px;
}

.security-text {
  margin: 0;
  font-size: 0.85rem;
  color: #166534;
  font-weight: 500;
}
</style>