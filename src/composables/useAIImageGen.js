// AI 绘图 API 集成
// 支持多个AI绘图服务

// ============ 配置 ============
const AI_IMAGE_APIS = {
  // 智谱AI CogView（推荐，免费额度）
  zhipu: {
    name: '智谱AI CogView',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/images/generations',
    apiKey: '7c77f0cb37d141ee86b75a18806a7087.tqLxkXI8KMKcTr7m', // 已配置
    free: true,
    freeQuota: '会员免费'
  },
  
  // 通义万相（阿里云，免费额度）
  tongyi: {
    name: '通义万相',
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
    apiKey: '', // 需要申请：https://dashscope.console.aliyun.com/
    free: true,
    freeQuota: 100 // 每月免费100张
  },
  
  // Stable Diffusion（本地部署，免费）
  sd: {
    name: 'Stable Diffusion',
    endpoint: 'http://localhost:7860/sdapi/v1/txt2img',
    apiKey: '',
    free: true
  },
  
  // DALL-E 3（OpenAI，付费）
  dalle: {
    name: 'DALL-E 3',
    endpoint: 'https://api.openai.com/v1/images/generations',
    apiKey: '', // 需要 OpenAI API Key
    free: false,
    price: '$0.02/张'
  },
  
  // Midjourney（通过第三方API）
  mj: {
    name: 'Midjourney',
    endpoint: 'https://api.midjourney.com/v1/imagine',
    apiKey: '',
    free: false,
    price: '$0.01/张'
  }
}

// ============ 风格提示词 ============
const STYLE_PROMPTS = {
  cartoon: 'cute cartoon style, colorful, vibrant, kawaii, cheerful',
  anime: 'anime style, manga, cel shading, vibrant colors, Japanese animation',
  watercolor: 'soft watercolor painting, dreamy, artistic, flowing colors',
  oil: 'classical oil painting, rich textures, masterpiece, museum quality',
  sketch: 'detailed pencil sketch, hand drawn, artistic, fine lines',
  pixel: 'pixel art, 8-bit, retro game style, cute pixels, nostalgic',
  minimal: 'minimalist, simple, clean lines, modern design, elegant',
  fantasy: 'fantasy art, magical, ethereal, mystical atmosphere, enchanting',
  realistic: 'photorealistic, high detail, professional photography, 4k'
}

// ============ 中文提示词增强 ============
const PROMPT_ENHANCERS = {
  '开心': 'happy, joyful, bright sunshine, warm colors, smiling',
  '悲伤': 'sad, melancholic, rain, blue tones, emotional',
  '平静': 'peaceful, calm, serene, soft pastel colors, tranquil',
  '兴奋': 'exciting, dynamic, energetic, vibrant colors, action',
  '浪漫': 'romantic, love, pink flowers, sunset, dreamy',
  '孤独': 'lonely, solitude, misty, monochrome, contemplative',
  '希望': 'hopeful, sunrise, golden light, new beginning',
  '焦虑': 'anxious, tense, dark clouds, dramatic lighting'
}

// ============ 主函数：生成AI图片 ============
export async function generateAIImage(content, style = 'cartoon') {
  // 1. 直接使用日记内容作为提示词
  const diaryContent = content.trim()
  
  // 2. 构建风格提示词
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.cartoon
  
  // 3. 组合最终提示词 - 直接使用日记内容
  const finalPrompt = `A ${stylePrompt} illustration depicting: ${diaryContent}. High quality, detailed, beautiful composition.`
  
  console.log('🎨 AI生图提示词:', finalPrompt)
  
  // 4. 调用AI绘图API（按优先级尝试）
  let image = null
  
  // 优先使用智谱AI（会员免费）
  image = await callZhipuAPI(finalPrompt)
  
  // 如果失败，尝试通义万相
  if (!image) {
    image = await callTongyiAPI(finalPrompt)
  }
  
  // 如果失败，尝试 Stable Diffusion
  if (!image) {
    image = await callStableDiffusionAPI(finalPrompt)
  }
  
  // 如果还失败，尝试 DALL-E
  if (!image) {
    image = await callDalleAPI(finalPrompt)
  }
  
  return {
    prompt: finalPrompt,
    image: image,
    style: style,
    diaryContent: diaryContent
  }
}

