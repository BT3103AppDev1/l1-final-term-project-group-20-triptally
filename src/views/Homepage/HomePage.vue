<template>
  <div v-if="user" class="trip-container">
    <h1>My Trips</h1>
      <div v-if="trips.length === 0" class="no-trips-message">
        No trips created yet. Start tallying by clicking the '+' button!
        </div>
      <div class="trip-grid">
      <!-- Trip Cards -->
      <router-link v-for="trip in trips" :key="trip.UID"
        :to="{ name: 'GroupPage', query: { tripName: trip.TripName }, params: { tripID: trip.UID }}" custom v-slot="{ navigate }">
        <div class="trip-card" @click="navigate">
          <!-- Settings Page -->
          <div class="settings" @click.stop="toggleDropdown(trip.UID)">
            <img src="@/assets/settingsicon.png" alt="Settings" class="settings-icon">
            <!-- Dropdown Menu -->
            <div class="dropdown-menu" v-if="trip.dropdownVisible">
              <div class="dropdown-item" @click="renameGroup(trip)">Rename Group</div>
              <div class="dropdown-item" @click="changeGroupImage(trip)">Change Group Image</div>
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

              <!-- Change Group Photo Popup -->
              <div class="change-image-popup" v-if="showChangeGroupImage">
                <div class="popup-content">
                  <h2 class="change-image">Change Trip Cover Image</h2>
          
                    <!--default html file upload button-->
                    <input type="file" accept="image/*" id="actual-btn" @change="tempDisplayPhoto" hidden/>
                    <!--our custom file upload button-->
                    <label class="image-upload-btn" for="actual-btn">Choose Image</label>

                    <img :src="tempSelectedImage" :alt="tempSelectedPhotoName" class="temp-image" v-if="tempSelectedImage">


                    <div class="button-container">
                        <button class="confirm-photo" @click="confirmChangePhoto">Confirm</button>
                        <button class="cancel-photo" @click="cancelChangePhoto">Cancel</button>
                    </div>

                </div>
              </div>

          </div>
          <img :src="getTripImage(trip)" :alt="trip.TripName" class="trip-image">
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

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, setDoc, updateDoc, arrayRemove, query, where, getDocs } from 'firebase/firestore';
import AddNewTripModal from './AddNewTripModal.vue';
import { firebaseApp, db, auth, storage } from '@/firebase'; // Assuming db and auth are exported from '@/firebase'
import defaultTripImage from '@/assets/default-trip-image.jpg';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


import 'firebase/app'
import 'firebase/storage'

export default {
  name: 'TripList',
  data() {
     return {
      user: false,
      userID: "",
      showModal: false,
      showLeaveGroupConfirmation: false,
      showEditTripNamePopup: false,
      showChangeGroupImage: false,
      selectedTrip: null,
      defaultTripImage,
      trips: [], 
      tripLength: 0,
      tempSelectedImage: null,
      tempSelectedPhotoName: null,
      tempFile: null,
     };
   },
  components: { 
    AddNewTripModal
  },
  methods: {
    getTripImage(trip) {
      if (trip.image) {
        return trip.image; // If image URL exists, return it directly
      } else {
        return defaultTripImage;
      } 
  },
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
    },
   
    async confirmChangePhoto() {
      if (this.tempFile){
        try {
          const storage = getStorage();         
          const storageRef = ref(storage, `image/${this.tempSelectedPhotoName}`);        
          const snapshot = await uploadBytes(storageRef, this.tempFile);
          const downloadURL = await getDownloadURL(snapshot.ref);
          this.selectedTrip.image = downloadURL;
          this.selectedPhotoName = this.tempSelectedPhotoName;
        
          const tripDocRef = doc(db, "Trips", this.selectedTrip.UID);
          await updateDoc(tripDocRef, {
            image: downloadURL
          });
    
          console.log("step")
          this.showChangeGroupImage = false;

        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    },
    cancelEditTripName() {
      this.selectedTrip = null; 
      this.showEditTripNamePopup = false;
    },
    changeGroupImage(trip){
      this.selectedTrip = trip;
      this.showChangeGroupImage = true;
    },
    cancelChangePhoto(){
      this.selectedTrip = null;
      this.tempSelectedImage = null;
      this.showChangeGroupImage = false;
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

      // update this.trips to reflect the updated group trips that user is in 
      const updatedTrips = this.trips.filter(t => t.UID !== trip.UID); 
      this.trips = updatedTrips;
    },
    cancelLeaveGroup() {
      this.selectedTrip.dropdownVisible = false;
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
          image: docSnap.data().image
        })
        console.log(newTripID + " added to user's group trips");
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
          this.trips = [];

          for (const tripID of userDoc.data().GroupTrips) {
          const tripDocRef = doc(db, "Trips", tripID);
          try {
            const docSnap = await getDoc(tripDocRef);
            const imageData = docSnap.data().image !== undefined ? docSnap.data().image : '';
            console.log(docSnap.data().image);
            this.trips.push({ 
              Currency: docSnap.data().Currency, 
              Members: docSnap.data().Members, 
              TripName: docSnap.data().TripName,
              image: imageData,
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
  background-color: white;
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
  background-color: #f2f2f2; 
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

.change-image-popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height:fit-content;
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

.temp-image {
  max-width: 100%; /* Adjust as needed */
  max-height: 100%; /* Adjust as needed */
  border-radius: 10%;
}

.edit-name {
  margin-top: 0px;
  margin-bottom: 30px;
}

.name-form {
  margin-bottom: 10px;
  font-size: medium;
}

.name-form input {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  background-color: #489FB5;
  border-radius: 5px; 
  border: none;
  padding-left: 8px;
  padding-top: 2px;
  padding-bottom: 2px;
  color: white;
  font-size: medium;
  width: 150px;
}

.name {
  margin-right: 10px;
}


.button-container {
  text-align: center; 
  padding-top:5px;
  width: 330px;
  display: flex; 
  justify-content: center; 
  align-items: center; 
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
  border-radius: 20px;
}

.image-upload-btn { 
  background-color: #489fb5;
  color: white;
  padding: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  border-radius: 0.3rem;
  cursor: pointer;
  margin-top: 1rem;
}

.confirm-photo, .cancel-photo { 
  margin-top: 7px;
  font-family: 'Montserrat', sans-serif;
}
</style>
  
  