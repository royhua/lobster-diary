<script setup>
import { ref, computed, onMounted } from 'vue'
import diaryData from '../../public/diary-data.js'

const diaries = ref([])
const searchQuery = ref('')
const selectedTag = ref('')
const darkMode = ref(false)
const selectedDiary = ref(null)
const showShareCard = ref(false)

// 加载数据
onMounted(() => {
  diaries.value = diaryData || []
  
  // 从localStorage读取暗黑模式设置
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    darkMode.value = savedDarkMode === 'true'
  }
})

// 所有标签
const allTags = computed(() => {
  const tags = new Set()
  diaries.value.forEach(entry => {
    entry.tags?.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

// 筛选后的日记
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

// 统计数据
const stats = computed(() => {
  const dates = diaries.value.map(e => e.date)
  const uniqueDays = new Set(dates).size
  const lastUpdate = diaries.value.length > 0 
    ? new Date(diaries.value[0].date).toLocaleDateString('zh-CN')
    : '-'
  
  return {
    total: diaries.value.length,
    days: uniqueDays,
    tags: allTags.value.length,
    lastUpdate
  }
})

// 切换暗黑模式
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value)
}

// 查看日记详情
const viewDiary = (entry) => {
  selectedDiary.value = entry
}

// 关闭详情
const closeDetail = () => {
  selectedDiary.value = null
}

// 导出Markdown
const exportMarkdown = () => {
  let md = '# 🦞 龙虾日记\n\n'
  diaries.value.forEach(entry => {
    const date = new Date(entry.date).toLocaleDateString('zh-CN')
    md += `## ${date}\n\n${entry.content}\n\n`
    if (entry.tags?.length) {
      md += `标签：${entry.tags.map(t => `#${t}`).join(' ')}\n\n`
    }
    md += '---\n\n'
  })
  
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `龙虾日记_${new Date().toISOString().split('T')[0]}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// 生成分享卡片
const generateShareCard = (entry) => {
  selectedDiary.value = entry
  showShareCard.value = true
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('zh-CN', { month: 'short' }),
    year: date.getFullYear(),
    full: date.toLocaleDateString('zh-CN')
  }
}
</script>

<template>
  <div class="app" :class="{ 'dark-mode': darkMode }">
    <!-- 头部 -->
    <header class="header">
      <div class="logo">🦞</div>
      <h1>龙虾日记</h1>
      <p class="subtitle">记录每一天的精彩生活</p>
    </header>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">📝 日记总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.days }}</div>
        <div class="stat-label">📅 坚持天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.tags }}</div>
        <div class="stat-label">🏷️ 标签数量</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.lastUpdate }}</div>
        <div class="stat-label">🕐 最后更新</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="🔍 搜索日记..." 
        class="search-input"
      />
      <select v-model="selectedTag" class="tag-select">
        <option value="">全部标签</option>
        <option v-for="tag in allTags" :key="tag" :value="tag">
          {{ tag }}
        </option>
      </select>
      <button @click="toggleDarkMode" class="btn-icon" :title="darkMode ? '切换亮色' : '切换暗色'">
        {{ darkMode ? '☀️' : '🌙' }}
      </button>
      <button @click="exportMarkdown" class="btn-icon" title="导出Markdown">
        📥
      </button>
    </div>

    <!-- 日记列表 -->
    <div class="diary-list">
      <div 
        v-for="entry in filteredDiaries" 
        :key="entry.date"
        class="diary-entry"
        @click="viewDiary(entry)"
      >
        <div class="diary-date">
          <span class="date-day">{{ formatDate(entry.date).day }}</span>
          <span class="date-month">{{ formatDate(entry.date).month }}</span>
        </div>
        <div class="diary-content">
          <p>{{ entry.content }}</p>
          <div class="diary-tags" v-if="entry.tags?.length">
            <span 
              v-for="tag in entry.tags" 
              :key="tag"
              class="tag"
              @click.stop="selectedTag = tag"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
        <div class="diary-actions">
          <button class="btn-share" @click.stop="generateShareCard(entry)" title="分享">
            📤
          </button>
        </div>
      </div>
      
      <div v-if="filteredDiaries.length === 0" class="empty-state">
        <span class="empty-icon">📝</span>
        <p>暂无日记</p>
      </div>
    </div>

    <!-- 日记详情弹窗 -->
    <div v-if="selectedDiary && !showShareCard" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeDetail">✕</button>
        <div class="modal-header">
          <span class="modal-date">{{ formatDate(selectedDiary.date).full }}</span>
        </div>
        <div class="modal-body">
          <p class="modal-text">{{ selectedDiary.content }}</p>
          <div class="modal-tags" v-if="selectedDiary.tags?.length">
            <span v-for="tag in selectedDiary.tags" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-action" @click="generateShareCard(selectedDiary)">
            📤 生成分享卡
          </button>
        </div>
      </div>
    </div>

    <!-- 分享卡片弹窗 -->
    <div v-if="showShareCard && selectedDiary" class="modal-overlay" @click="showShareCard = false">
      <div class="share-card" @click.stop>
        <button class="modal-close" @click="showShareCard = false">✕</button>
        <div class="share-card-content" id="share-card">
          <div class="share-header">
            <span class="share-logo">🦞</span>
            <span class="share-title">龙虾日记</span>
          </div>
          <div class="share-body">
            <p class="share-text">"{{ selectedDiary.content }}"</p>
          </div>
          <div class="share-footer">
            <span class="share-date">{{ formatDate(selectedDiary.date).full }}</span>
            <div class="share-tags" v-if="selectedDiary.tags?.length">
              <span v-for="tag in selectedDiary.tags" :key="tag" class="share-tag">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
        <p class="share-tip">💡 长按图片保存</p>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="footer">
      <p>🦞 龙虾日记 - 记录每一天的精彩</p>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.app.dark-mode {
  background: transparent;
}

.dark-mode body {
  background: #1a1a2e;
}

/* 头部 */
.header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  animation: fadeInDown 0.8s ease;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.2em;
  opacity: 0.9;
}

.logo {
  font-size: 4rem;
  margin-bottom: 10px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  text-align: center;
  animation: fadeInUp 0.6s ease;
}

.dark-mode .stat-card {
  background: #2d2d4e;
  color: white;
}

.stat-value {
  font-size: 2em;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
}

.dark-mode .stat-value {
  color: #a78bfa;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
}

.dark-mode .stat-label {
  color: #aaa;
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
}

.dark-mode .search-input {
  background: #2d2d4e;
  color: white;
}

.tag-select {
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
}

.dark-mode .tag-select {
  background: #2d2d4e;
  color: white;
}

.btn-icon {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 1.3rem;
  background: white;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dark-mode .btn-icon {
  background: #2d2d4e;
}

.btn-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* 日记列表 */
.diary-list {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.dark-mode .diary-list {
  background: #2d2d4e;
}

.diary-entry {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  animation: fadeInUp 0.5s ease;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 10px;
}

.diary-entry:hover {
  background: rgba(102, 126, 234, 0.05);
}

.dark-mode .diary-entry:hover {
  background: rgba(167, 139, 250, 0.1);
}

.diary-entry:last-child {
  border-bottom: none;
}

.diary-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.date-day {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.dark-mode .date-day {
  color: #a78bfa;
}

.date-month {
  font-size: 0.85rem;
  color: #888;
}

.dark-mode .date-month {
  color: #aaa;
}

.diary-content {
  flex: 1;
}

.diary-content p {
  font-size: 1rem;
  line-height: 1.7;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dark-mode .diary-content p {
  color: #ddd;
}

.diary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-mode .tag {
  background: rgba(167, 139, 250, 0.2);
  color: #a78bfa;
}

.tag:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
}

.diary-actions {
  display: flex;
  align-items: center;
}

.btn-share {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-share:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 16px;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: fadeInUp 0.3s ease;
}

.dark-mode .modal-content {
  background: #2d2d4e;
  color: white;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .modal-close {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-header {
  margin-bottom: 20px;
}

.modal-date {
  color: #667eea;
  font-weight: 500;
}

.dark-mode .modal-date {
  color: #a78bfa;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

.dark-mode .modal-text {
  color: #ddd;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-action {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* 分享卡片 */
.share-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  position: relative;
  animation: fadeInUp 0.3s ease;
}

.share-card-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
  color: white;
}

.share-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.share-logo {
  font-size: 2rem;
}

.share-title {
  font-size: 1.2rem;
  font-weight: 700;
}

.share-body {
  margin-bottom: 20px;
}

.share-text {
  font-size: 1.1rem;
  line-height: 1.8;
  font-style: italic;
}

.share-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 15px;
}

.share-date {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 10px;
}

.share-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.share-tag {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.8rem;
}

.share-tip {
  text-align: center;
  color: #888;
  margin-top: 15px;
  font-size: 0.9rem;
}

/* 页脚 */
.footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 40px;
  padding: 20px;
}

/* 响应式 */
@media (max-width: 600px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .diary-entry {
    flex-direction: column;
    gap: 12px;
  }
  
  .diary-date {
    flex-direction: row;
    gap: 8px;
  }
  
  .diary-actions {
    justify-content: flex-end;
  }
}
</style>
