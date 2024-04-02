<template>
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
            <input type="text" id="username" v-model="profile.username" />
          </div>
          <div class="form-group">
            <label for="currency">Default Currency:</label>
            <select id="currency" v-model="profile.currency" >
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
          </div>
        </form>
        <button type="button" @click="saveChanges">Save Changes</button>
      </div>
    </div>
    <div v-else>
      <h1 class="msg">You must be logged in to view this!</h1>
    </div>
</template>


<script>
import { auth, db } from '@/firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";


export default {
  name: 'ProfileForm',
  data() {
    return {
      user: false, 
      profile: {
        name: 'No Authenticated User',
        email: 'invalid@email',
        username: 'xxxxxxxx',
        currency: 'SGD'
      }
    };
  },
  methods: {
    //check
    async updateCurrency() {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        try {
          await updateDoc(docRef, {
            Currency: this.profile.currency
          });
        } catch (error) {
          console.error("Error updating currency:", error);
        }
      }
    },
    async updateUsername() {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        try {
          await updateDoc(docRef, {
            Username: this.profile.username
          });
        } catch (error) {
          console.error("Error updating currency:", error);
        }
      }
    },
    async saveChanges() {
      await this.updateCurrency();
      await this.updateUsername();
    },
    async fetchUserData() {
      const user = auth.currentUser;
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
          } else {
            console.error("User document does not exist.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.error("No user is currently authenticated.");
      }
    }
      },
      mounted() {
        this.fetchUserData();
        const auth = getAuth(); 
        onAuthStateChanged(auth, (user) => { 
          if (user) { 
            this.user = user; 
          }
        })
      }
    };
</script>
  
<style scoped>
.msg {
  text-align: center;
  color: #16697a;
  margin-bottom: 40px;
}

.profile-container {
  display: flex;
  align-items: center;
  text-align: center;

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
  width: 200px; 
  height: 30px;
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