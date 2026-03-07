<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElFooter,
  ElMenu,
  ElMenuItem,
  ElButton,
  ElSwitch,
  ElIcon,
  ElDrawer,
  ElRow,
  ElCol
} from 'element-plus'
import { Moon, Sunny, EditPen, House, DataLine } from '@element-plus/icons-vue'
import BottomNav from './components/BottomNav.vue'
import VersionTag from './components/VersionTag.vue'

const router = useRouter()
const darkMode = ref(false)
const isMobile = ref(false)
const showDrawer = ref(false)
const activeIndex = ref('/')

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    darkMode.value = savedDarkMode === 'true'
  }
  
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value)
  document.documentElement.classList.toggle('dark', darkMode.value)
}

const handleSelect = (key) => {
  activeIndex.value = key
  router.push(key)
  showDrawer.value = false
}
</script>

<template>
  <el-container :class="{ 'dark-mode': darkMode }" class="app-container">
    <!-- 桌面端导航 -->
    <el-header v-if="!isMobile" class="nav-header">
      <div class="nav-brand">
        <span class="brand-icon">🦞</span>
        <span class="brand-text">龙虾日记</span>
      </div>
      
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        :ellipsis="false"
        @select="handleSelect"
        class="nav-menu"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/stats">
          <el-icon><DataLine /></el-icon>
          <span>统计</span>
        </el-menu-item>
        <el-menu-item index="/write" class="write-item">
          <el-icon><EditPen /></el-icon>
          <span>写日记</span>
        </el-menu-item>
      </el-menu>
      
      <div class="nav-actions">
        <el-switch
          v-model="darkMode"
          :active-icon="Moon"
          :inactive-icon="Sunny"
          @change="toggleDarkMode"
        />
      </div>
    </el-header>
    
    <!-- 移动端导航 -->
    <el-header v-else class="mobile-header">
      <div class="mobile-brand">
        <span class="brand-icon">🦞</span>
      </div>
      <el-button 
        :icon="darkMode ? Sunny : Moon" 
        circle 
        @click="toggleDarkMode"
      />
    </el-header>
    
    <!-- 主内容 -->
    <el-main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
    
    <!-- 移动端底部导航 -->
    <BottomNav v-if="isMobile" />
    
    <!-- 版本标签 -->
    <VersionTag />
    
    <!-- 页脚 -->
    <el-footer v-if="!isMobile" class="app-footer">
      <div class="footer-content">
        <p>🦞 龙虾日记 · 记录每一天的精彩</p>
        <p class="footer-links">
          <a href="https://github.com/royhua/lobster-diary" target="_blank">GitHub</a>
          <span>·</span>
          <a href="mailto:luoyihua@industics.com">联系作者</a>
        </p>
      </div>
    </el-footer>
  </el-container>
</template>

<style>
/* Element Plus 暗黑模式 */
@import 'element-plus/theme-chalk/dark/css-vars.css';

/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-attachment: fixed;
  min-height: 100vh;
}

.dark-mode body {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
}

.app-container {
  min-height: 100vh;
  background: transparent;
}

/* 导航栏 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 64px;
}

.dark-mode .nav-header {
  background: rgba(0, 0, 0, 0.3);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-icon {
  font-size: 1.8rem;
}

.nav-menu {
  background: transparent !important;
  border: none !important;
}

.nav-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.8) !important;
  border-bottom: none !important;
}

.nav-menu .el-menu-item:hover {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.nav-menu .el-menu-item.is-active {
  color: white !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-bottom: 2px solid white !important;
}

.write-item {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border-radius: 8px;
  margin-left: 10px;
}

.write-item:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
}

.nav-actions {
  display: flex;
  align-items: center;
}

/* 移动端导航 */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  height: 56px;
}

.mobile-brand .brand-icon {
  font-size: 1.5rem;
}

/* 主内容 */
.main-content {
  padding: 20px;
  min-height: calc(100vh - 200px);
}

/* 页脚 */
.app-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  padding: 40px 20px;
}

.footer-content p {
  margin-bottom: 8px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  margin: 0 8px;
}

.footer-links a:hover {
  color: white;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
