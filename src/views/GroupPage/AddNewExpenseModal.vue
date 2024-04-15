<template> 
  <div class="main-container">
    <div class="form-container">
      <button @click="returnToMainExpensesPage">Back</button>
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
import { collection, doc, setDoc, getDoc, updateDoc, increment, query, where, getDocs, Timestamp, arrayUnion, FieldValue, deleteField } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SideNavBar from './SideNavBar.vue';


export default { 
  name: 'AddNewExpenseModal',
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
  emits: ['returnToMainPage'],
  props: { 
    tripID: String
  },
  components: {
    SideNavBar
  },
  methods: { 
    returnToMainExpensesPage() { 
      this.$emit('returnToMainPage');
    },
    async fetchTripData() { 
      // fetch trip data from firebase 
      const tripDocRef = doc(db, "Trips", this.$route.params.tripID); 
  
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
      const q = query(collection(db, "Users"), where ('__name__', 'in', this.trip.Members));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => { 
        this.trip.MemberDetails.push({ 
          ...doc.data(), 
          UID: doc.id,
      });
      })
    },
    async updateDebts(expenseID) { 

      // for now user can only select "Everyone" to split between, cos i'm not too sure how to make the dropdown thingy such that different users can be selected (and more than 1 user) 
      if (this.expense.splitBetween === "Everyone") { 
        this.expense.owedMembers = this.trip.Members.filter(memberID => memberID !== this.expense.paidBy);
      }

      // for each member of the owedMembers array, we will update their debt in firebase
      for (const memberID of this.expense.owedMembers) { 
      
        const tripRef = doc(db, "Trips", this.trip.UID);
        const owedMemberDocRef = doc(collection(tripRef, "Debts"), memberID); // this is the person that owes the payer money 
        const paidMemberDocRef = doc(collection(tripRef, "Debts"), this.expense.paidBy); // this is the person that has paid first 

        // Now create/access the "Who Owes User" collection for the payee and the "User Owes Who" collection for the person that owes the payer money 
        const paidMemberWhoOwesUserRef = collection(paidMemberDocRef, "Who Owes User"); // this is the payer's "Who Owes User" collection
        const paidMemberUserOwesWhoRef = collection(paidMemberDocRef, "User Owes Who"); // this is the payer's "User Owes Who" collection
        const owedMemberUserOwesWhoRef = collection(owedMemberDocRef, "User Owes Who"); // this is the ower's "User Owes Who" collection
        const owedMemberWhoOwesUserRef = collection(owedMemberDocRef, "Who Owes User");  // this is the ower's "Who Owes User" collection
        const amountOwed = Number((this.expense.amount / (this.expense.owedMembers.length + 1)).toFixed(2)); // this is the amount that is owed by user 

        // check whether the paid member currently owes this member any money - if yes, minus off from there
        const memberDocRef = doc(paidMemberUserOwesWhoRef, memberID); 
        const memberDocSnapshot = await getDoc(memberDocRef);

        if (memberDocSnapshot.exists()) { 
          // means the paid member currently owes this member money - minus off this member's debt to the paid member from there 
          console.log("Paid member currently owes owed member money!")

          const paidMemberData = memberDocSnapshot.data();
          if (paidMemberData.totalAmount >= amountOwed) { 
            // if the amount that the payer currently owes the ower is greater than the amount that the ower owes the payer, then 
            //  we will minus away amountOwed from paidMemberData.totalAmount 
            try { 
              await updateDoc(doc(paidMemberUserOwesWhoRef, memberID), { 
                totalAmount: increment(-amountOwed)
              })
            } catch (error) { 
              console.error(error);
            }
            
          } else { 
            // if the amount that the payer currently owes the ower is smaller than the the amount that the ower owes the payer, then 
            // we will minus away the amount that the payer currently owes the ower, 
            // and record in firebase the remaining amount that the ower owes the payer 
            try { 

              const paidMemberUserOwesWhoDoc = doc(paidMemberUserOwesWhoRef, memberID);
              const owedMemberWhoOwesUserDoc = doc(owedMemberWhoOwesUserRef, this.expense.paidBy);
              await updateDoc(paidMemberUserOwesWhoDoc, { 
                totalAmount: 0
              })

              // delete all the expenses in here! 
              await this.deleteAllFieldsWithWord(paidMemberUserOwesWhoDoc, "expenses");
              await this.deleteAllFieldsWithWord(owedMemberWhoOwesUserDoc, "expenses");
              
              await updateDoc(owedMemberWhoOwesUserDoc, { 
                totalAmount: 0
              })

              const oweUserDoc = doc(owedMemberUserOwesWhoRef, this.expense.paidBy); 
              
              await setDoc(oweUserDoc, { 
                [`expenses.${expenseID}`]: increment(amountOwed - paidMemberData.totalAmount),
                totalAmount: increment(amountOwed - paidMemberData.totalAmount),
                currency: this.trip.Currency 
              }, { merge: true });
              console.log(`${memberID} owes ${this.expense.paidBy} $${amountOwed}`); 

              await setDoc(doc(paidMemberWhoOwesUserRef, memberID), { 
                [`expenses.${expenseID}`]: increment(amountOwed - paidMemberData.totalAmount),
                totalAmount: increment(amountOwed - paidMemberData.totalAmount),
                currency: this.trip.Currency 
              }, { merge: true });

            } catch (error) { 
              console.error(error);
            }
          }
        } else { 
          // this is if paid member currently does not owe the owing member any money
          const oweUserDoc = doc(paidMemberWhoOwesUserRef, memberID); 
          const userOwesDoc = doc(owedMemberUserOwesWhoRef, this.expense.paidBy); 

          try { 
          await setDoc(oweUserDoc, { 
            [`expenses.${expenseID}`]: increment(amountOwed),
            totalAmount: increment(amountOwed),
            currency: this.trip.Currency 
          }, { merge: true });
          console.log(`${memberID} owes ${this.expense.paidBy} $${amountOwed}`);

          await setDoc(userOwesDoc, { 
            [`expenses.${expenseID}`]: increment(amountOwed),
            totalAmount: increment(amountOwed),
            currency: this.trip.Currency, 

          }, { merge: true });
          console.log(`${this.expense.paidBy} has a debtor with memberID ${memberID} who owes him/her $${amountOwed}`);

        } catch (error) { 
          console.error(error); 
        }
        }
      }
    }, 
    async deleteAllFieldsWithWord(docRef, word) {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            let updates = {};
            let shouldUpdate = false;

            // Check each field in the document
            for (const key in data) {
                if (typeof data[key] === 'number' && key.includes(word)) {
                    // Prepare to delete the field
                    updates[key] = deleteField();
                    shouldUpdate = true;
                }
            }

            // If there are fields to delete, perform the update
            if (shouldUpdate) {
                await updateDoc(docRef, updates);
                console.log("Fields containing the word have been deleted.");
            } else {
                console.log("No fields contained the word.");
            }
        } else {
            console.log("Document does not exist.");
        }
    },
    async addExpense() {
      // call the updateDebts method, which will update the debts of each member in this group trip based on this expense
      const tripRef = doc(db, "Trips", this.trip.UID);

      const expenseDocRef = doc(collection(tripRef, "Expenses")); 
      const expenseID = expenseDocRef.id; 
      await this.updateDebts(expenseID); 

      try { 
        await setDoc(expenseDocRef, { 
          title: this.expense.title, 
          amount: this.expense.amount, 
          paidBy: this.expense.paidBy,
          category: this.expense.category, 
          currency: this.trip.Currency,
          date: Timestamp.fromDate(new Date(this.expense.date)), 
          UID: expenseDocRef.id, 
          owedMembers: this.expense.owedMembers
        })
        console.log("Expense added successfully!");
      } catch (error) { 
        console.error("Error adding expense: " + error);
      }


      // // Introduce a dummy document ID or meaningful document (e.g., the date as a document)
      // const expenseDocRef = doc(collection(tripRef, "Expenses"), this.expense.date); // Use date as a document ID

      // // Now create a collection under this document
      // const specificExpenseRef = collection(dateDocRef, "Details");

      // // Now add the expense details as a document within this new collection
      // const expenseDetailRef = doc(specificExpenseRef); // Firestore generates a unique document ID
      // try {
      //   await setDoc(expenseDetailRef, {
      //     title: this.expense.title,
      //     amount: this.expense.amount,
      //     paidBy: this.expense.paidBy,
      //     category: this.expense.category,
      //     currency: this.trip.Currency, 
      //   });
      //   console.log("Expense added successfully under date:", this.expense.date);
      // } catch (error) {
      //   console.error("Error adding expense:", error);
      // }
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