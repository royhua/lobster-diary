<template>
  <span class="version-tag" :title="buildTime">v{{ version }}</span>
</template>

<script setup>
// 版本号由 scripts/bump-version.js 自动更新
const version = '2.1.18'
const buildTime = new Date().toISOString().split('T')[0]
</script>

<style scoped>
.version-tag {
  position: fixed;
  bottom: 8px;
  right: 12px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  border-radius: 6px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: monospace;
  z-index: 9999;
}
</style>
