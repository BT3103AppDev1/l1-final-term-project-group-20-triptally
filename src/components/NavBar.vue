<template>
    <nav class="navbar">
    <img src="@/assets/triptallylogo.png" class="tt_logo" alt="TripTally">
    <div>
        <router-link to="/login" class="nav-link-login">Log In</router-link>
        <router-link to="/signup" class="nav-link-signup">Sign Up</router-link>
    </div>
    </nav>

</template>
  
  <script>
  export default {
    name: 'NavBar'
  }
  </script>
  
  <style scoped>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    background-color: #489FB5; /* or any other color */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-decoration: none;
    height: 56px;
  }
  
  .tt_logo {
        height: 80px;
    }
  
  .nav-link-login {
    margin-right: 15px;
    color: #fff; 
    text-decoration: none; 
  }
  
  .nav-link-signup {
    padding: 10px 20px;
    background-color: #84C0CB;
    color: #fff;
    border-radius: 20px;
    text-decoration: none; 
    margin-right: 5px;
  }

  </style>
  