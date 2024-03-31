<template>
    <div class="trip-container">
       <h1>My Trips</h1>
       <div class="trip-grid">
         <!-- Trip Cards -->
         <router-link 
           v-for="trip in trips" 
           :key="trip.name" 
           :to="{ name: 'GroupPage', params: { tripName: trip.name }}" 
           tag="div" 
           class="trip-card"
         >
           <img :src="trip.image" :alt="trip.name" class="trip-image">
           <div class="trip-name">{{ trip.name }}</div>
         </router-link>
         
         <!-- Add New Trip Button -->
         <button class="add-trip-button" @click="addNewTrip">
           <span>+</span>
         </button>
       </div>
   </div>
 </template>
 
 <script>
 import gradTripImage from './GroupImages/grad-trip.png';
 import winterExchangeImage from './GroupImages/winter-exchange.png';
 import baliTripImage from './GroupImages/bali-trip.png';
 import weekendKLImage from './GroupImages/weekend-in-kl.png';
 
 export default {
   name: 'TripList',
   data() {
     return {
       trips: [
         { id: 1, name: 'Grad Trip <3', image: gradTripImage },
         { id: 2, name: 'Winter Exchange in Seoul', image: winterExchangeImage },
         { id: 3, name: 'Bali Trip', image: baliTripImage },
         { id: 4, name: 'Weekend in KL', image: weekendKLImage }
         // ... more trips
       ]
     };
   },
   methods: {
     addNewTrip() {
       // Logic to add new trip
     }
   }
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);

}

.add-trip-button:hover {
  background-color: #e6b800;
}

  </style>
  
  