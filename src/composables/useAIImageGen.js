// AI 绘图 API 集成
// 支持多个AI绘图服务

// ============ 配置 ============
const AI_IMAGE_APIS = {
  // 智谱AI CogView（推荐，免费额度）
  zhipu: {
    name: '智谱AI CogView',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/images/generations',
    apiKey: '', // 需要申请：https://open.bigmodel.cn/
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
  cartoon: 'cartoon style, cute, colorful, vibrant, anime inspired, kawaii',
  anime: 'anime style, manga, cel shading, vibrant colors, Japanese animation',
  watercolor: 'watercolor painting, soft colors, artistic, dreamy, flowing',
  oil: 'oil painting, classical art, rich textures, masterpiece',
  sketch: 'pencil sketch, hand drawn, artistic, detailed lines',
  pixel: 'pixel art, 8-bit, retro game style, cute pixels',
  minimal: 'minimalist, simple, clean lines, modern design',
  fantasy: 'fantasy art, magical, ethereal, mystical atmosphere',
  realistic: 'realistic, photorealistic, high detail, professional photography'
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
  // 1. 提取关键词
  const keywords = extractKeywordsFromContent(content)
  
  // 2. 构建提示词
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.cartoon
  const moodPrompt = enhanceMoodKeywords(content)
  
  // 3. 组合最终提示词
  const finalPrompt = `${keywords}, ${stylePrompt}, ${moodPrompt}, high quality, detailed`
  
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
    style: style
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
  
  // 提取中文关键词
  const chineseKeywords = [
    '天空', '大海', '森林', '城市', '日落', '星空',
    '花朵', '蝴蝶', '猫咪', '小狗', '咖啡', '书本'
  ]
  
  chineseKeywords.forEach(kw => {
    if (text.includes(kw)) {
      keywords.push(kw)
    }
  })
  
  // 如果没有关键词，使用通用描述
  if (keywords.length === 0) {
    keywords.push('beautiful scene', 'peaceful atmosphere')
  }
  
  return keywords.join(', ')
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
