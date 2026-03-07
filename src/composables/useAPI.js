// API 配置
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// 通用请求方法
const request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '请求失败')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export function useAPI() {
  // 获取日记列表
  const getDiaries = async (userId) => {
    const query = userId ? `?userId=${userId}` : ''
    return request(`/diaries${query}`)
  }
  
  // 获取单条日记
  const getDiary = async (id) => {
    return request(`/diaries/${id}`)
  }
  
  // 创建日记
  const createDiary = async (data) => {
    return request('/diaries', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
  
  // 更新日记
  const updateDiary = async (id, data) => {
    return request(`/diaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
  
  // 删除日记
  const deleteDiary = async (id) => {
    return request(`/diaries/${id}`, {
      method: 'DELETE'
    })
  }
  
  // 上传图片
  const uploadImage = async (image) => {
    return request('/upload', {
      method: 'POST',
      body: JSON.stringify({ image })
    })
  }
  
  // AI 生成
  const aiGenerate = async (keywords) => {
    return request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ keywords })
    })
  }
  
  // 健康检查
  const healthCheck = async () => {
    return request('/health')
  }
  
  return {
    getDiaries,
    getDiary,
    createDiary,
    updateDiary,
    deleteDiary,
    uploadImage,
    aiGenerate,
    healthCheck
  }
}

// 离线存储（使用 localStorage 作为缓存）
export function useOfflineStorage() {
  const CACHE_KEY = 'lobster_cache'
  const CACHE_EXPIRY = 5 * 60 * 1000 // 5分钟
  
  // 获取缓存
  const getCache = (key) => {
    const cache = localStorage.getItem(`${CACHE_KEY}_${key}`)
    if (!cache) return null
    
    const { data, timestamp } = JSON.parse(cache)
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`${CACHE_KEY}_${key}`)
      return null
    }
    
    return data
  }
  
  // 设置缓存
  const setCache = (key, data) => {
    localStorage.setItem(`${CACHE_KEY}_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  }
  
  // 清除缓存
  const clearCache = (key) => {
    if (key) {
      localStorage.removeItem(`${CACHE_KEY}_${key}`)
    } else {
      // 清除所有缓存
      Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_KEY))
        .forEach(k => localStorage.removeItem(k))
    }
  }
  
  return {
    getCache,
    setCache,
    clearCache
  }
}
