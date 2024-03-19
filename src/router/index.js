import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/LoginPage.vue';
import ForgotPassword from '@/components/ForgotPassword.vue';
import HomePage from '@/components/Homepage/HomePage.vue';
import GroupPage from '@/components/GroupPage/GroupPage.vue';
import AnalyticsPage from '@/components/GroupPage/AnalyticsPage.vue';
import BudgetsPage from '@/components/GroupPage/BudgetsPage.vue';
import MembersPage from '@/components/GroupPage/MembersPage.vue';
import SettingsPage from '@/components/GroupPage/SettingsPage.vue';

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
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
