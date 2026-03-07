<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase, useDiarySync } from '../composables/useSupabase.js'

const emit = defineEmits(['close', 'synced'])

const { 
  user, 
  loading, 
  error, 
  isConfigured, 
  signUp, 
  signIn, 
  signOut,
  getCurrentUser 
} = useSupabase()

const { syncToCloud, syncFromCloud, syncing } = useDiarySync()

const mode = ref('login') // login | register | profile
const email = ref('')
const password = ref('')
const localEmail = ref('')

onMounted(async () => {
  await getCurrentUser()
  if (user.value) {
    mode.value = 'profile'
    localEmail.value = user.value.email
  }
})

const handleLogin = async () => {
  try {
    await signIn(email.value, password.value)
    mode.value = 'profile'
  } catch (e) {
    console.error('登录失败:', e)
  }
}

const handleRegister = async () => {
  try {
    await signUp(email.value, password.value)
    mode.value = 'profile'
  } catch (e) {
    console.error('注册失败:', e)
  }
}

const handleLogout = async () => {
  await signOut()
  mode.value = 'login'
  email.value = ''
  password.value = ''
}

const handleSyncUp = async () => {
  const localData = localStorage.getItem('diaryDrafts')
  if (localData) {
    await syncToCloud(JSON.parse(localData))
    alert('同步成功！')
  }
}

const handleSyncDown = async () => {
  await syncFromCloud()
  emit('synced')
  alert('已从云端同步！')
}
</script>

<template>
  <div class="auth-panel" v-if="!isConfigured">
    <div class="not-configured">
      <span class="icon">⚠️</span>
      <h3>云同步未配置</h3>
      <p>需要在环境变量中配置 Supabase</p>
      <code>VITE_SUPABASE_URL=xxx</code>
      <code>VITE_SUPABASE_ANON_KEY=xxx</code>
    </div>
  </div>
  
  <!-- 登录/注册表单 -->
  <div v-else-if="mode !== 'profile'" class="auth-form">
    <div class="auth-header">
      <span class="icon">☁️</span>
      <h3>{{ mode === 'login' ? '登录' : '注册' }}</h3>
    </div>
    
    <div class="form-group">
      <input 
        v-model="email" 
        type="email" 
        placeholder="邮箱" 
        class="input"
      />
    </div>
    
    <div class="form-group">
      <input 
        v-model="password" 
        type="password" 
        placeholder="密码" 
        class="input"
      />
    </div>
    
    <p v-if="error" class="error-msg">{{ error }}</p>
    
    <button 
      v-if="mode === 'login'"
      @click="handleLogin" 
      :disabled="loading"
      class="btn primary"
    >
      {{ loading ? '登录中...' : '登录' }}
    </button>
    
    <button 
      v-else
      @click="handleRegister" 
      :disabled="loading"
      class="btn primary"
    >
      {{ loading ? '注册中...' : '注册' }}
    </button>
    
    <p class="switch-mode">
      {{ mode === 'login' ? '没有账号？' : '已有账号？' }}
      <a @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === 'login' ? '注册' : '登录' }}
      </a>
    </p>
  </div>
  
  <!-- 用户信息 -->
  <div v-else class="user-profile">
    <div class="profile-header">
      <div class="avatar">👤</div>
      <div class="user-info">
        <span class="email">{{ localEmail }}</span>
        <span class="status">已登录</span>
      </div>
    </div>
    
    <div class="sync-actions">
      <button @click="handleSyncUp" :disabled="syncing" class="btn">
        ☁️ 上传到云端
      </button>
      <button @click="handleSyncDown" :disabled="syncing" class="btn">
        ⬇️ 从云端同步
      </button>
    </div>
    
    <button @click="handleLogout" class="btn danger">
      退出登录
    </button>
  </div>
</template>

<style scoped>
.auth-panel, .auth-form, .user-profile {
  padding: 24px;
}

.not-configured {
  text-align: center;
  padding: 40px 20px;
}

.not-configured .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
}

.not-configured code {
  display: block;
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin: 8px 0;
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header .icon {
  font-size: 2.5rem;
}

.auth-header h3 {
  margin-top: 8px;
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: 16px;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
}

.error-msg {
  color: #ef4444;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.btn {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 12px;
}

.btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn.danger {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.switch-mode {
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
}

.switch-mode a {
  color: #6366f1;
  cursor: pointer;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.email {
  font-weight: 600;
  font-size: 1rem;
}

.status {
  font-size: 0.85rem;
  color: #10b981;
}

.sync-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.sync-actions .btn {
  flex: 1;
  background: #f1f5f9;
  color: #1e293b;
}
</style>
