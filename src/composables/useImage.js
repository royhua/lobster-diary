import { ref } from 'vue'

// 图片上传和处理
export function useImage() {
  const uploading = ref(false)
  const error = ref(null)

  // 压缩图片
  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            quality
          )
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 转换为Base64
  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 上传图片（返回Base64，实际项目可换成云存储）
  const uploadImage = async (file) => {
    uploading.value = true
    error.value = null

    try {
      const compressed = await compressImage(file)
      const base64 = await toBase64(compressed)
      uploading.value = false
      return base64
    } catch (e) {
      error.value = e.message
      uploading.value = false
      throw e
    }
  }

  return {
    uploading,
    error,
    uploadImage,
    compressImage,
    toBase64
  }
}

// AI生成图片（调用后端API）
export function useAIGenerate() {
  const generating = ref(false)
  const error = ref(null)

  const generateImage = async (prompt) => {
    generating.value = true
    error.value = null

    try {
      // 这里可以接入 DALL-E 或 Stable Diffusion API
      // 目前返回一个占位图
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const data = await response.json()
      generating.value = false
      return data.url
    } catch (e) {
      error.value = e.message
      generating.value = false
      // 返回占位图
      return `https://picsum.photos/800/600?random=${Date.now()}`
    }
  }

  return {
    generating,
    error,
    generateImage
  }
}

// 分享卡片生成
export function useShareCard() {
  const generateCard = async (entry, options = {}) => {
    const {
      width = 800,
      height = 600,
      background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    } = options

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // 背景
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // 标题
    ctx.fillStyle = 'white'
    ctx.font = 'bold 36px "Noto Sans SC", sans-serif'
    ctx.fillText('🦞 龙虾日记', 40, 60)

    // 日期
    ctx.font = '20px "Noto Sans SC", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    const date = new Date(entry.date).toLocaleDateString('zh-CN')
    ctx.fillText(date, 40, 100)

    // 内容（自动换行）
    ctx.fillStyle = 'white'
    ctx.font = '24px "Noto Sans SC", sans-serif'
    const maxWidth = width - 80
    const lineHeight = 36
    const words = entry.content.split('')
    let line = ''
    let y = 180

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 40, y)
        line = words[i]
        y += lineHeight
        if (y > height - 120) break
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 40, y)

    // 标签
    if (entry.tags?.length) {
      ctx.font = '18px "Noto Sans SC", sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      const tags = entry.tags.map(t => `#${t}`).join('  ')
      ctx.fillText(tags, 40, height - 40)
    }

    // 水印
    ctx.font = '14px "Noto Sans SC", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText('royhua.github.io/lobster-diary', width - 250, height - 20)

    return canvas.toDataURL('image/png')
  }

  return { generateCard }
}
