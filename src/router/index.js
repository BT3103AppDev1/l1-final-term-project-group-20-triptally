import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser } from '@/authState';
import LoginPage from '@/views/LoginPage.vue';
import ForgotPassword from '@/components/ForgotPassword.vue';
import SignupPage from '@/views/SignupPage.vue';
import HomePage from '@/views/Homepage/HomePage.vue';
import GroupPage from '@/views/GroupPage/GroupPage.vue';
import AnalyticsPage from '@/views/GroupPage/AnalyticsPage.vue';
import BudgetsPage from '@/views/GroupPage/BudgetsPage.vue';
import MembersPage from '@/views/GroupPage/MembersPage.vue';
import SettingsPage from '@/views/GroupPage/SettingsPage.vue';
import ProfilePage from '@/views/ProfilePage.vue';

const routes = [
    {
      path: '/',
      redirect: '/login', // Redirect root to /login
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage,
      meta: { disallowAuthed: true }
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPassword,
      meta: { disallowAuthed: true }
    }, 
    {
      path: '/signup', 
      name: 'SignupPage',
      component: SignupPage,
      meta: { disallowAuthed: true }
    },
    {
      path: '/homepage',
      name: 'HomePage',
      component: HomePage,
      meta: { requiresAuth: true } // Assume this meta for authenticated routes
    },
    {
      path: '/profilepage',
      name: 'ProfilePage',
      component: ProfilePage
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
    },
  ]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
  const isLogged = !!getCurrentUser(); // Ensure this returns false for unauthenticated users

  console.log("Attempting to navigate to:", to.name, "| Logged in:", isLogged);

  if (!isLogged && to.meta.requiresAuth) {
    console.log("Redirecting to Login: Not logged in and trying to access a protected route");
    next({ name: 'LoginPage' });
  } else if (isLogged && to.meta.disallowAuthed) {
    console.log("Redirecting to HomePage: Logged in and trying to access a disallowed route");
    next({ name: 'HomePage' });
  } else {
    console.log("Proceeding to:", to.name);
    next();
  }
});


export default router 
