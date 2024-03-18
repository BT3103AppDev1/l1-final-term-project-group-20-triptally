<template>
    <nav class="navbar">
    <img src="@/assets/globe.png" alt="triptally logo" style="width: 40px; height: 40px;" />
    <div>
        <router-link to="/" class="nav-link-login">Log In</router-link>
        <router-link to="/" class="nav-link-signup">Sign Up</router-link>
    </div>
    </nav>
</template>
  
  <script>
  export default {
    name: 'NavBar'
  }
  </script>
  
  <style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background-color: #489FB5; /* or any other color */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-decoration: none;
  }
  
  .navbar-logo img {
    height: 40px; /* Adjust as needed */
  }

  .nav-link-login {
    margin-right: 15px;
    color: #fff; 
  }
  
  .nav-link-signup {
    padding: 10px 20px;
    background-color: #84C0CB;
    color: #fff;
    border-radius: 20px;
  }

  </style>
  