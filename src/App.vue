<template>
  <div id ="app">
    <NavBar/>
  </div>
  <router-view></router-view>
  </template>

<script>
  import NavBar from '@/views/NavBar.vue'

  export default {
    name: 'App',
    components: {
      NavBar
    }
  }
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
