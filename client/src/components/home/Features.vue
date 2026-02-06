<template>
  <section class="features">
    <div class="container">
      <h2 class="section-title">Почему выбирают нас</h2>
      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="feature-card"
          @mouseenter="handleHover(index)"
          @mouseleave="handleLeave"
        >
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import confetti from 'canvas-confetti'

const hoveredIndex = ref(null)

const features = [
  {
    icon: '🎮',
    title: 'Геймификация',
    description: 'Загадки, пазлы, головоломки и система достижений делают каждое свидание уникальным'
  },
  {
    icon: '🗺️',
    title: 'Интерактивная карта',
    description: 'Навигация по локациям с GPS-подсказками и секретными точками'
  },
  {
    icon: '💝',
    title: 'Персонализация',
    description: 'Каждый квест создается индивидуально на основе вашей истории'
  },
  {
    icon: '⚡',
    title: 'Быстрый запуск',
    description: 'От идеи до готового квеста — 24 часа. Опишите задумку, мы воплотим'
  },
  {
    icon: '🎁',
    title: 'Сюрпризы',
    description: 'Скрытые послания, секретный контент и неожиданные повороты сюжета'
  },
  {
    icon: '📱',
    title: 'Мобильный формат',
    description: 'Квест доступен с любого устройства, не нужно ничего устанавливать'
  }
]

const handleHover = (index) => {
  hoveredIndex.value = index
  
  // Мини-конфетти при наведении
  confetti({
    particleCount: 20,
    spread: 40,
    origin: { y: 0.6 },
    colors: ['#667eea', '#764ba2', '#f093fb']
  })
}

const handleLeave = () => {
  hoveredIndex.value = null
}
</script>

<style scoped>
.features {
  padding: 100px 0;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 60px;
  color: #2d3748;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2d3748;
}

.feature-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #718096;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>