// ============ 智谱AI CogView API ============
async function callZhipuAPI(prompt) {
  const config = AI_IMAGE_APIS.zhipu
  
  if (!config.apiKey) {
    console.log('⚠️ 智谱AI未配置API Key')
    return null
  }
  
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: 'cogview-3',
        prompt: prompt,
        size: '1024x1024',
        n: 1
      })
    })
    
    const data = await response.json()
    
    if (data.data && data.data[0]) {
      return data.data[0].url || `data:image/png;base64,${data.data[0].b64_json}`
    }
    
    return null
  } catch (error) {
    console.error('智谱AI API错误:', error)
    return null
  }
}

// ============ 通义万相 API ============
async function callTongyiAPI(prompt) {
  const config = AI_IMAGE_APIS.tongyi
  
  if (!config.apiKey) {
    console.log('⚠️ 通义万相未配置API Key')
    return null
  }
  
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: prompt
        },
        parameters: {
          style: '<auto>',
          size: '1024*1024',
          n: 1
        }
      })
    })
    
    const data = await response.json()
    
    if (data.output && data.output.results) {
      return data.output.results[0].url
    }
    
    return null
  } catch (error) {
    console.error('通义万相API错误:', error)
    return null
  }
}

// 别名（保持兼容）
const callTongyiAPIAlias = callTongyiAPI

// ============ Stable Diffusion API ============
async function callStableDiffusionAPI(prompt) {
  const config = AI_IMAGE_APIS.sd
  
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: 'low quality, blurry, distorted, ugly',
        steps: 30,
        width: 1024,
        height: 1024,
        cfg_scale: 7
      })
    })
    
    const data = await response.json()
    
    if (data.images && data.images[0]) {
      return `data:image/png;base64,${data.images[0]}`
    }
    
    return null
  } catch (error) {
    console.error('Stable Diffusion API错误:', error)
    return null
  }
}

// ============ DALL-E API ============
async function callDalleAPI(prompt) {
  const config = AI_IMAGE_APIS.dalle
  
  if (!config.apiKey) {
    console.log('⚠️ DALL-E未配置API Key')
    return null
  }
  
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    })
    
    const data = await response.json()
    
    if (data.data && data.data[0]) {
      return data.data[0].url
    }
    
    return null
  } catch (error) {
    console.error('DALL-E API错误:', error)
    return null
  }
}

