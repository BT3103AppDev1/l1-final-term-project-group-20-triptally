<template>
  <div class="main-container">
  <div v-if="user" class="profile-container">
    <div class="profile-content">
      <h1 class="profile-text">Profile</h1>
      <form class="profile-form">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="profile.name" readonly/>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="profile.email" readonly/>
        </div>
        <div class="form-group">
          <label for="username">Username:</label>         
          <input type="text" id="username" v-model="enteredUsername" @input="onUsernameInput" placeholder="Username" required/>
          <div v-if="saveButtonClicked && (updateSuccess || usernameTaken || enteredUsername === profile.username)" >
            <template v-if="updateSuccess && usernameChanged">
                <p class="error-message-success">Username successfully updated!</p>
            </template>
            <template v-else-if="usernameTaken && usernameChanged">
                <p class="error-message-fail">Username already taken. Please choose another one!</p>
            </template>
          </div>
        </div>
        
        <div class="form-group">
          <label for="currency">Default Currency:</label>
          <select id="currency" v-model="selectedCurrency" >
            <option value="SGD">SGD</option>
            <option value="AUD">AUD</option>
            <option value="BGN">BGN</option>
            <option value="BRL">BRL</option>
            <option value="CAD">CAD</option>
            <option value="CHF">CHF</option>
            <option value="CNY">CNY</option>
            <option value="CZK">CZK</option>
            <option value="DKK">DKK</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="HKD">HKD</option>
            <option value="HRK">HRK</option>
            <option value="HUF">HUF</option>
            <option value="IDR">IDR</option>
            <option value="ILS">ILS</option>
            <option value="INR">INR</option>
            <option value="ISK">ISK</option>
            <option value="JPY">JPY</option>
            <option value="KRW">KRW</option>
            <option value="MYR">MYR</option>
            <option value="NZD">NZD</option>
            <option value="PHP">PHP</option>
            <option value="PLN">PLN</option>
            <option value="RON">RON</option>
            <option value="SEK">SEK</option>
            <option value="THB">THB</option>
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="ZAR">ZAR</option>  
          </select>
          <div v-if="saveButtonClicked">
            <template v-if="updateCurrSuccess && currencyChanged">
                <p class="error-message-success-b">Currency successfully updated!</p>
            </template>
          </div>
        </div>
      </form>
      <button type="button" @click="saveChanges">Save Changes</button>
      
    </div>
  </div>
  <div v-else>
    <h1 class="msg">You must be logged in to view this!</h1>
  </div>
  </div>
</template>


<script>
import { auth, db } from '@/firebase';
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import eventBus from '@/eventBus';


