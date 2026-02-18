<template>
  <div class="author-bio">
    <h3 class="bio-title">О себе</h3>

    <div v-if="!editing" class="bio-view">
      <div class="bio-avatar">
        <img :src="author.avatar_url || '/images/avatars/default.jpg'" :alt="author.display_name" />
        <button @click="editing = true" class="btn-edit-avatar">
          ✏️ Изменить
        </button>
      </div>

      <div class="bio-info">
        <div class="info-item">
          <label>Отображаемое имя:</label>
          <div class="info-value">{{ author.display_name }}</div>
        </div>

        <div class="info-item">
          <label>Username:</label>
          <div class="info-value">@{{ author.username }}</div>
        </div>

        <div class="info-item">
          <label>Email:</label>
          <div class="info-value">{{ author.email }}</div>
        </div>

        <div class="info-item">
          <label>Биография:</label>
          <div class="info-value">{{ author.bio || 'Не указано' }}</div>
        </div>

        <div class="info-item">
          <label>Сайт:</label>
          <div class="info-value">
            <a v-if="author.website" :href="author.website" target="_blank" rel="noopener">
              {{ author.website }}
            </a>
            <span v-else>Не указано</span>
          </div>
        </div>

        <button @click="editing = true" class="btn-edit">
          ✏️ Редактировать профиль
        </button>
      </div>
    </div>

    <form v-else @submit.prevent="handleSave" class="bio-edit">
      <div class="form-group">
        <label>Отображаемое имя</label>
        <input v-model="editData.display_name" type="text" class="form-input" required />
      </div>

      <div class="form-group">
        <label>Биография</label>
        <textarea v-model="editData.bio" class="form-textarea" rows="4" maxlength="500"></textarea>
        <span class="char-count">{{ editData.bio?.length || 0 }}/500</span>
      </div>

      <div class="form-group">
        <label>Сайт</label>
        <input v-model="editData.website" type="url" class="form-input" placeholder="https://" />
      </div>

      <div class="form-group">
        <label>Социальные сети</label>
        <div class="social-inputs">
          <input
            v-model="editData.social_links.instagram"
            type="url"
            class="form-input"
            placeholder="Instagram URL"
          />
          <input
            v-model="editData.social_links.telegram"
            type="url"
            class="form-input"
            placeholder="Telegram URL"
          />
          <input
            v-model="editData.social_links.vk"
            type="url"
            class="form-input"
            placeholder="VK URL"
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="cancelEdit" class="btn-cancel">Отмена</button>
        <button type="submit" class="btn-save">Сохранить</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  author: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const editing = ref(false)
const editData = reactive({
  display_name: '',
  bio: '',
  website: '',
  social_links: {
    instagram: '',
    telegram: '',
    vk: ''
  }
})

const startEdit = () => {
  editData.display_name = props.author.display_name
  editData.bio = props.author.bio || ''
  editData.website = props.author.website || ''
  editData.social_links = { ...props.author.social_links } || {}
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
}

const handleSave = () => {
  emit('update', editData)
  editing.value = false
}
</script>

<style scoped>
.author-bio {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.bio-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 24px 0;
}

.bio-view {
  display: flex;
  gap: 32px;
}

.bio-avatar {
  text-align: center;
  flex-shrink: 0;
}

.bio-avatar img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e2e8f0;
  margin-bottom: 16px;
}

.btn-edit-avatar {
  padding: 8px 16px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit-avatar:hover {
  background: #edf2f7;
  border-color: #667eea;
}

.bio-info {
  flex: 1;
}

.info-item {
  margin-bottom: 20px;
}

.info-item label {
  font-size: 0.85rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 6px;
}

.info-value {
  font-size: 1rem;
  color: #2d3748;
  padding: 8px 0;
}

.info-value a {
  color: #667eea;
  text-decoration: none;
}

.info-value a:hover {
  text-decoration: underline;
}

.btn-edit {
  margin-top: 24px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-edit:hover {
  transform: translateY(-2px);
}

.bio-edit {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  position: relative;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: -20px;
  font-size: 0.85rem;
  color: #718096;
}

.social-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.btn-cancel,
.btn-save {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: white;
  color: #718096;
  border: 2px solid #e2e8f0;
}

.btn-cancel:hover {
  background: #f7fafc;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-save:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .bio-view {
    flex-direction: column;
    align-items: center;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>