// ============ 辅助函数 ============
function extractKeywordsFromContent(content) {
  const keywords = []
  const text = content.toLowerCase()
  
  // 扩展关键词映射
  const keywordMap = {
    // 情绪
    '开心': 'happy, joyful, sunshine, smile',
    '快乐': 'happy, joy, cheerful, bright',
    '幸福': 'happiness, warm, love, family',
    '悲伤': 'sad, melancholic, rain, lonely',
    '难过': 'sad, tears, rain, blue',
    '焦虑': 'anxious, stress, worry, tense',
    '平静': 'peaceful, calm, serene, quiet',
    '兴奋': 'excited, energetic, dynamic, vibrant',
    '生气': 'angry, frustration, storm, dark',
    '感动': 'touched, emotional, heartwarming',
    
    // 活动
    '工作': 'office, work, business, desk, computer',
    '学习': 'study, reading, book, library, education',
    '运动': 'sport, running, fitness, exercise, gym',
    '跑步': 'running, jogging, outdoor, morning',
    '健身': 'fitness, gym, workout, strength',
    '旅行': 'travel, adventure, journey, explore',
    '旅游': 'tourism, sightseeing, vacation',
    '购物': 'shopping, store, market, buying',
    '做饭': 'cooking, kitchen, food, chef',
    '美食': 'delicious food, gourmet, cooking',
    '咖啡': 'coffee, cafe, drink, morning',
    '阅读': 'reading, book, library, peaceful',
    '电影': 'movie, cinema, film, theater',
    '音乐': 'music, guitar, piano, concert',
    '游戏': 'game, playing, fun, entertainment',
    '睡觉': 'sleep, bedroom, night, dream',
    '休息': 'rest, relaxing, couch, comfortable',
    
    // 场景
    '家': 'home, cozy, interior, living room',
    '公司': 'office, building, corporate',
    '学校': 'school, classroom, campus',
    '公园': 'park, nature, trees, walking',
    '海边': 'beach, ocean, waves, sand',
    '山上': 'mountain, hiking, nature, peak',
    '城市': 'city, urban, street, buildings',
    '农村': 'countryside, farm, fields, rural',
    
    // 天气
    '晴天': 'sunny, blue sky, sunshine, bright',
    '雨天': 'rain, rainy, umbrella, wet',
    '阴天': 'cloudy, overcast, gray',
    '雪': 'snow, winter, cold, white',
    '风': 'windy, breeze, storm',
    '热': 'hot, summer, sun, warm',
    '冷': 'cold, winter, ice, freeze',
    
    // 时间
    '早晨': 'morning, sunrise, dawn, breakfast',
    '上午': 'morning, daylight, working',
    '中午': 'noon, lunch, midday',
    '下午': 'afternoon, tea, relaxing',
    '晚上': 'evening, sunset, dinner',
    '夜晚': 'night, stars, moon, dark',
    '深夜': 'midnight, late night, quiet',
    
    // 人物
    '朋友': 'friends, friendship, together',
    '家人': 'family, parents, home',
    '同事': 'colleague, team, work',
    '孩子': 'children, kids, playing',
    '宠物': 'pet, cat, dog, cute',
    
    // 节日
    '生日': 'birthday, cake, celebration, party',
    '新年': 'new year, fireworks, celebration',
    '春节': 'chinese new year, red, lantern',
    '圣诞': 'christmas, tree, gifts, winter',
    
    // 物品
    '花': 'flower, bloom, garden, beautiful',
    '猫': 'cat, kitten, cute, pet',
    '狗': 'dog, puppy, pet, loyal',
    '车': 'car, driving, road',
    '书': 'book, reading, knowledge',
    '手机': 'phone, smartphone, technology',
    
    // 感受
    '累': 'tired, exhausted, rest',
    '饿': 'hungry, food, eating',
    '困': 'sleepy, tired, bed',
    '忙': 'busy, work, rush'
  }
  
  // 匹配关键词
  Object.entries(keywordMap).forEach(([cn, en]) => {
    if (text.includes(cn)) {
      keywords.push(en)
    }
  })
  
  // 如果没有匹配到，尝试提取通用描述
  if (keywords.length === 0) {
    // 检测是否包含中文
    if (/[\u4e00-\u9fa5]/.test(text)) {
      keywords.push('daily life scene, peaceful atmosphere')
    } else {
      keywords.push('beautiful scene, peaceful atmosphere')
    }
  }
  
  // 最多返回3个关键词
  return keywords.slice(0, 3).join(', ')
}

function enhanceMoodKeywords(content) {
  const enhancements = []
  
  Object.entries(PROMPT_ENHANCERS).forEach(([mood, prompt]) => {
    if (content.includes(mood)) {
      enhancements.push(prompt)
    }
  })
  
  return enhancements.join(', ') || 'neutral mood, balanced composition'
}

// ============ 配置 API Key ============
export function configureAPI(service, apiKey) {
  if (AI_IMAGE_APIS[service]) {
    AI_IMAGE_APIS[service].apiKey = apiKey
    console.log(`✅ ${AI_IMAGE_APIS[service].name} API Key 已配置`)
    return true
  }
  return false
}

// ============ 获取可用服务列表 ============
export function getAvailableServices() {
  return Object.entries(AI_IMAGE_APIS).map(([key, config]) => ({
    id: key,
    name: config.name,
    free: config.free,
    price: config.price || config.freeQuota,
    configured: !!config.apiKey
  }))
}

// ============ 获取智谱AI配置状态 ============
export function isZhipuConfigured() {
  return !!AI_IMAGE_APIS.zhipu.apiKey
}

// ============ 获取风格列表 ============
export function getAvailableStyles() {
  return [
    { id: 'cartoon', name: '卡通风格', icon: '🎨' },
    { id: 'anime', name: '动漫风格', icon: '🌸' },
    { id: 'watercolor', name: '水彩画', icon: '💧' },
    { id: 'oil', name: '油画', icon: '🖼️' },
    { id: 'sketch', name: '素描', icon: '✏️' },
    { id: 'pixel', name: '像素风', icon: '👾' },
    { id: 'minimal', name: '极简风', icon: '⬜' },
    { id: 'fantasy', name: '幻想风', icon: '✨' },
    { id: 'realistic', name: '写实风', icon: '📷' }
  ]
}
