<template>
  <div id="app">
    <!-- Show NavBar if on specific routes that do not require authentication -->
    <NavBar v-if="shouldShowNavBar"/>
    <!-- Otherwise, show TopNavBar if user is logged in -->
    <TopNavBar v-else-if="user"/>
    <router-view></router-view>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NavBar from '@/components/NavBar.vue';
import TopNavBar from './components/topnavbar.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    TopNavBar,
  },
  data() { 
    return { 
      user: null,
      authChecked: false,
    }
  },
  computed: {
  // Returns true for routes that should show the pre-login NavBar 
  shouldShowNavBar() {
    const isNonAuthRoute = ['LoginPage', 'ForgotPassword', 'SignupPage', 'LandingPage'].includes(this.$route.name);
    console.log(`Route name: ${this.$route.name}, Should show NavBar: ${isNonAuthRoute}`);
    return isNonAuthRoute;
  },
},
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      this.authChecked = true; // Indicates that auth state has been checked
    });
  }
};
</script>


<style>
.app {
  height: 100%;
  margin: 0;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
}

@font-face {
  font-family: 'MontserratRegular';
  src: url('~@/assets/fonts/Montserrat-Regular.ttf') format('truetype');
  font-style: normal;
}

@font-face {
  font-family: 'MontserratBold';
  src: url('~@/assets/fonts/Montserrat-Bold.ttf') format('truetype');
  font-style: normal;
}
</style>