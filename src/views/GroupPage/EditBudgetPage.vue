<template>
  <div class="app-container">
    <SideNavBar :key="trip.TripName" :tripID="$route.params.tripID" :tripName="trip.TripName"></SideNavBar>
    <div class="main-content">
      <p v-if="showSuccessMessage" class="success-message">Budget saved successfully!</p>
      <div class="edit-budget-card">
        <div class="header">
          <router-link :to="`/group/${tripID}/budgets`" class="budget-page-link">←</router-link>
          <h1>Edit Budget</h1>
          <button class="save-button" @click="saveBudget">Save</button>
        </div>
        <div class="budget-fields">
          <div class="field" v-for="item in budget" :key="item.id">
            <label :for="`category-${item.category}`">{{ item.category }}: </label>
            <input type="number" :id="`category-${item.category}`" v-model.number="item.allocated" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { doc, getDoc, collection, updateDoc, getDocs } from 'firebase/firestore';
import SideNavBar from './SideNavBar.vue';

export default {
  name: 'EditBudgetPage',
  props: {
    tripID: String
  },
  data() { 
    return { 
      showSuccessMessage: false,
      trip: { 
        TripName: "", 
        Members: [], 
        Currency: "", 
        UID: ""
      },
      budget: [], // Define budget as an array
    }
  },
  methods: {
    async fetchTripData() { 
      // Ensure you're fetching the trip data based on the correct tripID. This could come from the prop or the route.
      const tripID = this.tripID || this.$route.params.tripID;
      const tripDocRef = doc(db, "Trips", tripID); 
      try { 
        const docSnap = await getDoc(tripDocRef); 
        if (docSnap.exists()) {
          // Update the trip data
          this.trip.TripName = docSnap.data().TripName; 
          this.trip.Currency = docSnap.data().Currency; 
          this.trip.Members = docSnap.data().Members;
          this.trip.UID = tripID; 
        } else {
          console.error("Trip document does not exist");
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    },
    async fetchBudgetItems() {
      const budgetsRef = collection(db, "Trips", this.tripID, "Budgets"); // Ensure this uses the tripID correctly
      try {
        const querySnapshot = await getDocs(budgetsRef);
        this.budget = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error fetching budget items:", error);
      }
    },
    async saveBudget() {
      // Reset the success message state and proceed to update the budget items
      this.showSuccessMessage = false; 
      try {
        for (const item of this.budget) {
          const budgetDocRef = doc(db, "Trips", this.tripID, "Budgets", item.id);
          await updateDoc(budgetDocRef, {
            allocated: item.allocated,
            used: item.used
          });
        }
        // Show success message after updates
        this.showSuccessMessage = true;
        console.log("Budget updated successfully");
      } catch (error) {
        console.error("Error updating budget items:", error);
      }
    }
  },
  async mounted() {
    await this.fetchTripData(); // Fetch trip data on mount
    await this.fetchBudgetItems(); // Fetch budget items on mount
  },
  components: {
    SideNavBar
  }
};
</script>


<style scoped>
.app-container {
  display: flex;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
  height: 100vh; /* Or adjust to the height you need */
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  /* Additional styles as needed */
}

h1 {
  color: white;
  font-size:x-large;
  position: absolute;
  top: 10px;
  margin-left: 80px;
}

/* Centered card layout */
.edit-budget-card {
  background: #307A8D; 
  border-radius: 15px;
  width: 700px; /* Adjust width as needed */
  margin: 0 auto; /* Center the card horizontally */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4); /* subtle shadow */
  top: 60%; /* Adjust this value to control the vertical position */
  transform: translateY(20%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* Style your header */
}

.save-button {
  background-color: #ffb921;
  color: black;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 500;
  font-size: small;
  border-radius: 10px;
  width: 100px;
  margin: 2cap;
  margin-right: 2cap;
}

.save-button:hover {
  background-color: #e3be43; /* A slightly darker shade for hover state */
}

.budget-page-link {
  color: white;
  font-family: Montserrat, sans-serif;
  font-weight: 1000;
  font-size:x-large;
  text-decoration: none;
  margin-left: 2cap;
}
.budget-fields {
  display: flex;
  flex-direction: column;
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  color: white;
  margin-left: 8cap;
}

.field {
  margin-bottom: 15px;
  /* Style your fields */
}

input[type="number"] {
  font-family: Montserrat, sans-serif;
}

.success-message {
  color: black; /* Simple styling */
  position: fixed;
  left: 50%;
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  font-size: large;
}
</style>
