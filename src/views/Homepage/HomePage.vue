<template>
  <div v-if="user" class="trip-container">
    <h1>My Trips</h1>
    <div class="trip-grid">
      <!-- Trip Cards -->
      <router-link v-for="trip in trips" :key="trip.id" :to="{ name: 'GroupPage', params: { tripName: trip.name } }"
        custom v-slot="{ navigate }">
        <div class="trip-card" @click="navigate">
          <img :src="trip.image" :alt="trip.name" class="trip-image">
          <div class="trip-name">{{ trip.name }}</div>
        </div>
      </router-link>

      <!-- Add New Trip Button -->
      <button class="add-trip-button" @click="showModal = true">
        <span>+</span>
      </button>

      <AddNewTripModal :is-visible="showModal" @update:isVisible="showModal = $event"></AddNewTripModal>
    </div>
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
import { db } from '@/firebase';

 export default {
  name: 'TripList',
  data() {
     return {
      user: false,
      showModal: false, 
      trips: [
         { id: 1, name: 'Grad Trip <3', image: gradTripImage },
         { id: 2, name: 'Winter Exchange in Seoul', image: winterExchangeImage },
         { id: 3, name: 'Bali Trip', image: baliTripImage },
         { id: 4, name: 'Weekend in KL', image: weekendKLImage }
         // ... more trips
       ]
     };
   },
  components: { 
    AddNewTripModal
  },
  methods: {
     addNewTrip() {
       // Logic to add new trip
       this.isPopupVisible = !this.isPopupVisible
     }
   },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
        // retrieve user's relevant trips from firestore database 
      }
    })

    // 
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
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 20px;
    margin-top: 20px;
  }

  .trip-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: 10px;
    text-align: center;
    text-decoration: none;
    color: black;
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

</style>
  
  