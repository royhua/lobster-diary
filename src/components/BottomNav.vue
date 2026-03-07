<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 底部导航配置
const navItems = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/stats', icon: '📊', label: '统计' },
  { path: '/write', icon: '✍️', label: '写日记' }
]

const isActive = (path) => {
  return router.currentRoute.value.path === path
}
</script>

<template>
  <nav class="bottom-nav">
    <router-link 
      v-for="item in navItems" 
      :key="item.path"
      :to="item.path"
      :class="['nav-item', { active: isActive(item.path) }]"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 20px;
  padding-bottom: env(safe-area-inset-bottom, 10px);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 1000;
}

.dark-mode .bottom-nav {
  background: rgba(30, 41, 59, 0.95);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: #64748b;
  transition: all 0.2s;
}

.nav-item.active {
  color: #6366f1;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-icon {
  font-size: 1.5rem;
  transition: transform 0.2s;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
}

/* 中间写日记按钮突出 */
.nav-item:nth-child(3) {
  position: relative;
  top: -15px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 12px 24px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.nav-item:nth-child(3).active {
  color: white;
  transform: scale(1.05);
}

/* 仅在移动端显示 */
@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}
</style>
