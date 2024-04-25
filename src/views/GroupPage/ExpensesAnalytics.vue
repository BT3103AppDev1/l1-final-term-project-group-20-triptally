<template>
<canvas id="expensesGraph" height="400" width="700"></canvas>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '@/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  plugins
} from 'chart.js';
import Chart from 'chart.js/auto';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default { 
  name: 'ExpensesAnalytics', 
  data() { 
    return { 
      user: false, 
      chartData: null,
      chart: null,
      options: {
        scales: { 
          xAxes: [{
            type: 'time'
          }]
        },
        responsive: true,
        maintainAspectRatio: false,
      },
      expenses: {},
      trip: { 
        Currency: "",
        TripName: "", 
        Members: [], 
        UID: ""
      }, 
      groupedExpenses: {}
    }
  },
  props: {
    tripID: String,
    tripCurrency: String
  },
  methods: { 
    async fetchExpensesData() {
      // Fetch all the expenses logged for this trip
      const tripRef = doc(db, "Trips", this.tripID);
      const expensesRef = collection(tripRef, "Expenses");

      // Create a query against the collection, ordering by the 'date' field in descending order
      const q = query(expensesRef, orderBy("date", "asc"));
      const querySnapshot = await getDocs(q);
      const userCache = {};

      // Helper function to fetch user details
      const fetchUserDetails = async (userId) => {
        if (!userCache[userId]) {
          const userRef = doc(db, "Users", userId);
          const userSnap = await getDoc(userRef);
          userCache[userId] = userSnap.exists() ? userSnap.data() : { firstName: "Unknown", lastName: "" };
        }
        return userCache[userId];
      };

      // Fetch user details for each expense and map them
      const expenses = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const expenseData = doc.data();
        var userDetails; 
        if (expenseData.paidBy === this.user.uid) { 
          userDetails = { 
            FirstName: "You", 
            LastName: ""
          }
        } else { 
          userDetails = await fetchUserDetails(expenseData.paidBy);
        }
        return {
          id: doc.id,
          ...expenseData,
          date: expenseData.date.toDate(),  // Convert Timestamp to JavaScript Date
          paidByFirstName: userDetails.FirstName, 
          paidByLastName: userDetails.LastName
        };
      }));

      // this function will group the expenses according to their dates 
      this.groupExpensesByDate(expenses);
    }, 
    async groupExpensesByDate(expenses) { 
      const tempGroupedExpenses = expenses.reduce((acc, expense) => {
      // Format the date as 'dd/mm/yyyy'
      const expenseDate = expense.date.toLocaleDateString('en-GB');  // Change locale as needed

      // Initialize the array if this date hasn't been added to the accumulator
      if (!acc[expenseDate]) {
        acc[expenseDate] = [];
      }

      const amountEachUserOwes = (expense.amount / (expense.owedMembers.length + 1)).toFixed(2); 
      //console.log(expense.owedMembers);
      var displayText; 

      if (expense.owedMembers.indexOf(this.user.uid) > -1 ) { 
        // this means that the user owes the money, so you must display ' you borrowed ....'
        displayText = `You borrowed ${this.trip.Currency} ${amountEachUserOwes}`;

      } else if (expense.paidBy === this.user.uid) { 
        // this means that the user is the one that paid for the expense, so must display ' you lent ...' 
        displayText = `You lent ${this.trip.Currency} ${(expense.amount - amountEachUserOwes).toFixed(2)}`;
      } else { 
        // this means that the user is neither the borrower nor the payer - user is not involved in the expense 
        displayText = 'No balance';
      }

      // Push the current expense to the array for this date
      acc[expenseDate].push({
        id: expense.id,
        title: expense.title,
        category: expense.category,
        amount: expense.amount
      });

      return acc;
      }, {});

      // Now sort the keys of tempGroupedExpenses in ascending order and rebuild the groupedExpenses
      const sortedDates = Object.keys(tempGroupedExpenses).sort((a, b) => new Date(a) - new Date(b));
      this.groupedExpenses = sortedDates.reduce((sortedAcc, date) => {
        sortedAcc[date] = tempGroupedExpenses[date];
        return sortedAcc;
      }, {});

      // Now that our data is grouped according to date, calculate the daily total expenses
      this.calculateDailyTotals();
    },
    async fetchTripData() { 
      // fetch trip data from database
      const tripDocRef = doc(db, "Trips", this.tripID); 
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
    calculateDailyTotals() { 
      // Helper function to calculate the daily total expensees 
      const totals = {};
      for (const date in this.groupedExpenses) {
        totals[date] = this.groupedExpenses[date].reduce((sum, expense) => {
          return sum + Number(expense.amount); // Make sure 'expense.amount' is a number and not a string
        }, 0);
      }

      // using the daily total expenses, plot a line graph over time 
      this.plotLineGraph(totals);
    }, 
    plotLineGraph(totals) { 
      const dates = Object.keys(totals);
      const expenses = Object.values(totals);

      this.chartData = { 
        labels: dates, 
        datasets: [
          { 
            label: "Total Daily Expenses",
            tension: 0.3,
            pointRadius: 2,
            backgroundColor: '#16697A',
            borderColor: "#16697A",
            data: Object.values(totals)
          }
        ]
      }

    }
  }, 
  mounted() { 
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        await this.fetchExpensesData();
        const config = { 
          type: 'line',
          data: this.chartData, 
          options: { 
            responsive: true,
            interaction: { 
              intersect: false,
            },
            plugins: { 
              legend: { 
                display: false
              },
              title: { 
                display: true,
                text: "Total Daily Expenses",
                color: 'black',
                font: { 
                  family: "'Montserrat', sans-serif",
                  weight: 'bold',
                  size: 25,
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: "",
                  font: {
                    size: 12,
                    family: "'Montserrat', sans-serif",
                  }
                },
                grid: {
                  drawTicks: false,
                },
                border: {
                  dash: [5, 10],
                },
              },
              x: {
                ticks: {
                  color: "",
                  font: {
                    size: 12,
                    family: "'Montserrat', sans-serif",
                  }
                },
                grid: {
                  display: false,
                },
                border: {
                  display: false,
                },
              },
            },
            tooltips: { 
              callbacks: { 
                label(tooltipItem, data) { 
                  // Get the dataset label.
                  const label = data.datasets[tooltipItem.datasetIndex].label;

                  const value = numeral(tooltipItem.yLabel).format('$0, 0');
                  return `${label} : ${value}`;
                }
              }
            },
            maintainAspectRatio: false
          }
        }
        const canvasTag = document.getElementById("expensesGraph");
        const expensesGraph = new Chart(
          canvasTag,
          config
        )
      }
    })
  }
}

</script>

<style>
#expensesGraph { 
  background-color: white;
  padding: 20px;
  margin-top: 5%;
  margin-bottom: 5%;
  border-radius: 25px;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.1); 
}
</style>