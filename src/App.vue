<template>
  <div id="app">
    <NavBar v-if="route.name === 'LoginPage' || route.name === 'SignupPage'" />
    <TopNavBar v-else />

  </div>
  <router-view></router-view>
</template>

<script>
import { useRoute } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import TopNavBar from './components/topnavbar.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    TopNavBar,
  },
  setup() {
    const route = useRoute();
    return { route };
  },
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
