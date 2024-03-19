import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import ForgotPassword from '@/components/ForgotPassword.vue'
import SignupPage from '@/views/SignupPage.vue'
import AnalyticsPage from '@/views/AnalyticsPage.vue'

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
    }, 
    {
      path: '/signup', 
      name: 'SignupPage',
      component: SignupPage
    },
    {
      path: '/analytics', 
      name: 'AnalyticsPage',
      component: AnalyticsPage
    }
  ]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router 
