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
          <div v-if="saveButtonClicked && (usernameTaken || updateSuccess)" class="error-message">
            <template v-if="updateSuccess">
              Username successfully updated!!
            </template>
            <template v-else-if="this.enteredUsername === profile.username">
              This is your current username.
            </template>
            <template v-else>
              Username already taken. Please choose another one!
            </template>
        </div>
        </div>
        
        <div class="form-group">
          <label for="currency">Default Currency:</label>
          <select id="currency" v-model="profile.currency" >
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
      userID: "",
      enteredUsername: "",
      profile: {
        name: 'No Authenticated User',
        email: 'invalid@email',
        username: 'xxxxxxxx',
        currency: 'SGD'
      },      
      usernameTaken: { value: false },
      saveButtonClicked: false,
      updateSuccess: false
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
            UID: this.userID
          });
          this.updateSuccess = true;
          eventBus.emit('usernameUpdated', this.enteredUsername);
          console.log("emit");
        } catch (error) {
          console.error("Error updating currency:", error);
        }
      }
    },


    async saveChanges() {
      this.saveButtonClicked = true; 
      this.updateSuccess = false;
      await this.checkUsernameAvailability(); 
      if (!this.usernameTaken) {
        try {
          await this.updateUsername();
          console.log("Username updated successfully.");
          this.updateSuccess = true;
         
        } catch (error) {
          console.error("Error updating username:", error);
        }
      } else {
        this.updateSuccess = false;
        console.log("Username is already taken. Please choose a different username.");
      }
    },

    async updateCurrency() {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        try {
          await updateDoc(docRef, {
            Currency: this.profile.currency
          });
          // window.location.reload();
        } catch (error) {
          console.error("Error updating currency:", error);
        }
      }
    },

    async fetchUserData() {
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        this.userID = user.uid; 
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
    },

}
  
</script>

<style scoped>
.msg {
  text-align: center;
  color: #16697a;
  margin-bottom: 40px;
}

.main-container { 
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
