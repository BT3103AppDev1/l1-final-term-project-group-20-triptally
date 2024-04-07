<template>
  <div class="signup-card"> <!-- Apply .login-card class here -->
    <h1>Sign Up</h1>
    <form @submit.prevent="submitHandler">
      <input id="firstName" type="text" v-model="firstName" placeholder="First Name" required/>
      <input id="lastName" type="text" v-model="lastName" placeholder="Last Name" /> 
      <input id="email" type="email" v-model="email" @input="debouncedCheckEmail" placeholder="Email" required/>
      <div v-show="emailTaken" class="error-message">Email already in use. Please login.</div>
      <input id="password" type="password" v-model="password" @input="checkPassword" placeholder="Password" required />
      <div v-show="passwordError" class="error-message">
        {{ passwordErrorMessage }}
      </div>
      <input id="username" type="text" v-model="username" @input="debouncedCheckUsername" placeholder="Username" required/>
      <div v-show="usernameTaken" class="error-message">Username already taken. Please choose another one!</div>
      <select v-model="currency">
        <option value="" disabled selected hidden>Select Default Currency</option>
        <option value="SGD">SGD</option>
        <option value="AUD">AUD</option>
        <option value="CAD">CAD</option>
        <option value="CHF">CHF</option>
        <option value="CNY">CNY</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
        <option value="JPY">JPY</option>
        <option value="KRW">KRW</option>
        <option value="MYR">MYR</option>
        <option value="NZD">NZD</option>
        <option value="SEK">SEK</option>
        <option value="USD">USD</option>  
      </select>
      <button type="submit">Let's Tally!</button>
    </form>
  </div>

 
</template>

