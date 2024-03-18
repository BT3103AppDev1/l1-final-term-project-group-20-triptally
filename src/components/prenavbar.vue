<template> 
    <div class="navbar">
  
        <img src="@/assets/triptallylogo.png" class="tt_logo" alt="TripTally">
        <!-- <button class="login-button">Login</button>
        <button class="signup-button">Sign Up</button> -->
        <div>
        <router-link to="/" class="nav-link-login">Log In</router-link>
        <router-link to="/" class="nav-link-signup">Sign Up</router-link>
        </div>
    </div>
  
</template>
  
<script>
    export default {
        name: 'preNavigationBar',
    }

</script>

<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgb(72, 159, 181); 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: 4vw;
  }

    .tt_logo {
        height: 3vw;
    }
    
    .login-button, .signup-button {
        padding: 10px 20px;
        font-size: 1.5vw;
        border: none;
        cursor: pointer;
        margin-left: auto;
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