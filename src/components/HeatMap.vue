<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  }
})

const emit = defineEmits(['date-click'])

// 生成一年的日期数组
const daysInYear = computed(() => {
  const year = props.year
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31, 23, 59, 59)
  const days = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return days
})

// 统计每个日期的日记数量
const dateCount = computed(() => {
  const count = {}
  props.data.forEach(entry => {
    count[entry.date] = (count[entry.date] || 0) + 1
  })
  return count
})

// 获取颜色
const getColor = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  const count = dateCount.value[dateStr] || 0
  if (count === 0) return '#ebedf0'
  if (count === 1) return '#c6e48f6'
  if (count === 2) return '#9ae8f2'
  return '#667eea'
}

// 月份名称
const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

// 检查是否有日记
const hasDiary = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  return props.data.some(entry => entry.date === dateStr)
}

// 检查是否是今天
const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// 点击日期
const handleClick = (date) => {
  emit('date-click', date)
}

// 切换年份
const prevYear = () => {
  emit('date-click', new Date(props.year - 1, 11, 30))
}

const nextYear = () => {
  emit('date-click', new Date(props.year + 1, 0, 1))
}
</script>

<template>
  <div class="heatmap">
    <!-- 年份导航 -->
    <div class="heatmap-header">
      <button class="nav-btn" @click="prevYear">◀</button>
      <span class="year-label">{{ year }}</span>
      <button class="nav-btn" @click="nextYear">▶</button>
    </div>
    
    <!-- 月份标签 -->
    <div class="months-row">
      <span v-for="month in months" :key="month" class="month-label">
        {{ month.slice(0, 2) }}
      </span>
    </div>
    
    <!-- 星期标签 -->
    <div class="weekdays-row">
      <span v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="weekday-label">
        {{ day }}
      </span>
    </div>
    
    <!-- 日期格子 -->
    <div class="days-grid">
      <div
        v-for="date in daysInYear"
        :key="date.toISOString()"
        class="day-cell"
        :class="{
          'has-diary': hasDiary(date),
          'is-today': isToday(date)
        }"
        :style="{ backgroundColor: getColor(date) }"
        @click="handleClick(date)"
      >
        <span class="day-number">{{ date.getDate() }}</span>
      </div>
    </div>
    
    <!-- 图例 -->
    <div class="heatmap-legend">
      <div class="legend-item">
        <span class="legend-color" style="backgroundColor: #ebedf0"></span>
        <span>无</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="backgroundColor: #c6e48f6"></span>
        <span>1篇</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="backgroundColor: #9ae8f2"></span>
        <span>2篇</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="backgroundColor: #667eea"></span>
        <span>3+篇</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heatmap {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.dark-mode .heatmap {
  background: #2d2d4e;
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  color: #667eea;
}

.nav-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.year-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.dark-mode .year-label {
  color: white;
}

.months-row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  margin-bottom: 8px;
}

.month-label {
  text-align: center;
  font-size: 0.7rem;
  color: #888;
  padding: 4px 0;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.weekday-label {
  text-align: center;
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 500;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s;
  min-height: 24px;
}

.day-cell:hover {
  transform: scale(1.1);
}

.day-number {
  font-size: 0.65rem;
  color: rgba(0,0,0,0.5);
}

.is-today {
  box-shadow: 0 0 0 2px #667eea;
}

.heatmap-legend {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  font-size: 0.75rem;
  color: #888;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
</style>
