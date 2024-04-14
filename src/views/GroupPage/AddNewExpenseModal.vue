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
          <option v-for="member in this.trip.MemberDetails" :key="member.UID" :value="member.UID">
            {{ member.FirstName }} {{ member.LastName }}
          </option>
        </select>
      </div>
      
      <div class="split-between">
        <span>and split between</span>
        <select v-model="expense.splitBetween">
          <option value="Everyone">Everyone</option>
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
import { collection, doc, setDoc, getDoc, updateDoc, increment, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";


export default { 
  data() { 
    return { 
      user: false, 
      trip: { 
        TripName: "",
        Members: [],
        MemberDetails: [],
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
  
      const docSnap = await getDoc(tripDocRef); 
      if (docSnap.exists()) { 
        const data = docSnap.data(); 
        this.trip.TripName = data.TripName; 
        this.trip.Currency = data.Currency; 
        this.trip.Members = data.Members;
        this.trip.UID = this.$route.params.tripID; 
      } else { 
        console.log("Error");
      }
    }, 
    async convertMembersArray() { 
      // this.trip.Members contains an array of the userIDs of all members in the trip
      // this.trip.MemberDetails contains objects each containing the details of each member of the trip 

      // in this function, we are trying to use this.trip.Members array to to create this.trip.MemberDetails
      // this is needed for display in the dropdown menu, so that we can display the names of each user in the dropdown menu, and users can select who paid for the expense 
      console.log(this.trip.Members);
      const q = query(collection(db, "Users"), where ('__name__', 'in', this.trip.Members));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => { 
        console.log(doc.id, " => ", doc.data());
        this.trip.MemberDetails.push({ 
          ...doc.data(), 
          UID: doc.id,
      });
      })
    },
    async updateDebts() { 
      console.log("Update Debts function called")
      // for now user can only select "Everyone" to split between, cos i'm not too sure how to make the dropdown thingy such that different users can be selected (and more than 1 user) 
      if (this.expense.splitBetween === "Everyone") { 
        this.expense.owedMembers = this.trip.Members;
      }

      // for each member of the owedMembers array, we will update their debt in firebase 
      for (const memberID of this.expense.owedMembers) { 
        if (memberID === this.expense.paidBy) { 
          // this is supposed to check if the memberID corresponds to the user that paid for this expense 
          
        } else { 
          const tripRef = doc(db, "Trips", this.trip.UID);
          const owedMemberDocRef = doc(collection(tripRef, "Debts"), memberID); // this is the person that owes the payer money 
          const paidMemberDocRef = doc(collection(tripRef, "Debts"), this.expense.paidBy); // this is the person that has paid firsdt 

          // Now create/access the "Who Owes User" collection for the payee and the "User Owes Who" collection for the person that owes the payer money 
          const oweUserRef = collection(paidMemberDocRef, "Who Owes User");
          const userOwesRef = collection(owedMemberDocRef, "User Owes Who");

          const oweUserDoc = doc(oweUserRef, memberID); 
          const userOwesDoc = doc(userOwesRef, this.expense.paidBy); 

          const amountOwed = Number((this.expense.amount / (this.expense.owedMembers.length)).toFixed(2));

          try { 
            await setDoc(oweUserDoc, { 
              amount: increment(amountOwed),
              currency: this.trip.Currency
            }, { merge: true });
            console.log(`${memberID} owes ${this.expense.paidBy} $${amountOwed}`);

            await setDoc(userOwesDoc, { 
              amount: increment(amountOwed),
              currency: this.trip.Currency
            }, { merge: true });
            console.log(`${this.expense.paidBy} has a debtor with memberID ${memberID} who owes him/her $${amountOwed}`);

          } catch (error) { 
            console.error(error); 
          }
        }
      }
    }, 
    async addExpense() {
      // call the updateDebts method, which will update the debts of each member in this group trip based on this expense
      await this.updateDebts();  

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
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        await this.fetchTripData();
        await this.convertMembersArray();
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