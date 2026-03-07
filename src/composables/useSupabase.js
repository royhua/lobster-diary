import { createClient } from '@supabase/supabase-js'
import { ref, computed } from 'vue'

// Supabase 配置（需要用户自己配置）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 单例客户端
let supabase = null

export function useSupabase() {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const isConfigured = computed(() => supabaseUrl && supabaseKey)
  
  // 初始化客户端
  const initClient = () => {
    if (!supabase && isConfigured.value) {
      supabase = createClient(supabaseUrl, supabaseKey)
      
      // 监听认证状态变化
      supabase.auth.onAuthStateChange((event, session) => {
        user.value = session?.user || null
      })
    }
    return supabase
  }
  
  // 获取当前用户
  const getCurrentUser = async () => {
    const client = initClient()
    if (!client) return null
    
    const { data: { user: currentUser } } = await client.auth.getUser()
    user.value = currentUser
    return currentUser
  }
  
  // 注册
  const signUp = async (email, password) => {
    const client = initClient()
    if (!client) throw new Error('Supabase 未配置')
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: signUpError } = await client.auth.signUp({
        email,
        password
      })
      
      if (signUpError) throw signUpError
      user.value = data.user
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 登录
  const signIn = async (email, password) => {
    const client = initClient()
    if (!client) throw new Error('Supabase 未配置')
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: signInError } = await client.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      user.value = data.user
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 登出
  const signOut = async () => {
    const client = initClient()
    if (!client) return
    
    await client.auth.signOut()
    user.value = null
  }
  
  return {
    user,
    loading,
    error,
    isConfigured,
    initClient,
    getCurrentUser,
    signUp,
    signIn,
    signOut
  }
}

// 日记数据同步
export function useDiarySync() {
  const { user, isConfigured, initClient } = useSupabase()
  const syncing = ref(false)
  const syncError = ref(null)
  
  // 获取云端日记
  const fetchDiaries = async () => {
    if (!isConfigured.value || !user.value) return []
    
    const client = initClient()
    const { data, error } = await client
      .from('diaries')
      .select('*')
      .eq('user_id', user.value.id)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  }
  
  // 创建日记
  const createDiary = async (diary) => {
    if (!isConfigured.value || !user.value) return null
    
    const client = initClient()
    const { data, error } = await client
      .from('diaries')
      .insert({
        ...diary,
        user_id: user.value.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // 更新日记
  const updateDiary = async (id, updates) => {
    if (!isConfigured.value || !user.value) return null
    
    const client = initClient()
    const { data, error } = await client
      .from('diaries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // 删除日记
  const deleteDiary = async (id) => {
    if (!isConfigured.value || !user.value) return
    
    const client = initClient()
    const { error } = await client
      .from('diaries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
  
  // 同步本地数据到云端
  const syncToCloud = async (localDiaries) => {
    if (!isConfigured.value || !user.value) return
    
    syncing.value = true
    syncError.value = null
    
    try {
      for (const diary of localDiaries) {
        // 检查是否已存在
        const existing = await fetchDiaryByDate(diary.date)
        
        if (existing) {
          // 更新
          await updateDiary(existing.id, diary)
        } else {
          // 创建
          await createDiary(diary)
        }
      }
    } catch (e) {
      syncError.value = e.message
      throw e
    } finally {
      syncing.value = false
    }
  }
  
  // 从云端同步到本地
  const syncFromCloud = async () => {
    if (!isConfigured.value || !user.value) return []
    
    syncing.value = true
    syncError.value = null
    
    try {
      const cloudDiaries = await fetchDiaries()
      
      // 保存到 localStorage
      localStorage.setItem('diaryDrafts', JSON.stringify(cloudDiaries))
      
      return cloudDiaries
    } catch (e) {
      syncError.value = e.message
      throw e
    } finally {
      syncing.value = false
    }
  }
  
  return {
    syncing,
    syncError,
    fetchDiaries,
    createDiary,
    updateDiary,
    deleteDiary,
    syncToCloud,
    syncFromCloud
  }
}
