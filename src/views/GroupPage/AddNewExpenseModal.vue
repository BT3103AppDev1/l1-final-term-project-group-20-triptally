<template> 
<div class="app-container">
  <div class="main-container">
    <div class="header">
      <div class="back-button" @click="returnToMainExpensesPage">
        <img src="@/assets/backbutton.png" alt="Back" class="backbutton-icon">
      </div>
      <h1>Add New Expense</h1>
    </div> 
    <div class="form-container">
      <div class="first-row">
        <input type="date" v-model="expense.date" placeholder="Choose Date">
      </div>
      <div class="second-row">
        <select v-model="expense.category" class="expense-category">
          <option value="Food">🍽️</option>
          <option value="Shopping">🛍️</option>
          <option value="Transport">🚌</option>
          <option value="Entertainment">🎭</option>
          <option value="Accomodations">🏨</option>
          <option value="Miscellaneous">📦</option>
        </select>
        <input class="expense-title" type="text" v-model="expense.title" placeholder="Description"><br>
      </div>
      <div class="third-row">
        <select v-model="selectedCurrency" class="currency-category">
          <option value="" disabled selected>Select Currency</option>
          <option value="SGD">SGD</option>
          <option value="AUD">AUD</option>
          <option value="CAD">CAD</option>
          <option value="CHF">CHF</option>
          <option value="CNY">CNY</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          <option value="KRW">KRW</option>
          <option value="MYR">MYR</option>
          <option value="NZD">NZD</option>
          <option value="SEK">SEK</option>
          <option value="USD">USD</option>
        </select>
        <input class="expense-amount" type="number" v-model="expense.amount" placeholder="0.00"><br>
      </div>
      <div class="fourth-row">
        <div class="paid-by">
        <span>Paid by</span>
        <select class="payer" v-model="expense.paidBy">
          <option v-for="member in this.trip.MemberDetails" :key="member.UID" :value="member.UID">
            {{ member.FirstName }} {{ member.LastName }}
          </option>
        </select>
        <span>and split between</span>
        <select class="split-between" v-model="expense.splitBetween">
        <!--Ideally user should be able to either select 'Everyone' or manually add members one by one - members involved in the expense will be added to this.expense.owedMembers -->
        <option value="Everyone">Everyone</option>
        </select>
      </div>
    </div>
  </div>
  <button type="submit" @click="addExpense">Add Expense!</button>  
  </div>
</div>
  
</template>