export default {
  name: 'ProfileForm',
  data() {
    return {
      user: false,
      enteredUsername: "",
      selectedCurrency: "",
      profile: {
        name: 'No Authenticated User',
        email: 'invalid@email',
        username: 'xxxxxxxx',
        currency: 'SGD'
      }, 
      usernameChanged: false,
      currencyChanged: false,
      usernameTaken: { value: false },
      saveButtonClicked: false,
      updateSuccess: false,
      updateCurrSuccess: false
    };
  },
  
  methods: {
    onUsernameInput() {
      this.saveButtonClicked = false;
      this.updateSuccess = false;    
    },

    async checkUsernameAvailability() {
      this.usernameTaken = false;
      const usernameDocRef = doc(db, "Usernames", this.enteredUsername);
      try {
        const docSnap = await getDoc(usernameDocRef);
        this.usernameTaken = docSnap.exists();
      } catch (error) {
        console.error("Error checking username uniqueness:", error);
      }
    },    

    async updateUsername() {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        try {
          await updateDoc(docRef, {
            Username: this.enteredUsername
          });
          await deleteDoc(doc(db, "Usernames", this.profile.username)); 
          this.profile.username = this.enteredUsername;
          await setDoc(doc(db, "Usernames", this.enteredUsername), { 
            UID: this.user.uid
          });
         
          eventBus.emit('usernameUpdated', this.enteredUsername);
        } catch (error) {
          console.error("Error updating currency:", error);
        }
      }
    },

    async updateCurrency() {
      const docRef = doc(db, "Users", this.user.uid);
      try {
        await updateDoc(docRef, {
          Currency: this.selectedCurrency
        });
        console.log('Currency updated');
      
      } catch (error) {
        console.error("Error updating currency:", error);
      }
    },

    async saveChanges() {
      this.saveButtonClicked = true; 
      this.updateSuccess = false;
      this.updateCurrSuccess = false;
      this.noChange = false;
      this.enteredUsername = this.enteredUsername.trim();
      
      this.usernameChanged = this.enteredUsername !== this.profile.username;
      this.currencyChanged = this.profile.currency !== this.selectedCurrency;

  
      if (this.usernameChanged) {
        await this.checkUsernameAvailability(); 
        if (!this.usernameTaken) {
          await this.updateUsername();
          console.log("Username updated successfully.");
          this.updateSuccess = true;
         
        } else {
          console.log("Username is already taken. Please choose a different username.");
          return; 
        }
      }

      if (this.currencyChanged) {
        await this.updateCurrency();
        this.updateCurrSuccess = true;
        this.profile.currency = this.selectedCurrency;
        console.log("Currency updated successfully.");
        
      }   
    },


    async fetchUserData() {
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        try {
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.profile.name = userData.FirstName + ' ' + userData.LastName;
            this.profile.email = userData.Email;
            this.profile.username = userData.Username;
            this.profile.currency = userData.Currency;
            this.enteredUsername = userData.Username; 
            this.selectedCurrency = userData.Currency;
          } else {
            console.error("User document does not exist.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.error("No user is currently authenticated.");
      }
    },
  },

    mounted() {
      this.fetchUserData();
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.user = user;
          await this.fetchUserData();
        }
      })
      this.initialCurrency = this.profile.currency;
    },
}
  
</script>

<style scoped>
.msg {
  text-align: center;
  color: #16697a;
  margin-bottom: 40px;
}

/* .main-container { 
  align-items: center;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
} */

.main-container {
    padding: 20px;
    min-height: 100vh;
    text-align: center;
    align-items: center;
    background: url('@/assets/singapore.jpg') no-repeat center center fixed;
    background-size: cover;
    background-color: rgba(88, 85, 79, 0.2);
  }

.profile-container {
  display: flex;
  align-items: center;
  text-align: center;
  padding: 3rem;
}

input[type="email"] { 
  margin: 0; 
}


.error-message-success {
  width: 60%;
  margin-left: 5px;
  margin-bottom: 10px;
  font-size: 12px;
  margin-top: -1px;
  color: green; 
}

.error-message-fail {
  width: 60%;
  margin-left: 5px;
  margin-top: -1px;
  margin-bottom: 10px;
  font-size: 12px;
  color: rgb(166, 2, 2); 
}

.error-message-success-b {
  width: 60%;
  margin-left: 5px;
  margin-bottom: 10px;
  font-size: 12px;
  margin-top: -10px;
  color: green; 
}

.error-message-fail-b {
  width: 60%;
  margin-left: 5px;
  margin-top: -10px;
  margin-bottom: 10px;
  font-size: 12px;
  color: rgb(166, 2, 2); 
}

.profile-content {
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
  background: #EDE7E3;
  border-radius: 10px;
}

.profile-form {
  display: block;
  flex-direction: column;
  text-align: left;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  width:fit-content;
}

.form-group input {
  width: 300px;
  height: 15px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-size: small;
  margin-bottom: 0.1rem;
}

select {
  width: 250px;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-size: small;
}

input[readonly] {
  background-color: #ccc;
}

input[readonly]:focus {
  outline: none;
}

button {
  background-color: #FFA500; /* Orange button */
  border: none;
  padding: 0.5rem 1rem;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 1rem;
  width:130px;
  float: right;
  font-size: small;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
}

button:hover {
  background-color: #cc8400;
}

.profile-text {
  color: #333;
  text-align: left;
  margin-bottom: 2rem;
}

</style>
