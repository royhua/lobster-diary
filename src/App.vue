<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const darkMode = ref(false)
const scrolled = ref(false)

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    darkMode.value = savedDarkMode === 'true'
  }
  
  // 监听滚动
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 50
  })
})

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value)
}
</script>

<template>
  <div class="app-container" :class="{ 'dark-mode': darkMode }">
    <!-- 毛玻璃导航栏 -->
    <nav class="nav-bar" :class="{ 'scrolled': scrolled }">
      <router-link to="/" class="nav-brand">
        <span class="brand-icon">🦞</span>
        <span class="brand-text">龙虾日记</span>
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">
          <span class="link-icon">🏠</span>
          <span class="link-text">首页</span>
        </router-link>
        <router-link to="/stats" class="nav-link">
          <span class="link-icon">📊</span>
          <span class="link-text">统计</span>
        </router-link>
        <router-link to="/write" class="nav-link write-btn">
          <span class="link-icon">✍️</span>
          <span class="link-text">写日记</span>
        </router-link>
        <button @click="toggleDarkMode" class="theme-toggle">
          <span class="theme-icon">{{ darkMode ? '☀️' : '🌙' }}</span>
        </button>
      </div>
    </nav>
    
    <!-- 主内容 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="footer-icon">🦞</span>
          <span>龙虾日记</span>
        </div>
        <p class="footer-desc">记录每一天的精彩生活</p>
        <div class="footer-links">
          <router-link to="/">首页</router-link>
          <span class="divider">·</span>
          <router-link to="/stats">数据统计</router-link>
          <span class="divider">·</span>
          <router-link to="/write">写日记</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* ============ 全局样式 ============ */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --accent: #ec4899;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  
  --bg-light: #f8fafc;
  --bg-card: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

body {
  font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-light);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* 暗黑模式 */
.dark-mode {
  --bg-light: #0f172a;
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}

/* ============ 应用容器 ============ */
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-attachment: fixed;
}

.dark-mode.app-container {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
}

/* ============ 导航栏 ============ */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: var(--transition);
}

.nav-bar.scrolled {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-lg);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-icon {
  font-size: 1.8rem;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.brand-text {
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: var(--transition);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.write-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: white !important;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.write-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.theme-toggle {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.theme-icon {
  font-size: 1.3rem;
}

/* ============ 主内容 ============ */
.main-content {
  padding-top: 80px;
  min-height: calc(100vh - 200px);
}

/* ============ 页脚 ============ */
.footer {
  padding: 60px 20px 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.footer-content {
  max-width: 400px;
  margin: 0 auto;
}

.footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.footer-icon {
  font-size: 1.5rem;
}

.footer-desc {
  font-size: 0.95rem;
  opacity: 0.8;
  margin-bottom: 20px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: var(--transition);
}

.footer-links a:hover {
  color: white;
}

.divider {
  opacity: 0.5;
}

/* ============ 页面过渡动画 ============ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============ 响应式 ============ */
@media (max-width: 768px) {
  .nav-bar {
    padding: 12px 16px;
  }
  
  .brand-text {
    display: none;
  }
  
  .link-text {
    display: none;
  }
  
  .nav-link {
    padding: 10px 12px;
  }
  
  .write-btn .link-text {
    display: inline;
  }
}
</style>
