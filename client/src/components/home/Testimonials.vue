<template>
  <section class="testimonials">
    <div class="container">
      <h2 class="section-title">Их истории любви</h2>
      <p class="section-subtitle">
        Что говорят пары, которые уже попробовали наши квесты
      </p>

      <div class="testimonials-slider">
        <button 
          class="slider-arrow slider-arrow-left" 
          @click="previousTestimonial"
          :disabled="currentIndex === 0"
        >
          ←
        </button>

        <div class="testimonials-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div 
            v-for="(testimonial, index) in testimonials" 
            :key="index"
            class="testimonial-card"
          >
            <div class="testimonial-header">
              <div class="avatar">{{ testimonial.avatar }}</div>
              <div class="testimonial-meta">
                <h4 class="testimonial-name">{{ testimonial.name }}</h4>
                <div class="stars">
                  <span v-for="i in 5" :key="i">⭐</span>
                </div>
              </div>
            </div>

            <p class="testimonial-text">"{{ testimonial.text }}"</p>

            <div class="testimonial-details">
              <span class="detail-badge">{{ testimonial.questType }}</span>
              <span class="detail-date">{{ testimonial.date }}</span>
            </div>

            <div v-if="testimonial.image" class="testimonial-image">
              <img :src="testimonial.image" :alt="testimonial.name" />
            </div>
          </div>
        </div>

        <button 
          class="slider-arrow slider-arrow-right" 
          @click="nextTestimonial"
          :disabled="currentIndex === testimonials.length - 1"
        >
          →
        </button>
      </div>

      <div class="slider-dots">
        <button 
          v-for="(_, index) in testimonials" 
          :key="index"
          class="dot"
          :class="{ 'dot-active': currentIndex === index }"
          @click="currentIndex = index"
        ></button>
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">500+</div>
          <div class="stat-label">Счастливых пар</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">4.9</div>
          <div class="stat-label">Средняя оценка</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">98%</div>
          <div class="stat-label">Рекомендуют друзьям</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">15</div>
          <div class="stat-label">Предложений руки ❤️</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentIndex = ref(0)
let autoplayInterval = null

const testimonials = [
  {
    name: 'Анна и Дмитрий',
    avatar: '💑',
    text: 'Это было невероятно! Дмитрий организовал квест по местам нашей первой встречи. Каждая локация — маленькое путешествие в прошлое. Финал с предложением руки и сердца был идеален. Спасибо за лучший день в моей жизни!',
    questType: 'Машина времени',
    date: 'Декабрь 2023',
    image: null
  },
  {
    name: 'Елена и Михаил',
    avatar: '👫',
    text: 'Заказали квест на годовщину. Детективная история по городу с загадками и сюрпризами — мы не ожидали, что это будет так захватывающе! Прошли за 3 часа, получили море эмоций. Теперь хотим заказать ещё на День Рождения.',
    questType: 'Детектив',
    date: 'Январь 2024',
    image: null
  },
  {
    name: 'Максим',
    avatar: '🎩',
    text: 'Хотел удивить девушку на первом свидании. Квест помог растопить лёд и сразу начать общение в игровой форме. Все задания были продуманы, никаких неловких пауз. Она была в восторге, теперь мы вместе уже полгода!',
    questType: 'Охотник за сокровищами',
    date: 'Сентябрь 2023',
    image: null
  },
  {
    name: 'Ольга',
    avatar: '💝',
    text: 'Муж заказал квест-сюрприз на мой День Рождения. Я даже не подозревала! В каждой точке маршрута меня ждали подарки и милые послания. Последняя локация привела к ресторану, где нас ждал праздничный стол с друзьями. Магия!',
    questType: 'Premium',
    date: 'Ноябрь 2023',
    image: null
  },
  {
    name: 'Сергей и Виктория',
    avatar: '🌹',
    text: 'Escape Room на улице — вот это адреналин! Нам дали 90 минут, и мы еле успели. Головоломки были сложными, но решаемыми. Отличный способ проверить свою команду. Рекомендуем всем, кто любит интеллектуальные вызовы.',
    questType: 'Escape Room',
    date: 'Февраль 2024',
    image: null
  }
]

const nextTestimonial = () => {
  if (currentIndex.value < testimonials.length - 1) {
    currentIndex.value++
  }
}

const previousTestimonial = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    if (currentIndex.value < testimonials.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = 0
    }
  }, 5000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
.testimonials {
  padding: 100px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
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
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 60px;
}

.testimonials-slider {
  position: relative;
  max-width: 900px;
  margin: 0 auto 60px;
  overflow: hidden;
}

.testimonials-track {
  display: flex;
  transition: transform 0.5s ease;
}

.testimonial-card {
  min-width: 100%;
  background: white;
  color: #2d3748;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.testimonial-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.testimonial-meta {
  flex: 1;
}

.testimonial-name {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #2d3748;
}

.stars {
  font-size: 1rem;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 24px;
  font-style: italic;
}

.testimonial-details {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.detail-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.detail-date {
  color: #718096;
  font-size: 0.9rem;
}

.testimonial-image {
  margin-top: 24px;
  border-radius: 16px;
  overflow: hidden;
}

.testimonial-image img {
  width: 100%;
  height: auto;
  display: block;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 1.5rem;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.slider-arrow:hover:not(:disabled) {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.slider-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slider-arrow-left {
  left: -25px;
}

.slider-arrow-right {
  right: -25px;
}

.slider-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 60px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.7);
}

.dot-active {
  background: white;
  width: 32px;
  border-radius: 6px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: white;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .testimonial-card {
    padding: 32px 24px;
  }

  .slider-arrow {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .slider-arrow-left {
    left: 10px;
  }

  .slider-arrow-right {
    right: 10px;
  }

  .stat-number {
    font-size: 2.5rem;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
}
</style>