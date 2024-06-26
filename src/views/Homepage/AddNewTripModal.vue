<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal">
      <button class="closeModal" @click="closeModal">X</button>
      <h2>New Group Trip</h2>
      <input v-model="tripName" type="text" id="tripName" placeholder="Enter Trip Name"><br>
      <div class="select-wrapper">
        <input type="text" class='search-input' v-model="searchTerm" placeholder="Search username"
               @focus="showDropdown = true" @blur="keepDropdownOpen">
        <div v-if="showDropdown" class="custom-dropdown">
          <div v-for="user in filteredUsers" :key="user.userID"
               @click="selectUser(user)"
               class="dropdown-item">
            {{ user.username }}
          </div>
        </div>
        <div class="selected-items">
          <span v-if="!selectedMembers.length" class="placeholder">Members</span>
          <div v-for="(user, index) in selectedMembers" :key="index" class="selected-item">
            {{ user.username }}
            <span @click="removeSelectedMember(index)">x</span>
          </div>
        </div>
      </div>
      <select v-model="currency" class="select-currency">
        <option value="" disabled selected hidden>Select Default Currency</option>
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
      </select><br>
      <div class="photo-form">
        <label>Upload Group Picture </label>
        <!--default html file upload button-->
        <input type="file" accept="image/*" id="actual-btn" @change="tempDisplayPhoto" hidden/>
        <!--our custom file upload button-->
        <label class="image-upload-btn" for="actual-btn">Choose Image</label>
        <img :src="tempSelectedImage" :alt="tempSelectedPhotoName" class="temp-image" v-if="tempSelectedImage">
        <!-- <span><img :src="tempSelectedImage" :alt="tempSelectedPhotoName" class="temp-image" v-if="tempSelectedImage"></span> -->
      </div><br>
      <button type="submit" class="createTrip" @click="createTrip">Create New Trip!</button>
    </div>
  </div>
</template>

<script>
import { doc, getDoc, collection, addDoc, arrayUnion, updateDoc, getDocs } from "firebase/firestore";
import { firebaseApp, db, auth, storage } from '@/firebase'; // Assuming db and auth are exported from '@/firebase'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as firebase from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
      searchTerm: '',
      showDropdown: false,
      filteredUsers: [],
      tempSelectedImage: null,
      tempSelectedPhotoName: null,
      tempFile: null,
    }
  },
  computed: {
    availableUsers() {
      return this.allUsers.filter(user => 
        !this.selectedMembers.some(member => member.userID === user.userID)
      );
    },
    filteredUsers() {
      if (!this.searchTerm) {
        return this.availableUsers;
      }
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      return this.availableUsers.filter(user => 
        user.username.toLowerCase().includes(lowerSearchTerm)
      );
    },
  },
  watch: {
    searchTerm(newVal) {
      if (newVal.length > 0) {
        this.showDropdown = true;
      } else {
        this.showDropdown = false;
      }
    }
  },
  async created() {
    await this.fetchUsers();
  },
  emits: ['update:isVisible', 'refreshTrips'],
  async created() {
    await this.fetchUsers();
  },
  methods: {
    keepDropdownOpen(event) {
      event.preventDefault();
      setTimeout(() => { this.showDropdown = this.searchTerm.trim().length > 0; }, 300);
    },
    selectUser(user) {
      this.selectedMembers.push(user);
      this.searchTerm = ''; 
      this.showDropdown = false; 
    },
    async fetchUsers() {
      // fectch all users in TripTally from database 
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
      var userIDs = this.selectedMembers.map(member => member.userID);
      if (!userIDs.includes(this.userID)) { 
        userIDs.push(this.userID);
      }

      try {

        if (this.tempFile){

          const storage = getStorage();         
          const storageRef = ref(storage, `image/${this.tempSelectedPhotoName}`);        
          const snapshot = await uploadBytes(storageRef, this.tempFile);
          const downloadURL = await getDownloadURL(snapshot.ref);
          this.selectedPhotoName = this.tempSelectedPhotoName;
        
          const tripDocRef = await addDoc(collection(db, "Trips"), {
            Members: userIDs, // Assuming you want to add all userIDs, not just this.members
            TripName: this.tripName,
            Currency: this.currency,
            image: downloadURL
          });

          this.tripID = tripDocRef.id;
          console.log('New trip added with ID: ' + this.tripID);

      } else { 
        const tripDocRef = await addDoc(collection(db, "Trips"), {
          Members: userIDs, // Assuming you want to add all userIDs, not just this.members
          TripName: this.tripName,
          Currency: this.currency, 
          image: ""
        });

        this.tripID = tripDocRef.id;
        console.log('New trip added with ID: ' + this.tripID);

      }

      for (const userID of userIDs) {
        const userRef = doc(db, "Users", userID);
        try {
          await updateDoc(userRef, {
            GroupTrips: arrayUnion(this.tripID)
          });
          this.closeModal();
          console.log("Trip added to user with userID: " + userID);

        } catch (error) {
          console.error("Error updating user document: ", error);
        }
      }

      const budgetsRef = collection(db, "Trips", this.tripID, "Budgets");

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
      // emit to HomePage.vue to update the trips that user is in 
      this.$emit('refreshTrips', this.tripID);
      } catch (error) {
        console.error('Error adding trip document: ', error);
      }
      this.tripName = "";
      this.selectedMembers = [];
      this.currency = "";     
    },
    closeModal() {
      this.tripName = "";
      this.selectedMembers = [];
      this.currency = "";
      this.showDropdown = false;
      this.$emit('update:isVisible', false);
    }, 
    tempDisplayPhoto(event){
      const file = event.target.files[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.tempSelectedImage = e.target.result;
            this.tempSelectedPhotoName = file.name;
          };      
          reader.readAsDataURL(file);
          this.tempFile = file;
          
        } catch (error) {
          console.error('Error reading image file:', error);
        }
      }
    }
  }, 
  mounted() { 
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
      }
    })
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

.custom-dropdown {
  position: absolute;
  width: 57.5%;
  margin-top: 40px;
  border-radius: 10px;
  background-color: #82C0CC;
  border: 1px solid #ccc;
  z-index: 100;
}

.dropdown-item {
  padding: 5px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #1b4851;
  border-radius: 10px;
}

input[placeholder="Enter Trip Name"], input[placeholder="Search username"], select {
  width: 58%;
  height: 100%;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
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
  color: white;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  margin-top: -10px;
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

.selected-items {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  width: 58.5%;
  background-color: #1b4851;
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

input[type='file'] { 
  display: none
}

.image-upload-btn { 
  background-color: rgba(27,72,81,255);
  color: white;
  padding: 8px;
  font-family: 'Montserrat', sans-serif;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.852);
  cursor: pointer;
  margin-left: 10px;
}

.photo-form {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.temp-image {
  max-width: 70px; /* Adjust as needed */
  max-height: 70px; /* Adjust as needed */
  margin-left: 5px;
}

</style>
