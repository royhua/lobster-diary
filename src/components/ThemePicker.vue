<template>
  <div class="theme-picker">
    <!-- 标题 -->
    <h3>🎨 选择主题</h3>
    <div class="theme-grid">
      <button 
        v-for="theme in themes" 
        :key="theme.id"
        :class="['theme-card', { active: currentTheme === theme.id }]"
        @click="currentTheme = theme.id"
      >
        <span class="theme-icon">{{ theme.icon }}</span>
        <span class="theme-name">{{ theme.name }}</span>
        <span class="theme-desc">{{ theme.desc }}</span>
      </button>
    </div>
  </div>
</template>

</template>

<style scoped>
.theme-picker {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-dark);
  border-radius: 24px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.theme-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.theme-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
}

.theme-card.active {
  border-color: #818cf8;
  background: rgba(129, 140, 254, 0.2);
}

.theme-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 8px;
}

.theme-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
}

.theme-desc {
  font-size: 0.8rem;
  color: var(--text-secondary, #64748b);
}
</style>
