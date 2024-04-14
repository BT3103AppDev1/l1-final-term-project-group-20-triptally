<template> 
  <div class="main-container">
    <div class="form-container">
      <h1>Add New Expense</h1>
      <input type="date" v-model="expense.date" placeholder="Choose Date"><br>
      <input type="text" v-model="expense.title" placeholder="Title"><br>
      <input type="number" v-model="expense.amount" placeholder="Amount"><br>
      <div>
        <select v-model="expense.category">
          <option value="" disabled selected hidden>Select Category</option>
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Transport">Transport</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Accomodations">Accomodations</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </select>
      </div>
  

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
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";


export default { 
  data() { 
    return { 
      user: false, 
      trip: { 
        TripName: "",
        Members: [],
        Currency: "",
        UID: ""
      },
      expense: { 
        date: "", 
        title: "", 
        amount: "", 
        paidBy: "",
        category: "",
        splitBetween: "",
        owedMembers: []
        // this represents the userIDs of the members that owe the person that paid for this expense money 
      }
    }
  }, 
  props: { 
    tripID: String
  },
  methods: { 
    async fetchTripData() { 
      // fetch trip data from firebase 
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
    async convertMembersArray() { 
      // convert members array to their names, based on their userIDs
      // this is needed for display in the dropdown menu, so that users can select who paid for the expense 
    },
    async addExpense() {
      // call the updateDebts method, which will update the debts of each member in this group trip based on this expense 

      const tripRef = doc(db, "Trips", this.trip.UID);
      // Introduce a dummy document ID or meaningful document (e.g., the date as a document)
      const dateDocRef = doc(collection(tripRef, "Expenses"), this.expense.date); // Use date as a document ID

      // Now create a collection under this document
      const specificExpenseRef = collection(dateDocRef, "Details");

      // Now add the expense details as a document within this new collection
      const expenseDetailRef = doc(specificExpenseRef); // Firestore generates a unique document ID
      try {
        await setDoc(expenseDetailRef, {
          title: this.expense.title,
          amount: this.expense.amount,
          paidBy: this.expense.paidBy,
          category: this.expense.category,
          currency: this.trip.Currency, 
        });
        console.log("Expense added successfully under date:", this.expense.date);
      } catch (error) {
        console.error("Error adding expense:", error);
      }
    }
  }, 
  mounted() { 
    this.fetchTripData(); 
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
      }
    })
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


input[placeholder="Choose Date"], input[placeholder="Title"], input[placeholder="Amount"], select {
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

select { 
  width: 60%;
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