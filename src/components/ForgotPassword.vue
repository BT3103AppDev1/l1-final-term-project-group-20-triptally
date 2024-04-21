
<template>
  <div class="pw-card">
    <h1>Password Reset</h1>
    <text>Enter the email address associated with your account and click the button below to receive an email to reset this account’s password.</text>
    <form @submit.prevent="submitPasswordReset">
      <input type="email" placeholder="Enter Email" v-model="email" />
      <br>
      <button type="submit">Reset My Password</button>
      <router-link to="/" class="go-login-link">← Back to Login.</router-link>
    </form>
  </div>
</template>
  
<script>
import { auth } from '@/firebase'; // Importing auth instance
import { sendPasswordResetEmail } from "firebase/auth"; // Importing sendPasswordResetEmail directly from Firebase Auth

export default {
  name: 'ForgotPassword',
  data() {
    return {
      email: '',
    };
  },
  methods: {
    submitPasswordReset() {
      sendPasswordResetEmail(auth, this.email)
        .then(() => {
          alert('A password reset email has been sent. Please check your inbox.');
          this.email = ''; // Optionally clear the email input after sending
        })
        .catch((error) => {
          console.error("Error sending password reset email:", error);
          alert(`Failed to send password reset email. Please try again. Error: ${error.message}`);
        });
    }
  }
}
</script>
  
  
<style>
/* Centered card layout */
.pw-card {
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

/* Use a full-screen background image */
body, html {
  height: 100%;
  margin: 0;
  font-family: 'MontserratBold', Montserrat,sans-serif;
  background: url('src/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
}

/* Forgot password link */
.go-login-link {
  color: #16697A;
  position: absolute;
  left: 40px;
  bottom: 23px; /* Position it 20px above bottom of card */
  text-decoration: underline;
  font-size: medium;
}

button {
  width: 250px;
  padding: 15px;
  border: none;
  border-radius: 35px;
  background-color: #16697A;
  color: #EDE7E3;
  font-size:large;
  margin-top: 20px;
  margin: 0 auto; /* Center within flex container */
  display: block; /* Ensure they're treated as block-level for margin auto to work */
  font-weight: 600;
  cursor: pointer;
}

input[type="email"] {
  width: 450px; /* Full width minus padding */
  height: 30px;
  padding: 10px;
  margin-bottom: 20px; /* Space between inputs */
  border: 0px solid #ddd;
  border-radius: 10px;
  font-size: large;
  font-family:'Montserrat', sans-serif;
  margin: 0 auto; /* Center within flex container */
  display: block; /* Ensure they're treated as block-level for margin auto to work */
}

text {
  text-align: center;
  color: #7A7474;
  margin-top: 0px;
  margin-bottom: 25px;
  width: 70%;
  font-size: medium;
}

h1 {
  text-align: center;
  color: #16697a;
  margin-bottom: 40px;
}

</style>
  