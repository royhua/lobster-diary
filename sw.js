// 龙虾日记 Service Worker - 支持离线访问

const CACHE_NAME = 'lobster-diary-v1'
const STATIC_ASSETS = [
  '/lobster-diary/',
  '/lobster-diary/index.html',
  '/lobster-diary/assets/index.css',
  '/lobster-diary/assets/index.js'
]

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 请求拦截 - 网络优先，缓存降级
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // API 请求：网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // 网络失败时返回离线提示
          return new Response(
            JSON.stringify({ error: '离线模式', offline: true }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          )
        })
    )
    return
  }
  
  // 静态资源：缓存优先
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // 后台更新缓存
          fetch(request).then((response) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response)
            })
          })
          return cachedResponse
        }
        
        // 缓存未命中，从网络获取
        return fetch(request).then((response) => {
          // 缓存响应
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response.clone())
            })
          }
          return response
        })
      })
    )
  }
})

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-diaries') {
    event.waitUntil(syncDiaries())
  }
})

// 同步日记数据
async function syncDiaries() {
  const pendingSync = localStorage.getItem('pending_sync')
  if (!pendingSync) return
  
  const items = JSON.parse(pendingSync)
  
  for (const item of items) {
    try {
      await fetch('/api/diaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
    } catch (e) {
      console.error('Sync failed:', e)
    }
  }
  
  localStorage.removeItem('pending_sync')
}
