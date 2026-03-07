<script setup>
import { ref, computed, onMounted } from 'vue'
import diaryData from '../../public/diary-data.js'
import { useImage, useShareCard } from '../composables/useImage.js'

const diaries = ref([])
const searchQuery = ref('')
const selectedTag = ref('')
const darkMode = ref(false)
const selectedDiary = ref(null)
const showShareCard = ref(false)
const showGallery = ref(false)
const shareCardUrl = ref('')
const viewMode = ref('list') // list | gallery | timeline

const { uploadImage, uploading } = useImage()
const { generateCard } = useShareCard()

onMounted(() => {
  diaries.value = diaryData || []
  
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    darkMode.value = savedDarkMode === 'true'
  }
  
  const savedDrafts = localStorage.getItem('diaryDrafts')
  if (savedDrafts) {
    const drafts = JSON.parse(savedDrafts)
    const draftIds = new Set(drafts.map(d => d.id))
    diaries.value = [...drafts, ...diaries.value.filter(d => !draftIds.has(d.id))]
  }
  
  const savedImages = localStorage.getItem('diaryImages')
  if (savedImages) {
    const imagesMap = JSON.parse(savedImages)
    diaries.value = diaries.value.map(d => ({
      ...d,
      image: imagesMap[d.id] || d.image
    }))
  }
})

