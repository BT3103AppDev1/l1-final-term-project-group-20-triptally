import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import ForgotPassword from '@/components/ForgotPassword.vue'
import SignupPage from '@/views/SignupPage.vue'
import HomePage from '@/views/Homepage/HomePage.vue';
import GroupPage from '@/views/GroupPage/GroupPage.vue';
import AnalyticsPage from '@/views/GroupPage/AnalyticsPage.vue';
import BudgetsPage from '@/views/GroupPage/BudgetsPage.vue';
import MembersPage from '@/views/GroupPage/MembersPage.vue';
import SettingsPage from '@/views/GroupPage/SettingsPage.vue';

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
      path: '/homepage',
      name: 'HomePage',
      component: HomePage
    },
    {
      path: '/group/:tripName', 
      name: 'GroupPage',
      component: GroupPage,
      props: true 
    },
    {
      path: '/group/:tripName/analytics', 
      name: 'AnalyticsPage',
      component: AnalyticsPage,
      props: true
    },
    {
      path: '/group/:tripName/budgets', 
      name: 'BudgetsPage',
      component: BudgetsPage,
      props: true
    },
    {
      path: '/group/:tripName/members', 
      name: 'MembersPage',
      component: MembersPage,
      props: true
    },
    {
      path: '/group/:tripName/settings', 
      name: 'SettingsPage',
      component: SettingsPage,
      props: true
    }
  ]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router 
