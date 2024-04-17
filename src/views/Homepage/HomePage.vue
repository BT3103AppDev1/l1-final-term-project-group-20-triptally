<template>
  <div v-if="user" class="trip-container">
    <h1>My Trips</h1>
      <div v-if="trips.length === 0" class="no-trips-message">
        No trips created yet. Start tallying by clicking the '+' button!
        </div>
      <div class="trip-grid">
      <!-- Trip Cards -->
      <router-link v-for="trip in trips" :key="trip.UID"
        :to="{ name: 'GroupPage', params: { tripID: trip.UID }}" custom v-slot="{ navigate }">
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
                  <button class="confirm-button" @click="leaveGroup(selectedTrip)">Leave Group</button>
                  <button class="cancel-button" @click="cancelLeaveGroup">Cancel</button>
                </div>
              </div>
              <!-- Add/Edit Trip Name Popup -->
              <div class="edit-name-popup" v-if="showEditTripNamePopup">
                <div class="popup-content">
                  <h2 class="edit-name">Edit Trip Name</h2>
                  <div class="name-form">
                    <label class="name" for="name">Group Name:</label>
                    <input type="text" v-model="newTripName">
                  </div>
                  <div class="button-container">
                    <button class="save-edit" @click="updateTripName">Save</button>
                    <button class="cancel-edit" @click="cancelEditTripName">Cancel</button>
                  </div>
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

    <AddNewTripModal @refresh-trips="fetchUserTrips(newTripID)" :is-visible="showModal" @update:isVisible="showModal = $event"></AddNewTripModal>
  </div>
    <div v-else>
      <h1>
        You must be logged in to view this!
      </h1>
    </div>
</template>
 
 <script>
import { doc, getDoc, collection, setDoc, updateDoc, arrayRemove, query, where, getDocs } from "firebase/firestore";
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
      showEditTripNamePopup: false,
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
      this.trips.forEach(t => {
        if (t.UID !== uid) {
          t.dropdownVisible = false;
        }
      });
    },
    confirmLeaveGroup(trip) {
      this.showLeaveGroupConfirmation = true;
      this.selectedTrip = trip;
    },
    renameGroup(trip) {
      this.showEditTripNamePopup = true;
      this.selectedTrip = trip;
      this.newTripName = trip.TripName;
      trip.dropdownVisible = false; 

    },
    async updateTripName() {
      this.selectedTrip.TripName = this.newTripName;
      this.showEditTripNamePopup = false;

      console.log(this.newTripName);

      const tripDocRef = doc(db, "Trips", this.selectedTrip.UID);
      try { 
        await updateDoc(tripDocRef, { 
          TripName: this.newTripName
        })
        console.log("Trip name changed to " + this.newTripName);
      } catch (error) { 
        console.log(error);
      }

      this.selectedTrip = null; 
    },
    cancelEditTripName() {
      this.selectedTrip.dropdownVisible = false;
      this.selectedTrip = null; 
      this.showEditTripNamePopup = false;
    },
    async leaveGroup(trip) {
      //logic to leave group 
      console.log("leaving group:", trip.TripName);
      this.showLeaveGroupConfirmation = false;
      this.selectedTrip = null; 

      // remove the user from the group trip's members array 
      const tripDocRef = doc(db, "Trips", trip.UID);
      try { 
        await updateDoc(tripDocRef, { 
          Members: arrayRemove(this.user.uid)
        })
        console.log("User removed from trip's members array");
      } catch (error) { 
        console.error(error);
      }

      // remove the tripID from the user's trips array 
      const userDocRef = doc(db, "Users", this.user.uid);
      try { 
        await updateDoc(userDocRef, { 
          GroupTrips: arrayRemove(trip.UID)
        })
        console.log("Trip removed from user's GroupTrips array");
      } catch (error) { 
        console.error(error);
      }

      await this.fetchUserData();
    },
    cancelLeaveGroup() {
      this.showLeaveGroupConfirmation = false;
      this.selectedTrip = null; 
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
  
      const docRef = doc(db, "Users", this.user.uid);
      try {
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          const groupTrips = userDoc.data().GroupTrips;
          console.log(groupTrips);

          // // Firestore limits the 'in' query to a maximum of 10 elements in the array
          // const maxQuerySize = 10;
          // const tripCollections = collection(db, "Trips");
          // this.trips = [];

          // // If you have more than 10 trip IDs, you need to split them into chunks of 10
          // for (let i = 0; i < groupTrips.length; i += maxQuerySize) {
          //   const chunk = groupTrips.slice(i, i + maxQuerySize);
          //   const tripsQuery = query(tripCollections, where('__name__', 'in', chunk));
          //   const querySnapshot = await getDocs(tripsQuery);
            
          //   querySnapshot.forEach(docSnapshot => {
          //     this.trips.push({ 
          //       Currency: docSnapshot.data().Currency, 
          //       Members: docSnapshot.data().Members, 
          //       TripName: docSnapshot.data().TripName,
          //       UID: docSnapshot.id 
          //     });
          //   });
          // }

          for (const tripID of userDoc.data().GroupTrips) {
            const tripDocRef = doc(db, "Trips", tripID);
            try {
              const docSnap = await getDoc(tripDocRef);
              this.trips.push({ 
                Currency: docSnap.data().Currency, 
                Members: docSnap.data().Members, 
                TripName: docSnap.data().TripName,
                UID: tripID 
              });
            } catch (error) {
              console.error("Error retrieving trip ", error);
            }
          }

        } else {
          console.error("User document does not exist.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      }
    },
  mounted() {
  
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
        this.fetchUserData(); 
      }
    })
  }, 

 }
 </script>
  
  <style scoped>

  .no-trips-message {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .trip-container {
    padding: 20px;
    padding-bottom: 70px;
    min-height: 100vh;
    text-align: center;
    align-items: center;
    background: url('@/assets/singapore.jpg') no-repeat center center fixed;
    background-size: cover;
    background-color: rgba(88, 85, 79, 0.2);
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
    right: 0;
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
  padding: 30px;
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
  padding-left: 20px;
  padding-right: 20px;
}

.confirm-button, .cancel-button {
  font-weight: 500;
  font-size: 15px;
  display: flex; /* Enables flexbox */
  justify-content: center; /* Centers content horizontally */
  align-items: center; /* Centers content vertically */
  padding: 15px 24px;
  height: 35px;
  width: 330px;
  background-color: white;
  border-radius: 0%;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
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

.edit-name-popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height:150px;
  padding: 30px;
  background-color: #16697A;
  border-radius: 20px;
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
  color: white;
}

.edit-name {
  margin-top: 0px;
  margin-bottom: 30px;
}

.name-form {
  margin-bottom: 10px;
}

.name-form input {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  border-radius: 10px;
  border: none;
  padding: 6px;
}

.name {
  margin-right: 10px;
}


.button-container {
  text-align: center; /* Align buttons to the center */
  padding-top:5px;
  width: 330px;
  display: flex; /* Display buttons in the same line */
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
}

.button-container button {
  padding: 10px 20px; 
  cursor: pointer;
}

.save-edit, .cancel-edit {
  font-weight: 500;
  font-size: 15px;
  padding: 15px 24px;
  height: 35px;
  width: 165px;
  background-color: #16697A;
  border-radius: 0%;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
}

.save-edit {
  color: #ffa62b;
  cursor: pointer;
  padding-bottom: 5px;
}

.cancel-edit {
  color: white;
  cursor: pointer;
}

.save-edit:hover, .cancel-edit:hover {
  background-color: #105664;
}
</style>
  
  