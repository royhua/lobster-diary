<script setup>
import { ref, computed, onMounted } from 'vue'

const diaryData = ref([])
const searchQuery = ref('')
const selectedTag = ref('')
const allTags = computed(() => {
  const tags = new Set()
  diaryData.value.forEach(entry => entry.tags?.forEach(tag => tags.add(tag))
  return tags
})

const filteredDiaries = computed(() => {
  let result = [...diaryData.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(entry => 
      entry.content.toLowerCase().includes(query) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(tag))
    )
  }
  
  if (selectedTag.value) {
    result = result.filter(entry => entry.tags?.includes(selectedTag.value))
  }
  
  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const stats = computed(() => ({
  total: diaryData.value.length,
  days: new Set(diaryData.value.map(e => e.date)).size,
  tags: allTags.value.length,
  lastUpdate: diaryData.value.length > 0 ? new Date(diaryData.value[diaryData.value[diaryData.value.length - 1].toLocaleDateString('zh-CN') : '-'
})

)

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
        </option>
      </select>
      <button @click="toggleDarkMode" class="btn-icon">
        {{ isDarkMode ? '☀️' : '🌙' }}
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
        <div class="diary-date">
          <span class="date-day">{{ new Date(entry.date).getDate() }}</span>
          <span class="date-month">{{ new Date(entry.date).toLocaleDateString('zh-CN', { month: 'short' }) }}</span>
        </div>
        <div class="diary-content">
          <p>{{ entry.content }}</p>
          <div class="diary-tags" v-if="entry.tags?.length">
            <span 
              v-for="tag in entry.tags" 
              :key="tag"
              class="tag"
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="filteredDiaries.length === 0" class="empty-state">
        <span class="empty-icon">📝</span>
        <p>暂无日记</p>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="footer">
      <p>🦞 龙虾日记 - 记录每一天的精彩</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  background: #1a1a2e;
}

.dark-mode .header {
  background: #2d2d4e;
}

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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.stat-card h3 {
  color: #667eea;
  font-size: 2em;
  margin-bottom: 5px;
}

.stat-card p {
  color: #666;
  font-size: 0.9em;
}

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
}

.tag-select {
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: white;
  cursor: pointer;
}
.btn-icon {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 1.3rem;
  background: white;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-icon:hover {
  transform: scale(1.1);
}

.diary-list {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.diary-entry {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  animation: fadeInUp 0.5s ease;
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

.date-month {
  font-size: 0.85rem;
  color: #888;
}

.diary-content {
  flex: 1;
}

.diary-content p {
  font-size: 1rem;
  line-height: 1.7;
  color: #333;
}

.app.dark-mode .diary-content p {
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
  background: linear-gradient(135deg, #667eea20, #764ba2 20%);
  color: #667eea;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tag:hover {
  background: linear-gradient(135deg, #667eea40, #764ba2 40%);
}

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
}
</style>
