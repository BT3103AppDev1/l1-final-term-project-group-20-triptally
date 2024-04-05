<template>
  <div id="app">
    <TopNavBar v-if="user"/>
    <NavBar v-else />
  </div>
  <router-view></router-view>
</template>

<script>
import { useRoute } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import TopNavBar from './components/topnavbar.vue';
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: 'App',
  data() { 
    return { 
      user: null, 
    }
  },
  components: {
    NavBar,
    TopNavBar,
  },
  setup() {
    const route = useRoute();
    return { route };
  }, 
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // If there's a user, set the user data
        this.user = user;
        console.log("User logged in:", user); 
      } else {
        // If there's no user, set user to null
        this.user = null;
        console.log("No user logged in");
      }
    });
  }
};
</script>

<style>
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