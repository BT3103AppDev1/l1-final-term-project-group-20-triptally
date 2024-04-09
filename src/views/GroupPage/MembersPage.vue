<template>
  <div v-if="user" class="main">
    <SideNavBar :tripName=$route.params.tripName></SideNavBar>
  </div>

  <div v-else>
    <h1>You must be logged in to view this!</h1>
  </div>
</template>
  
  
  <script>
  import SideNavBar from './SideNavBar.vue';
  import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  data() { 
    return { 
      user: false
    }
  },
  components: {
    SideNavBar
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
      }
    })
  }
};
  </script>
