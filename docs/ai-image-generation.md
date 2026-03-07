# 龙虾日记 v2.1 - AI 图片生成功能

## 功能描述

根据日记内容， AI 自动生成配图，让日记更生动！

---

## 技术方案

### 方案一：调用 AI 绘图 API

| API | 特点 | 费用 |
|-----|------|------|
| DALL-E 3 | 效果最好 | $0.02/张 |
| Midjourney | 艺术风格强 | $0.01/张 |
| Stable Diffusion | 开源免费 | 免费（需部署） |
| 通义万相 | 中文友好 | 有免费额度 |

### 方案二：使用占位图服务（推荐）

```
用户日记 → AI提取关键词 → 匹配图片库 → 返回图片
```

使用 Unsplash API（免费）：
- 1秒内返回高质量图片
- 无需 API Key
- 支持关键词搜索

---

## 迭代11：AI图片生成

### 🎯 产品经理需求

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 智能配图 | 根据日记内容自动推荐图片 | P0 |
| 关键词提取 | AI提取日记关键词 | P0 |
| 图片搜索 | Unsplash API 搜索相关图片 | P0 |
| 一键应用 | 点击即可添加到日记 | P0 |

### 💻 前端开发

```vue
<!-- AIGenerateImage.vue -->
<template>
  <div class="ai-image-generator">
    <button @click="generateImage" class="generate-btn">
      🎨 AI 生成配图
    </button>
    
    <div v-if="loading" class="loading">
      <span class="spinner">⏳</span>
      <span>正在生成图片...</span>
    </div>
    
    <div v-if="images.length" class="image-grid">
      <img 
        v-for="img in images" 
        :key="img.id"
        :src="img.url"
        @click="selectImage(img)"
      />
    </div>
  </div>
</template>
```

### ⚙️ 后端实现

```javascript
// composables/useAIGenerate.js
export function useAIGenerate() {
  const generateImage = async (content) => {
    // 1. 提取关键词
    const keywords = extractKeywords(content)
    
    // 2. 调用 Unsplash API
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${keywords}&count=4`,
      {
        headers: {
          'Accept-Version': 'v1'
        }
      }
    )
    
    const data = await response.json()
    return data.map(img => ({
      id: img.id,
      url: img.urls.regular,
      author: img.user.name
    }))
  }
  
  return { generateImage }
}
```

---

## 实现优先级

1. **Phase 1**：关键词提取 + Unsplash 搜索
2. **Phase 2**：图片预览 + 选择
3. **Phase 3**：集成 DALL-E（可选）

---

## 预估工时

| 任务 | 时间 |
|------|------|
| 关键词提取 | 0.5h |
| Unsplash 集成 | 1h |
| UI 组件 | 1h |
| 测试 | 0.5h |
| **总计** | **3h** |

---

*创建时间：2026-03-07*
