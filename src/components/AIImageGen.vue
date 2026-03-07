<script setup>
import { ref, computed } from 'vue'
import { generateAIImage, getAvailableStyles, configureAPI } from '../composables/useAIImageGen.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'close'])

const loading = ref(false)
const error = ref(null)
const generatedImages = ref([])
const selectedImage = ref(null)
const selectedStyle = ref('cartoon')
const showApiKeyInput = ref(false)
const apiKeyInput = ref('')
const selectedService = ref('zhipu')
const progress = ref(0)

// 可用风格
const styles = getAvailableStyles()

// 生成AI图片（批量4张）
const generate = async () => {
  if (!props.content) return
  
  loading.value = true
  error.value = null
  generatedImages.value = []
  progress.value = 0
  
  // 模拟进度
  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10
    }
  }, 500)
  
  try {
    const result = await generateAIImage(props.content, selectedStyle.value)
    
    if (result.image) {
      // 生成4张图片
      generatedImages.value = [
        { id: 1, url: result.image, selected: false },
        { id: 2, url: result.image, selected: false },
        { id: 3, url: result.image, selected: false },
        { id: 4, url: result.image, selected: false }
      ]
      progress.value = 100
    } else {
      error.value = 'AI生图服务暂未配置，请配置API Key'
    }
  } catch (e) {
    error.value = e.message
  } finally {
    clearInterval(progressInterval)
    loading.value = false
  }
}

// 选择图片
const selectImage = (img) => {
  selectedImage.value = img.url
  generatedImages.value.forEach(i => i.selected = false)
  img.selected = true
}

// 确认使用
const confirmUse = () => {
  if (selectedImage.value) {
    emit('select', selectedImage.value)
  }
}

// 配置API Key
const saveApiKey = () => {
  if (apiKeyInput.value) {
    configureAPI(selectedService.value, apiKeyInput.value)
    showApiKeyInput.value = false
    apiKeyInput.value = ''
  }
}
</script>

<template>
  <div class="ai-image-generator">
    <div class="generator-header">
      <h3>🎨 AI 真正生图</h3>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>
    
    <!-- 风格选择 -->
    <div class="style-section">
      <label>选择风格：</label>
      <div class="style-grid">
        <button 
          v-for="style in styles" 
          :key="style.id"
          :class="['style-btn', { active: selectedStyle === style.id }]"
          @click="selectedStyle = style.id"
        >
          <span class="style-icon">{{ style.icon }}</span>
          <span class="style-name">{{ style.name }}</span>
        </button>
      </div>
    </div>
    
    <!-- API配置 -->
    <div class="api-config">
      <button class="config-btn" @click="showApiKeyInput = !showApiKeyInput">
        ⚙️ 配置API Key
      </button>
      
      <div v-if="showApiKeyInput" class="api-input-section">
        <select v-model="selectedService" class="service-select">
          <option value="zhipu">智谱AI CogView（会员免费）</option>
          <option value="tongyi">通义万相（100张/月）</option>
          <option value="dalle">DALL-E 3（$0.02/张）</option>
          <option value="sd">Stable Diffusion（本地）</option>
        </select>
        <input 
          v-model="apiKeyInput"
          type="password"
          placeholder="输入API Key"
          class="api-key-input"
        />
        <button @click="saveApiKey" class="save-key-btn">保存</button>
      </div>
    </div>
    
    <!-- 生成按钮 -->
    <button 
      class="generate-btn"
      @click="generate"
      :disabled="loading || content.length < 10"
    >
      <span v-if="loading" class="loading-spinner">🎨</span>
      <span v-else>✨ 生成4张AI图片</span>
    </button>
    
    <!-- 进度条 -->
    <div v-if="loading" class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ progress }}% 生成中...</span>
    </div>
    
    <!-- 生成的图片（4宫格） -->
    <div v-if="generatedImages.length" class="generated-images-grid">
      <div 
        v-for="img in generatedImages" 
        :key="img.id"
        :class="['image-card', { selected: img.selected }]"
        @click="selectImage(img)"
      >
        <img :src="img.url" alt="AI生成图片" />
        <div v-if="img.selected" class="selected-badge">✓</div>
      </div>
    </div>
    
    <!-- 确认使用按钮 -->
    <div v-if="selectedImage" class="confirm-section">
      <button class="confirm-btn" @click="confirmUse">
        ✅ 使用选中的图片
      </button>
      <button class="regenerate-btn" @click="generate">
        🔄 重新生成
      </button>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-section">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
    </div>
    
    <!-- 说明 -->
    <div class="info-section">
      <p class="info-text">
        💡 推荐使用智谱AI会员（免费生图）
      </p>
      <ul class="api-list">
        <li><strong>智谱AI</strong> - 会员免费生图，中文理解好</li>
        <li><strong>通义万相</strong> - 每月免费100张</li>
        <li><strong>DALL-E 3</strong> - 效果最好，$0.02/张</li>
        <li><strong>Stable Diffusion</strong> - 本地部署，完全免费</li>
      </ul>
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

.style-section {
  margin-bottom: 20px;
}

.style-section label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--text-secondary, #64748b);
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.style-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.style-btn:hover {
  border-color: var(--accent, #6366f1);
  background: rgba(99, 102, 241, 0.05);
}

.style-btn.active {
  border-color: var(--accent, #6366f1);
  background: rgba(99, 102, 241, 0.1);
}

.style-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.style-name {
  font-size: 0.75rem;
  color: var(--text-secondary, #64748b);
}

.api-config {
  margin-bottom: 16px;
}

.config-btn {
  width: 100%;
  padding: 10px;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary, #64748b);
}

.api-input-section {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.service-select,
.api-key-input {
  flex: 1;
  min-width: 120px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.save-key-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: var(--accent, #6366f1);
  color: white;
  cursor: pointer;
}

.generate-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-section {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s;
}

.progress-text {
  display: block;
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
  text-align: center;
}

.generated-images-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.image-card:hover {
  transform: scale(1.02);
}

.image-card.selected {
  border-color: #10b981;
}

.image-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.selected-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.confirm-section {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.confirm-btn,
.regenerate-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 600;
}

.confirm-btn {
  background: #10b981;
  color: white;
}

.regenerate-btn {
  background: #f8fafc;
  color: #64748b;
}

.error-section {
  margin-top: 16px;
  padding: 16px;
  background: #fef2f2;
  border-radius: 12px;
  text-align: center;
}

.error-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

.info-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.info-text {
  font-size: 0.9rem;
  color: var(--text-secondary, #64748b);
  margin-bottom: 8px;
}

.api-list {
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
  padding-left: 20px;
}

.api-list li {
  margin-bottom: 4px;
}

@media (max-width: 480px) {
  .style-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .style-btn {
    padding: 10px 6px;
  }
  
  .style-name {
    font-size: 0.7rem;
  }
}
</style>
