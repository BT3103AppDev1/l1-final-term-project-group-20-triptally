<template> 
<div class="app-container">
  <div class="main-content">
    <p v-if="showSuccessMessage" class="success-message">Expense added successfully!</p>
    <p v-if="showErrorMessage" class="error-message">All fields must be filled!</p>
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
          <div class="currency-category">
            <p>{{ selectedCurrency }}</p>
          </div>
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
          <div class="select-wrapper">
            <div class="selected-items">
              <span v-if="!expense.owedMembers.length" class="placeholder">Add Members</span>
              <div v-for="(member, index) in expense.owedMembers" :key="index" class="selected-item">
                {{ member.FirstName }} {{ member.LastName }}
                <span @click="removeSelectedMember(index)">x</span>
              </div>
            </div>
            <select @change="addSelectedMember" class="custom-select">
              <option disabled selected value="">Select</option>
              <option value="Everyone">Everyone</option>
              <option
                v-for="member in availableMembers" :key="member.UID" :value="member.UID">
                {{ member.FirstName }} {{ member.LastName }}
              </option>
            </select>
          </div>
        </div>
        <div class="fifth-row">
          <img src="@/assets/receipt-icon.png" class="receipt-icon"><span>Upload Receipt      </span>
          <input type="file" accept="image/*" @change="handlePhotoChange">
        </div>
      </div>
    </div>
      <button type="submit" @click="addExpense">Add Expense!</button>  
    </div>
  </div>
</div>
  
</template>

<script>
import { db } from '@/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, increment, query, where, getDocs, Timestamp, arrayUnion, FieldValue, deleteField, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";



