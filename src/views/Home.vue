<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import diaryData from '../../public/diary-data.js'
import { useImage, useShareCard } from '../composables/useImage.js'

const router = useRouter()
const diaries = ref([])
const searchQuery = ref('')
const selectedTag = ref('')
const darkMode = ref(false)
const selectedDiary = ref(null)
const showShareCard = ref(false)
const shareCardUrl = ref('')
const viewMode = ref('list')
const touchStartX = ref(0)
const isMobile = ref(false)

const { uploadImage, uploading } = useImage()
const { generateCard } = useShareCard()

// 检测移动端
onMounted(() => {
  isMobile.value = window.innerWidth < 768
  
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
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})

const allTags = computed(() => {
  const tags = new Set()
  diaries.value.forEach(entry => {
    entry.tags?.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
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
  images: diaries.value.filter(d => d.image).length
}))

// 滑动手势切换视图
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchEnd = (e) => {
  if (!isMobile.value) return
  
  const touchEndX = e.changedTouches[0].clientX
  const diff = touchEndX.value - touchStartX.value
  
  if (Math.abs(diff) > 100) {
    const views = ['list', 'gallery', 'timeline']
    const currentIndex = views.indexOf(viewMode.value)
    
    if (diff > 0 && currentIndex > 0) {
      viewMode.value = views[currentIndex - 1]
    } else if (diff < 0 && currentIndex < views.length - 1) {
      viewMode.value = views[currentIndex + 1]
    }
  }
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
    weekday: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
    full: date.toLocaleDateString('zh-CN')
  }
}
</script>

<template>
  <div 
    class="home-page" 
    :class="{ 'dark-mode': darkMode, 'is-mobile': isMobile }"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-icon">🦞</span>
          <span class="title-text">龙虾日记</span>
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
        
        <div class="view-toggle" v-if="!isMobile">
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
      
      <!-- 移动端视图指示器 -->
      <div class="view-indicator" v-if="isMobile">
        <span 
          v-for="v in ['list', 'gallery', 'timeline']" 
          :key="v"
          :class="['indicator-dot', { active: viewMode === v }]"
        ></span>
      </div>
    </section>

    <!-- 日记列表视图 -->
    <section v-if="viewMode === 'list'" class="diary-section">
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
            <img :src="entry.image" :alt="entry.content" loading="lazy" />
          </div>
          <div class="card-body">
            <div class="card-date">
              <span class="date-day">{{ formatDate(entry.date).day }}</span>
              <span class="date-month">{{ formatDate(entry.date).month }}</span>
            </div>
            <div class="card-content">
              <p class="content-text">{{ entry.content }}</p>
              <div class="card-tags" v-if="entry.tags?.length">
                <span v-for="tag in entry.tags.slice(0, 3)" :key="tag" class="tag" @click.stop="selectedTag = tag">
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

    <!-- 图片墙视图 -->
    <section v-else-if="viewMode === 'gallery'" class="gallery-section">
      <div class="gallery-grid">
        <div 
          v-for="entry in filteredDiaries.filter(d => d.image)" 
          :key="entry.id"
          class="gallery-card"
          @click="viewDiary(entry)"
        >
          <img :src="entry.image" :alt="entry.content" class="gallery-image" loading="lazy" />
          <div class="gallery-overlay">
            <span class="gallery-date">{{ formatDate(entry.date).full }}</span>
          </div>
        </div>
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
            <div class="timeline-date">{{ formatDate(entry.date).full }}</div>
            <p class="timeline-text">{{ entry.content }}</p>
            <div class="timeline-tags" v-if="entry.tags?.length">
              <span v-for="tag in entry.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
            <img v-if="entry.image" :src="entry.image" class="timeline-image" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    <!-- 日记详情弹窗 -->
    <Teleport to="body">
      <div v-if="selectedDiary && !showShareCard" class="modal-overlay" @click="closeDetail">
        <div class="modal-card" :class="{ 'full-screen': isMobile }" @click.stop>
          <button class="modal-close" @click="closeDetail">✕</button>
          
          <div class="modal-image" v-if="selectedDiary.image">
            <img :src="selectedDiary.image" :alt="selectedDiary.content" @click="openImagePreview" />
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
    </Teleport>

    <!-- 分享卡片弹窗 -->
    <Teleport to="body">
      <div v-if="showShareCard && selectedDiary" class="modal-overlay" @click="showShareCard = false">
        <div class="share-modal" :class="{ 'full-screen': isMobile }" @click.stop>
          <button class="modal-close" @click="showShareCard = false">✕</button>
          <div class="share-preview">
            <img :src="shareCardUrl" alt="分享卡片" />
          </div>
          <div class="share-actions">
            <button class="action-btn primary" @click="downloadShareCard">💾 保存图片</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ============ 移动端优化样式 ============ */

