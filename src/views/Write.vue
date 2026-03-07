<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAI } from '../composables/useAI.js'

const router = useRouter()
const { getRandomPrompt, getRandomQuote, extractTags, analyzeMood } = useAI()

const content = ref('')
const suggestedTags = ref([])
const mood = ref(null)
const prompt = ref('')
const quote = ref('')
const saving = ref(false)

onMounted(() => {
  prompt.value = getRandomPrompt()
  quote.value = getRandomQuote()
})

// 监听内容变化，实时提取标签
const handleInput = () => {
  if (content.value.length > 10) {
    suggestedTags.value = extractTags(content.value)
    mood.value = analyzeMood(content.value)
  } else {
    suggestedTags.value = []
    mood.value = null
  }
}

// 换一个提示词
const refreshPrompt = () => {
  prompt.value = getRandomPrompt()
}

// 换一个金句
const refreshQuote = () => {
  quote.value = getRandomQuote()
}

// 保存日记
const saveDiary = async () => {
  if (!content.value.trim()) return
  
  saving.value = true
  
  // 获取现有数据
  const savedData = localStorage.getItem('diaryDrafts')
  const drafts = savedData ? JSON.parse(savedData) : []
  
  // 添加新日记
  const newDiary = {
    id: `d${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    content: content.value,
    tags: suggestedTags.value,
    mood: mood.value?.mood || 'neutral',
    createdAt: new Date().toISOString()
  }
  
  drafts.unshift(newDiary)
  localStorage.setItem('diaryDrafts', JSON.stringify(drafts))
  
  saving.value = false
  
  // 跳转回首页
  router.push('/')
}

// 字数统计
const wordCount = computed(() => content.value.length)

// 取消
const cancel = () => {
  router.push('/')
}
</script>

<template>
  <div class="write-page">
    <!-- 头部 -->
    <header class="write-header">
      <button class="back-btn" @click="cancel">← 返回</button>
      <h1>✍️ 写日记</h1>
      <button 
        class="save-btn" 
        :disabled="!content.trim() || saving"
        @click="saveDiary"
      >
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </header>
    
    <!-- 提示词 -->
    <div class="prompt-section">
      <div class="prompt-card">
        <p class="prompt-text">💡 {{ prompt }}</p>
        <button class="refresh-btn" @click="refreshPrompt">🔄</button>
      </div>
    </div>
    
    <!-- 编辑区 -->
    <div class="editor-section">
      <textarea 
        v-model="content"
        class="editor"
        placeholder="写下今天的故事..."
        @input="handleInput"
      ></textarea>
      
      <div class="editor-footer">
        <span class="word-count">{{ wordCount }} 字</span>
        <span v-if="mood" class="mood-indicator">
          {{ mood.emoji }} {{ mood.label }}
        </span>
      </div>
    </div>
    
    <!-- 智能标签 -->
    <div class="tags-section" v-if="suggestedTags.length > 0">
      <h3>🏷️ 智能标签</h3>
      <div class="tags-list">
        <span 
          v-for="tag in suggestedTags" 
          :key="tag" 
          class="tag-item"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
    
    <!-- 金句 -->
    <div class="quote-section">
      <div class="quote-card">
        <p class="quote-text">✨ {{ quote }}</p>
        <button class="refresh-btn" @click="refreshQuote">🔄</button>
      </div>
    </div>
    
    <!-- 快捷操作 -->
    <div class="quick-actions">
      <button class="quick-btn" @click="content += '\n\n今天的目标完成情况：'">
        📋 添加目标回顾
      </button>
      <button class="quick-btn" @click="content += '\n\n明日计划：'">
        📅 添加明日计划
      </button>
      <button class="quick-btn" @click="content += '\n\n感恩的事：'">
        🙏 添加感恩清单
      </button>
    </div>
  </div>
</template>

<style scoped>
.write-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* 头部 */
.write-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.write-header h1 {
  color: white;
  font-size: 1.3rem;
}

.back-btn, .save-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
}

.save-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 提示词 */
.prompt-section {
  margin-bottom: 20px;
}

.prompt-card {
  background: rgba(255,255,255,0.95);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.prompt-text {
  flex: 1;
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
}

/* 编辑器 */
.editor-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.editor {
  width: 100%;
  min-height: 300px;
  border: none;
  font-size: 1.1rem;
  line-height: 1.8;
  resize: vertical;
  font-family: inherit;
  color: #333;
}

.editor:focus {
  outline: none;
}

.editor::placeholder {
  color: #aaa;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.word-count {
  color: #888;
  font-size: 0.9rem;
}

.mood-indicator {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #667eea;
}

/* 标签 */
.tags-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.tags-section h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.tags-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tag-item {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* 金句 */
.quote-section {
  margin-bottom: 20px;
}

.quote-card {
  background: rgba(255,255,255,0.95);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.quote-text {
  flex: 1;
  color: #666;
  font-size: 0.95rem;
  font-style: italic;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.quick-btn:hover {
  background: rgba(255,255,255,0.3);
}
</style>
