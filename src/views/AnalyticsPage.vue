<template>
  <div class="container">
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
  </div>
</template>


<script>
import { auth, db } from '@/firebase';
import { ref, onMounted } from "vue"; 
import { collection, doc, getDoc } from "firebase/firestore";

const currency = ref("");
onMounted(async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {

    const userID = currentUser.uid;
    const currencyDoc = await getDoc(doc(db, "Currency", userID));
    if (currencyDoc.exists()) {
      currency.value = currencyDoc.data().SelectedCurrency;
    }

    totalBudget.value = 1500;
    totalExpense.value = 999;
  }
});

export default {
  name: 'AnalyticsPage'
}

</script>
<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-image: none;
  background-color: #EDE7E3;
}

h1 {

  color: black;
  /* margin-left: 5vw; */
}

h3 {
  font-size: 12px;
  font-weight: normal;
  color: gray;
}

.wrapper {
  display: flex;
  flex-direction: row; /* Changed from column to row */
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