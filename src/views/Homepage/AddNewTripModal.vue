<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal">
      <button class="closeModal" @click="closeModal">X</button>
      <h2>New Group Trip</h2>
      <form @submit.prevent="createTrip">
        <input v-model="tripName" type="text" id="tripName" placeholder="Enter Trip Name"><br>
        <input v-model="members" type="text" placeholder="Add 1st member" /><br>
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
        </select><br>
        <button type="submit" class="createTrip">Create New Trip!</button>
      </form>
    </div>
  </div>
</template>

<script>
import { auth, db } from "@/firebase"; 
import { doc, getDoc, collection, addDoc, arrayUnion, updateDoc } from "firebase/firestore";
import * as firebase from 'firebase/app';
import { getAuth, onAuthStateChanged } from "firebase/auth"; 

export default {
  props: {
    isVisible: Boolean
  },
  data() { 
    return { 
      user: false,
      userID: "",
      tripName: "", 
      members: "",
      currency: "",
      userIDs: [],
      tripID: "",
    }
  },
  emits: ['update:isVisible'],
  methods: {
    async createTrip(event) {
      event.preventDefault(); 
      console.log(this.members);
      // search for the username and the user's corresponding UID 
      const docRef = doc(db, "Usernames", this.members); 
      const docSnap = await getDoc(docRef); 

      if (docSnap.exists()) { 
        console.log(docSnap.data().UID); 
        this.userIDs.push(docSnap.data().UID);
      } else { 
        alert("User entered does not exist."); 
      }

      // add the creator user's username to the userIDs array 
      this.fetchUserData();
      this.userIDs.push(this.userID); 

      try {
        // create a new trip in firebase and store it under the "Trips" collection
        const tripDocRef = await addDoc(collection(db, "Trips"), {
          Members: this.userIDs, // Assuming you want to add all userIDs, not just this.members
          TripName: this.tripName,
          Currency: this.currency
        });
        this.tripID = tripDocRef.id;
        console.log('New trip added with ID: ' + this.tripID);

        // for every user in the group trip, add the unique trip ID to the GroupTrips array in the user's document within the "Users" collction
        for (const userID of this.userIDs) {
          const userRef = doc(db, "Users", userID);
          try {
            await updateDoc(userRef, {
              GroupTrips: arrayUnion(this.tripID)
            });
            console.log("Trip added to user with userID: " + userID);
          } catch (error) {
            console.error("Error updating user document: ", error);
          }
        }
      } catch (error) {
        console.error('Error adding trip document: ', error);
      }
      event.target.reset();
      
      // send all information to firebase 
      // first create a trip and generate an id for that, then iterate through the members list and add the id to the groups array for each of the members 

    },
    closeModal() {
      this.$emit('update:isVisible', false);
    }, 
    userList() { 
      // retrieve users from firebase 
    },
    async fetchUserData() {
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        this.userID = user.uid;
      } else {
        console.error("No user is currently authenticated.");
      }
    }
  }
}
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #16697ae4;
  padding: 20px;
  color: white;
  border-radius: 20px;
  width: 50%;
  /* Add other styles as necessary */
}

.closeModal { 
  bottom: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  /* Distance from the right */
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
}


input[placeholder="Enter Trip Name"], input[placeholder="Add 1st member"], input[placeholder="Add 2nd member"], #searchUser, select {
  width: 60%;
  /* Full width minus padding */
  height: 100%;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
  /* Space between inputs */
  border: 0px solid #ddd;
  border-radius: 10px;
  font-size: medium;
  font-family: 'Montserrat', sans-serif;
}

.createTrip { 
  background-color: #82C0CC;
}
</style>