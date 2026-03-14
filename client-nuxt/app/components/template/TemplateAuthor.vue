<template>
  <div class="template-author">
    <h3 class="section-title">Об авторе</h3>
    
    <div class="author-card">
      <!-- Аватар -->
      <div class="author-header">
        <NuxtLink to="/about" class="author-avatar-link">
          <img
            :src="withAvatarFallback(author.avatar_url || '/images/avatars/liza.jpg')"
            alt="Лиза Петри"
            class="author-avatar"
            @error="onImgError"
          />
        </NuxtLink>

        <div class="author-info">
          <NuxtLink to="/about" class="author-name">
            {{ (author.display_name === "Влад" || !author.display_name) ? "Лиза Петри" : author.display_name }}
          </NuxtLink>
          
          <!-- Статистика создателя -->
          <div class="author-quick-stats">
            <div class="stat">
              <span class="stat-number">{{ author.total_templates || 0 }}</span>
              <span class="stat-text">сценариев</span>
            </div>
            <div class="stat">
              <span class="stat-number">за 24ч</span>
              <span class="stat-text">срок создания</span>
            </div>
          </div>
          <p class="author-process">Общаемся, уточняем детали, погружаемся в вашу историю</p>
        </div>
      </div>

      <!-- Биография -->
      <p class="author-bio">
        {{ author.bio || "Создаю персональные свидания-квесты с 2024 года. Каждый сценарий — с нуля под вашу пару." }}
      </p>

      <!-- Социальные ссылки -->
      <div v-if="hasSocialLinks" class="author-social">
        <a 
          v-if="author.social_links?.instagram"
          :href="author.social_links.instagram"
          target="_blank"
          rel="noopener"
          class="social-link instagram"
        >
          <span class="social-icon">📷</span>
          Instagram
        </a>
        <a 
          v-if="author.social_links?.telegram"
          :href="author.social_links.telegram"
          target="_blank"
          rel="noopener"
          class="social-link telegram"
        >
          <span class="social-icon">✈️</span>
          Telegram
        </a>
        <a 
          v-if="author.social_links?.vk"
          :href="author.social_links.vk"
          target="_blank"
          rel="noopener"
          class="social-link vk"
        >
          <span class="social-icon">🔵</span>
          VK
        </a>
        <a 
          v-if="author.website"
          :href="author.website"
          target="_blank"
          rel="noopener"
          class="social-link website"
        >
          <span class="social-icon">🌐</span>
          Сайт
        </a>
      </div>

      <!-- Кнопка профиля -->
      <NuxtLink 
        to="/about"
        class="btn-view-profile"
      >
        Узнать обо мне →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const { withAvatarFallback, onImgError } = useImageFallback()
const props = defineProps({
  author: {
    type: Object,
    required: true
  }
})

const hasSocialLinks = computed(() => {
  const links = props.author.social_links
  return props.author.website || (links && (links.instagram || links.telegram || links.vk))
})
</script>

<style scoped>
.template-author {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 24px 0;
}

.author-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.author-header {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.author-avatar-link {
  position: relative;
  flex-shrink: 0;
  text-decoration: none;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e2e8f0;
  transition: border-color 0.3s;
}

.author-avatar-link:hover .author-avatar {
  border-color: #667eea;
}

.verified-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 3px solid white;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  text-decoration: none;
  display: block;
  margin-bottom: 4px;
  transition: color 0.3s;
}

.author-name:hover {
  color: #667eea;
}

.author-username {
  color: #718096;
  font-size: 0.95rem;
  margin-bottom: 12px;
}

.author-quick-stats {
  display: flex;
  gap: 20px;
  padding-top: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.stat-number {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1rem;
}

.stat-text {
  color: #718096;
}

.author-process {
  margin-top: 8px;
  font-size: 0.82rem;
  color: #718096;
  font-style: italic;
  line-height: 1.4;
}

.author-bio {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
  padding: 16px;
  background: #f7fafc;
  border-left: 4px solid #667eea;
  border-radius: 8px;
}

.author-social {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.social-link:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.social-icon {
  font-size: 1.2rem;
}

.btn-view-profile {
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-view-profile:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.author-avatar-link:focus,
.author-name:focus,
.social-link:focus,
.btn-view-profile:focus {
  outline: none;
}

@media (max-width: 640px) {
  .template-author {
    padding: 24px 20px;
  }

  .author-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .author-avatar {
    width: 100px;
    height: 100px;
  }
}
</style>