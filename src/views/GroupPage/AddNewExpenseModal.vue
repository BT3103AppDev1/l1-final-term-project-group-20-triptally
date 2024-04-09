<template> 
  <div class="main-container">
    <div class="form-container">
      <h1>Add New Expense</h1>
      <input type="date" v-model="expense.date" placeholder="Choose Date"><br>
      <input type="text" v-model="expense.title" placeholder="Title"><br>
      <input type="number" v-model="expense.amount" placeholder="Amount"><br>

      <div class="paid-split-container">
      <div class="paid-by">
        <span>Paid by</span>
        <select v-model="expense.paidBy">
          <option value="you">You</option>
          <!-- Add more options here for other members -->
        </select>
      </div>
      
      <div class="split-between">
        <span>and split between</span>
        <select v-model="expense.splitBetween">
          <option value="everyone">Everyone</option>
          <!-- Add more options here for individual members or custom splits -->
        </select>
      </div>
    </div>

    <button @click="addExpense">Add Expense!</button>

    </div>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export default { 
  data() { 
    return { 
      expense: { 
        date: "", 
        title: "", 
        amount: "", 
        paidBy: ""
      }
    }
  }, 
  props: { 
    trip: Object
  },
  methods: { 
    fetchTripData() { 
      // fetch trip data from firebase 

    }, 
    addExpense() { 
      // add this new expense as a document in the "Expenses" collection in the specific trip document 
      db.collection('Trips').doc(this.tripID).collection('Expenses').setDoc({
        Title: this.title, 
        Amount: this.amount, 
        PaidBy: this.paidBy
      })
    }
  }, 
  mounted() { 
    this.fetchTripData(); 
  }
}
</script>

<style scoped>

.main-container { 
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%; 
  display: flex;
}

.form-container { 
  padding: 20px;
  background: #16697ae4;
  color: white;
  border-radius: 20px;
  width: 80%;
  position: relative; 
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

input[placeholder="Choose Date"], input[placeholder="Title"], input[placeholder="Amount"] {
  width: 58%;
  /* Full width minus padding */
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
  /* Space between inputs */
  border: 0px solid #ddd;
  border-radius: 10px;
  font-size: medium;
  font-family: 'Montserrat', sans-serif;
}

.form-container h1 { 
    color: white; 
}

button {
  background-color: #82C0CC; /* Replace with your color */
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  /* Other styling */
}

button:hover {
  background-color: #71a9b4; /* Replace with your color */
}


</style>