# Supabase 云同步配置指南

## 🦞 龙虾日记 - 从零开始配置云同步

本指南将帮助你在 **10分钟内** 完成云同步配置。

---

## 第一步：注册 Supabase 账号

1. 访问 https://supabase.com
2. 点击 **"Start your project"**
3. 使用 GitHub 账号登录（推荐）或邮箱注册

---

## 第二步：创建项目

1. 登录后点击 **"New Project"**
2. 填写信息：

| 字段 | 填写内容 |
|------|----------|
| Organization | 默认或新建 |
| Project name | `lobster-diary` |
| Database Password | 自动生成或自定义（记住！） |
| Region | 选择 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)** |
| Plan | **Free**（免费版足够） |

3. 点击 **"Create new project"**
4. 等待约 2 分钟，项目初始化完成

---

## 第三步：创建数据表

1. 进入项目后，点击左侧 **"SQL Editor"**
2. 点击 **"New query"**
3. 复制以下 SQL 并执行：

```sql
-- 创建日记表
CREATE TABLE diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  mood VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引（提升查询性能）
CREATE INDEX idx_diaries_user_id ON diaries(user_id);
CREATE INDEX idx_diaries_date ON diaries(date DESC);

-- 设置 RLS（行级安全）
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的日记
CREATE POLICY "Users can view own diaries"
  ON diaries FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能插入自己的日记
CREATE POLICY "Users can insert own diaries"
  ON diaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的日记
CREATE POLICY "Users can update own diaries"
  ON diaries FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能删除自己的日记
CREATE POLICY "Users can delete own diaries"
  ON diaries FOR DELETE
  USING (auth.uid() = user_id);
```

4. 点击右下角 **"Run"** 执行

---

## 第四步：获取 API 密钥

1. 点击左侧 **"Settings"** → **"API"**
2. 找到以下两个值：

| 名称 | 说明 | 示例 |
|------|------|------|
| **Project URL** | 项目地址 | `https://xxx.supabase.co` |
| **anon public** | 公开密钥（可公开） | `eyJhbGciOiJ...` |

> ⚠️ **注意**：`anon` 密钥可以公开，但 `service_role` 密钥**绝对不能**泄露！

---

## 第五步：配置环境变量

### 方式一：本地开发

1. 在项目根目录创建 `.env` 文件：

```bash
cd /root/.openclaw/workspace/lobster-diary
touch .env
```

2. 编辑 `.env` 文件：

```env
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon密钥
```

3. 重启开发服务器

### 方式二：GitHub Pages 部署

由于 GitHub Pages 是静态托管，环境变量需要在构建时注入：

1. 编辑 `vite.config.js`：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/lobster-diary/',
  define: {
    // 直接在这里配置（注意：密钥会暴露在前端代码中）
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://你的项目ID.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('你的anon密钥')
  }
})
```

> 💡 **安全提示**：`anon` 密钥设计为可公开，Supabase 通过 RLS 保护数据安全。

---

## 第六步：启用邮箱认证

1. 点击左侧 **"Authentication"** → **"Providers"**
2. 确保 **"Email"** 已启用
3. （可选）配置邮箱模板：
   - 点击 **"Email Templates"**
   - 自定义确认邮件、重置密码邮件等

---

## 第七步：测试连接

### 快速测试脚本

在浏览器控制台（F12）运行：

```javascript
// 测试 Supabase 连接
const { createClient } = supabase
const client = createClient(
  'https://你的项目ID.supabase.co',
  '你的anon密钥'
)

// 测试注册
const { data, error } = await client.auth.signUp({
  email: 'test@example.com',
  password: 'test123456'
})

console.log('注册结果:', data, error)
```

---

## 常见问题

### Q1: RLS 是什么？为什么需要？

**RLS (Row Level Security)** 是 PostgreSQL 的行级安全特性。它确保：
- 用户 A 只能看到用户 A 的日记
- 用户 B 无法访问用户 A 的数据

即使 `anon` 密钥泄露，没有正确的用户认证，也无法读取他人数据。

### Q2: 免费版有什么限制？

| 项目 | 免费额度 |
|------|----------|
| 数据库 | 500 MB |
| 文件存储 | 1 GB |
| 带宽 | 5 GB/月 |
| 并发连接 | 最多 3 个 |
| MAU | 50,000 |

对于个人日记应用，免费版完全够用！

### Q3: 数据存储在哪里？

- 数据存储在你选择的区域（Tokyo/Singapore）
- Supabase 使用 AWS 作为底层基础设施
- 数据自动备份，支持时间点恢复

### Q4: 如何迁移现有数据？

在浏览器控制台运行：

```javascript
// 获取本地数据
const localData = JSON.parse(localStorage.getItem('diaryDrafts') || '[]')

// 批量上传到 Supabase
for (const diary of localData) {
  await supabase.from('diaries').insert({
    date: diary.date,
    content: diary.content,
    tags: diary.tags || [],
    user_id: (await supabase.auth.getUser()).data.user.id
  })
}

console.log('迁移完成！')
```

---

## 完整配置检查清单

- [ ] Supabase 账号已注册
- [ ] 项目已创建（记住数据库密码）
- [ ] `diaries` 表已创建
- [ ] RLS 策略已配置
- [ ] 已获取 Project URL 和 anon Key
- [ ] 环境变量已配置
- [ ] 邮箱认证已启用
- [ ] 测试连接成功

---

## 需要帮助？

- 📖 Supabase 官方文档：https://supabase.com/docs
- 💬 Discord 社区：https://discord.supabase.com
- 🦞 龙虾日记 Issues：https://github.com/royhua/lobster-diary/issues

---

**配置完成后**，重启龙虾日记，你将看到：
- ☁️ 云同步按钮
- 🔐 登录/注册界面
- 📱 多设备数据同步

祝你使用愉快！🦞
