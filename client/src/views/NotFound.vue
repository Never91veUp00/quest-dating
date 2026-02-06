<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Страница не найдена</h1>
      <p>Похоже, вы заблудились в нашем квесте 🗺️</p>
      <router-link to="/" class="btn btn-primary">
        Вернуться на главную
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 40px;
}

.error-code {
  font-size: 10rem;
  font-weight: 900;
  margin-bottom: 20px;
  opacity: 0.3;
}

.not-found h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.not-found p {
  font-size: 1.2rem;
  margin-bottom: 32px;
  opacity: 0.9;
}

.btn-primary {
  padding: 16px 40px;
  background: white;
  color: #667eea;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  display: inline-block;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
</style>