<script setup> 
import {createUserWithEmailAndPassword} from "firebase/auth";
import { auth, db } from '@/firebase';
import {ref} from "vue"; 
import { doc, setDoc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from 'vue-router'; // Import useRouter
import _ from 'lodash';

const email = ref(""); 
const password = ref("");
const currency = ref(""); 
const lastName = ref(""); 
const firstName = ref("")
const username = ref(""); 
const usernameTaken = ref(false);
const emailTaken = ref(false);
const passwordError = ref(false);
const passwordErrorMessage = ref("");
const UID = ref('');

const router = useRouter(); // Use the useRouter hook

const checkUsername = async () => {
  usernameTaken.value = false;

  const usernameDocRef = doc(db, "Usernames", username.value);

  try {
    const docSnap = await getDoc(usernameDocRef);
    usernameTaken.value = docSnap.exists();
  } catch (error) {
    console.error("Error checking username uniqueness:", error);
  }
};

const debouncedCheckUsername = _.debounce(checkUsername, 500);

const checkEmail = async () => {
  emailTaken.value = false; // Reset the state before checking
  console.log("Checking email:", email.value);

  const usersRef = collection(db, "Users");
  const q = query(usersRef, where("Email", "==", email.value)); // Define the query

  try {
    const querySnapshot = await getDocs(q);
    emailTaken.value = !querySnapshot.empty;
    console.log("Is email taken:", emailTaken.value);
  } catch (error) {
    console.error("Error checking email uniqueness:", error);
  }
};


// Debounce the checkEmail function to avoid too many calls
const debouncedCheckEmail = _.debounce(checkEmail, 500);


function checkPassword() {
  passwordError.value = false; // Reset the error state
  if (password.value.length < 6) {
    passwordError.value = true;
    passwordErrorMessage.value = "Password must be at least 6 characters long.";
  } else if (!containsSpecialCharacters(password.value)) {
    passwordError.value = true;
    passwordErrorMessage.value = "Password must contain at least 1 number, 1 uppercase and lowercase letter, 1 special character.";
  } else if (!checkUpperLowerCase(password.value)) {
    passwordError.value = true;
    passwordErrorMessage.value = "Password must contain at least 1 number, 1 uppercase and lowercase letter, 1 special character.";
} else if (!containsNumber(password.value)) {
    passwordError.value = true;
    passwordErrorMessage.value = "Password must contain at least 1 number, 1 uppercase and lowercase letter, 1 special character.";
  }
}


function containsSpecialCharacters(str) {
  // This regex matches any character that is not a letter (a-zA-Z) or a number (0-9)
  const specialCharactersRegex = /[^a-zA-Z0-9]/;
  return specialCharactersRegex.test(str);
}

function checkUpperLowerCase(password) {
  const containsUppercase = /[A-Z]/.test(password);
  const containsLowercase = /[a-z]/.test(password);

  if (containsUppercase && containsLowercase) {
    return true;
  } else { 
    return false; 
  }
}

function containsNumber(password) {
  // This regex matches any digit from 0 to 9
  const numberRegex = /\d/;
  return numberRegex.test(password);
}

async function submitHandler() { 
  console.log("submitHandler function called");
  usernameTaken.value = false;
  emailTaken.value = false;
  passwordError.value = false;

  // Check if email is unique
  await debouncedCheckEmail();
  if (emailTaken.value) {
    // If the email is taken, don't proceed with form submission
    return;
  }

  // Check if the username is unique
  await debouncedCheckUsername();
  if (usernameTaken.value) {
    // If the username is taken, don't proceed with form submission
    return;
  }

  // Check password validity 
  checkPassword();
  if (passwordError.value) {
    console.log("Password did not meet requirements.");
    return; // Stop the submission if the password is invalid
  }

  // If all checks pass, proceed with Firebase authentication
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    console.log('User created with UID:', userCredential.user.uid);
    UID.value = userCredential.user.uid;

    // call the next method, which will write the rest of the user details into database 
    await writeUserData(UID.value, email.value, username.value, currency.value, firstName.value, lastName.value);
    console.log('User data written to Firestore');

    // Add the username to the Firebase collection
    await setDoc(doc(db, "Usernames", username.value), {
      UID: UID.value 
    });

    // Navigate to the home page after successful signup
    router.push('/');
  } catch (error) {
    // Handle errors from createUserWithEmailAndPassword
    if (error.code === "auth/email-already-in-use") {
      console.log("Email already in use. Please use another email!");
    } else if (error.code === "auth/weak-password") {
      console.log("Password must be at least 6 characters long.");
    } else {
      // Log the error and potentially inform the user
      console.error(error);
    }
  }
}

async function writeUserData(userID, email, username, currency, firstName, lastName) { 
  await setDoc(doc(db, "Users", userID), { 
    Email: email, 
    Username: username, 
    Currency: currency, 
    FirstName: firstName, 
    LastName: lastName, 
    GroupTrips: []
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

button { 
  cursor: pointer;
}

select {
  width: 62%;
  margin-top: 4px;
}

/* Centered card layout */
.signup-card {
  background: rgba(238, 238, 238, 0.7); /* semi-transparent white background */
  padding: 20px;
  border-radius: 15px;
  width: 60%; /* Adjust width as needed */
  height: 80%;
  margin: 0 auto; /* Center the card horizontally */
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* subtle shadow */
  align-items: center; /* Centers flex children horizontally */
  transform: translateY(10%);
}

/* Input styling */
input[type="email"], input[type="password"], input[placeholder="First Name"], input[placeholder="Last Name"], input[placeholder="Username"] {
  width: 60%; /* Full width minus padding */
  float: left; 
  height: 100%;
  padding: 10px;
  margin-bottom: 20px; /* Space between inputs */
  border: 0px solid #ddd;
  border-radius: 10px;
  font-size: medium;
  font-family:'Montserrat', sans-serif;
  background-color: white;
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
  margin-top: 20px;
  margin-bottom: 20px;
}


button:hover {
  background-color: #607994;
}

.error-message {
  color: rgb(166, 2, 2);
  text-align: center;
  margin-top: -10px;
  margin-bottom: 10px;
  font-size: 12px;
  margin-left: 0;
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