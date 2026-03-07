import { computed, ref } from 'vue'

// 情绪分析关键词
const positiveWords = ['开心', '快乐', '幸福', '成功', '美好', '棒', '赞', '喜欢', '爱', '感谢', '期待', '希望', '阳光', '精彩', '完美', '顺利', '突破', '进步', '成长', '收获']
const negativeWords = ['难过', '伤心', '失望', '沮丧', '糟糕', '烦', '累', '压力', '焦虑', '担心', '害怕', '迷茫', '困惑', '挫折', '失败', '遗憾', '痛苦', '疲惫']
const neutralWords = ['今天', '工作', '学习', '完成', '进行', '继续', '开始', '结束', '计划', '安排']

export function useSentiment() {
  const analyzeSentiment = (text) => {
    let positiveScore = 0
    let negativeScore = 0
    let neutralScore = 0
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++
    })
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++
    })
    
    neutralWords.forEach(word => {
      if (text.includes(word)) neutralScore++
    })
    
    const total = positiveScore + negativeScore + neutralScore || 1
    
    return {
      positive: Math.round((positiveScore / total) * 100),
      negative: Math.round((negativeScore / total) * 100),
      neutral: Math.round((neutralScore / total) * 100),
      label: positiveScore > negativeScore ? '积极' : (negativeScore > positiveScore ? '低落' : '平静')
    }
  }
  
  const getSentimentEmoji = (label) => {
    switch (label) {
      case '积极': return '😊'
      case '低落': return '😔'
      default: return '😌'
    }
  }
  
  return {
    analyzeSentiment,
    getSentimentEmoji
  }
}

// 统计计算
export function useDiaryStats(diaries) {
  const stats = computed(() => {
    if (!diaries.value || diaries.value.length === 0) {
      return {
        total: 0,
        thisMonth: 0,
        thisWeek: 0,
        streak: 0,
        longestStreak: 0,
        avgLength: 0,
        topTags: [],
        monthlyData: [],
        sentimentOverview: { positive: 33, negative: 33, neutral: 34, label: '平静' }
      }
    }
    
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    
    // 本月日记
    const thisMonthDiaries = diaries.value.filter(d => {
      const date = new Date(d.date)
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear
    })
    
    // 本周日记
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const thisWeekDiaries = diaries.value.filter(d => new Date(d.date) >= weekAgo)
    
    // 连续记录天数
    const dates = [...new Set(diaries.value.map(d => d.date))].sort().reverse()
    let streak = 0
    let longestStreak = 0
    let currentStreak = 0
    
    for (let i = 0; i < dates.length; i++) {
      const current = new Date(dates[i])
      const expected = new Date(now)
      expected.setDate(expected.getDate() - i)
      
      if (current.toDateString() === expected.toDateString()) {
        if (i === 0) streak = 1
        else streak++
        currentStreak++
      } else {
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 0
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak, streak)
    
    // 平均字数
    const avgLength = Math.round(
      diaries.value.reduce((sum, d) => sum + d.content.length, 0) / diaries.value.length
    )
    
    // 热门标签
    const tagCount = {}
    diaries.value.forEach(d => {
      d.tags?.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    })
    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))
    
    // 月度数据（用于图表）
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(thisYear, thisMonth - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      const count = diaries.value.filter(d => {
        const dDate = new Date(d.date)
        return dDate.getMonth() === month && dDate.getFullYear() === year
      }).length
      monthlyData.push({
        month: `${month + 1}月`,
        count
      })
    }
    
    // 情绪分析
    const { analyzeSentiment } = useSentiment()
    let totalPositive = 0
    let totalNegative = 0
    let totalNeutral = 0
    
    diaries.value.forEach(d => {
      const sentiment = analyzeSentiment(d.content)
      totalPositive += sentiment.positive
      totalNegative += sentiment.negative
      totalNeutral += sentiment.neutral
    })
    
    const count = diaries.value.length
    const sentimentOverview = {
      positive: Math.round(totalPositive / count),
      negative: Math.round(totalNegative / count),
      neutral: Math.round(totalNeutral / count),
      label: totalPositive > totalNegative ? '积极' : (totalNegative > totalPositive ? '低落' : '平静')
    }
    
    return {
      total: diaries.value.length,
      thisMonth: thisMonthDiaries.length,
      thisWeek: thisWeekDiaries.length,
      streak,
      longestStreak,
      avgLength,
      topTags,
      monthlyData,
      sentimentOverview
    }
  })
  
  return { stats }
}
