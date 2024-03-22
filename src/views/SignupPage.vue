<template>
  <div class="signup-card"> <!-- Apply .login-card class here -->
    <h1>Sign Up</h1>
    <form @submit.prevent="submitHandler">
      <input id="email" type="email" v-model="email" placeholder="Email" required/>
      <input id="password" type="password" v-model="password" placeholder="Password" required />
      <input id="firstName" type="text" v-model="firstName" placeholder="First Name" required/>
      <input id="lastName" type="text" v-model="lastName" placeholder="Last Name" /> 
      <input id="username" type="text" v-model="username" placeholder="Username" required/>
      <select v-model="currency">
        <option value="" disabled selected hidden>Select Default Currency</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="JPY">JPY</option>
        <option value="GBP">GBP</option>
        <option value="AUD">AUD</option>
        <option value="CAD">CAD</option>
        <option value="CHF">CHF</option>
        <option value="CNY">CNY</option>
        <option value="SEK">SEK</option>
        <option value="NZD">NZD</option>
        <option value="SGD">SGD</option>
        <option value="MYR">MYR</option>
        <option value="KRW">KRW</option>
      </select>
      <button type="submit">Let's Tally!</button>
    </form>
  </div>

 
</template>

<script setup> 
import {createUserWithEmailAndPassword} from "firebase/auth";
import { auth, db } from '@/firebase';
import {ref} from "vue"; 
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from 'vue-router'; // Import useRouter

const email = ref(""); 
const password = ref("");
const currency = ref(""); 
const lastName = ref(""); 
const firstName = ref("")
const username = ref(""); 
var UID = '';

const router = useRouter(); // Use the useRouter hook

async function submitHandler() { 
  console.log("submitHandler function called");
  // user signup through firebase authentication 
  await createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(function(data){
      console.log('uid',data.user.uid)
      UID = data.user.uid; 
      // call the next method, which will write the rest of the user details into database 
      writeUserData(UID, email.value, username.value, currency.value, firstName.value, lastName.value);
      // Navigate to the login page after successful signup
      router.push('/'); // Use the route name from your router setup
    })
    .catch((error) => {
      // handle error
      console.log(error)
    });
}

async function writeUserData(userID, email, username, currency, firstName, lastName) { 
  console.log("writeUserData function called");
  await setDoc(doc(db, "Users", userID), { 
    Email: email, 
    Username: username, 
    Currency: currency, 
    FirstName: firstName, 
    LastName: lastName
  })

}

</script>

<style scoped> 
body, html {
  height: 100%;
  margin: 0;
  background: url('src/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
}

/* Centered card layout */
.signup-card {
  background: rgba(255, 255, 255, 0.7); /* semi-transparent white background */
  padding: 40px;
  border-radius: 15px;
  width: 60%; /* Adjust width as needed */
  height: 90%;
  margin: 0 auto; /* Center the card horizontally */
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* subtle shadow */
  align-items: center; /* Centers flex children horizontally */
  transform: translateY(20%);

}

/* Input styling */
input[type="email"], input[type="password"], input[placeholder="First Name"], input[placeholder="Last Name"], input[placeholder="Username"], select {
  width: 60%; /* Full width minus padding */
  float: left; 
  height: 100%;
  padding: 10px;
  margin-bottom: 20px; /* Space between inputs */
  border: 0px solid #ddd;
  border-radius: 10px;
  font-size: medium;
  font-family:'Montserrat', sans-serif;
}

/* Button styling */
button {
  width: 140px;
  padding: 15px;
  border: none;
  border-radius: 35px;
  background-color: #16697A;
  color: #EDE7E3;
  font-weight: 700;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  margin-top: 40px;
}


button:hover {
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