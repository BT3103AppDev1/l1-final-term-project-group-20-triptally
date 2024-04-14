<template>
  <div class="app-container">
    <SideNavBar :tripID="$route.params.tripID" :tripName="trip.TripName"></SideNavBar>
    <div class="budget-page"> 
      <button class="edit-button" @click="editBudget">Edit</button>
      <h1>Total Budget: ${{ totalBudget }}</h1>
      <div class="budget-categories">
        <div class="category-block" v-for="(item, index) in budget" :key="index">
          <div class="icon-and-category">
            <span class="icon">{{ getCategoryIcon(item.category) }}</span>
            <span class="category-name">{{ item.category }}</span>
          </div>
          <div class="progress-and-amount">
            <div class="progress-container">
              <div class="progress-bar" :style="{width: progressWidth(item), backgroundColor: getCategoryColor(item.category)}">
                <span class="spent-amount">${{ item.used }}</span>
              </div>
            </div>
            <div class="amount-info">
              <div class="amount-allocated">${{ item.allocated }}</div>
              <div class="amount-left">left ${{ item.allocated - item.used }}</div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  </div>
</template>

<script>
import SideNavBar from './SideNavBar.vue';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from '@/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';


export default {
  name: 'BudgetPage',
  data() {
    return {
      user: false,
      trip: { 
        TripName: "", 
        Members: [], 
        Currency: "", 
        UID: ""
      },
      totalBudget: 0, // Example total budget
      budget: [], // Array to store budget items
    };
  },
  components: {
    SideNavBar
  },
  props: ['tripID'], 
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
    },
    progressWidth(item) {
      const percentageUsed = (item.used / item.allocated) * 100;
      return `${percentageUsed}%`;
    },
    getCategoryIcon(category) {
      const icons = {
        'Food': '🍽️',
        'Shopping': '🛍️',
        'Transport': '🚌',
        'Entertainment': '🎭',
        'Accommodation': '🏨',
        'Miscellaneous': '📦'
      };
      return icons[category] || '❓';
    },
    getCategoryColor(category) {
      const colors = {
        'Food': '#B2DFAB',
        'Shopping': '#F0E694',
        'Transport': '#ABD9EA',
        'Entertainment': '#DDC9F7',
        'Accommodation': '#FCC2AB',
        'Miscellaneous': '#EDA5B9',
      };
      return colors[category] || '#cccccc'; // Default color if the category is not found
    },
    editBudget() {
      this.$router.push({ name: 'EditBudgetPage' });
    },
    async fetchBudgetItems() {
      const budgetsRef = collection(db, "Trips", this.tripID, "Budgets");
      const queryRef = query(budgetsRef, orderBy("order")); // Order by the 'order' field

      try {
        const querySnapshot = await getDocs(queryRef);
        this.budget = querySnapshot.docs.map(doc => doc.data());
        console.log("Budget items fetched successfully:", this.budget);
        
        // Calculate the total budget
        this.totalBudget = this.budget.reduce((total, item) => total + item.allocated, 0);

        console.log("Fetched budget items in order:", this.budget);
        console.log("Total Budget: ", this.totalBudget);
      } catch (error) {
        console.error("Error fetching budget items:", error);
      }
    },
  },
  mounted() {
    const auth = getAuth();
    this.trip.UID = this.tripID; // Ensure this is set before fetching
    this.fetchTripData();
    console.log("Trip ID from route:", this.$route.params.tripID);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        await this.fetchBudgetItems();
      }
    })
  },
  watch: {
  '$route'() {
    console.log("Route changed, fetching budget items...");
    this.fetchBudgetItems();
    this.fetchTripDetails();
  },
},
}
</script>

<style scoped>
.app-container {
  display: flex;
  align-items: center;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
}

.budget-page {
  max-width: 600px;
  margin: -60px auto 0; /* Adjust top margin */
  font-family: 'Arial', sans-serif;
}

.edit-button {
  position: absolute; /* Position the button absolutely within the budget-page */
  top: 80px; /* Adjust as needed */
  right: 20px; /* Adjust as needed */
  padding: 10px 20px;
  background-color: #ffb921; /* Pastel yellow, or choose a color that fits your design */
  color: black;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 500;
  width: 100px;
}

.edit-button:hover {
  background-color: #e3be43; /* A slightly darker shade for hover state */
}

.category-name {
  font-size: medium;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 700;
}

h1 {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 700;
  text-align: center;
  color: #333;
  margin-top: 100px; /* Adjust as needed */
}

.budget-categories {
  display: flex;
  flex-direction: column;
}

.category-block {
  background-color: #f7f7f7; /* Soft pastel background */
  padding: 10px;
  padding-left: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* subtle shadow */
  width: 600px;
  height:auto;
  margin-left: -100px;
}

.icon-and-category {
  display: flex;
  align-items: center;
  font-size: 1.2em;
  margin-bottom: 10px;
}

.icon {
  margin-right: 10px;
}

.category-name {
  flex-grow: 1;
}

.progress-and-amount {
  display: flex;
  align-items: center;
}

.progress-bar {
  height: 20px; /* Increased height */
  border-radius: 5px;
  transition: width 0.3s ease;
  position: relative; /* Enable absolute positioning of children */
}

.spent-amount {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(-10%, -50%); /* Adjust positioning to inside the progress bar */
  color: black; /* Improved visibility against colored backgrounds */
  background-color: transparent; /* Optional: Adjust based on visibility needs */
  padding: 0 4px; /* Slight padding on the sides */
  min-width: 30px; /* Ensure there's enough room for numbers */
  text-align: center; /* Center the text within the space */
  border-radius: 5px;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 600;
  font-size: 0.95em; /* Adjust font size as necessary */
  white-space: nowrap; /* Ensure the text doesn't wrap */
}

.progress-container {
  background-color: #e0e0e0;
  border-radius: 5px;
  flex-grow: 1;
  margin-right: 10px;
  position: relative; /* Added to ensure the spent amount is positioned correctly */
  overflow: hidden; /* Ensure that the spent amount text does not overflow */
}

.amount-info {
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: flex-start; /* Align items to the start of the flex container */
}

.amount-allocated {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 600; /* Add some padding for better spacing */
  font-size: x-large;
}

.amount-left {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 600;
  padding: 2px 0; /* Add some padding for better spacing */
  color: #333; /* Adjust the color if needed */
  font-size: small; /* Adjust the font size if needed */
  border-radius: 5px;
  padding: 5px 10px;
}
</style>
