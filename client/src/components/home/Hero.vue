<template>
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">
          Превратите свидание в 
          <span class="highlight">незабываемое приключение</span>
        </h1>
        <p class="hero-subtitle">
          Персонализированные квесты-свидания с загадками, головоломками 
          и романтическими сюрпризами
        </p>
        <div class="hero-actions">
          <router-link to="/order" class="btn btn-primary">
            Создать квест
          </router-link>
          <button @click="scrollToHowItWorks" class="btn btn-secondary">
            Как это работает
          </button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="animated-illustration">
          <!-- SVG или Lottie анимация -->
          <div class="quest-preview">
            <div class="map-placeholder">🗺️</div>
            <div class="task-cards">
              <div class="task-card">🧩</div>
              <div class="task-card">💝</div>
              <div class="task-card">🔍</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const scrollToHowItWorks = () => {
  document.querySelector('.how-it-works')?.scrollIntoView({ 
    behavior: 'smooth' 
  })
}
</script>

<style scoped>
.hero {
  padding: 100px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
}

.highlight {
  background: linear-gradient(to right, #f093fb, #f5576c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  backdrop-filter: blur(10px);
}

.hero-visual {
  position: relative;
}

.quest-preview {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.map-placeholder {
  font-size: 120px;
  text-align: center;
  margin-bottom: 20px;
}

.task-cards {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.task-card {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  animation: cardPop 0.6s ease-out;
  animation-fill-mode: backwards;
}

.task-card:nth-child(1) { animation-delay: 0.2s; }
.task-card:nth-child(2) { animation-delay: 0.4s; }
.task-card:nth-child(3) { animation-delay: 0.6s; }

@keyframes cardPop {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>