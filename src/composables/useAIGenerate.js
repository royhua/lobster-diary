// AI 图片生成 - 使用 Unsplash API（免费，无需 Key）

// 图片关键词映射
const keywordMap = {
  // 情绪相关
  '开心': 'happy,joy,sunshine',
  '快乐': 'happy,joy,smile',
  '幸福': 'happiness,love,warm',
  '悲伤': 'sad,rain,lonely',
  '焦虑': 'anxiety,stress,calm',
  '平静': 'calm,peace,serenity',
  '兴奋': 'excited,energy,dynamic',
  
  // 活动相关
  '工作': 'work,office,business',
  '学习': 'study,book,education',
  '运动': 'sport,fitness,running',
  '旅行': 'travel,adventure,nature',
  '美食': 'food,delicious,cooking',
  '音乐': 'music,guitar,concert',
  '阅读': 'reading,book,library',
  '电影': 'movie,cinema,film',
  '游戏': 'game,play,fun',
  
  // 自然相关
  '天气': 'weather,sky,cloud',
  '晴天': 'sunny,blue-sky,sunshine',
  '雨天': 'rain,umbrella,rainy',
  '春天': 'spring,flower,bloom',
  '夏天': 'summer,beach,hot',
  '秋天': 'autumn,fall,leaves',
  '冬天': 'winter,snow,cold',
  '日出': 'sunrise,morning,dawn',
  '日落': 'sunset,evening,dusk',
  
  // 场景相关
  '家': 'home,cozy,interior',
  '城市': 'city,urban,street',
  '海边': 'beach,ocean,sea',
  '山上': 'mountain,hiking,nature',
  '公园': 'park,nature,green',
  
  // 时间相关
  '早晨': 'morning,sunrise,breakfast',
  '中午': 'noon,lunch,daylight',
  '下午': 'afternoon,tea,relax',
  '晚上': 'evening,night,moon',
  '深夜': 'night,stars,midnight',
  
  // 节日相关
  '生日': 'birthday,cake,celebration',
  '新年': 'new-year,celebration,fireworks',
  '圣诞': 'christmas,winter,gifts',
  
  // 其他
  '咖啡': 'coffee,cafe,drink',
  '猫': 'cat,cute,pet',
  '狗': 'dog,pet,animal',
  '花': 'flower,bloom,nature',
  '星星': 'stars,night,sky',
  '月亮': 'moon,night,sky'
}

// 从内容提取关键词
export function extractImageKeywords(content) {
  const keywords = []
  const text = content.toLowerCase()
  
  // 匹配关键词
  Object.entries(keywordMap).forEach(([cn, en]) => {
    if (text.includes(cn)) {
      keywords.push(en.split(',')[0].trim())
    }
  })
  
  // 如果没有匹配到，使用通用关键词
  if (keywords.length === 0) {
    keywords.push('nature', 'minimal', 'peaceful')
  }
  
  return keywords.slice(0, 3) // 最多返回3个关键词
}

// 从 Unsplash 获取图片（免费 API，无需 Key）
export async function fetchUnsplashImages(keyword, count = 4) {
  try {
    // 使用 Unsplash Source API（无需认证）
    const response = await fetch(
      `https://source.unsplash.com/featured/?${keyword}&count=${count}`,
      { method: 'HEAD' }
    )
    
    // Unsplash Source 返回单个图片 URL
    // 格式：https://images.unsplash.com/photo-xxx?auto=format&fit=crop&w=800&q=80
    const imageUrl = response.url
    
    if (imageUrl) {
      return [{
        id: `img_${Date.now()}`,
        url: imageUrl,
        keyword: keyword,
        source: 'Unsplash'
      }]
    }
    
    return []
  } catch (error) {
    console.error('Unsplash fetch error:', error)
    return []
  }
}

// 备用：使用 Lorem Picsum（图片占位服务）
export async function fetchPicsumImages(count = 4) {
  const images = []
  
  for (let i = 0; i < count; i++) {
    const id = Math.floor(Math.random() * 1000)
    images.push({
      id: `picsum_${id}`,
      url: `https://picsum.photos/id/${id}/800/600`,
      source: 'Picsum'
    })
  }
  
  return images
}

// 备用：使用 Pexels API
export async function fetchPexelsImages(keyword, count = 4) {
  // Pexels 免费 API Key（公开测试用）
  const apiKey = '563492bad648781776593b6148797c1e3c089bf'
  
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${keyword}&per_page=${count}`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    )
    
    const data = await response.json()
    
    if (data.photos) {
      return data.photos.map(photo => ({
        id: `pexels_${photo.id}`,
        url: photo.src.medium,
        large: photo.src.large,
        photographer: photo.photographer,
        source: 'Pexels'
      }))
    }
    
    return []
  } catch (error) {
    console.error('Pexels fetch error:', error)
    return []
  }
}

// 主函数：根据日记内容生成配图
export async function generateDiaryImage(content) {
  // 1. 提取关键词
  const keywords = extractImageKeywords(content)
  const mainKeyword = keywords[0] || 'nature'
  
  // 2. 尝试多个图片源
  let images = []
  
  // 优先使用 Pexels（质量高）
  images = await fetchPexelsImages(mainKeyword, 6)
  
  // 如果 Pexels 失败，使用 Picsum
  if (images.length === 0) {
    images = await fetchPicsumImages(6)
  }
  
  return {
    keywords: keywords,
    images: images
  }
}

// 获取随机配图（用于快速生成）
export function getRandomImage(category = 'nature') {
  const categories = {
    nature: ['nature', 'landscape', 'forest', 'mountain'],
    city: ['city', 'urban', 'architecture', 'street'],
    food: ['food', 'coffee', 'breakfast', 'dinner'],
    people: ['people', 'portrait', 'lifestyle', 'friends'],
    animals: ['animals', 'cat', 'dog', 'wildlife'],
    abstract: ['abstract', 'minimal', 'texture', 'pattern']
  }
  
  const categoryKeywords = categories[category] || categories.nature
  const randomKeyword = categoryKeywords[Math.floor(Math.random() * categoryKeywords.length)]
  
  return `https://source.unsplash.com/featured/?${randomKeyword}/800x600`
}
