<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  diaries: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['filter'])

const searchQuery = ref('')
const startDate = ref('')
const endDate = ref('')
const selectedTags = ref([])
const sortBy = ref('date-desc') // date-desc | date-asc | content-length

// 所有标签
const allTags = computed(() => {
  const tags = new Set()
  props.diaries.forEach(d => {
    d.tags?.forEach(t => tags.add(t))
  })
  return Array.from(tags)
})

// 筛选结果
const filteredResults = computed(() => {
  let results = [...props.diaries]
  
  // 关键词搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(d => 
      d.content.toLowerCase().includes(query) ||
      d.tags?.some(t => t.toLowerCase().includes(query))
    )
  }
  
  // 日期范围
  if (startDate.value) {
    results = results.filter(d => d.date >= startDate.value)
  }
  if (endDate.value) {
    results = results.filter(d => d.date <= endDate.value)
  }
  
  // 标签筛选
  if (selectedTags.value.length > 0) {
    results = results.filter(d => 
      selectedTags.value.every(t => d.tags?.includes(t))
    )
  }
  
  // 排序
  switch (sortBy.value) {
    case 'date-asc':
      results.sort((a, b) => new Date(a.date) - new Date(b.date))
      break
    case 'content-length':
      results.sort((a, b) => b.content.length - a.content.length)
      break
    default:
      results.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  
  return results
})

// 监听变化，触发筛选
watch([searchQuery, startDate, endDate, selectedTags, sortBy], () => {
  emit('filter', filteredResults.value)
}, { deep: true })

// 切换标签
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// 清除所有筛选
const clearFilters = () => {
  searchQuery.value = ''
  startDate.value = ''
  endDate.value = ''
  selectedTags.value = []
  sortBy.value = 'date-desc'
}
</script>

<template>
  <div class="advanced-search">
    <div class="search-header">
      <h3>🔍 高级搜索</h3>
      <button class="clear-btn" @click="clearFilters">清除筛选</button>
    </div>
    
    <!-- 关键词搜索 -->
    <div class="search-input-group">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="搜索关键词..."
        class="search-input"
      />
    </div>
    
    <!-- 日期范围 -->
    <div class="date-range">
      <label>📅 日期范围</label>
      <div class="date-inputs">
        <input 
          v-model="startDate"
          type="date"
          class="date-input"
        />
        <span class="date-separator">至</span>
        <input 
          v-model="endDate"
          type="date"
          class="date-input"
        />
      </div>
    </div>
    
    <!-- 标签筛选 -->
    <div class="tag-filter" v-if="allTags.length > 0">
      <label>🏷️ 标签筛选</label>
      <div class="tag-list">
        <span 
          v-for="tag in allTags" 
          :key="tag"
          :class="['tag-item', { active: selectedTags.includes(tag) }]"
          @click="toggleTag(tag)"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
    
    <!-- 排序 -->
    <div class="sort-options">
      <label>📊 排序方式</label>
      <div class="sort-buttons">
        <button 
          :class="['sort-btn', { active: sortBy === 'date-desc' }]"
          @click="sortBy = 'date-desc'"
        >
          最新优先
        </button>
        <button 
          :class="['sort-btn', { active: sortBy === 'date-asc' }]"
          @click="sortBy = 'date-asc'"
        >
          最早优先
        </button>
        <button 
          :class="['sort-btn', { active: sortBy === 'content-length' }]"
          @click="sortBy = 'content-length'"
        >
          内容最长
        </button>
      </div>
    </div>
    
    <!-- 结果统计 -->
    <div class="search-stats">
      <span>找到 {{ filteredResults.length }} 条日记</span>
    </div>
  </div>
</template>

<style scoped>
.advanced-search {
  background: var(--bg-primary, #fff);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-header h3 {
  font-size: 1.1rem;
  color: var(--text-primary, #1e293b);
}

.clear-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 0.85rem;
  cursor: pointer;
}

.search-input-group {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
}

.date-range,
.tag-filter,
.sort-options {
  margin-bottom: 16px;
}

.date-range label,
.tag-filter label,
.sort-options label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary, #64748b);
  margin-bottom: 8px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.date-separator {
  color: var(--text-secondary, #64748b);
  font-size: 0.9rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 12px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  background: var(--accent-light, rgba(99, 102, 241, 0.1));
}

.tag-item.active {
  background: var(--accent, #6366f1);
  color: white;
}

.sort-buttons {
  display: flex;
  gap: 8px;
}

.sort-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: transparent;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: var(--accent, #6366f1);
}

.sort-btn.active {
  background: var(--accent, #6366f1);
  color: white;
  border-color: var(--accent, #6366f1);
}

.search-stats {
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: var(--text-secondary, #64748b);
}

@media (max-width: 640px) {
  .date-inputs {
    flex-direction: column;
  }
  
  .date-separator {
    display: none;
  }
  
  .sort-buttons {
    flex-direction: column;
  }
}
</style>
