<script setup>
import { computed } from 'vue'

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['tag-click'])

// 计算标签权重（基于使用频率)
const tagWeights = computed(() => {
  const weights = {}
  props.tags.forEach(tag => {
    weights[tag] = (weights[tag] || 0) + 1
  })
  return weights
})

// 标签大小级别
const getTagSize = (tag) => {
  const weight = tagWeights.value[tag] || 1
  const maxWeight = Math.max(...Object.values(tagWeights.value))
  const ratio = weight / maxWeight
  
  if (ratio > 0.8) return 'xxl'
  if (ratio > 0.6) return 'xl'
  if (ratio > 0.4) return 'lg'
  if (ratio > 0.2) return 'md'
  return 'sm'
}

// 标签颜色
const getTagColor = (tag) => {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#ec4899', '#8b5cf6', 
    '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'
  ]
  const index = props.tags.indexOf(tag) % colors.length
  return colors[index]
}

// 点击标签
const handleClick = (tag) => {
  emit('tag-click', tag)
}
</script>

<template>
  <div class="tag-cloud">
    <span
      v-for="tag in tags"
      :key="tag"
      class="tag-item"
      :class="getTagSize(tag)"
      :style="{ color: getTagColor(tag) }"
      @click="handleClick(tag)"
    >
      #{{ tag }}
    </span>
  </div>
</template>

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 20px;
}

.tag-item {
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  font-weight: 500;
}

.tag-item:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

.tag-item.sm {
  font-size: 0.85rem;
}

.tag-item.md {
  font-size: 1rem;
}

.tag-item.lg {
  font-size: 1.2rem;
}

.tag-item.xl {
  font-size: 1.4rem;
}

.tag-item.xxl {
  font-size: 1.6rem;
  font-weight: 700;
}
</style>
