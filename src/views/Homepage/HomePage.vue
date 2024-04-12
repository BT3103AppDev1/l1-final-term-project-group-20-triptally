<template>
  <div v-if="user" class="trip-container">
    <h1>My Trips</h1>
    <div class="trip-grid">
      <!-- Trip Cards -->
      <router-link v-for="trip in trips" :key="trip.UID"
        :to="{ name: 'GroupPage', params: { tripName: trip.TripName } }" custom v-slot="{ navigate }">
        <div class="trip-card" @click="navigate">
          <!-- Settings Page -->
          <div class="settings" @click.stop="toggleDropdown(trip.UID)">
            <img src="@/assets/settingsicon.png" alt="Settings" class="settings-icon">
            <!-- Dropdown Menu -->
            <div class="dropdown-menu" v-if="trip.dropdownVisible">
              <div class="dropdown-item" @click="renameGroup(trip)">Rename Group</div>
              <div class="dropdown-item" @click="confirmLeaveGroup(trip)">Leave Group</div>
            </div>
              <!-- Leave Group Confirmation Modal -->
              <div class="confirmation-popup" v-if="showLeaveGroupConfirmation && selectedTrip">
                <div>
                  <p class="leave-group-confirmation">Are you sure you want to leave the group "{{ selectedTrip.TripName }}"?</p>
                  <button class="confirm-button" @click="leaveGroup(selectedTrip)">Confirm</button>
                  <button class="cancel-button" @click="cancelLeaveGroup">Cancel</button>
                </div>
              </div>
          </div>
          <img :src="trip.image" :alt="trip.TripName" class="trip-image">
          <div class="trip-name">{{ trip.TripName }}</div>
        </div>
      </router-link>
    </div>
    <!-- Add New Trip Button -->
    <button class="add-trip-button" @click="showModal = true">
      <span>+</span>
    </button>

    <AddNewTripModal @refresh-trips="fetchUserTrips" :is-visible="showModal" @update:isVisible="showModal = $event"></AddNewTripModal>
  </div>
    <div v-else>
      <h1>
        You must be logged in to view this!
      </h1>
    </div>
</template>
 
 <script>
 import gradTripImage from './GroupImages/grad-trip.png';
 import winterExchangeImage from './GroupImages/winter-exchange.png';
 import baliTripImage from './GroupImages/bali-trip.png';
 import weekendKLImage from './GroupImages/weekend-in-kl.png';
import { doc, getDoc, collection, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AddNewTripModal from './AddNewTripModal.vue'
import { db, auth } from '@/firebase';

 export default {
  name: 'TripList',
  data() {
     return {
      user: false,
      userID: "",
      showModal: false,
      showLeaveGroupConfirmation: false,
      selectedTrip: null,
      trips: [], 
      tripLength: 0,
        //  { id: 1, name: 'Grad Trip <3', image: gradTripImage },
        //  { id: 2, name: 'Winter Exchange in Seoul', image: winterExchangeImage },
        //  { id: 3, name: 'Bali Trip', image: baliTripImage },
        //  { id: 4, name: 'Weekend in KL', image: weekendKLImage }
         // ... more trips
     };
   },
  components: { 
    AddNewTripModal
  },
  methods: {
    toggleDropdown(uid) {
      const trip = this.trips.find(t => t.UID === uid);
      if (trip) {
      trip.dropdownVisible = !trip.dropdownVisible;
      }
    },
    confirmLeaveGroup(trip) {
      this.showLeaveGroupConfirmation = true;
      this.selectedTrip = trip;
    },
    leaveGroup(trip) {
      //logic to leave group 
      console.log("leaving group:", trip.TripName);
      this.showLeaveGroupConfirmation = false;
      this.selectedTrip = null;
    },
    cancelLeaveGroup() {
      this.showLeaveGroupConfirmation = false;
    },
    addNewTrip() {
       // Logic to add new trip
       this.isPopupVisible = !this.isPopupVisible
     }, 
    async fetchUserTrips(newTripID) { 

      const tripDocRef = doc(db, "Trips", newTripID); 
      try { 
        const docSnap = await getDoc(tripDocRef); 
        this.trips.push( { 
          Currency: docSnap.data().Currency, 
          Members: docSnap.data().Members, 
          TripName: docSnap.data().TripName,
          UID: newTripID,
          dropdownVisible: false,
        })
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    async fetchUserData() {
      const user = auth.currentUser;
      console.log(user);
      this.userID = user.uid; 
      if (user) {
        const docRef = doc(db, "Users", this.userID);
        try {
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();

            for (const tripID of userData.GroupTrips) {
              const tripDocRef = doc(db, "Trips", tripID);
              try {
                const docSnap = await getDoc(tripDocRef);
                this.trips.push({ 
                  Currency: docSnap.data().Currency, 
                  Members: docSnap.data().Members, 
                  TripName: docSnap.data().TripName,
                  UID: tripID 
                });
                console.log(docSnap.data().TripName);
              } catch (error) {
                console.error("Error retrieving trip ", error);
              }
            }
            this.tripLength = this.trips.length;
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
  }, 

 }
 </script>
  
  <style scoped>
  .app-container {
    font-family: 'Arial', sans-serif;
  }

  .trip-container {
    padding: 20px;
    padding-bottom: 70px;
    min-height: 100vh;
    text-align: center;
  }

  .trip-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 20px;
    margin-top: 20px;
  }

  .trip-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: 8px;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    color: black;
    cursor: pointer;
  }

  .trip-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 4px;
  }

  .trip-name {
    margin-top: 10px;
  }

  .add-trip-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background-color: #ffcc00;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    color: #fff;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .add-trip-button:hover {
    background-color: #e6b800;
  }
  .settings {
    margin-left: 90%;
    position: relative;
  }

  .settings-icon {
    width: 15px;
    height: 12px;
  }

  .dropdown-menu {
  position: absolute;
  left: 0;
  top: 100%;
  width: 150px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.dropdown-item {
  text-align: left;
  padding: 10px;
  padding-left: 15px;
  cursor: pointer;
  font-size: smaller;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.confirmation-popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height:150px;
  padding: 10px;
  background-color: white;
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
  z-index: 10;
  font-size: 15px;
  font-weight: 300;
}

  .leave-group-confirmation {
    cursor: pointer;
    font-weight: 600; 
  }

  .confirm-button, .cancel-button {
    font-weight: 300;
    font-size: 15px;
    display: flex; /* Enables flexbox */
    justify-content: center; /* Centers content horizontally */
    align-items: center; /* Centers content vertically */
    padding: 15px 24px;
    height: 35px;
    width: 300px;
    background-color: white;
    border-top: 1px solid rgb(244, 243, 243);
    border-radius: 0%;
  }

  .confirm-button {
    color: rgb(189, 1, 1);
    cursor: pointer;
  }
  .cancel-button {
    color: black;
    cursor: pointer;
  }

  .confirm-button:hover, .cancel-button:hover {
  background-color: #f2f2f2; /* Light grey background on hover */
}
</style>
  
  