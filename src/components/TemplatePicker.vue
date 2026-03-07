<script setup>
import { ref } from 'vue'

const emit = defineEmits(['select', 'close'])

const templates = [
  {
    id: 'daily',
    name: '📝 日常记录',
    icon: '📝',
    description: '记录今天发生的事情',
    template: `今天是${new Date().toLocaleDateString('zh-CN')}，天气不错。

今天发生的事情：
1. 
2. 
3. 

今日心情：
今日收获：
明日计划：`
  },
  {
    id: 'gratitude',
    name: '🙏 感恩日记',
    icon: '🙏',
    description: '记录值得感恩的事',
    template: `感恩日记 - ${new Date().toLocaleDateString('zh-CN')}

今天我要感谢：
1. 感谢，因为
2. 感谢，因为
3. 感谢，因为

今天的小确幸：
我想对自己说：`
  },
  {
    id: 'review',
    name: '📊 日复盘',
    icon: '📊',
    description: '每日复盘总结',
    template: `日复盘 - ${new Date().toLocaleDateString('zh-CN')}

【今日完成】
✅ 
✅ 
✅ 

【今日未完成】
⬜ 

【做得好的地方】


【需要改进的地方】


【明日最重要的事】


【心情打分】😊 1-10分：`
  },
  {
    id: 'work',
    name: '💼 工作日志',
    icon: '💼',
    description: '记录工作进展',
    template: `工作日志 - ${new Date().toLocaleDateString('zh-CN')}

【今日工作】
- 
- 
- 

【遇到的问题】


【解决方案】


【明日计划】


【工作时长】小时`
  },
  {
    id: 'study',
    name: '📚 学习笔记',
    icon: '📚',
    description: '记录学习内容',
    template: `学习笔记 - ${new Date().toLocaleDateString('zh-CN')}

【今日学习内容】


【重点知识】
1. 
2. 
3. 

【疑问】


【明日学习计划】`
  },
  {
    id: 'fitness',
    name: '🏃 运动打卡',
    icon: '🏃',
    description: '记录运动数据',
    template: `运动打卡 - ${new Date().toLocaleDateString('zh-CN')}

【运动项目】


【运动时长】分钟

【运动数据】
- 跑步：km
- 骑行：km
- 步数：

【身体状态】


【明日计划】`
  }
]

const selectedTemplate = ref(null)

const selectTemplate = (template) => {
  selectedTemplate.value = template
  emit('select', template.template)
}
</script>

<template>
  <div class="template-picker">
    <div class="picker-header">
      <h3>📋 选择日记模板</h3>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>
    
    <div class="template-grid">
      <div 
        v-for="t in templates" 
        :key="t.id"
        class="template-card"
        @click="selectTemplate(t)"
      >
        <span class="template-icon">{{ t.icon }}</span>
        <span class="template-name">{{ t.name }}</span>
        <span class="template-desc">{{ t.description }}</span>
      </div>
    </div>
    
    <div class="picker-footer">
      <button class="blank-btn" @click="emit('select', '')">
        📄 从空白开始
      </button>
    </div>
  </div>
</template>

<style scoped>
.template-picker {
  background: var(--bg-primary, #fff);
  border-radius: 20px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.picker-header h3 {
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

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.template-card {
  padding: 16px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.template-card:hover {
  background: var(--accent-light, rgba(99, 102, 241, 0.1));
  transform: translateY(-2px);
}

.template-icon {
  font-size: 1.8rem;
}

.template-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary, #1e293b);
}

.template-desc {
  font-size: 0.8rem;
  color: var(--text-secondary, #64748b);
}

.picker-footer {
  text-align: center;
}

.blank-btn {
  padding: 10px 24px;
  border: 1px dashed var(--text-secondary, #64748b);
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary, #64748b);
}

.blank-btn:hover {
  border-color: var(--accent, #6366f1);
  color: var(--accent, #6366f1);
}

@media (max-width: 480px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>