const allTags = computed(() => {
  const tags = new Set()
  diaries.value.forEach(entry => {
    entry.tags?.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

const diariesWithImages = computed(() => {
  return diaries.value.filter(d => d.image).sort((a, b) => new Date(b.date) - new Date(a.date))
})

const filteredDiaries = computed(() => {
  let result = [...diaries.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(entry => 
      entry.content.toLowerCase().includes(query) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  if (selectedTag.value) {
    result = result.filter(entry => entry.tags?.includes(selectedTag.value))
  }
  
  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const stats = computed(() => ({
  total: diaries.value.length,
  days: new Set(diaries.value.map(e => e.date)).size,
  tags: allTags.value.length,
  lastUpdate: diaries.value.length > 0 ? new Date(diaries.value[0].date).toLocaleDateString('zh-CN') : '-',
  images: diaries.value.filter(d => d.image).length
}))

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value)
}

const viewDiary = (entry) => {
  selectedDiary.value = entry
}

const closeDetail = () => {
  selectedDiary.value = null
}

const handleImageUpload = async (event, entry) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const base64 = await uploadImage(file)
    const diary = diaries.value.find(d => d.id === entry.id)
    if (diary) {
      diary.image = base64
      saveImages()
    }
  } catch (e) {
    console.error('上传失败:', e)
  }
}

const saveImages = () => {
  const imagesMap = {}
  diaries.value.forEach(d => {
    if (d.image) imagesMap[d.id] = d.image
  })
  localStorage.setItem('diaryImages', JSON.stringify(imagesMap))
}

const removeImage = (entry) => {
  const diary = diaries.value.find(d => d.id === entry.id)
  if (diary) {
    diary.image = null
    saveImages()
  }
}

const generateShareCard = async (entry) => {
  selectedDiary.value = entry
  shareCardUrl.value = await generateCard(entry)
  showShareCard.value = true
}

const downloadShareCard = () => {
  const a = document.createElement('a')
  a.href = shareCardUrl.value
  a.download = `龙虾日记_${new Date().toISOString().split('T')[0]}.png`
  a.click()
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('zh-CN', { month: 'long' }),
    weekday: date.toLocaleDateString('zh-CN', { weekday: 'long' }),
    full: date.toLocaleDateString('zh-CN')
  }
}
</script>

<template>
  <div class="home-page" :class="{ 'dark-mode': darkMode }">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-icon">🦞</span>
          龙虾日记
        </h1>
        <p class="hero-subtitle">记录生活中的每一个精彩瞬间</p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">篇日记</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.days }}</span>
          <span class="stat-label">天记录</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.images }}</span>
          <span class="stat-label">张配图</span>
        </div>
      </div>
    </section>

    <!-- 工具栏 -->
    <section class="toolbar-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索日记..." 
          class="search-input"
        />
      </div>
      
      <div class="filter-group">
        <select v-model="selectedTag" class="tag-filter">
          <option value="">全部标签</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
        
        <div class="view-toggle">
          <button 
            :class="['toggle-btn', { active: viewMode === 'list' }]" 
            @click="viewMode = 'list'"
          >📋</button>
          <button 
            :class="['toggle-btn', { active: viewMode === 'gallery' }]" 
            @click="viewMode = 'gallery'"
          >🖼️</button>
          <button 
            :class="['toggle-btn', { active: viewMode === 'timeline' }]" 
            @click="viewMode = 'timeline'"
          >📅</button>
        </div>
      </div>
    </section>

    <!-- 图片墙视图 -->
    <section v-if="viewMode === 'gallery'" class="gallery-section">
      <div v-if="diariesWithImages.length === 0" class="empty-state">
        <span class="empty-icon">📷</span>
        <p>还没有配图日记</p>
        <p class="empty-hint">点击日记上传图片吧~</p>
      </div>
      <div v-else class="gallery-grid">
        <div 
          v-for="entry in diariesWithImages" 
          :key="entry.id"
          class="gallery-card"
          @click="viewDiary(entry)"
        >
          <img :src="entry.image" :alt="entry.content" class="gallery-image" />
          <div class="gallery-overlay">
            <span class="gallery-date">{{ formatDate(entry.date).full }}</span>
            <p class="gallery-content">{{ entry.content.slice(0, 50) }}...</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 列表视图 -->
    <section v-else-if="viewMode === 'list'" class="diary-section">
      <div v-if="filteredDiaries.length === 0" class="empty-state">
        <span class="empty-icon">📝</span>
        <p>还没有日记</p>
        <router-link to="/write" class="empty-btn">写第一篇日记</router-link>
      </div>
      
      <div v-else class="diary-cards">
        <article 
          v-for="entry in filteredDiaries" 
          :key="entry.id || entry.date"
          class="diary-card"
          @click="viewDiary(entry)"
        >
          <div v-if="entry.image" class="card-image">
            <img :src="entry.image" :alt="entry.content" />
          </div>
          <div class="card-body">
            <div class="card-date">
              <span class="date-day">{{ formatDate(entry.date).day }}</span>
              <span class="date-month">{{ formatDate(entry.date).month }}</span>
            </div>
            <div class="card-content">
              <p class="content-text">{{ entry.content }}</p>
              <div class="card-tags" v-if="entry.tags?.length">
                <span v-for="tag in entry.tags" :key="tag" class="tag" @click.stop="selectedTag = tag">
                  #{{ tag }}
                </span>
              </div>
            </div>
            <button class="card-action" @click.stop="generateShareCard(entry)">
              📤
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- 时间线视图 -->
    <section v-else class="timeline-section">
      <div class="timeline">
        <div 
          v-for="entry in filteredDiaries" 
          :key="entry.id || entry.date"
          class="timeline-item"
          @click="viewDiary(entry)"
        >
          <div class="timeline-marker">
            <span class="marker-day">{{ formatDate(entry.date).day }}</span>
          </div>
          <div class="timeline-content">
            <div class="timeline-date">{{ formatDate(entry.date).full }} · {{ formatDate(entry.date).weekday }}</div>
            <p class="timeline-text">{{ entry.content }}</p>
            <div class="timeline-tags" v-if="entry.tags?.length">
              <span v-for="tag in entry.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
            <img v-if="entry.image" :src="entry.image" class="timeline-image" />
          </div>
        </div>
      </div>
    </section>

    <!-- 日记详情弹窗 -->
    <div v-if="selectedDiary && !showShareCard" class="modal-overlay" @click="closeDetail">
      <div class="modal-card" @click.stop>
        <button class="modal-close" @click="closeDetail">✕</button>
        
        <div class="modal-image" v-if="selectedDiary.image">
          <img :src="selectedDiary.image" :alt="selectedDiary.content" />
          <button class="remove-image" @click="removeImage(selectedDiary)">🗑️</button>
        </div>
        <div v-else class="modal-upload">
          <label class="upload-btn">
            <input type="file" accept="image/*" @change="(e) => handleImageUpload(e, selectedDiary)" hidden />
            <span v-if="uploading">上传中...</span>
            <span v-else>📷 添加配图</span>
          </label>
        </div>
        
        <div class="modal-header">
          <span class="modal-date">{{ formatDate(selectedDiary.date).full }}</span>
          <span class="modal-weekday">{{ formatDate(selectedDiary.date).weekday }}</span>
        </div>
        
        <div class="modal-body">
          <p class="modal-text">{{ selectedDiary.content }}</p>
          <div class="modal-tags" v-if="selectedDiary.tags?.length">
            <span v-for="tag in selectedDiary.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="action-btn primary" @click="generateShareCard(selectedDiary)">
            📤 生成分享卡
          </button>
        </div>
      </div>
    </div>

    <!-- 分享卡片弹窗 -->
    <div v-if="showShareCard && selectedDiary" class="modal-overlay" @click="showShareCard = false">
      <div class="share-modal" @click.stop>
        <button class="modal-close" @click="showShareCard = false">✕</button>
        <div class="share-preview">
          <img :src="shareCardUrl" alt="分享卡片" />
        </div>
        <div class="share-actions">
          <button class="action-btn primary" @click="downloadShareCard">💾 保存图片</button>
        </div>
        <p class="share-tip">点击保存按钮下载分享图</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============ 变量 ============ */
.home-page {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --accent: #6366f1;
  --accent-light: rgba(99, 102, 241, 0.1);
  
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.dark-mode {
  --bg-primary: #1e293b;
  --bg-secondary: #0f172a;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border-color: #334155;
}

/* ============ Hero ============ */
.hero {
  text-align: center;
  padding: 60px 0 40px;
  color: white;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 3.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 20px 40px;
  border-radius: 100px;
  display: inline-flex;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.8;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

/* ============ 工具栏 ============ */
.toolbar-section {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: none;
  border-radius: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
}

.filter-group {
  display: flex;
  gap: 12px;
}

.tag-filter {
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
}

.toggle-btn {
  padding: 14px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: var(--accent-light);
}

/* ============ 日记卡片 ============ */
.diary-cards {
  display: grid;
  gap: 20px;
}

.diary-card {
  background: var(--bg-primary);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.diary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

.card-image {
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.diary-card:hover .card-image img {
  transform: scale(1.05);
}

.card-body {
  padding: 20px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.card-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 12px;
  background: var(--accent-light);
  border-radius: 12px;
}

.date-day {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.date-month {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.card-content {
  flex: 1;
}

.content-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  background: var(--accent-light);
  color: var(--accent);
  border-radius: 20px;
  font-size: 0.85rem;
}

.card-action {
  padding: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.2rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.card-action:hover {
  background: var(--accent-light);
}

/* ============ 图片墙 ============ */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.gallery-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 4/3;
  cursor: pointer;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-card:hover .gallery-image {
  transform: scale(1.05);
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.gallery-card:hover .gallery-overlay {
  transform: translateY(0);
}

.gallery-date {
  font-size: 0.85rem;
  opacity: 0.9;
}

.gallery-content {
  font-size: 0.95rem;
  margin-top: 4px;
}

/* ============ 时间线 ============ */
.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--accent), transparent);
}

.timeline-item {
  position: relative;
  padding-bottom: 30px;
  cursor: pointer;
}

.timeline-marker {
  position: absolute;
  left: -40px;
  width: 32px;
  height: 32px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
}

.timeline-content {
  background: var(--bg-primary);
  padding: 20px;
  border-radius: 16px;
  transition: all 0.2s;
}

.timeline-item:hover .timeline-content {
  transform: translateX(8px);
}

.timeline-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.timeline-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.timeline-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.timeline-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 12px;
}

/* ============ 空状态 ============ */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.empty-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-state p {
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.empty-hint {
  opacity: 0.7;
  font-size: 1rem !important;
}

.empty-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 24px;
  background: white;
  color: var(--accent);
  border-radius: 100px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
}

.empty-btn:hover {
  transform: scale(1.05);
}

/* ============ 弹窗 ============ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: var(--bg-primary);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  cursor: pointer;
  font-size: 1rem;
  z-index: 10;
}

.modal-image {
  position: relative;
}

.modal-image img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(0,0,0,0.6);
  color: white;
  cursor: pointer;
}

.modal-upload {
  padding: 40px;
  text-align: center;
  background: var(--accent-light);
}

.upload-btn {
  display: inline-block;
  padding: 16px 32px;
  background: var(--accent);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
}

.modal-header {
  padding: 20px 24px 0;
}

.modal-date {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-weekday {
  color: var(--text-secondary);
  margin-left: 8px;
}

.modal-body {
  padding: 16px 24px 24px;
}

.modal-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-primary);
}

.modal-tags {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.modal-actions {
  padding: 0 24px 24px;
}

.action-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

/* 分享弹窗 */
.share-modal {
  background: var(--bg-primary);
  border-radius: 20px;
  padding: 24px;
  max-width: 450px;
  width: 100%;
}

.share-preview {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.share-preview img {
  width: 100%;
  display: block;
}

.share-actions {
  margin-bottom: 12px;
}

.share-tip {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* ============ 响应式 ============ */
@media (max-width: 640px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .stats-row {
    padding: 16px 24px;
    gap: 16px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .toolbar-section {
    flex-direction: column;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .filter-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .card-body {
    flex-direction: column;
  }
  
  .card-date {
    flex-direction: row;
    gap: 8px;
    width: fit-content;
  }
}
</style>
