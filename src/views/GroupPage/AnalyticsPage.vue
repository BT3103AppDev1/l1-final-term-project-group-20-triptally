<template>
  <!-- <div class="main-container"> -->
    <!-- <SideNavBar :tripName="tripName"></SideNavBar> -->
    <SideNavBar></SideNavBar>
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
    </div>
  </div> -->
  <!-- </div> -->
</template>

<script>
import { ref, onMounted } from 'vue';
import SideNavBar from './SideNavBar.vue';
import { auth, db } from '@/firebase';
import { getDoc, doc } from 'firebase/firestore';

export default {
  name: 'AnalyticsPage',
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
  }
};
</script>


<style scoped>
.main-container {
  display: flex;
  
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