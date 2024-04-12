<template>
  <div class="login-card">
    <h1>Log In</h1>
    <form @submit.prevent="login">
      <input type="email" placeholder="Email" v-model="email" />
      <input type="password" placeholder="Password" v-model="password" /><br>
      <router-link to="/forgot-password" class="forgot-password-link">Forgot Password?</router-link>
      <button type="button" @click="login">Let's Tally!</button>
    </form>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      error: '', // Optional: for displaying login errors
    };
  },
  methods: { 
    async login() {
      const auth = getAuth();
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        console.log("Login successful");
        this.$router.push({ path: '/homepage' });
      } catch (error) {
        console.error("Login failed:", error);
        this.error = error.message; // Update to show Firebase error messages
        alert('Login failed. Please check your email and password.');
      }
    }
  }
}
</script>


<style scoped>
/* Use a full-screen background image */
body, html {
  height: 100%;
  margin: 0;
  background: url('src/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
}

/* Centered card layout */
.login-card {
  background: rgba(255, 255, 255, 0.7); /* semi-transparent white background */
  padding: 40px;
  border-radius: 15px;
  width: 600px; /* Adjust width as needed */
  margin: 0 auto; /* Center the card horizontally */
  position: relative;
  top: 50%; /* Push down by half the viewport height */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* subtle shadow */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centers flex children horizontally */
  top: 60%; /* Adjust this value to control the vertical position */
  transform: translateY(50%);
}

button { 
  cursor: pointer; 
}

/* Input styling */
input[type="email"], input[type="password"] {
  width: 450px; /* Full width minus padding */
  height: 30px;
  padding: 10px;
  margin-bottom: 20px; /* Space between inputs */
  border: 0px solid #ddd;
  border-radius: 10px;
  font-size: large;
  font-family:'Montserrat', sans-serif;
}

/* Button styling */
.login-button {
  width: 140px;
  padding: 15px;
  border: none;
  border-radius: 35px;
  background-color: #16697A;
  color: #EDE7E3;
  font-weight: 700;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  margin-top: 40px;
  text-align: center;
  text-decoration: none;
  cursor: pointer; 
}


.login-button:hover {
  background-color: #607994;
}

/* Forgot password link */
.forgot-password-link {
  color: #16697A;
  position: absolute;
  right: 100px;
  bottom: 100px; /* Position it 20px above bottom of card */
  text-decoration: underline;
}

/* to align items in centre*/
form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Header styling */
h1 {
  text-align: center;
  color: #16697a;
  margin-bottom: 40px;
}

</style>
