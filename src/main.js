import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import Home from './views/Home.vue'
import Stats from './views/Stats.vue'

const router = createRouter({
  history: createWebHistory('/lobster-diary'),
  routes: [
    { path: '/', component: Home },
    { path: '/stats', component: Stats }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
