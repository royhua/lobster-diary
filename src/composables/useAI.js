// AI 相关功能（由于是纯前端项目，使用模拟AI）

// 生成日记提示词
const prompts = [
  "今天发生了什么让你印象深刻的事？",
  "今天有什么收获或感悟？",
  "有什么让你感到开心的事吗？",
  "今天遇到了什么挑战？你是如何应对的？",
  "今天学到了什么新东西？",
  "有什么想感谢的人或事吗？",
  "今天的目标完成得怎么样？",
  "有什么让你感到放松的时刻？",
  "今天和谁有过有意义的交流？",
  "如果用三个词形容今天，会是哪三个？"
]

// 随机金句
const quotes = [
  "每一天都是新的开始 ✨",
  "坚持就是胜利 💪",
  "相信自己，你可以的！🌟",
  "生活因记录而美好 📝",
  "小步前进，大步成长 🚀",
  "今天的努力是明天的收获 🌻",
  "保持热爱，奔赴山海 🏔️",
  "慢一点也没关系 🐢",
  "你比想象中更强大 💎",
  "记录当下，珍惜此刻 ⏰"
]

// 智能标签提取关键词
const tagKeywords = {
  '工作': ['工作', '上班', '会议', '项目', '报告', '任务', '加班', 'deadline'],
  '学习': ['学习', '读书', '课程', '考试', '笔记', '知识', '技能'],
  '运动': ['运动', '健身', '跑步', '骑行', '游泳', '瑜伽', '锻炼'],
  '美食': ['美食', '吃', '餐厅', '做饭', '午餐', '晚餐', '早餐'],
  '旅行': ['旅行', '旅游', '景点', '出差', '度假', '风景'],
  '家庭': ['家人', '父母', '孩子', '老婆', '老公', '家里', '回家'],
  '朋友': ['朋友', '聚会', '聊天', '同学', '同事'],
  '心情': ['开心', '难过', '焦虑', '平静', '激动', '郁闷', '放松'],
  '成长': ['成长', '进步', '突破', '改变', '反思', '感悟'],
  '技术': ['代码', '开发', '编程', 'API', '框架', 'bug', '技术'],
  '健康': ['健康', '生病', '医院', '身体', '休息', '睡眠'],
  '周末': ['周末', '周六', '周日', '休息', '放假']
}

export function useAI() {
  // 获取随机提示词
  const getRandomPrompt = () => {
    return prompts[Math.floor(Math.random() * prompts.length)]
  }
  
  // 获取随机金句
  const getRandomQuote = () => {
    return quotes[Math.floor(Math.random() * quotes.length)]
  }
  
  // 智能提取标签
  const extractTags = (content) => {
    const tags = []
    
    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag)
      }
    })
    
    // 限制最多3个标签
    return tags.slice(0, 3)
  }
  
  // 生成日记草稿（基于关键词）
  const generateDraft = (keywords) => {
    const templates = [
      `今天${keywords[0] || '发生了一些事'}，让我感到${keywords[1] || '有所收获'}。${getRandomQuote()}`,
      `${keywords[0] || '这一天'}，我想记录下${keywords[1] || '这份心情'}。希望明天会更好！`,
      `关于${keywords[0] || '今天'}，有很多想说的。${keywords[1] || '一切都在慢慢变好'}。`
    ]
    
    return templates[Math.floor(Math.random() * templates.length)]
  }
  
  // 情绪分析（简化版）
  const analyzeMood = (content) => {
    const positiveWords = ['开心', '快乐', '幸福', '成功', '美好', '棒', '赞', '喜欢', '爱', '感谢', '期待', '希望', '阳光', '精彩', '完美', '顺利', '突破', '进步', '成长', '收获']
    const negativeWords = ['难过', '伤心', '失望', '沮丧', '糟糕', '烦', '累', '压力', '焦虑', '担心', '害怕', '迷茫', '困惑', '挫折', '失败', '遗憾', '痛苦', '疲惫']
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      if (content.includes(word)) positiveCount++
    })
    
    negativeWords.forEach(word => {
      if (content.includes(word)) negativeCount++
    })
    
    if (positiveCount > negativeCount) return { mood: 'positive', emoji: '😊', label: '积极' }
    if (negativeCount > positiveCount) return { mood: 'negative', emoji: '😔', label: '低落' }
    return { mood: 'neutral', emoji: '😌', label: '平静' }
  }
  
  // 生成周报
  const generateWeeklyReport = (diaries) => {
    const thisWeek = diaries.filter(d => {
      const date = new Date(d.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    })
    
    const totalWords = thisWeek.reduce((sum, d) => sum + d.content.length, 0)
    const avgWords = thisWeek.length > 0 ? Math.round(totalWords / thisWeek.length) : 0
    
    const allTags = thisWeek.flatMap(d => d.tags || [])
    const topTags = [...new Set(allTags)].slice(0, 3)
    
    return {
      count: thisWeek.length,
      totalWords,
      avgWords,
      topTags,
      quote: getRandomQuote()
    }
  }
  
  return {
    getRandomPrompt,
    getRandomQuote,
    extractTags,
    generateDraft,
    analyzeMood,
    generateWeeklyReport
  }
}
