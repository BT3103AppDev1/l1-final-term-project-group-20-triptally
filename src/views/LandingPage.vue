<template>
  <div class="container">
    <img src="@/assets/triptallyshadow.png" class="tt_logo" alt="TripTally"><br>
    <h1>Reinvent group travel with TripTally</h1><br>
    <button class="get-started-btn" @click="navigateToSignUp">Get Started</button>
  </div>
</template>

<script> 

export default { 
  name: 'LandingPage', 
  methods: { 
    navigateToSignUp() { 
      this.$router.push('/signup');
    }
  }
}
</script>

<style scoped>
.container { 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 95vh;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  /* padding: 20px;
  padding-bottom: 70px;
  min-height: 100vh;
  text-align: center;
  align-items: center;
  justify-content: center;
  display: flex;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2); */
}

.tt_logo {
  height: 200px;
}

h1 { 
  color: white;
  font-weight: bold;
  font-family:'Montserrat', sans-serif;
  size: 90%;
  margin-top: -60px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.get-started-btn { 
  background-color: white;
  color: #16697A;
  font-family: 'Montserrat', sans-serif; 
  margin-top: 40px;
  font-size: large;
  padding: 15px;
}
</style>