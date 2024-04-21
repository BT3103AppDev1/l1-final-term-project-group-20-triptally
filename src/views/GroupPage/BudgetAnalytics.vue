<template>
  <div class="budget-analytics-container">
    <div class="totals-container">
      <div class="budgetTot">
        <div class="budget-label">Total Budget</div>
        <h2>{{ currencySymbols[this.trip.Currency] }}{{ totalBudget }}</h2>
      </div>
      <div class="expenseTot">
        <div class="budget-label">Total Expense</div>
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
import { setBlockTracking } from 'vue';
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
        'Food': '#16697A',
        'Shopping': '#489FB5',
        'Transport': '#82C0CC',
        'Entertainment': '#EDE7E3',
        'Accommodations': '#B8D4D8',
        'Miscellaneous': '#FFA62B',
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
        type: 'doughnut',
        data,
        options: {
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'black',
                font: { 
                  family: "'Montserrat', sans-serif",
                  weight: 500,
                  size: 12,
                }
              }
            }
          },
          cutout: '60%',
        }
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
  margin-right: 5%;
}

.budget-label {
  display: flex;
  align-items: left;
  font-size: 13px;
  color: grey;
}

.budgetTot,
.expenseTot {
  width: 200px; /* You might need to adjust this based on your content */
  height: 80px;
  padding: 15px;
  border-radius: 25px;
  background-color: white;
  text-align: center;
  font-weight: 700;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.1); 
}

.expenseTot {
  margin-top: 25px; /* Space between budget and expense totals */
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.1); 
}

.chart-header {
  margin-bottom: 10px; /* Add space between the chart header and the chart */
  font-weight: bold;
  font-size: 25px;
}

/* Ensure the canvas has a defined height */
canvas {
  height: 300px !important; /* Override the Chart.js canvas height */
  width: 90% !important; /* Full width of the container */
}
</style>