# 🦞 龙虾日记

> 记录每一天的精彩生活

## 🌟 功能特性

### Phase 1 - 基础功能 ✅
- 🌙 暗黑模式切换
- 📖 日记详情弹窗
- 📤 分享卡片生成
- 📥 导出 Markdown
- 🏷️ 标签筛选

### Phase 2 - 图片功能 ✅
- 📷 配图上传（自动压缩）
- 🖼️ 图片墙瀑布流
- 💾 图片本地存储
- 🗑️ 配图删除

### Phase 3 - 数据可视化 ✅
- 📅 年度热力图（GitHub 风格）
- 😊 情绪分析
- 🏷️ 标签云
- 📈 月度趋势图
- ✍️ 写作统计

### Phase 4 - AI 增强 ✅
- ✍️ 智能写作提示
- 🏷️ AI 标签提取
- 😊 实时情绪检测
- ✨ 每日金句
- 📋 快捷模板

### Phase 5 - 后端 & 多端 ✅
- 🔌 RESTful API
- 💾 云端数据同步
- 📱 PWA 离线支持
- 🔄 Service Worker 缓存

## 🚀 快速开始

### 前端

```bash
cd lobster-diary
npm install
npm run dev    # 开发
npm run build  # 构建
npm run deploy # 部署到 gh-pages
```

### 后端

```bash
cd lobster-diary/server
npm install
npm start
```

## 📡 API 文档

### 获取日记列表
```
GET /api/diaries?userId=xxx
```

### 创建日记
```
POST /api/diaries
{
  "content": "日记内容",
  "tags": ["标签1", "标签2"],
  "image": "base64...",
  "userId": "user123"
}
```

### 更新日记
```
PUT /api/diaries/:id
{
  "content": "更新内容"
}
```

### 删除日记
```
DELETE /api/diaries/:id
```

## 🛠️ 技术栈

- **前端**: Vue 3 + Vite + Vue Router
- **样式**: 原生 CSS + 渐变设计
- **存储**: localStorage（离线）+ API（在线）
- **PWA**: Service Worker + Web App Manifest
- **后端**: Node.js + Express（可选）

## 📦 项目结构

```
lobster-diary/
├── public/
│   ├── diary-data.js      # 静态数据
│   ├── manifest.json      # PWA 配置
│   └── sw.js              # Service Worker
├── src/
│   ├── components/        # 组件
│   │   ├── HeatMap.vue
│   │   └── TagCloud.vue
│   ├── composables/       # 组合式函数
│   │   ├── useAI.js
│   │   ├── useAPI.js
│   │   ├── useImage.js
│   │   └── useStats.js
│   ├── views/             # 页面
│   │   ├── Home.vue
│   │   ├── Stats.vue
│   │   └── Write.vue
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── server/                # 后端（可选）
│   ├── index.js
│   └── data/
└── package.json
```

## 🔗 在线访问

https://royhua.github.io/lobster-diary/

## 📝 开发日志

- 2026-03-05: 项目启动，Phase 1 完成
- 2026-03-06: Phase 2 图片功能
- 2026-03-07: Phase 3-5 数据可视化、AI增强、后端API

---

Made with 💜 by 🦞 龙虾
