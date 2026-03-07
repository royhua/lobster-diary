<script setup>
import { ref, computed, onMounted } from 'vue'
import diaryData from '../../public/diary-data.js'
import { useDiaryStats, useSentiment } from '../composables/useStats.js'
import HeatMap from '../components/HeatMap.vue'
import TagCloud from '../components/TagCloud.vue'

import { useRouter } from 'vue-router'

const diaries = ref([])
const { stats } = useDiaryStats(diaries)
const { analyzeSentiment, getSentimentEmoji } = useSentiment()
const selectedYear = ref(new Date().getFullYear())
const router = useRouter()

onMounted(() => {
  diaries.value = diaryData || []
})

const sentimentData = computed(() => {
  return [
    { label: '积极', value: stats.value.sentimentOverview.positive, color: '#667eea' },
    { label: '平静', value: stats.value.sentimentOverview.neutral, color: '#a78bfa' },
    { label: '低落', value: stats.value.sentimentOverview.negative, color: '#764ba2' }
  ]
})

const handleTagClick = (tag) => {
  router.push({ query: { tag } })
}

const handleDateClick = (date) => {
  selectedYear.value = date.getFullYear()
}
</script>

<template>
  <div class="stats-page">
    <!-- 标题 -->
    <header class="stats-header">
      <h1>📊 数据分析</h1>
      <p class="subtitle">了解你的写作习惯</p>
    </header>
    
    <!-- 核心统计 -->
    <div class="stats-overview">
      <div class="stat-card primary">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总日记数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.streak }}</span>
          <span class="stat-label">连续天数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.longestStreak }}</span>
          <span class="stat-label">最长连续</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.thisMonth }}</span>
          <span class="stat-label">本月</span>
        </div>
      </div>
    </div>
    
    <!-- 热力图 -->
    <div class="section">
      <h2 class="section-title">📅 年度热力图</h2>
      <HeatMap :data="diaries" :year="selectedYear" @date-click="handleDateClick" />
    </div>
    
    <!-- 情绪分析 -->
    <div class="section">
      <h2 class="section-title">😊 情绪分析</h2>
      <div class="sentiment-section">
        <div class="sentiment-overview">
          <div class="sentiment-emoji">{{ getSentimentEmoji(stats.sentimentOverview.label) }}</div>
          <div class="sentiment-label">整体情绪：{{ stats.sentimentOverview.label }}</div>
        </div>
        <div class="sentiment-bars">
          <div 
            v-for="item in sentimentData" 
            :key="item.label"
            class="sentiment-bar"
          >
            <div class="bar-label">{{ item.label }}</div>
            <div class="bar-container">
              <div 
                class="bar-fill" 
                :style="{ 
                  width: item.value + '%', 
                  backgroundColor: item.color 
                }"
              ></div>
            </div>
            <div class="bar-value">{{ item.value }}%</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 标签云 -->
    <div class="section">
      <h2 class="section-title">🏷️ 标签云</h2>
      <TagCloud 
        :tags="stats.topTags.map(t => t.tag)" 
        @tag-click="handleTagClick"
      />
    </div>
    
    <!-- 月度趋势 -->
    <div class="section">
      <h2 class="section-title">📈 月度趋势</h2>
      <div class="chart-container">
        <div class="bar-chart">
          <div 
            v-for="(item, index) in stats.monthlyData" 
            :key="item.month"
            class="chart-bar"
          >
            <div 
              class="bar-fill-vertical"
              :style="{ 
                height: Math.max(item.count * 10, 2) + 'px',
                backgroundColor: index === 11 ? '#667eea' : '#a78bfa'
              }"
            ></div>
            <span class="bar-label">{{ item.month }}</span>
            <span class="bar-value" v-if="item.count > 0">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 写作统计 -->
    <div class="section">
      <h2 class="section-title">✍️ 写作统计</h2>
      <div class="writing-stats">
        <div class="stat-row">
          <span class="stat-name">平均字数</span>
          <span class="stat-number">{{ stats.avgLength }} 字</span>
        </div>
        <div class="stat-row">
          <span class="stat-name">本周记录</span>
          <span class="stat-number">{{ stats.thisWeek }} 篇</span>
        </div>
        <div class="stat-row">
          <span class="stat-name">热门标签</span>
          <span class="stat-tags">
            <span v-for="t in stats.topTags.slice(0, 3)" :key="t.tag" class="mini-tag">
              #{{ t.tag }} ({{ t.count }})
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.stats-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.stats-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  opacity: 0.9;
  font-size: 1.1rem;
}

/* 统计卡片 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stat-card.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* 区块 */
.section {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 24px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 20px;
}

/* 情绪分析 */
.sentiment-section {
  display: flex;
  gap: 30px;
  align-items: center;
}

.sentiment-overview {
  text-align: center;
  flex-shrink: 0;
}

.sentiment-emoji {
  font-size: 4rem;
  margin-bottom: 10px;
}

.sentiment-label {
  font-size: 1rem;
  color: #666;
}

.sentiment-bars {
  flex: 1;
}

.sentiment-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bar-label {
  width: 50px;
  font-size: 0.9rem;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.bar-value {
  width: 40px;
  text-align: right;
  font-size: 0.85rem;
  color: #888;
}

/* 图表 */
.chart-container {
  overflow-x: auto;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 150px;
  padding-top: 10px;
}

.chart-bar {
  flex: 1;
  min-width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bar-fill-vertical {
  width: 100%;
  border-radius: 6px 6px 0 0;
  transition: height 0.5s ease;
}

.bar-value {
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 600;
}

/* 写作统计 */
.writing-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-name {
  color: #666;
  font-size: 0.95rem;
}

.stat-number {
  color: #333;
  font-weight: 600;
}

.stat-tags {
  display: flex;
  gap: 8px;
}

.mini-tag {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

/* 响应式 */
@media (max-width: 600px) {
  .sentiment-section {
    flex-direction: column;
  }
  
  .bar-chart {
    gap: 4px;
  }
  
  .chart-bar {
    min-width: 30px;
  }
}
</style>
