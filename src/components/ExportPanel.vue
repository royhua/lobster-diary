<script setup>
import { ref } from 'vue'

const props = defineProps({
  diary: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const exporting = ref(false)
const selectedFormat = ref('markdown')

const formats = [
  { id: 'markdown', name: 'Markdown', icon: '📝', ext: '.md' },
  { id: 'pdf', name: 'PDF', icon: '📄', ext: '.pdf' },
  { id: 'word', name: 'Word', icon: '📘', ext: '.docx' },
  { id: 'json', name: 'JSON', icon: '📊', ext: '.json' },
  { id: 'txt', name: '纯文本', icon: '📃', ext: '.txt' }
]

// 导出为Markdown
const exportToMarkdown = () => {
  const content = `# ${props.diary.date}

${props.diary.content}

**标签**: ${props.diary.tags?.map(t => '#' + t).join(' ') || '无'}

**心情**: ${props.diary.mood || 'neutral'}

---
*创建于: ${props.diary.createdAt}*
`
  downloadFile(content, `${props.diary.date}.md`, 'text/markdown')
}

// 导出为纯文本
const exportToTxt = () => {
  const content = `${props.diary.date}

${props.diary.content}

标签: ${props.diary.tags?.join(', ') || '无'}
心情: ${props.diary.mood || 'neutral'}
`
  downloadFile(content, `${props.diary.date}.txt`, 'text/plain')
}

// 导出为JSON
const exportToJSON = () => {
  const content = JSON.stringify(props.diary, null, 2)
  downloadFile(content, `${props.diary.date}.json`, 'application/json')
}

// 导出为PDF（使用浏览器打印）
const exportToPDF = () => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${props.diary.date} - 龙虾日记</title>
      <style>
        body {
          font-family: 'Noto Sans SC', sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          line-height: 1.8;
        }
        h1 { color: #6366f1; }
        .tags { margin: 20px 0; }
        .tag {
          display: inline-block;
          padding: 4px 12px;
          background: #f0f0ff;
          color: #6366f1;
          border-radius: 12px;
          margin-right: 8px;
        }
        .content {
          margin: 30px 0;
          font-size: 16px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #888;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <h1>🦞 ${props.diary.date}</h1>
      <div class="tags">
        ${props.diary.tags?.map(t => `<span class="tag">#${t}</span>`).join('') || ''}
      </div>
      <div class="content">${props.diary.content}</div>
      <div class="footer">
        心情: ${props.diary.mood || 'neutral'} | 创建于: ${props.diary.createdAt}
      </div>
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

// 导出函数
const exportDiary = async () => {
  exporting.value = true
  
  switch (selectedFormat.value) {
    case 'markdown':
      exportToMarkdown()
      break
    case 'txt':
      exportToTxt()
      break
    case 'json':
      exportToJSON()
      break
    case 'pdf':
      exportToPDF()
      break
    default:
      alert('该格式暂不支持')
  }
  
  exporting.value = false
}

// 下载文件
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="export-panel">
    <div class="panel-header">
      <h3>📤 导出日记</h3>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>
    
    <div class="format-grid">
      <button 
        v-for="format in formats" 
        :key="format.id"
        :class="['format-btn', { active: selectedFormat === format.id }]"
        @click="selectedFormat = format.id"
      >
        <span class="format-icon">{{ format.icon }}</span>
        <span class="format-name">{{ format.name }}</span>
        <span class="format-ext">{{ format.ext }}</span>
      </button>
    </div>
    
    <div class="preview-section">
      <h4>📋 预览</h4>
      <div class="preview-content">
        <p><strong>日期:</strong> {{ diary.date }}</p>
        <p><strong>内容:</strong> {{ diary.content.substring(0, 100) }}...</p>
        <p><strong>标签:</strong> {{ diary.tags?.join(', ') || '无' }}</p>
      </div>
    </div>
    
    <button 
      class="export-btn"
      @click="exportDiary"
      :disabled="exporting"
    >
      {{ exporting ? '导出中...' : '📥 导出' }}
    </button>
  </div>
</template>

<style scoped>
.export-panel {
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  font-size: 1.2rem;
  color: #1e293b;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  cursor: pointer;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.format-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.format-btn:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.format-btn.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.format-icon {
  font-size: 1.8rem;
  margin-bottom: 6px;
}

.format-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
}

.format-ext {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.preview-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.preview-section h4 {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 12px;
}

.preview-content p {
  font-size: 0.85rem;
  color: #475569;
  margin-bottom: 8px;
}

.export-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.export-btn:disabled {
  opacity: 0.5;
}
</style>
