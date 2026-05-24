<template>
  <div class="testimonial-card">
    <!-- Рейтинг -->
    <div class="testimonial-rating">
      <RatingStars :rating="testimonial.rating" size="medium" />
    </div>

    <!-- Текст отзыва -->
    <p class="testimonial-text">
      "{{ testimonial.text }}"
    </p>

    <!-- Автор отзыва -->
    <div class="testimonial-author">
      <div class="author-avatar">{{ testimonial.avatar }}</div>
      <div class="author-details">
        <div class="author-name">{{ testimonial.name }}</div>
        <div v-if="testimonial.template" class="template-name">
          {{ testimonial.template }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import RatingStars from './RatingStars.vue'

defineProps({
  testimonial: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.testimonial-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.testimonial-rating {
  display: flex;
  justify-content: center;
}

.testimonial-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #2d3748;
  font-style: italic;
  text-align: center;
  margin: 0;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.author-details {
  flex: 1;
}

.author-name {
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.template-name {
  font-size: 0.9rem;
  color: #718096;
}

@media (max-width: 640px) {
  .testimonial-card {
    padding: 16px;
    gap: 10px;
    border-radius: 12px;
  }

  .testimonial-text {
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .testimonial-author {
    gap: 10px;
    padding-top: 10px;
  }

  .author-avatar {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }

  .author-name {
    font-size: 0.85rem;
  }

  .template-name {
    font-size: 0.75rem;
  }
}
</style>