<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal">
      <button class="closeModal" @click="closeModal">X</button>
      <h2>New Group Trip</h2>
      <input v-model="tripName" type="text" id="tripName" placeholder="Enter Trip Name"><br>
      <div class="select-wrapper">
        <div class="selected-items">
          <span v-if="!selectedMembers.length" class="placeholder">Add Members</span>
          <div v-for="(user, index) in selectedMembers" :key="index" class="selected-item">
            {{ user.username }}
            <span @click="removeSelectedMember(index)">x</span>
          </div>
        </div>
        <select @change="addSelectedMember" class="custom-select">
          <option disabled selected value="">Select</option>
          <option 
            v-for="user in availableUsers" 
            :key="user.userID" 
            :value="user.userID"
            :disabled="selectedMembers.some(member => member.userID === user.userID)">
              {{ user.username }}
          </option>
        </select>
      </div>
      <select v-model="currency" class="select-currency">
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
      <button type="submit" class="createTrip" @click="createTrip">Create New Trip!</button>
    </div>
  </div>
</template>

<script>
import { auth, db } from "@/firebase"; 
import { doc, getDoc, collection, addDoc, arrayUnion, updateDoc, getDocs } from "firebase/firestore";
import * as firebase from 'firebase/app';

export default {
  props: {
    isVisible: Boolean
  },
  data() { 
    return { 
      userID: "",
      tripName: "", 
      selectedMembers: [],
      currency: "",
      allUsers: [], // Array to hold all users with their usernames and user IDs
      tripID: "",
    }
  },
  computed: {
    availableUsers() {
      return this.allUsers.filter(user => 
        !this.selectedMembers.some(member => member.userID === user.userID)
      );
    },
  },
  emits: ['update:isVisible', 'refreshTrips'],
  async created() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      const usersRef = collection(db, "Usernames");
      const querySnapshot = await getDocs(usersRef);
      this.allUsers = querySnapshot.docs.map(doc => ({ username: doc.id, userID: doc.data().UID }));
    },
    addSelectedMember(event) {
    const selectedUserID = event.target.value;
    const selectedUser = this.allUsers.find(user => user.userID === selectedUserID);
    if (selectedUser && !this.selectedMembers.some(member => member.userID === selectedUser.userID)) {
      this.selectedMembers.push(selectedUser);
    }
    // Reset the select dropdown
      event.target.value = "";
    },
    removeSelectedMember(index) {
      this.selectedMembers.splice(index, 1);
    },
    async createTrip() {
      //this below part doesnt matter anymore bc they can only choose frm a list of existing usernames
      /*console.log(this.members);
      // search for the username and the user's corresponding UID 
      const docRef = doc(db, "Usernames", this.members); 
      const docSnap = await getDoc(docRef); 

      if (docSnap.exists()) { 
        console.log(docSnap.data().UID); 
        this.userIDs.push(docSnap.data().UID);
      } else { 
        alert("User entered does not exist."); 
      }*/ 
      await this.fetchUserData();

      var userIDs = this.selectedMembers.map(member => member.userID);
      userIDs.push(this.userID);

      try {
        const tripDocRef = await addDoc(collection(db, "Trips"), {
          Members: userIDs, // Assuming you want to add all userIDs, not just this.members
          TripName: this.tripName,
          Currency: this.currency
        });
        this.tripID = tripDocRef.id;
        console.log('New trip added with ID: ' + this.tripID);

        for (const userID of userIDs) {
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

        const budgetsRef = collection(db, "Trips", tripDocRef.id, "Budgets");

        const defaultBudgetItems = [
          { category: 'Food', allocated: 0, used: 0, order: 1 },
          { category: 'Shopping', allocated: 0, used: 0, order: 2 },
          { category: 'Transport', allocated: 0, used: 0, order: 3 },
          { category: 'Entertainment', allocated: 0, used: 0, order: 4 },
          { category: 'Accommodations', allocated: 0, used: 0, order: 5 },
          { category: 'Miscellaneous', allocated: 0, used: 0, order: 6 },
        ];

        for (const item of defaultBudgetItems) {
          await addDoc(budgetsRef, item);
        }
        this.$emit('refreshTrips', this.tripID);
      } catch (error) {
        console.error('Error adding trip document: ', error);
      }
      this.tripName = "";
      this.selectedMembers = [];
      this.currency = "";     
      // send all information to firebase 
      // first create a trip and generate an id for that, then iterate through the members list and add the id to the groups array for each of the members 

    },
    closeModal() {
      this.tripName = "";
      this.selectedMembers = [];
      this.currency = "";
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
  position: relative; 
}

.closeModal { 
  position: absolute;
  top: 0px;
  right: 30px;
  width: 30px; 
  height: 30px; 
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  background-color: transparent;
}


input[placeholder="Enter Trip Name"], input[placeholder="Add 1st member"], input[placeholder="Add 2nd member"], #searchUser, select {
  width: 58%;
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

.select-currency {
  width: 60%;
}

.createTrip { 
  background-color: #82C0CC;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
}

.createTrip:hover {
  background-color: #1b4851;
}

.select-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  border: 1px solid #ddd; 
  border-radius: 10px; 
  min-height: 38px; 
  width: calc(60% - 10px); 
  margin-bottom: -10px;
  background-color: white;
}

.custom-select {
  width: 60.3%;
  height: 100%;
  margin-top: 0px; 
  border: 0px solid #ddd;
  border-bottom-left-radius: 10px; 
  border-bottom-right-radius: 10px; 
  border-top-left-radius: 0; 
  border-top-right-radius: 0; 
  font-size: medium;
  font-family: 'Montserrat', sans-serif;
  background-color: #a2eefd;
  color: black;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
}

.selected-item {
  background-color: #82C0CC;
  color: white;
  border-radius: 10px;
  padding: 7px 10px;
  margin-right: 5px;
  margin-bottom: 7px;
  cursor: pointer;
}

.selected-item span {
  margin-left: 5px;
  cursor: pointer;
  color: white; 
}

.selected-items .placeholder {
    color: #999;
    padding: 7px 10px;
}

</style>
