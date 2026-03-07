<script setup>
import { ref, watch } from 'vue'
import { generateDiaryImage } from '../composables/useAIGenerate.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'close'])

const loading = ref(false)
const keywords = ref([])
const images = ref([])
const error = ref(null)

// 生成图片
const generate = async () => {
  if (!props.content) return
  
  loading.value = true
  error.value = null
  
  try {
    const result = await generateDiaryImage(props.content)
    keywords.value = result.keywords
    images.value = result.images
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// 选择图片
const selectImage = (image) => {
  emit('select', image.url)
}

// 监听内容变化，自动生成
watch(() => props.content, () => {
  if (props.content.length > 20) {
    generate()
  }
}, { immediate: true })
</script>

<template>
  <div class="ai-image-generator">
    <div class="generator-header">
      <h3>🎨 AI 配图生成</h3>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>
    
    <!-- 关键词展示 -->
    <div class="keywords-section" v-if="keywords.length">
      <span class="keyword-label">识别关键词：</span>
      <span v-for="kw in keywords" :key="kw" class="keyword-tag">{{ kw }}</span>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner">🎨</div>
      <p>正在为你生成配图...</p>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="generate" class="retry-btn">重试</button>
    </div>
    
    <!-- 图片网格 -->
    <div v-if="images.length && !loading" class="image-grid">
      <div 
        v-for="img in images" 
        :key="img.id"
        class="image-card"
        @click="selectImage(img)"
      >
        <img :src="img.url" :alt="img.keyword" loading="lazy" />
        <div class="image-overlay">
          <span class="select-text">点击选择</span>
        </div>
        <div class="image-source" v-if="img.photographer">
          📷 {{ img.photographer }}
        </div>
      </div>
    </div>
    
    <!-- 底部操作 -->
    <div class="generator-footer" v-if="images.length">
      <button @click="generate" class="refresh-btn">
        🔄 换一批
      </button>
      <button @click="emit('close')" class="skip-btn">
        跳过
      </button>
    </div>
  </div>
</template>

<style scoped>
.ai-image-generator {
  background: var(--bg-primary, #fff);
  border-radius: 20px;
  padding: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.generator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.generator-header h3 {
  font-size: 1.2rem;
  color: var(--text-primary, #1e293b);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  cursor: pointer;
  font-size: 0.9rem;
}

.keywords-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.keyword-label {
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
}

.keyword-tag {
  padding: 4px 10px;
  background: var(--accent-light, rgba(99, 102, 241, 0.1));
  color: var(--accent, #6366f1);
  border-radius: 12px;
  font-size: 0.8rem;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  font-size: 3rem;
  animation: spin 2s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--text-secondary, #64748b);
}

.error-state {
  text-align: center;
  padding: 40px 20px;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

.retry-btn {
  margin-top: 12px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: var(--accent, #6366f1);
  color: white;
  cursor: pointer;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 4/3;
  cursor: pointer;
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-card:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.select-text {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.image-source {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 6px;
  font-size: 0.7rem;
}

.generator-footer {
  display: flex;
  gap: 12px;
}

.refresh-btn,
.skip-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  cursor: pointer;
}

.refresh-btn {
  background: var(--accent, #6366f1);
  color: white;
}

.skip-btn {
  background: var(--bg-secondary, #f8fafc);
  color: var(--text-secondary, #64748b);
}

@media (max-width: 480px) {
  .image-grid {
    grid-template-columns: 1fr;
  }
}
</style>
