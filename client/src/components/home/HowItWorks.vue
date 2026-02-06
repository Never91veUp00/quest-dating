<template>
  <section class="how-it-works">
    <div class="container">
      <h2 class="section-title">Как это работает</h2>
      <p class="section-subtitle">
        Всего 4 простых шага до незабываемого свидания
      </p>

      <div class="steps">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step"
          :class="{ 'step-active': activeStep === index }"
          @mouseenter="activeStep = index"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-icon">{{ step.icon }}</div>
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-description">{{ step.description }}</p>
          
          <div v-if="index < steps.length - 1" class="step-connector">
            <svg width="100" height="40" viewBox="0 0 100 40">
              <path 
                d="M0,20 Q50,0 100,20" 
                stroke="url(#gradient)" 
                stroke-width="2" 
                fill="none"
                stroke-dasharray="5,5"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="10"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
              <defs>
                <linearGradient id="gradient">
                  <stop offset="0%" stop-color="#667eea" />
                  <stop offset="100%" stop-color="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <h3>Готовы создать свой квест?</h3>
        <router-link to="/order" class="btn btn-primary-large">
          Начать сейчас
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const activeStep = ref(0)

const steps = [
  {
    icon: '✍️',
    title: 'Опишите идею',
    description: 'Расскажите о своем свидании: место, тема, особенности вашей пары'
  },
  {
    icon: '🎨',
    title: 'Мы создаем квест',
    description: 'За 24 часа соберем персонализированный квест с загадками и заданиями'
  },
  {
    icon: '📱',
    title: 'Получаете ссылку',
    description: 'Уникальная ссылка на веб-квест, доступная с любого устройства'
  },
  {
    icon: '🎉',
    title: 'Наслаждайтесь!',
    description: 'Ваша вторая половинка проходит квест и получает незабываемые эмоции'
  }
]
</script>

<style scoped>
.how-it-works {
  padding: 100px 0;
  background: white;
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
  margin-bottom: 16px;
  color: #2d3748;
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 60px;
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-bottom: 80px;
  position: relative;
}

.step {
  text-align: center;
  position: relative;
  padding: 30px 20px;
  border-radius: 16px;
  transition: all 0.3s;
}

.step:hover {
  background: #f7fafc;
  transform: translateY(-10px);
}

.step-number {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.step-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
  animation-delay: calc(var(--index) * 0.2s);
}

.step:nth-child(1) .step-icon { animation-delay: 0s; }
.step:nth-child(2) .step-icon { animation-delay: 0.2s; }
.step:nth-child(3) .step-icon { animation-delay: 0.4s; }
.step:nth-child(4) .step-icon { animation-delay: 0.6s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.step-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2d3748;
}

.step-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #718096;
}

.step-connector {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
}

.cta-section {
  text-align: center;
  padding: 60px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  color: white;
}

.cta-section h3 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 24px;
}

.btn-primary-large {
  padding: 18px 40px;
  background: white;
  color: #667eea;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.btn-primary-large:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 1024px) {
  .steps {
    grid-template-columns: repeat(2, 1fr);
    gap: 60px 40px;
  }

  .step-connector {
    display: none;
  }
}

@media (max-width: 640px) {
  .steps {
    grid-template-columns: 1fr;
    gap: 60px;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-section h3 {
    font-size: 1.5rem;
  }
}
</style>