<template>
  <div class="main-container">
  <!-- <SideNavBar :tripName="tripName"></SideNavBar> -->
  <div v-if="user">
    <SideNavBar :tripName="$route.query.tripName" :tripID="$route.params.tripID"></SideNavBar>
    <div class="expenses-analytics">


    </div>
  </div>
  <!-- <div class="content-container">
      <h1>Analytics & Reports</h1>
      <div class="wrapper">
      <div class="budgetExpenseWrapper">
        <div class="budgetTot">
          <h3>Total Budget</h3>
          <h2>{{ currency }} {{ totalBudget }}</h2>
        </div>
        <div class="expenseTot">
          <h3>Total Expense</h3>
          <h2>{{ currency }} {{ totalExpense }}</h2>
        </div>
      </div>
      <div class="spending">
        <h3>Spending This Trip</h3>
      </div>
    </div> --->
  </div>
  <!-- </div> -->
</template>

<script>
import { ref, onMounted } from 'vue';
import SideNavBar from './SideNavBar.vue';
import { auth, db } from '@/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: 'AnalyticsPage',
  data() { 
    return { 
      trip: { 
        TripName: "", 
        Members: [], 
        Currency: "",
        UID: ""
      },
      user: false, 
      groupedExpenses: {}
    }
  },
  methods: { 
    async fetchExpensesData() {
      // Fetch all the expenses logged for this trip
      const tripRef = doc(db, "Trips", this.trip.UID);
      const expensesRef = collection(tripRef, "Expenses");

      // Create a query against the collection, ordering by the 'date' field in descending order
      const q = query(expensesRef, orderBy("date", "desc"));
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
      const groupedExpenses = expenses.reduce((acc, expense) => {
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
        subtitle: `${expense.paidByFirstName} ${expense.paidByLastName} paid ${expense.currency} ${(expense.amount).toFixed(2)}`,
        sideDisplayText: displayText
        // amount: expense.amount  // You might want to format or calculate the amount differently
      });

      return acc;
      }, {});

      // Update your component state or data object
      this.groupedExpenses = groupedExpenses;
      console.log(groupedExpenses);
    }
  }, 
  setup() {
    const currency = ref("");
    const totalBudget = ref(0);
    const totalExpense = ref(0);
    const tripName = ref("");
    onMounted(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userID = currentUser.uid;
        const currencyDoc = await getDoc(doc(db, "Currency", userID));
        if (currencyDoc.exists()) {
          currency.value = currencyDoc.data().SelectedCurrency;
        }
        // Dummy values for budget and expense, adjust as necessary
        totalBudget.value = 1500;
        totalExpense.value = 999;
        tripName.value = "dummy until we implement trip collection";
        //there was no issue with the formatting, the trip name was just hardcoded 
        //so it disappeared on this page bc it extracts info from firebase.
      }
    });

    return {
      currency,
      totalBudget,
      totalExpense,
      tripName
    };
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


<style scoped>
.main-container { 
  display: flex;
  align-items: center;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
}

.content-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 2rem;
  align-items: center;
  justify-content: flex-start;
}

h1 {

  color: black;
  
}

h3 {
  font-size: 12px;
  font-weight: normal;
  color: gray;
}

.wrapper {
  display: flex;
  flex-direction: row; 
  justify-content: space-around;
  margin-top: 2rem;
}

.budgetExpenseWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.budgetTot,
.expenseTot {
  width: 200px;
  height: 120px;
  padding: 15px;
  border-radius: 25px;
  background-color: white;
  margin: 10px;
  text-align: center;
  font-weight: 700;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
}

.spending {
  width: 500px;
  height: 400px;
  background-color: white;
  margin-top: 10px;
  margin-left: 10px;
  padding: 15px;
  border-radius: 25px;
  text-align: center;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
}
</style>