<script>
import { db } from '@/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, increment, query, where, getDocs, Timestamp, arrayUnion, FieldValue, deleteField } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default { 
  name: 'AddNewExpenseModal',
  data() { 
    return {
      selectedCurrency: "", 
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
        category: "Food",
        splitBetween: "Everyone",
        owedMembers: []
        // this represents the userIDs of the members that owe the person that paid for this expense money 
      }
    }
  }, 
  emits: ['returnToMainPage'],
  props: { 
    tripID: String
  },
  computed: {
    currencyOptions() {
      return Object.entries(this.currencySymbols).map(([code, symbol]) => ({
        code,
        symbol
      }));
    }
  },
  methods: { 
    initializeCurrency() {
      // Assuming 'trip.Currency' is loaded here or via a prop
      if (this.trip.Currency) {
        this.selectedCurrency = this.trip.Currency;
      }
    },
    returnToMainExpensesPage() { 
      // this will be emitted to the parent component - aka GroupPage, which will then toggle back to the main expenses display
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
        this.initializeCurrency();
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
      // update debt details for all members involved in the expense - we need to update the WhoOwesUser collection for the payer, and the UserOwesWho collection for the person who owes the money 

      // for now user can only select "Everyone" to split between, cos i'm not too sure how to make the dropdown thingy such that different users can be selected (and more than 1 user) 
      if (this.expense.splitBetween === "Everyone") { 
        this.expense.owedMembers = this.trip.Members.filter(memberID => memberID !== this.expense.paidBy);
      }

      // for each member of the owedMembers array, we will update their debt in firebase
      for (const memberID of this.expense.owedMembers) { 
      
        const tripRef = doc(db, "Trips", this.trip.UID);
        const owedMemberDocRef = doc(collection(tripRef, "Debts"), memberID); // this is the person that owes the payer money 
        const paidMemberDocRef = doc(collection(tripRef, "Debts"), this.expense.paidBy); // this is the person that has paid first 

        // Now create/access the "Who Owes User" collection for the payer and the "User Owes Who" collection for the person that owes the payer money 
        const paidMemberWhoOwesUserRef = collection(paidMemberDocRef, "Who Owes User"); // this is the payer's "Who Owes User" collection
        const paidMemberUserOwesWhoRef = collection(paidMemberDocRef, "User Owes Who"); // this is the payer's "User Owes Who" collection
        const owedMemberUserOwesWhoRef = collection(owedMemberDocRef, "User Owes Who"); // this is the ower's "User Owes Who" collection
        const owedMemberWhoOwesUserRef = collection(owedMemberDocRef, "Who Owes User");  // this is the ower's "Who Owes User" collection
        const amountOwed = Number((this.expense.amount / (this.expense.owedMembers.length + 1)).toFixed(2)); // this is the amount that is owed by each user involved in the expense 

        // check whether the paid member currently owes this member any money - if yes, minus off from there
        const memberDocRef = doc(paidMemberUserOwesWhoRef, memberID); 
        const memberDocSnapshot = await getDoc(memberDocRef);

        if (memberDocSnapshot.exists()) { 
          // means the paid member currently owes this member money - minus off this member's debt to the paid member from there 

          const paidMemberData = memberDocSnapshot.data();
          if (paidMemberData.totalAmount >= amountOwed) { 
            // if the amount that the payer currently owes the ower is greater than the amount that the ower owes the payer, then 
            //  we will minus away amountOwed from paidMemberData.totalAmount 
            try { 
              // update the "User Owes Who" collection for the paid member to reflect the updated total amount owed 
              await updateDoc(doc(paidMemberUserOwesWhoRef, memberID), { 
                totalAmount: increment(-amountOwed)
              })

              // update the "Who Owes User" collection for the owing member, to reflect the updated total amount that the paid member still owes him/her
              await updateDoc(doc(owedMemberWhoOwesUserRef, this.expense.paidBy), { 
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
                totalAmount: 0, 
                expenses: {}
              })

              // delete all the expenses in here!
              
              await updateDoc(owedMemberWhoOwesUserDoc, { 
                totalAmount: 0,
                expenses: {}
              })

              const oweUserDoc = doc(owedMemberUserOwesWhoRef, this.expense.paidBy); 
              const docSnapshot = await getDoc(oweUserDoc);
              const docData = docSnapshot.data();

              let updates = {
                expenses: { [`expenses.${expenseID}`]: increment(amountOwed - paidMemberData.totalAmount) },
                totalAmount: increment(amountOwed - paidMemberData.totalAmount),
                currency: this.trip.Currency
              };

              if (!docData || docData.reminder === undefined) { 
                updates.reminder = false;
              }
              
              await setDoc(oweUserDoc, updates, { merge: true });
              console.log(`${memberID} owes ${this.expense.paidBy} $${amountOwed}`); 

              await setDoc(doc(paidMemberWhoOwesUserRef, memberID), { 
                expenses: {[`expenses.${expenseID}`]: increment(amountOwed - paidMemberData.totalAmount)},
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
            expenses: {[`expenses.${expenseID}`]: increment(amountOwed)},
            totalAmount: increment(amountOwed),
            currency: this.trip.Currency,  
          }, { merge: true });
          console.log(`${memberID} owes ${this.expense.paidBy} $${amountOwed}`);

          await setDoc(userOwesDoc, { 
            expenses: {[`expenses.${expenseID}`]: increment(amountOwed)},
            totalAmount: increment(amountOwed),
            currency: this.trip.Currency, 
            reminder: false
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
                    updates = {
                      ...updates, 
                      [key]: deleteField()
                    };
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
        this.expense.date = "";
        this.expense.title = ""; 
        this.expense.amount = ""; 
        this.expense.paidBy = "";
        this.expense.category = "";
        this.expense.splitBetween = "";
        this.expense.owedMembers =[]

      } catch (error) { 
        console.error("Error adding expense: " + error);
      }
    }
  }, 
  mounted() { 
    this.initializeCurrency();
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
  background: #307A8D; 
  border-radius: 15px;
  width: 820px; /* Adjust width as needed */
  height: 600px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4); /* subtle shadow */
  top: 60%; /* Adjust this value to control the vertical position */
  transform: translateY(20%);
  color: white;
  margin-left: 200px;
  margin-top: -350px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 60px;
  width: 820px;
  padding: 20px;
  padding-top: 50px;
  margin-bottom: 0px;
}

.back-button {
  position: absolute;
  left: 65px; /* Positions the back button 20px from the left */
  top: 60%; /* Centers the button vertically */
  transform: translateY(-50%); /* Aligns the button vertically centered */
}

.backbutton-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

h1 {
  color: white;
  flex-grow: 1;
  text-align: center;
  margin-top: 35px;
  font-size: 40px;
}

.form-container { 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 80%;
  height: 80%;
  position: relative; 
  border-radius: 10px;
}

.first-row {
  width: 100%;
}

input[placeholder="Choose Date"] {
  width: 55%;
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

.expense-category {
  font-size: 35px;
  width: 100px;
  height: 60px;
  margin-right: 20px;
  padding-left: 25px;
}

.currency-category {
  font-size: 18px;
  width: 100px;
  height: 60px;
  margin-right: 20px;
  padding-left: 22px;
}

.expense-title, .expense-amount {
  width: 300px;
  height: 60px;
  border: 0px solid #ddd;
  border-radius: 10px;
  font-size: large;
  font-family: 'Montserrat', sans-serif;
  margin-top: 10px;
  padding-left: 8px;
  padding-top: 0px;
  padding-bottom: 0px;
}

.second-row, .third-row {
  display: flex;
}

.payer, .split-between {
  width: 140px;
  margin-left: 10px;
  margin-right: 10px;
}

.form-container h1 { 
    color: white; 
}

button {
  background-color: #82C0CC; /* Replace with your color */
  color: white;
  border: none;
  padding: 20px 30px;
  font-size: 22px;
  cursor: pointer;
  margin-bottom: 55px;
  margin-top: 10px;
}

button:hover {
  background-color: #71a9b4; /* Replace with your color */
}


</style>