<template>
  <div class="app-container">
    <SideNavBar :tripID="$route.params.tripID" :tripName="$route.query.tripName"></SideNavBar>
    <div class="budget-page"> 
      <button class="edit-button" @click="editBudget">Edit</button>
      <h1 v-if="isLoading" class="loading">Fetching Budget for {{ trip.TripName }}...</h1>
      <h1 v-else>Total Budget: {{ currencySymbols[trip.Currency] }}{{ totalBudget }}</h1>
      <div class="budget-categories">
        <div class="category-block" v-for="(item, index) in budget" :key="index">
          <div class="icon-and-category">
            <span class="icon">{{ getCategoryIcon(item.category) }}</span>
            <span :class="['category-name']">
              {{ item.category }}
              <span v-if="budgetExceeded[index]" class="exceeded-message">
                Budget has been exceeded!
              </span>
            </span>
          </div>
          <div class="progress-and-amount">
            <div class="progress-container">
              <div class="progress-bar" :style="{width: progressWidth(item), backgroundColor: getCategoryColor(item.category)}">
                <span :class="amountSpentClass(item, index)">
                  {{ currencySymbols[trip.Currency] }}{{ item.used }}
                </span>
              </div>
            </div>
            <div class="amount-info">
              <div class="amount-allocated"> {{ currencySymbols[trip.Currency] }}{{ item.allocated }}</div>
              <div class="amount-left">left {{ currencySymbols[trip.Currency] }}{{ item.allocated - item.used }}</div>
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
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export default {
  name: 'BudgetPage',
  data() {
    return {
      isLoading: true, // Initially true, indicating data is loading
      user: false,
      trip: { 
        TripName: "", 
        Members: [], 
        Currency: "", 
        UID: ""
      },
      currencySymbols: {
        SGD: "S$",
        AUD: "A$",
        BGN: "лв",
        BRL: "R$",
        CAD: "C$",
        CHF: "CHF",
        CNY: "¥",
        CZK: "Kč",
        DKK: "kr",
        EUR: "€",
        GBP: "£",
        HKD: "HK$",
        HRK: "kn",
        HUF: "Ft",
        IDR: "Rp",
        ILS: "₪",
        INR: "₹",
        ISK: "kr",
        JPY: "¥",
        KRW: "₩",
        MYR: "RM",
        NZD: "NZ$",
        PHP: "₱",
        PLN: "zł",
        RON: "lei",
        SEK: "kr",
        THB: "฿",
        TRY: "₺",
        USD: "$",
        ZAR: "R",
        // Add any additional currencies and their symbols here
      }, 
      totalBudget: 0, // Example total budget
      budget: [], // Array to store budget items
      showAmountOutside: {}, // This will be an object keyed by budget item index
      budgetExceeded: {}, // This will check if the set budget is exceeded
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
    progressWidth(item, index) {
      const percentageUsed = (item.used / item.allocated) * 100; // Maximum width of the progress bar is the allocated amount
      // If less than 10%, we'll show the amount outside the progress bar
      this.showAmountOutside[index] = percentageUsed < 10;
      return `${percentageUsed}%`;
    },
    getCategoryIcon(category) {
      // get the corresponding icon based on the category of the budget 
      const icons = {
        'Food': '🍽️',
        'Shopping': '🛍️',
        'Transport': '🚌',
        'Entertainment': '🎭',
        'Accommodations': '🏨',
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
        'Accommodations': '#FCC2AB',
        'Miscellaneous': '#EDA5B9',
      };
      return colors[category] || '#cccccc'; // Default color if the category is not found
    },
    editBudget() {
      // navigate users to the EditBudgetPage
      this.$router.push({
        name: 'EditBudgetPage',
        params: { tripID: this.$route.params.tripID }, 
        query: { tripName: this.$route.query.tripName } // Assuming you want to pass '123' as the tripID
      });
    },
    checkBudgetExceeded() {
      // for each budget category, check if the budget has been exceeded 
      this.budget.forEach((item, index) => {
        this.budgetExceeded[index] = item.used > item.allocated;
      });
    },
    amountSpentClass(item, index) {
      return {
        'text-danger': this.budgetExceeded[index],
        'spent-amount': !this.budgetExceeded[index],
        'amount-outside': this.showAmountOutside[index] && !this.budgetExceeded[index],
      };
    },
    determineAmountPosition() {
      // Assuming this method is called after budget data is updated
      this.budget.forEach((item, index) => {
        const percentageUsed = (item.used / item.allocated) * 100;
        this.showAmountOutside[index] = percentageUsed < 25;
      });
    },
    async fetchBudgetItems() {
      // fetch budget data from database 
      this.isLoading = true; // Make sure to set it to true when starting to fetch
      const budgetsRef = collection(db, "Trips", this.tripID, "Budgets");
      const queryRef = query(budgetsRef, orderBy("order"));

      try {
        const querySnapshot = await getDocs(queryRef);
        let budgets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Loop through each budget category to calculate the total used amount fort that category
        for (let i = 0; i < budgets.length; i++) {
          let usedAmount = 0;
          const expensesRef = collection(db, "Trips", this.tripID, "Expenses");
          const expensesQuery = query(expensesRef, where("category", "==", budgets[i].category));
          const expensesSnapshot = await getDocs(expensesQuery);

          expensesSnapshot.forEach((doc) => {
            usedAmount += Number(doc.data().amount); // Ensure 'amount' is a number
          });

          // Update the used amount in the budgets array
          budgets[i] = { ...budgets[i], used: usedAmount };
        }

        // Calculate the progress for each budget item
        budgets = budgets.map(budgetItem => ({
          ...budgetItem,
          progress: ((budgetItem.used / budgetItem.allocated) * 100).toFixed(2) + '%',
        }));

        this.budget = budgets;
        this.determineAmountPosition(); // Check if budget is above or below 25% used up, alter display accordingly 
        this.checkBudgetExceeded(); // Check if budget is still within progress bar

        // Calculate the total budget
        this.totalBudget = this.budget.reduce((acc, item) => acc + item.allocated, 0);
        this.isLoading = false; // Set it to false once data fetching is complete
      } catch (error) {
        console.error("Error fetching budget items:", error);
        this.isLoading = false; // Set it to false to prevent errors
      }
    }
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
  margin: -250px auto 0; /* Adjust top margin */
  font-family: 'Arial', sans-serif;
}

.edit-button {
  position: absolute; /* Position the button absolutely within the budget-page */
  top: 15; /* Adjust as needed */
  right: 5%; /* Adjust as needed */
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
  display: flex;
  align-items: center;
}

h1 {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 700;
  text-align: center;
  color: #333;
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
  max-width: 100%;
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

.amount-outside {
  position: absolute;
  left: calc(100% + 5px); /* Places it outside the bar */
  top: 50%;
  transform: translateY(-50%); /* Centers it vertically */
  color: black; /* Adjust the text color so it's visible */
  background: none; /* Ensures no background */
  white-space: nowrap; /* Prevents it from wrapping to the next line */
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
  font-weight: 500;
  padding: 2px 0; /* Add some padding for better spacing */
  color: #333; /* Adjust the color if needed */
  font-size: small; /* Adjust the font size if needed */
  border-radius: 5px;
  padding: 5px 10px;
}

.exceeded-message {
  color: rgb(194, 40, 40);
  margin-left: 10px;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 700;
  white-space: nowrap;
}

.text-danger {
  position: absolute;
  /* Set position at the end of the visible progress bar */
  right: 0;
  top: 50%;
  transform: translate(-10%, -50%);
  color: rgb(194, 40, 40);
  background-color: transparent;
  padding: 0 4px;
  min-width: 30px;
  text-align: center;
  border-radius: 5px;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 600;
  font-size: 0.95em;
  white-space: nowrap;
}

.loading{
  color: grey;
  margin-top: -400px;
  font-size: x-large;
}
</style>
