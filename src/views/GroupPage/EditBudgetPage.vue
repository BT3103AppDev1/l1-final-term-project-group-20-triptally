<template>
  <div class="app-container">
    <SideNavBar />
    <div class="main-content">
      <p v-if="showSuccessMessage" class="success-message">Budget saved successfully!</p>
      <div class="edit-budget-card">
        <div class="header">
          <router-link to="/group/:tripName/budgets" class="budget-page-link">←</router-link>
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
import { collection, doc, updateDoc, getDocs } from 'firebase/firestore';
import SideNavBar from './SideNavBar.vue';

export default {
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
  props: {
    tripID: String
  },
  methods: {
    async fetchBudgetItems() {
      const budgetsRef = collection(db, "Trips", this.tripID, "Budgets"); // Using prop directly
      try {
        const querySnapshot = await getDocs(budgetsRef);
        this.budget = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error fetching budget items:", error);
      }
    },
    async saveBudget() {
      this.showSuccessMessage = false; // Reset or hide previous message if necessary
      try {
        for (const item of this.budget) {
          const budgetDocRef = doc(db, "Trips", this.tripID, "Budgets", item.id);
          await updateDoc(budgetDocRef, {
            allocated: item.allocated,
            used: item.used
          });
          this.showSuccessMessage = true;
        }
        console.log("Budget updated successfully");
        // Optionally, navigate back to the budget overview page or show a success message
      } catch (error) {
        console.error("Error updating budget items:", error);
        // Optionally, show an error message to the user
      }
    }
  },
  async mounted() {
    this.trip.UID = this.tripID; // Ensure this is set before fetching
    await this.fetchBudgetItems(); // Now calling the correct method
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
