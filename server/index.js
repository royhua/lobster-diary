const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(bodyParser.json())

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data', 'diaries.json')

// 确保数据目录存在
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 读取数据
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return { diaries: [], users: {} }
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    return { diaries: [], users: {} }
  }
}

// 写入数据
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// ============ API 路由 ============

// 获取所有日记
app.get('/api/diaries', (req, res) => {
  const data = readData()
  const { userId } = req.query
  
  if (userId) {
    const userDiaries = data.diaries.filter(d => d.userId === userId)
    res.json({ success: true, diaries: userDiaries })
  } else {
    res.json({ success: true, diaries: data.diaries })
  }
})

// 获取单条日记
app.get('/api/diaries/:id', (req, res) => {
  const data = readData()
  const diary = data.diaries.find(d => d.id === req.params.id)
  
  if (diary) {
    res.json({ success: true, diary })
  } else {
    res.status(404).json({ success: false, error: '日记不存在' })
  }
})

// 创建日记
app.post('/api/diaries', (req, res) => {
  const data = readData()
  const { content, tags, image, userId = 'default' } = req.body
  
  if (!content) {
    return res.status(400).json({ success: false, error: '内容不能为空' })
  }
  
  const newDiary = {
    id: `d${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    content,
    tags: tags || [],
    image: image || null,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  data.diaries.unshift(newDiary)
  writeData(data)
  
  res.json({ success: true, diary: newDiary })
})

// 更新日记
app.put('/api/diaries/:id', (req, res) => {
  const data = readData()
  const index = data.diaries.findIndex(d => d.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: '日记不存在' })
  }
  
  const updatedDiary = {
    ...data.diaries[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  data.diaries[index] = updatedDiary
  writeData(data)
  
  res.json({ success: true, diary: updatedDiary })
})

// 删除日记
app.delete('/api/diaries/:id', (req, res) => {
  const data = readData()
  const index = data.diaries.findIndex(d => d.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: '日记不存在' })
  }
  
  data.diaries.splice(index, 1)
  writeData(data)
  
  res.json({ success: true, message: '删除成功' })
})

// 上传图片
app.post('/api/upload', (req, res) => {
  // 简化版：直接返回 base64
  // 实际项目应该使用云存储
  const { image } = req.body
  
  if (!image) {
    return res.status(400).json({ success: false, error: '图片不能为空' })
  }
  
  // 这里简化处理，实际应该存储到云服务
  res.json({ success: true, url: image })
})

// AI 生成日记（模拟）
app.post('/api/ai/generate', (req, res) => {
  const { keywords } = req.body
  
  // 模拟 AI 生成
  const templates = [
    `今天${keywords?.[0] || '发生了一些事'}，让我感到有所收获。每一天都是新的开始！`,
    `${keywords?.[0] || '这一天'}，我想记录下这份心情。希望明天会更好！`,
    `关于${keywords?.[0] || '今天'}，有很多想说的。一切都在慢慢变好。`
  ]
  
  const content = templates[Math.floor(Math.random() * templates.length)]
  
  res.json({ 
    success: true, 
    content,
    tags: keywords?.slice(0, 3) || []
  })
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🦞 龙虾日记 API 服务运行在端口 ${PORT}`)
  console.log(`📡 API 地址: http://localhost:${PORT}/api`)
})
