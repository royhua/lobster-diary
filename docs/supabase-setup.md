# Supabase 云同步配置指南

## 1. 为什么选择 Supabase

| 特点 | 说明 |
|------|------|
| 免费额度 | 500MB 数据库 + 1GB 文件存储 |
| 实时同步 | WebSocket 实时订阅 |
| 认证完善 | 支持邮箱/OAuth/匿名登录 |
| REST API | 自动生成 CRUD API |
| 边缘函数 | 支持触发器和定时任务 |

---

## 2. 数据库表设计

### 2.1 diaries 表

```sql
CREATE TABLE diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  mood VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_diaries_user_id ON diaries(user_id);
CREATE INDEX idx_diaries_date ON diaries(date DESC);
```

### 2.2 users 表（使用 Supabase Auth）

Supabase 自动管理 `auth.users` 表

---

## 3. API 端点

### 3.1 认证

```javascript
// 注册
POST /auth/v1/signup
{
  "email": "user@example.com",
  "password": "password123"
}

// 登录
POST /auth/v1/token
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3.2 日记 CRUD

```javascript
// 获取日记列表
GET /rest/v1/diaries?select=*&order=created_at.desc&limit=50

// 创建日记
POST /rest/v1/diaries
{
  "date": "2026-03-07",
  "content": "今天天气很好",
  "tags": ["日常", "天气"],
  "mood": "positive"
}

// 更新日记
PATCH /rest/v1/diaries?id=eq.xxx
{
  "content": "更新内容"
}

// 删除日记
DELETE /rest/v1/diaries?id=eq.xxx
```

---

## 4. 前端集成代码

