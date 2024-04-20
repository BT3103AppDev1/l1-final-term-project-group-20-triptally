<template>
  <div class="budget-analytics-container">
    <div class="totals-container">
      <div class="budgetTot">
        <h3>Total Budget</h3>
        <h2>{{ currencySymbols[this.trip.Currency] }}{{ totalBudget }}</h2>
      </div>
      <div class="expenseTot">
        <h3>Total Expense</h3>
        <h2>{{ currencySymbols[this.trip.Currency] }}{{ totalExpense }}</h2>
      </div>
    </div>
    <div class="chart-container">
      <div class="chart-header">Breakdown of Expenses</div>
      <canvas ref="expensesChart"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import { db } from '@/firebase';
import { doc, collection, getDocs, getDoc, query } from 'firebase/firestore';
Chart.register(...registerables);


export default {
  name: 'BudgetAnalytics',
  props: ['tripID', 'Currency'],
  data() {
    return {
      user: false,
      trip: { 
        TripName: "", 
        Members: [], 
        Currency: "", 
        UID: ""
      },
      currencySymbols: {
        USD: "$",
        JPY: "¥",
        SGD: "S$",
        AUD: "A$",
        CAD: "C$",
        CHF: "₣",
        CNY: "¥",
        EUR: "€",
        GBP: "£",
        KRW: "₩",
        MYR: "RM",
        NZD: "NZ$",
        SEK: "kr",
        // Add more currencies as needed
      },
      chart: null,
      totalBudget: 0,
      totalExpense: 0, // Define totalExpense here
      categoryOrder: ['Food', 'Shopping', 'Transport', 'Entertainment', 'Accommodations', 'Miscellaneous'],
      categoryColors: {
        'Food': '#B2DFAB',
        'Shopping': '#F0E694',
        'Transport': '#ABD9EA',
        'Entertainment': '#DDC9F7',
        'Accommodations': '#FCC2AB',
        'Miscellaneous': '#EDA5B9',
      },
    };
  },
  methods: {
    async fetchTripData() { 
      const tripDocRef = doc(db, "Trips", this.tripID); 
      const docSnap = await getDoc(tripDocRef); 
      if (docSnap.exists()) {
        this.trip = docSnap.data(); 
        this.trip.UID = this.tripID;
      }
    },
    async fetchAndPlotExpenses() {
      if (!this.tripID) {
        console.error("TripID is not provided in BudgetAnalytics.");
        return;
      }

      console.log("Fetching expenses for tripID:", this.tripID);
      const expensesRef = collection(db, "Trips", this.tripID, "Expenses");
      const expensesSnapshot = await getDocs(query(expensesRef));

      const expensesByCategory = {};
      let totalExpense = 0;
      expensesSnapshot.forEach((doc) => {
        const { category, amount } = doc.data();
        const amountNumber = Number(amount);
        expensesByCategory[category] = (expensesByCategory[category] || 0) + amountNumber;
        totalExpense += amountNumber;
      });

      this.totalExpense = totalExpense; // Update totalExpense directly

      console.log("Expenses by category:", expensesByCategory);
      console.log("Total expenses:", this.totalExpense); // Use this.totalExpense

      this.plotChart(Object.keys(expensesByCategory), Object.values(expensesByCategory));
    },
    
    async fetchBudgetItems() {
      if (!this.tripID) {
        console.error("TripID is not provided for fetching budget items.");
        return;
      }

      const budgetsRef = collection(db, "Trips", this.tripID, "Budgets");
      const querySnapshot = await getDocs(query(budgetsRef));

      this.totalBudget = querySnapshot.docs.reduce((acc, doc) => acc + Number(doc.data().allocated), 0);
      console.log("Total budget:", this.totalBudget);
      this.$emit('update:totalBudget', this.totalBudget);
    },
    
    plotChart(categories, amounts) {
      // Filter categories based on the fixed order
      const orderedCategories = this.categoryOrder.filter(cat => categories.includes(cat));

      const data = {
        labels: orderedCategories,
        datasets: [{
          label: 'Expenses by Category',
          data: orderedCategories.map(cat => amounts[categories.indexOf(cat)]),
          backgroundColor: orderedCategories.map(cat => this.categoryColors[cat]),
          borderColor: orderedCategories.map(cat => this.categoryColors[cat]),
          borderWidth: 1
        }]
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
      };

      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = this.$refs.expensesChart.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'pie',
        data,
        options
      });
    }
  },
  mounted() {
    if (this.tripID) {
      this.fetchTripData();
      this.fetchAndPlotExpenses();
      this.fetchBudgetItems();
    }
  },
  watch: {
    tripID(newVal) {
      if (newVal) {
        this.fetchAndPlotExpenses();
        this.fetchBudgetItems();
      }
    }
  },
};
</script>

<style scoped>
.budget-analytics-container {
  display: flex;
  justify-content: space-around; /* Adjust as needed to space out the totals and chart */
  align-items: center; /* Align items vertically */
  max-width: 1200px; /* Adjust based on your preference */
  margin: auto; /* Center the container */
}

.totals-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align text to the left */
  background-color: white;
  padding: 20px; /* Add some padding */
  border-radius: 25px; /* Rounded corners */
  margin-right: 20px; /* Add space between the totals and the chart */
}

.budgetTot,
.expenseTot {
  width: 200px; /* You might need to adjust this based on your content */
  height: 120px;
  padding: 15px;
  border-radius: 25px;
  background-color: white;
  margin-bottom: 10px; /* Space between budget and expense totals */
  text-align: center;
  font-weight: 700;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
}

.chart-container {
  flex-grow: 1; /* Take up remaining space */
  background-color: rgb(255, 255, 255);
  padding: 20px;
  border-radius: 25px;
  display: flex;
  flex-direction: column; /* Align items vertically */
  align-items: center; /* Center the chart */
  width: 400px;
}

.chart-header {
  margin-bottom: 10px; /* Add space between the chart header and the chart */
  font-weight: bold;
}

/* Ensure the canvas has a defined height */
canvas {
  height: 400px !important; /* Override the Chart.js canvas height */
  width: 100% !important; /* Full width of the container */
}
</style>