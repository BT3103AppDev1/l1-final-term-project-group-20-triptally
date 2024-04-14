<template>
  <div v-if="user" class="main">
    <SideNavBar :tripName="trip.TripName" :tripID="$route.params.tripID"></SideNavBar>
  </div>

  <div v-else>
    <h1>You must be logged in to view this!</h1>
  </div>
</template>
  
  
<script>
import SideNavBar from './SideNavBar.vue';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  data() { 
    return { 
      user: false,
      trip: { 
        TripName: "",
        Members: [],
        Currency: "", 
        UID: ""
      }
    }
  },
  components: {
    SideNavBar
  },
  methods: { 
    async fetchTripData() { 
      // fetch trip data based on tripID
      const tripDocRef = doc(db, "Trips", this.$route.params.tripID); 
      try { 
        const docSnap = await getDoc(tripDocRef); 
        this.trip.TripName = docSnap.data().TripName; 
        this.trip.Currency = docSnap.data().Currency; 
        this.trip.Members = docSnap.data().Members;
        this.trip.UID = this.$route.params.tripID; 
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  },
  mounted() {
    const auth = getAuth();
    this.fetchTripData(); 
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
      }
    })
  }
};
</script>

<style>
.main {
  display: flex;
  align-items: center;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
}
</style>