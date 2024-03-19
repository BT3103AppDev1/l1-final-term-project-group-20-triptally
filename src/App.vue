<template>
  <div id ="app">
    <!-- <NavBar/> -->
    <preNavigationBar />
    <!-- <NavigationBar /> -->
  </div>
  <router-view></router-view>
  </template>

<script>
  import NavBar from '@/components/NavBar.vue'
  import NavigationBar from '@/components/topnavbar.vue'
  import preNavigationBar from '@/components/prenavbar.vue'

  export default {
    name: 'App',
    components: {
      NavBar,
      NavigationBar,
      preNavigationBar
    }
  }
</script>

<style scoped>
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