export default { 
  name: 'AddNewExpenseModal',
  data() { 
    return {
      showSuccessMessage: false,
      showErrorMessage: false,
      selectedCurrency: "", 
      user: false, 
      currentUser: {
        FirstName: '',
        LastName: '',
        UID: ''
      },
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
        splitBetween: "",
        owedMembers: [],
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
    },
    availableMembers() {
      const filteredMembers = this.trip.MemberDetails.filter(member => 
        !this.expense.owedMembers.some(owedMember => owedMember.UID === member.UID)
      );
      console.log('Filtered Members:', filteredMembers);
      return filteredMembers;
    },
  },
  methods: { 
    initializeCurrency() {
      // Assuming 'trip.Currency' is loaded here or via a prop
      if (this.trip.Currency) {
        this.selectedCurrency = this.trip.Currency;
      }
    },
    addSelectedMember(event) {
    const selectedUserID = event.target.value;
    if (selectedUserID === "Everyone") { 
      this.expense.owedMembers = this.trip.MemberDetails;
    } else { 
      const selectedUser = this.trip.MemberDetails.find(member => member.UID === selectedUserID);
      if (selectedUser && !this.expense.owedMembers.some(member => member.UID === selectedUser.userID)) {
        this.expense.owedMembers.push(selectedUser);
      }
    }

    console.log(this.expense.owedMembers);
    // Reset the select dropdown
      event.target.value = "";
    },
    removeSelectedMember(index) {
      this.expense.owedMembers.splice(index, 1);
      console.log(this.expense.owedMembers);
    },
    async fetchCurrentUserDetails(uid) {
      const userDocRef = doc(db, "Users", uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        this.currentUser.FirstName = userData.FirstName;
        this.currentUser.LastName = userData.LastName;
        this.currentUser.UID = uid;
        // Set the default paidBy to the user's UID
        this.expense.paidBy = uid;
      } else {
        console.error("No user found with UID:", uid);
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
      for (const member of this.expense.owedMembers) { 

        if (member.UID !== this.expense.paidBy) { 
          const tripRef = doc(db, "Trips", this.trip.UID);
          const owedMemberDocRef = doc(collection(tripRef, "Debts"), member.UID); // this is the person that owes the payer money 
          const paidMemberDocRef = doc(collection(tripRef, "Debts"), this.expense.paidBy); // this is the person that has paid first 

          // Now create/access the "Who Owes User" collection for the payer and the "User Owes Who" collection for the person that owes the payer money 
          const paidMemberWhoOwesUserRef = collection(paidMemberDocRef, "Who Owes User"); // this is the payer's "Who Owes User" collection
          const paidMemberUserOwesWhoRef = collection(paidMemberDocRef, "User Owes Who"); // this is the payer's "User Owes Who" collection
          const owedMemberUserOwesWhoRef = collection(owedMemberDocRef, "User Owes Who"); // this is the ower's "User Owes Who" collection
          const owedMemberWhoOwesUserRef = collection(owedMemberDocRef, "Who Owes User");  // this is the ower's "Who Owes User" collection
          const amountOwed = Number((this.expense.amount / (this.expense.owedMembers.length + 1)).toFixed(2)); // this is the amount that is owed by each user involved in the expense 

          // check whether the paid member currently owes this member any money - if yes, minus off from there
          const memberDocRef = doc(paidMemberUserOwesWhoRef, member.UID); 
          const memberDocSnapshot = await getDoc(memberDocRef);

          if (memberDocSnapshot.exists()) { 
            // means the paid member currently owes this member money - minus off this member's debt to the paid member from there 

            const paidMemberData = memberDocSnapshot.data();
            if (paidMemberData.totalAmount > amountOwed) { 
              // if the amount that the payer currently owes the ower is greater than the amount that the ower owes the payer, then 
              //  we will minus away amountOwed from paidMemberData.totalAmount 
              try { 
                // update the "User Owes Who" collection for the paid member to reflect the updated total amount owed 
                await updateDoc(doc(paidMemberUserOwesWhoRef, member.UID), { 
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

                const paidMemberUserOwesWhoDoc = doc(paidMemberUserOwesWhoRef, member.UID);
                const owedMemberWhoOwesUserDoc = doc(owedMemberWhoOwesUserRef, this.expense.paidBy);
                await deleteDoc(paidMemberUserOwesWhoDoc);

                // delete all the expenses in here!
                await deleteDoc(owedMemberWhoOwesUserDoc);

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

                await setDoc(doc(paidMemberWhoOwesUserRef, member.UID), { 
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
            const oweUserDoc = doc(paidMemberWhoOwesUserRef, member.UID); 
            const userOwesDoc = doc(owedMemberUserOwesWhoRef, this.expense.paidBy); 

            try { 
            await setDoc(oweUserDoc, { 
              expenses: {[`expenses.${expenseID}`]: increment(amountOwed)},
              totalAmount: increment(amountOwed),
              currency: this.trip.Currency,  
            }, { merge: true });
            console.log(`${member.UID} owes ${this.expense.paidBy} $${amountOwed}`);

            await setDoc(userOwesDoc, { 
              expenses: {[`expenses.${expenseID}`]: increment(amountOwed)},
              totalAmount: increment(amountOwed),
              currency: this.trip.Currency, 
              reminder: false
            }, { merge: true });
            console.log(`${this.expense.paidBy} has a debtor with memberID ${member.UID} who owes him/her $${amountOwed}`);

          } catch (error) { 
            console.error(error); 
          }
          }
        }
      }
    }, 
    async handlePhotoChange(event) {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          console.log('Received data:', data.totalAmount);
          if (data) {
            this.expense.amount = data.totalAmount.toFixed(2);
            this.expense.date = new Date(data.date); // Update your form's data
            alert('Receipt processed. Total: ' + data.total);
          } else {
            alert('Receipt processing failed.');
          }
        } catch (error) {
          console.error('Error uploading and processing image:', error);
          alert('Error processing the receipt');
        }
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
        this.showSuccessMessage = true;
        console.log("Expense added successfully!");

        // Update the used amount in the corresponding budget category
        const budgetRef = collection(tripRef, "Budgets"); 
        const budgetCategoryRef = doc(budgetRef, this.expense.category);
        await setDoc(budgetCategoryRef, {
          used: increment(Number(this.expense.amount)),
        }, { merge: true });

        // Reset the form fields
        this.expense.date = "";
        this.expense.title = ""; 
        this.expense.amount = ""; 
        this.expense.paidBy = "";
        this.expense.category = "";
        this.expense.splitBetween = "";
        this.expense.owedMembers =[]

      } catch (error) { 
        console.error("Error adding expense: " + error);
        this.showErrorMessage = true;
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
        await this.fetchCurrentUserDetails(user.uid);
        await this.convertMembersArray();
      }
    })
  }
}
</script>

<style scoped>

.app-container { 
  width: 100%; 
  height: 100%;
}

.main-container { 
  background: #16697A; 
  border-radius: 15px;
  width: 820px; /* Adjust width as needed */
  height: 680px;
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
  background-color: rgb(222, 221, 221);
  border-radius: 10px;
  color: black;
  margin-top: 10px;
  display: flex;             /* Enable Flexbox */
  justify-content: center;   /* Center horizontally */
  align-items: center;
  font-weight: 600; 
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

.fourth-row {
  margin-top: 15px;
}

.payer, .split-between {
  width: 140px;
  margin-left: 10px;
  margin-right: 10px;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  border: 1px solid #ddd; 
  border-radius: 10px; 
  min-height: 38px; 
  width: calc(60% - 10px); 
  margin-bottom: -10px;
  background-color: white;
  font-size: 14px;
}

.select-wrapper {
  width: 800px;
}

.form-container h1 { 
    color: white; 
}

button {
  background-color: #82C0CC; /* Replace with your color */
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 22px;
  cursor: pointer;
  margin-bottom: 55px;
  margin-top: 10px;
}

button:hover {
  background-color: #71a9b4; /* Replace with your color */
}

.success-message {
  color: rgb(2, 89, 40); /* Simple styling */
  position: fixed;
  top: 10%;
  left: 50%;
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  font-size: large;
  z-index: 100; 
  padding: 5px;
  padding-left: 8px;
  padding-right: 8px;
  border-radius: 10px;
  background-color: rgb(176, 244, 205);
}
.error-message {
  color: rgb(165, 17, 3); /* Simple styling */
  position: fixed;
  top: 10%;
  left: 50%;
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  font-size: large;
  z-index: 100;
  padding: 5px;
  padding-left: 8px;
  padding-right: 8px;
  border-radius: 10px;
  background-color: rgb(241, 180, 174); 
}

.receipt-icon { 
  height: 30px;
  vertical-align:bottom;
}

.fifth-row { 
  margin-bottom: 5px;
}
</style>