/* 基础变量 */
.home-page {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --accent: #6366f1;
  --accent-light: rgba(99, 102, 241, 0.1);
  
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px 100px;
}

/* 移动端底部导航空间 */
.home-page.is-mobile {
  padding-bottom: 100px;
}

/* Hero 区域 */
.hero {
  text-align: center;
  padding: 40px 0 30px;
  color: white;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon {
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.hero-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 24px;
}

/* 统计胶囊 */
.stats-row {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 16px 32px;
  border-radius: 100px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.3);
}

/* 工具栏 */
.toolbar-section {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: none;
  border-radius: 12px;
  background: var(--bg-primary);
  font-size: 1rem;
}

.filter-group {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.tag-filter {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: var(--bg-primary);
  font-size: 0.95rem;
}

.view-toggle {
  display: flex;
  background: var(--bg-primary);
  border-radius: 10px;
  overflow: hidden;
}

.toggle-btn {
  padding: 10px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
}

.toggle-btn.active {
  background: var(--accent-light);
}

/* 移动端视图指示器 */
.view-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s;
}

.indicator-dot.active {
  width: 24px;
  border-radius: 4px;
  background: white;
}

/* 日记卡片 */
.diary-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diary-card {
  background: var(--bg-primary);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.diary-card:active {
  transform: scale(0.98);
}

.card-image {
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.card-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
  padding: 10px;
  background: var(--accent-light);
  border-radius: 10px;
}

.date-day {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.date-month {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.content-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 3px 10px;
  background: var(--accent-light);
  color: var(--accent);
  border-radius: 12px;
  font-size: 0.8rem;
}

.card-action {
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.1rem;
  border-radius: 8px;
}

/* 图片墙 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.gallery-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-card:active .gallery-overlay {
  opacity: 1;
}

.gallery-date {
  font-size: 0.8rem;
}

/* 时间线 */
.timeline {
  position: relative;
  padding-left: 36px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 14px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--accent), transparent);
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
  cursor: pointer;
}

.timeline-marker {
  position: absolute;
  left: -36px;
  width: 28px;
  height: 28px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
}

.timeline-content {
  background: var(--bg-primary);
  padding: 16px;
  border-radius: 12px;
}

.timeline-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.timeline-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.timeline-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.timeline-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

/* 弹窗 */
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
  max-width: 500px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  animation: modalIn 0.25s ease;
}

/* 移动端全屏弹窗 */
.modal-card.full-screen,
.share-modal.full-screen {
  max-width: 100%;
  max-height: 100%;
  height: 100%;
  border-radius: 0;
  margin: 0;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  cursor: pointer;
  font-size: 0.9rem;
  z-index: 10;
}

.modal-image img {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: rgba(0,0,0,0.6);
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
}

.modal-upload {
  padding: 30px;
  text-align: center;
  background: var(--accent-light);
}

.upload-btn {
  display: inline-block;
  padding: 12px 24px;
  background: var(--accent);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
}

.modal-header {
  padding: 16px 20px 0;
}

.modal-date {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-body {
  padding: 12px 20px 20px;
}

.modal-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-primary);
}

.modal-tags {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}

.modal-actions {
  padding: 0 20px 20px;
}

.action-btn {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

/* 分享弹窗 */
.share-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  max-width: 400px;
  width: 100%;
}

.share-preview {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}

.share-preview img {
  width: 100%;
  display: block;
}

.share-actions {
  margin-bottom: 10px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 12px;
  opacity: 0.8;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.empty-btn {
  display: inline-block;
  padding: 10px 20px;
  background: white;
  color: var(--accent);
  border-radius: 100px;
  text-decoration: none;
  font-weight: 600;
}

/* 暗黑模式 */
.dark-mode {
  --bg-primary: #1e293b;
  --bg-secondary: #0f172a;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
}

/* 桌面端优化 */
@media (min-width: 768px) {
  .home-page {
    padding: 0 20px 60px;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .stats-row {
    padding: 20px 40px;
    gap: 24px;
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .diary-cards {
    gap: 20px;
  }
  
  .diary-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  }
  
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .gallery-card:hover .gallery-overlay {
    opacity: 1;
  }
  
  .timeline-item:hover .timeline-content {
    transform: translateX(8px);
  }
}
</style>
