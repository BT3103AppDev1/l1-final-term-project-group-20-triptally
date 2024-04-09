<template>
  <div class="app-container">
  <SideNavBar :tripName="$route.params.tripName"></SideNavBar>
  <div v-if="!showAddExpenseModal" class="main-container">
    <div class="debt-container">
    <!-- You Are Owed Section -->
    <div class="owed-container">
      <h2>YOU ARE OWED <span class="amount">MYR 30</span> IN TOTAL</h2>
      <div class="individual-debt" v-for="(debt, index) in debtsOwedToYou" :key="index">
        <div class="initials">{{ debt.initials }}</div>
        <div class="details">
          <span class="name">{{ debt.name }} owes you</span>
          <span class="amount">{{ debt.amount }}</span>
        </div>
        <button class="remind-btn">Remind</button>
      </div>
    </div>
    
    <!-- You Owe Section -->
    <div class="owe-container">
      <h2>YOU OWE <span class="amount">MYR 40</span> IN TOTAL</h2>
      <div class="individual-debt" v-for="(debt, index) in debtsYouOwe" :key="index">
        <div class="initials">{{ debt.initials }}</div>
        <div class="details">
          <span class="name">You owe {{ debt.name }}</span>
          <span class="amount">{{ debt.amount }}</span>
        </div>
        <button class="clear-btn">Clear Debt</button>
      </div>
    </div>
  </div>

  <h2 class="expense-list-heading">LIST OF EXPENSES</h2>
  <div class="expenses-list-container">
    <div class="date-expense-group" v-for="(expenses, date) in groupedExpenses" :key="date">
      <div class="date">{{ date }}</div>
      <div class="expenses" v-for="expense in expenses" :key="expense.id">
        <div class="expense-item">
          <div class="expense-icon">
            <!-- icon placeholder -->
          </div>
          <div class="expense-details">
            <div class="expense-title">{{ expense.title }}</div>
            <div class="expense-subtitle">{{ expense.subtitle }}</div>
          </div>
          <div class="expense-amount" :class="{ 'no-balance': !expense.balance }">
            {{ expense.amount }}
          </div>
          <div class="expense-balance" v-if="expense.balance">
            {{ expense.balance }}
          </div>
        </div>
      </div>
    </div>
    <!-- Add Expense Button -->
    <button class="add-expense-btn" @click="showAddExpenseModal = true">+</button>
    <div>
      
    </div>
    
  </div>
  
  </div>

  <div v-else>
    <AddNewExpenseModal></AddNewExpenseModal>
  </div>
</div>


</template>


<script>
import SideNavBar from './SideNavBar.vue';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AddNewExpenseModal from './AddNewExpenseModal.vue';

export default {
  data() { 
    return { 
      user: false,
      debtsOwedToYou: [
        { initials: "YA", name: "Yuki Ang", amount: "MYR 20" },
        { initials: "VK", name: "Vanessa Koh", amount: "MYR 10" }
      ],
      debtsYouOwe: [
        { initials: "HQ", name: "Hui Qian Khoo", amount: "MYR 10" },
        { initials: "CT", name: "Calista Tan", amount: "MYR 30" }
      ],
      groupedExpenses: {
        '25/02/2024': [
          { id: 1, title: 'Dinner at Petaling Street Market', subtitle: 'Calista Tan paid MYR 100', amount: 'You borrowed MYR 30.00'},
          { id: 2, title: 'Clothes from thrift store', subtitle: 'You paid MYR 50', amount: 'No balance' }
        ],
        '24/02/2024': [
          { id: 3, title: 'Karaoke', subtitle: 'Hui Qian Khoo paid MYR 50', amount: 'You borrowed MYR 10' },
          { id: 4, title: 'Lunch by the river', subtitle: 'You paid MYR 100', amount: 'You lent MYR 80.00' }
        ]
      },
      showAddExpenseModal: false,
    };
  },
  components: {
    SideNavBar,
    AddNewExpenseModal
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
      }
    })
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh; 
}

.main-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  padding-top: 20px;
  overflow: hidden;
}

.debt-container {
  width: calc(100% - 100px); 
  display: flex;
  justify-content: space-between; 
  margin-top: 20px;
  margin-bottom: 20px;
}

.owed-container,
.owe-container {
  flex: 1;
  min-width: 0; 
  padding: 1rem; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden; 
  margin-left: 20px;
}

.owed-container h2,
.owe-container h2 {
  white-space: nowrap; 
  text-align: center;
}

.owed-container .amount {
  display: inline; 
  font-weight: bold;
  margin-left: 20px;
  margin-right: 20px;
  color: rgb(75, 159, 131);
}

.owe-container .amount {
  display: inline; 
  font-weight: bold;
  margin-left: 20px;
  margin-right: 20px; 
  color:#d9534f;
}

.individual-debt {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.initials {
  background: #ececec; 
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  font-weight: bold;
}

.details {
  flex-grow: 1;
}

.name {
  display: block;
  font-size: 20px;
}

.amount {
  display: block;
  font-weight: bold;
}

.remind-btn,
.clear-btn {
  border: none;
  padding: 10px;
  width: 150px;
  border-radius: 10px;
  cursor: pointer;
}

.remind-btn {
  background: #FFA62B; 
  color: white;
  font-family: 'Montserrat', sans-serif;
}

.clear-btn {
  background: #5eaac7; 
  color: white;
  font-family: 'Montserrat', sans-serif;
}

.amount {
  font-size: 1.5em; 
  color: #d9534f; 
}

.expenses-list-container {
  max-width: 600px;
  padding: 50px;
  background: #f8f9faac;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px auto; 
  height: 300px; 
  overflow-y: auto; 
}

.expense-list-heading {
  color: black;
}

.date-expense-group {
  margin-bottom: 20px;
}

.date {
  background-color: #82C0CC; 
  color: #333; 
  padding: 5px 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  width: 100%;
}

.expense-item {
  display: flex;
  align-items: center;
  background: #fff;
  margin-bottom: 10px;
  border-radius: 10px;
  padding: 15px;
  width: 100%; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.expense-details {
  flex-grow: 1;
  margin-left: 10px;
}

.expense-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.expense-subtitle {
  color: #555; 
  font-size: 0.9em;
}

.expense-amount {
  margin-left: 10px;
  color: #5cb85c; 
}

.expense-amount.no-balance {
  color: #aaa; 
}

.expense-balance {
  color: #d9534f; 
}

.add-expense-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #ffcc00;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.add-expense-btn:hover {
  background-color: #e6b800;
}

</style>