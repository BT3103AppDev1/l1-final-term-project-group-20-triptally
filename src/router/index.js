import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'

const routes = [
    {
      path: '/',
      name: 'LoginPage',
      component: LoginPage
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPassword
    }
  ]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router 
