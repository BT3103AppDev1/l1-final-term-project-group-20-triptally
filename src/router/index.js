import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser, logoutUser } from '@/authState';
import LoginPage from '@/views/LoginPage.vue';
import ForgotPassword from '@/components/ForgotPassword.vue';
import SignupPage from '@/views/SignupPage.vue';
import HomePage from '@/views/Homepage/HomePage.vue';
import GroupPage from '@/views/GroupPage/GroupPage.vue';
import AnalyticsPage from '@/views/GroupPage/AnalyticsPage.vue';
import BudgetsPage from '@/views/GroupPage/BudgetsPage.vue';
import MembersPage from '@/views/GroupPage/MembersPage/MembersPage.vue';
//import SettingsPage from '@/views/GroupPage/SettingsPage.vue';
import ProfilePage from '@/views/ProfilePage.vue';
import EditBudgetPage from '@/views/GroupPage/EditBudgetPage.vue';
import AddNewExpenseModal from '@/views/GroupPage/AddNewExpenseModal.vue';

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
      path: '/group/:tripID', 
      name: 'GroupPage',
      component: GroupPage,
      props: true
    },
    {
      path: '/group/:tripID/add-expense', 
      name: 'AddNewExpenseModal', 
      component: AddNewExpenseModal, 
      props: true
    },
    {
      path: '/group/:tripID/analytics', 
      name: 'AnalyticsPage',
      component: AnalyticsPage,
      props: true
    },
    {
      path: '/group/:tripID/budgets', 
      name: 'BudgetsPage',
      component: BudgetsPage,
      props: true
      
    },
    {
      path: '/group/:tripID/editbudget', 
      name: 'EditBudgetPage',
      component: EditBudgetPage,
      props: true
    },
    {
      path: '/group/:tripID/members', 
      name: 'MembersPage',
      component: MembersPage,
      props: true
    },
    // {
    //   path: '/group/:tripID/settings', 
    //   name: 'SettingsPage',
    //   component: SettingsPage,
    //   props: true
    // },
  ]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
  const isLogged = !!getCurrentUser(); // Ensure this checks if the user is authenticated

  if (isLogged && to.name === 'LoginPage') {
    // If the user is already logged in and tries to access the login page, log them out
    logoutUser().then(() => {
      next('/login'); // Proceed to login after logging out
    });
  } else if (!isLogged && to.meta.requiresAuth) {
    // If not logged in and trying to access a protected route
    next({ name: 'LoginPage' });
  } else {
    // No specific rules apply, proceed
    next();
  }
});

export default router 
