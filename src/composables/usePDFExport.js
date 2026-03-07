import { ref } from 'vue'

export function usePDFExport() {
  const exporting = ref(false)
  const error = ref(null)
  
  // 生成PDF（使用浏览器打印功能）
  const exportToPDF = async (diaries, options = {}) => {
    const {
      title = '🦞 龙虾日记',
      includeImages = true,
      pageSize = 'A4'
    } = options
    
    exporting.value = true
    error.value = null
    
    try {
      // 创建打印专用容器
      const printContainer = document.createElement('div')
      printContainer.id = 'print-container'
      printContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 210mm;
        padding: 20mm;
        background: white;
        font-family: 'Noto Sans SC', sans-serif;
      `
      
      // 添加标题
      const header = document.createElement('div')
      header.innerHTML = `
        <h1 style="font-size: 24px; margin-bottom: 8px;">${title}</h1>
        <p style="color: #666; margin-bottom: 24px;">
          导出时间：${new Date().toLocaleDateString('zh-CN')} | 
          共 ${diaries.length} 篇日记
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 24px;">
      `
      printContainer.appendChild(header)
      
      // 添加日记内容
      diaries.forEach((diary, index) => {
        const entry = document.createElement('div')
        entry.style.cssText = `
          margin-bottom: 32px;
          page-break-inside: avoid;
        `
        
        let content = `
          <div style="display: flex; gap: 16px; margin-bottom: 12px;">
            <div style="
              min-width: 50px;
              padding: 8px;
              background: #f0f0ff;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 20px; font-weight: bold; color: #6366f1;">
                ${new Date(diary.date).getDate()}
              </div>
              <div style="font-size: 12px; color: #666;">
                ${new Date(diary.date).toLocaleDateString('zh-CN', { month: 'short' })}
              </div>
            </div>
            <div style="flex: 1;">
              <p style="font-size: 14px; line-height: 1.8; color: #333;">
                ${diary.content}
              </p>
        `
        
        // 添加图片
        if (includeImages && diary.image) {
          content += `
            <img 
              src="${diary.image}" 
              style="
                max-width: 100%;
                max-height: 300px;
                border-radius: 8px;
                margin-top: 12px;
              "
            />
          `
        }
        
        // 添加标签
        if (diary.tags?.length) {
          content += `
            <div style="margin-top: 8px;">
              ${diary.tags.map(t => `
                <span style="
                  display: inline-block;
                  padding: 2px 8px;
                  background: #f0f0ff;
                  color: #6366f1;
                  border-radius: 12px;
                  font-size: 12px;
                  margin-right: 6px;
                ">#${t}</span>
              `).join('')}
            </div>
          `
        }
        
        content += `</div></div>`
        
        entry.innerHTML = content
        printContainer.appendChild(entry)
        
        // 添加分隔线（除了最后一篇）
        if (index < diaries.length - 1) {
          const divider = document.createElement('hr')
          divider.style.cssText = `
            border: none;
            border-top: 1px dashed #eee;
            margin: 24px 0;
          `
          printContainer.appendChild(divider)
        }
      })
      
      // 添加页脚
      const footer = document.createElement('div')
      footer.innerHTML = `
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">
          🦞 龙虾日记 - https://royhua.github.io/lobster-diary/
        </p>
      `
      printContainer.appendChild(footer)
      
      document.body.appendChild(printContainer)
      
      // 触发打印
      window.print()
      
      // 清理
      document.body.removeChild(printContainer)
      
      exporting.value = false
      return true
    } catch (e) {
      error.value = e.message
      exporting.value = false
      throw e
    }
  }
  
  // 导出单篇日记
  const exportSingleDiary = async (diary) => {
    return exportToPDF([diary], {
      title: `🦞 龙虾日记 - ${new Date(diary.date).toLocaleDateString('zh-CN')}`
    })
  }
  
  // 导出为图片（使用 html2canvas）
  const exportToImage = async (diary) => {
    // 这个功能需要 html2canvas 库
    // 简化版：返回 base64
    return diary.image || null
  }
  
  return {
    exporting,
    error,
    exportToPDF,
    exportSingleDiary,
    exportToImage
  }
}
