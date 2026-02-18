<template>
  <router-link 
    :to="`/author/${author.username}`"
    class="author-card"
  >
    <!-- Аватар -->
    <div class="author-avatar-wrapper">
      <img 
        :src="author.avatar_url || '/images/avatars/default.jpg'" 
        :alt="author.display_name"
        class="author-avatar"
      />
      <div v-if="author.is_verified" class="verified-badge" title="Верифицированный автор">
        ✓
      </div>
    </div>

    <!-- Информация -->
    <div class="author-info">
      <h3 class="author-name">{{ author.display_name }}</h3>
      <p class="author-username">@{{ author.username }}</p>
      
      <p v-if="author.bio" class="author-bio">
        {{ truncateBio(author.bio) }}
      </p>

      <!-- Статистика -->
      <div class="author-stats">
        <div class="stat">
          <div class="stat-value">{{ author.total_templates || author.published_templates || 0 }}</div>
          <div class="stat-label">Шаблонов</div>
        </div>
        <div class="stat">
          <div class="stat-value">
            <RatingStars :rating="author.average_rating" size="small" />
          </div>
          <div class="stat-label">Рейтинг</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ author.total_orders || 0 }}</div>
          <div class="stat-label">Заказов</div>
        </div>
      </div>

      <!-- Социальные ссылки -->
      <div v-if="hasSocialLinks" class="author-social">
        <a 
          v-if="author.social_links?.instagram"
          :href="author.social_links.instagram"
          target="_blank"
          rel="noopener"
          class="social-link"
          @click.stop
        >
          📷
        </a>
        <a 
          v-if="author.social_links?.telegram"
          :href="author.social_links.telegram"
          target="_blank"
          rel="noopener"
          class="social-link"
          @click.stop
        >
          ✈️
        </a>
        <a 
          v-if="author.social_links?.vk"
          :href="author.social_links.vk"
          target="_blank"
          rel="noopener"
          class="social-link"
          @click.stop
        >
          🔵
        </a>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import RatingStars from './RatingStars.vue'

const props = defineProps({
  author: {
    type: Object,
    required: true
  }
})

const hasSocialLinks = computed(() => {
  const links = props.author.social_links
  return links && (links.instagram || links.telegram || links.vk)
})

const truncateBio = (bio) => {
  if (!bio) return ''
  return bio.length > 100 ? bio.substring(0, 100) + '...' : bio
}
</script>

<style scoped>
.author-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.author-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.author-avatar-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e2e8f0;
  transition: border-color 0.3s;
}

.author-card:hover .author-avatar {
  border-color: #667eea;
}

.verified-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid white;
}

.author-info {
  width: 100%;
}

.author-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.author-username {
  color: #718096;
  font-size: 0.9rem;
  margin: 0 0 12px 0;
}

.author-bio {
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.author-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
  display: flex;
  justify-content: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.author-social {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.social-link {
  width: 32px;
  height: 32px;
  background: #f7fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.3s;
  text-decoration: none;
}

.social-link:hover {
  background: #667eea;
  transform: scale(1.1);
}
</style>