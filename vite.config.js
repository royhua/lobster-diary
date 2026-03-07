import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/lobster-diary/',
  build: {
    outDir: 'dist'
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://fulwytanmyldfucsbrlf.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bHd5dGFubXlsZGZ1Y3NicmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODYyODQsImV4cCI6MjA4ODQ2MjI4NH0.cQRBmQ-GyGZMGRpZ4HLqt4mIfo8i9x_eG7SIn9_rFOs')
  }
})
