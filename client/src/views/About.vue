<template>
  <div class="about-page">
    <section class="hero-about">
      <div class="container">
        <h1 class="page-title">О Quest Dating</h1>
        <p class="page-subtitle">
          Мы превращаем свидания в незабываемые истории
        </p>
      </div>
    </section>

    <section class="story">
      <div class="container">
        <div class="story-grid">
          <div class="story-text">
            <h2>Наша история</h2>
            <p>
              Всё началось с простой идеи: свидания не должны быть скучными. 
              В 2023 году наш основатель создал первый квест-свидание для своей 
              девушки, и её реакция была настолько восторженной, что стало понятно — 
              это нужно людям.
            </p>
            <p>
              Сегодня мы помогли более чем 500 парам создать особенные моменты. 
              От первых свиданий до предложений руки и сердца — мы знаем, как 
              сделать каждую встречу волшебной.
            </p>
            <p>
              Наша миссия — показать, что любовь — это приключение, которое 
              стоит переживать с азартом и радостью.
            </p>
          </div>
          <div class="story-visual">
            <div class="visual-card">
              <div class="visual-icon">💝</div>
              <h3>500+</h3>
              <p>Созданных квестов</p>
            </div>
            <div class="visual-card">
              <div class="visual-icon">⭐</div>
              <h3>4.9/5</h3>
              <p>Средняя оценка</p>
            </div>
            <div class="visual-card">
              <div class="visual-icon">❤️</div>
              <h3>15</h3>
              <p>Предложений</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="values">
      <div class="container">
        <h2 class="section-title">Наши ценности</h2>
        <div class="values-grid">
          <div v-for="(value, index) in values" :key="index" class="value-card">
            <div class="value-icon">{{ value.icon }}</div>
            <h3>{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="team">
      <div class="container">
        <h2 class="section-title">Команда мечтателей</h2>
        <p class="section-subtitle">
          Мы верим в силу романтики и креативности
        </p>
        <div class="team-grid">
          <div v-for="(member, index) in team" :key="index" class="team-member">
            <div class="member-avatar">{{ member.avatar }}</div>
            <h3>{{ member.name }}</h3>
            <p class="member-role">{{ member.role }}</p>
            <p class="member-bio">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-about">
      <div class="container">
        <h2>Готовы начать своё приключение?</h2>
        <p>Создайте квест-свидание, которое запомнится навсегда</p>
        <router-link to="/order" class="btn btn-primary-large">
          Создать квест
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
const values = [
  {
    icon: '🎨',
    title: 'Креативность',
    description: 'Каждый квест — это уникальная история, созданная специально для вас'
  },
  {
    icon: '💝',
    title: 'Эмоции',
    description: 'Мы создаём не просто квесты, а моменты, которые останутся в сердце'
  },
  {
    icon: '🎯',
    title: 'Внимание к деталям',
    description: 'Продумываем каждую мелочь, чтобы всё прошло идеально'
  },
  {
    icon: '🤝',
    title: 'Партнёрство',
    description: 'Мы работаем с вами вместе, слушаем ваши идеи и воплощаем мечты'
  }
]

const team = [
  {
    name: 'Александр',
    role: 'Основатель & Главный квестмейкер',
    avatar: '👨‍💻',
    bio: 'Создал более 200 квестов. Любит детективы и романтические комедии.'
  },
  {
    name: 'Мария',
    role: 'Сценарист',
    avatar: '👩‍🎨',
    bio: 'Пишет истории, которые заставляют сердце биться быстрее.'
  },
  {
    name: 'Дмитрий',
    role: 'Разработчик',
    avatar: '👨‍💼',
    bio: 'Воплощает идеи в красивые интерактивные веб-квесты.'
  },
  {
    name: 'Анна',
    role: 'Дизайнер',
    avatar: '👩‍🎨',
    bio: 'Создаёт визуальную магию для каждого квеста.'
  }
]
</script>

<style scoped>
.about-page {
  padding-top: 80px;
}

.hero-about {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  text-align: center;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.page-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
}

.story {
  padding: 100px 0;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.story-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.story-text h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  color: #2d3748;
}

.story-text p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 20px;
}

.story-visual {
  display: grid;
  gap: 20px;
}

.visual-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
}

.visual-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.visual-card h3 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.values {
  padding: 100px 0;
  background: #f7fafc;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 60px;
  color: #2d3748;
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 60px;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.value-card {
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s;
}

.value-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.value-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
}

.value-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2d3748;
}

.value-card p {
  color: #718096;
  line-height: 1.6;
}

.team {
  padding: 100px 0;
  background: white;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.team-member {
  text-align: center;
}

.member-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
}

.team-member h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #2d3748;
}

.member-role {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 12px;
}

.member-bio {
  color: #718096;
  line-height: 1.6;
}

.cta-about {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  text-align: center;
}

.cta-about h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.cta-about p {
  font-size: 1.2rem;
  margin-bottom: 32px;
  opacity: 0.9;
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

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }

  .story-grid {
    grid-template-columns: 1fr;
  }

  .team-grid,
  .values-grid {
    grid-template-columns: 1fr;
  }
}
</style>