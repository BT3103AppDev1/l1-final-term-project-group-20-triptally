<template>
  <div class="main-container">
  <!-- <SideNavBar :tripName="tripName"></SideNavBar> -->
  <div v-if="user">
    <SideNavBar :tripName="$route.query.tripName" :tripID="$route.params.tripID"></SideNavBar>
  </div>
  <div class="content-container">
      <h1>Analytics & Reports</h1>
      <div class="budget-wrapper">
        <div class="budget-analytics">
            <BudgetAnalytics :tripID="$route.params.tripID" @update:totalExpense="totalExpense = $event" @update:totalBudget="totalBudget = $event" />
        </div>
      <div class="expense-wrapper">
        <div class="expenses-analytics">
          <ExpensesAnalytics :tripID="trip.UID"/>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { ref, onMounted } from 'vue';
import SideNavBar from './SideNavBar.vue';
import { auth, db } from '@/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ExpensesAnalytics from './ExpensesAnalytics.vue';
import BudgetAnalytics from './BudgetAnalytics.vue';

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
    SideNavBar, 
    BudgetAnalytics,
    ExpensesAnalytics
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
  margin-top: -200px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
}

h1 {
  position: relative;
  color: black;
  
}

h3 {
  font-size: 12px;
  font-weight: normal;
  color: gray;
}

.budget-wrapper, .expense-wrapper {
  display: flex;
  flex-direction: column; 
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