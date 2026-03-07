<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const darkMode = ref(false)

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    darkMode.value = savedDarkMode === 'true'
  }
})

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value)
}
</script>

<template>
  <div class="app-container" :class="{ 'dark-mode': darkMode }">
    <!-- 导航栏 -->
    <nav class="nav-bar">
      <router-link to="/" class="nav-brand">
        🦞 龙虾日记
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/stats" class="nav-link">统计</router-link>
        <button @click="toggleDarkMode" class="nav-btn">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </nav>
    
    <!-- 主内容 -->
    <main>
      <router-view />
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <p>🦞 龙虾日记 - 记录每一天的精彩</p>
      <p class="footer-links">
        <router-link to="/">首页</router-link>
        <span>·</span>
        <router-link to="/stats">数据统计</router-link>
      </p>
    </footer>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-container.dark-mode {
  background: #1a1a2e;
}

/* 导航栏 */
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dark-mode .nav-bar {
  background: rgba(45, 45, 78, 0.95);
}

.nav-brand {
  font-size: 1.3rem;
  font-weight: 700;
  color: #667eea;
  text-decoration: none;
}

.dark-mode .nav-brand {
  color: #a78bfa;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.dark-mode .nav-link {
  color: #aaa;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #667eea;
}

.dark-mode .nav-link:hover,
.dark-mode .nav-link.router-link-active {
  color: #a78bfa;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 5px;
}

/* 页脚 */
.footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  padding: 30px 20px;
}

.footer-links {
  margin-top: 10px;
  font-size: 0.9rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
}

.footer-links a:hover {
  color: white;
}

.footer-links span {
  margin: 0 10px;
}
</style>
