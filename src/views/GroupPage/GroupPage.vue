<template>
  <div class="app-container">
  <SideNavBar :tripName="$route.query.tripName" :tripID="$route.params.tripID"></SideNavBar>
  <div v-if="!showAddExpenseModal && !showClearDebtPage" class="main-container">
    <div v-if="consolidatedReminder" class="reminders">
        <div class="reminder-msg">
          <img src="@/assets/reminder-icon.png" alt="Reminder Icon" class="reminder-icon">
          <h1>Reminders:</h1>
          <ul>
            <li v-for="message in consolidatedReminder" :key="message.id">{{ message }}</li>
          </ul>
        </div>
      </div>
      <h1 class="debt-overview">Debt Overview</h1>
      <div class="debt-container">
        <!-- You Are Owed Section -->
        <div class="owed-container">
          <h2>YOU ARE OWED <span class="amount">{{ currencySymbols[this.trip.Currency] }} {{ this.totalDebtOwedToYou }}</span> IN TOTAL</h2>
          <div class="individual-debt" v-for="debt in debtsOwedToYou" :key="debt.UID">
            <div class="debt-details" v-if="debt.totalAmount !== 0">
              <div class="initials">{{ debt.FirstName[0] }}{{ debt.LastName[0] }}</div>
              <div class="details">
                <span class="name">{{ debt.FirstName }} {{ debt.LastName }} owes you</span>
                <span class="debt-amount">{{ currencySymbols[this.trip.Currency]  }} {{ debt.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="action-buttons">
                <button class="remind-btn" @click="showReminderPopup(debt)">Remind</button>
              </div>
            </div>
            <div v-else></div>
          </div>
        </div>
        <!-- You Owe Section -->
        <div class="owe-container">
          <h2>YOU OWE <span class="amount">{{ currencySymbols[this.trip.Currency] }} {{ this.totalDebtYouOwe }}</span> IN TOTAL</h2>
          <div class="individual-debt" v-for="debt in debtsYouOwe" :key="debt.UID">
            <div class="debt-details" v-if="debt.totalAmount !== 0">
              <div class="initials">{{ debt.FirstName[0] }}{{ debt.LastName[0] }}</div>
              <div class="details">
                <span class="name">You owe {{ debt.FirstName }} {{ debt.LastName }}</span>
                <span class="debt-amount">{{ currencySymbols[this.trip.Currency]  }} {{ debt.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="action-buttons">
                <button class="clear-btn" @click="clearDebt">Clear Debt</button>
              </div>
            </div>
            <div v-else></div>
          </div>
        </div>
      </div>
      <div class="expenses-list-container">
        <h2 class="expense-list-heading">LIST OF EXPENSES</h2>
        <div v-if="Object.keys(groupedExpenses).length === 0" class="no-expense-msg">
          No expense added yet. Start tallying by clicking the '+' button!
        </div>
        <div v-else>
          <div class="date-expense-group" v-for="(expenses, date) in groupedExpenses" :key="date">
            <div class="date">{{ date }}</div>
            <div class="expenses" v-for="expense in expenses" :key="expense.id">
              <div class="expense-item">
                <div class="expense-icon">
                  <span v-if="expense.category === 'Food'">🍽️</span>
                <span v-else-if="expense.category === 'Shopping'">🛍️</span>
                <span v-else-if="expense.category === 'Transport'">🚌</span>
                <span v-else-if="expense.category === 'Entertainment'">🎭</span>
                <span v-else-if="expense.category === 'Accommodations'">🏨</span>
                <span v-else>📦</span> 
                </div>
                <div class="expense-details">
                  <div class="expense-title">{{ expense.title }}</div>
                  <div class="expense-subtitle">{{ expense.subtitle }}</div>
                </div>
                <div class="right-side">
                  <div class="delete-expense" @click="showCancelExpensePopup(expense)">
                    <img src="@/assets/dustbin.png" alt="delete" class="dustbin-icon">
                  </div>
                  <div class="expense-amount" :class="{ 'no-balance': !expense.balance }">
                    {{ expense.sideDisplayText }}
                  </div>
                </div>
                <div class="expense-balance" v-if="expense.balance">
                  {{ expense.balance }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Add Expense Button -->
        <button class="add-expense-btn" @click="showAddExpenseModal = true">+</button>
      </div>
      <!-- Cancel expense Confirmation popup -->
      <div v-if="showCancelExpenseConfirmation" class="confirmation-popup">
        <div class="confirmation-content">
        <p class="reminder-confirmation">
          Are you sure you want to delete this expense? 
        </p>
        <div class="confirmation-buttons">
          <button class="confirm-button" @click="deleteExpense">Delete</button>
          <button class="cancel-button" @click="cancelConfirmation">Cancel</button>
        </div>
      </div>
      </div>
      <!-- Reminder Confirmation Popup -->
    <div v-if="showReminderConfirmation && selectedUser" class="confirmation-popup">
      <div class="confirmation-content">
        <p class="reminder-confirmation">
          Are you sure you want to send a reminder to
          {{ selectedUser.FirstName }} {{ selectedUser.LastName }}?
        </p>
        <div class="confirmation-buttons">
          <button class="confirm-button" @click="remindUser(selectedUser)">Remind</button>
          <button class="cancel-button" @click="cancelReminder">Cancel</button>
        </div>
      </div>
    </div>
    </div>
    <div v-else>
      <div v-if="showClearDebtPage">
        <ClearDebtPage @refreshDebtData="fetchDebtData" @returnToMainPage="removeClearDebtPage" :debts="debtsYouOwe" :tripID="trip.UID"/>
      </div>
      <div v-else>
        <AddNewExpenseModal @returnToMainPage="showAddExpenseModal = false" :tripID="trip.UID"></AddNewExpenseModal>
      </div>
    </div>
  </div>
</template>


<script>
import SideNavBar from './SideNavBar.vue';
import ClearDebtPage from './ClearDebtPage.vue';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AddNewExpenseModal from './AddNewExpenseModal.vue';
import { doc, getDoc, collection, getDocs, query, orderBy, updateDoc, deleteDoc, deleteField, increment, setDoc, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import ReminderIcon from '@/assets/reminder-icon.png';


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
      toDeleteExpense: null,
      totalDebtOwedToYou: 0.00,
      totalDebtYouOwe: 0.00, 
      debtsOwedToYou: [],
      debtsYouOwe: [],
      reminders: [],
      groupedExpenses: {},
      currencySymbols: {
        SGD: "S$",
        AUD: "A$",
        BGN: "лв",
        BRL: "R$",
        CAD: "C$",
        CHF: "CHF",
        CNY: "¥",
        CZK: "Kč",
        DKK: "kr",
        EUR: "€",
        GBP: "£",
        HKD: "HK$",
        HRK: "kn",
        HUF: "Ft",
        IDR: "Rp",
        ILS: "₪",
        INR: "₹",
        ISK: "kr",
        JPY: "¥",
        KRW: "₩",
        MYR: "RM",
        NZD: "NZ$",
        PHP: "₱",
        PLN: "zł",
        RON: "lei",
        SEK: "kr",
        THB: "฿",
        TRY: "₺",
        USD: "$",
        ZAR: "R",
        // Add any additional currencies and their symbols here
      },
      showAddExpenseModal: false,
      showClearDebtPage: false,
      showReminderConfirmation: false,
      showCancelExpenseConfirmation: false,
      selectedUser: null,
    };
  },
  components: {
    SideNavBar,
    AddNewExpenseModal,
    ClearDebtPage
  },
  watch: {
    showAddExpenseModal(newVal, oldVal) {
      // Check if the modal is being closed
      if (oldVal === true && newVal === false) {
        this.fetchDebtData();
        this.fetchExpensesData();
      }
    }
  },
  computed: {
    consolidatedReminder() {
      if (this.reminders.length === 0) {
        return null;
      }
      return this.reminders.map(reminder => 
        `${reminder.FirstName} ${reminder.LastName} has reminded you to pay ${this.trip.Currency} ${reminder.totalAmount.toFixed(2)}!`
      );
    },
  },
  methods: {
    removeClearDebtPage() { 
      this.showClearDebtPage = false;
    },
    sumUpDebts(debtArray) { 
      var sum = 0; 
      for (const debt of debtArray) { 
        sum += debt.totalAmount
      }

      return sum.toFixed(2);
    },
    async fetchExpensesData() {
      console.log('fetchExpensesData method called')
      // Fetch all the expenses logged for this trip
      const tripRef = doc(db, "Trips", this.$route.params.tripID);
      const expensesRef = collection(tripRef, "Expenses");

      // Create a query against the collection, ordering by the 'date' field in descending order
      const q = query(expensesRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const userCache = {};

      // Helper function to fetch user details
      const fetchUserDetails = async (userId) => {
        if (!userCache[userId]) {
          const userRef = doc(db, "Users", userId);
          const userSnap = await getDoc(userRef);
          userCache[userId] = userSnap.exists() ? userSnap.data() : { firstName: "Unknown", lastName: "" };
        }
        return userCache[userId];
      };

      // Fetch user details for each expense and map them
      const expenses = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const expenseData = doc.data();
        var userDetails; 
        if (expenseData.paidBy === this.user.uid) { 
          userDetails = { 
            FirstName: "You", 
            LastName: ""
          }
        } else { 
          userDetails = await fetchUserDetails(expenseData.paidBy);
        }
        return {
          id: doc.id,
          ...expenseData,
          date: expenseData.date.toDate(),  // Convert Timestamp to JavaScript Date
          paidByFirstName: userDetails.FirstName, 
          paidByLastName: userDetails.LastName
        };
      }));

      // this function will group the expenses according to their dates 
      this.groupExpensesByDate(expenses);
    }, 
    async groupExpensesByDate(expenses) { 
      console.log('groupedExpensesByDate called')
      const groupedExpenses = expenses.reduce((acc, expense) => {
      // Format the date as 'dd/mm/yyyy'
      const expenseDate = expense.date.toLocaleDateString('en-GB');  // Change locale as needed

      // Initialize the array if this date hasn't been added to the accumulator
      if (!acc[expenseDate]) {
        acc[expenseDate] = [];
      }

      const amountEachUserOwes = (expense.amount / (expense.owedMembers.length)).toFixed(2); 
      //console.log(expense.owedMembers);
      var displayText; 
      console.log(expense.paidBy);

      if (expense.owedMembers.some(member => member.UID === this.user.uid) && expense.paidBy !== this.user.uid) { 
        // this means that the user owes the money, so you must display ' you borrowed ....'
        displayText = `You borrowed ${this.trip.Currency} ${amountEachUserOwes}`;

      } else if (expense.paidBy === this.user.uid) { 
        // this means that the user is the one that paid for the expense, so must display ' you lent ...' 
        displayText = `You lent ${this.trip.Currency} ${(expense.amount - amountEachUserOwes).toFixed(2)}`;
      } else { 
        // this means that the user is neither the borrower nor the payer - user is not involved in the expense 
        displayText = 'No balance';
      }


      // Push the current expense to the array for this date
      acc[expenseDate].push({
        id: expense.id,
        amount: expense.amount,
        title: expense.title,
        paidBy: expense.paidBy,
        owedMembers: expense.owedMembers,
        category: expense.category,
        subtitle: `${expense.paidByFirstName} ${expense.paidByLastName} paid ${expense.currency} ${Number(expense.amount).toFixed(2)}`,
        sideDisplayText: displayText
        // amount: expense.amount  // You might want to format or calculate the amount differently
      });

      return acc;
      }, {});

      // Update your component state or data object
      this.groupedExpenses = groupedExpenses;
      console.log(groupedExpenses);
    },
    async fetchDebtData() { 
      // this function fetches the debts that the user owes and the debts that others owe the user in this trip 
      const tripRef = doc(db, "Trips", this.$route.params.tripID);
      const debtsRef = collection(tripRef, "Debts");
      const userDebtRef = doc(debtsRef, this.user.uid);

      // fetch all debts that the user owes others in this trip
      const userOwesWhoRef = collection(userDebtRef, "User Owes Who");

      // Add a where clause to filter documents where 'totalAmount' is greater than 0
      const queryWithCondition = query(userOwesWhoRef, where("totalAmount", ">", 0));

      // Get the documents based on the query with the condition
      const userOwesWhoSnapshot = await getDocs(queryWithCondition);
      this.debtsYouOwe = [];
      this.reminders = [];
      const userOwesWhoPromises = userOwesWhoSnapshot.docs.map(async (document) => { 
        // document.id refers to the userID of the member that user owes 
        const additionalDataRef = doc(db, "Users", document.id); 
        const additionalDocSnapshot = await getDoc(additionalDataRef);

        if (additionalDocSnapshot.exists()) { 

          // if the member that user owes has sent a reminder to the user, add debt details to the reminders array  
          if (document.data().reminder && document.data().totalAmount > 0) { 
            this.reminders.push({
              totalAmount: document.data().totalAmount,
              paidByID: document.id, 
              ...additionalDocSnapshot.data()
            })
          }

          // save data about the member that the user owes money within the reminders array, together w the debt details
          return { 
            ...document.data(), 
            UID: document.id, 
            FirstName: additionalDocSnapshot.data().FirstName,
            LastName: additionalDocSnapshot.data().LastName,
            Username: additionalDocSnapshot.data().Username,
            Email: additionalDocSnapshot.data().Email
          }
        } else { 
          return { 
            ...document.data(), 
            UID: document.id
          }
        }
      })

      const debtsYouOwe = await Promise.all(userOwesWhoPromises);
      this.debtsYouOwe = debtsYouOwe;
      // sum up all the debts that user owes to find the total debt that user owes others 
      this.totalDebtYouOwe = this.sumUpDebts(this.debtsYouOwe);

      // fetch the debts that other members owe the user 
      const whoOwesUserRef = collection(userDebtRef, "Who Owes User");
      const whoOwesUserSnapshot = await getDocs(whoOwesUserRef);
      this.debtsOwedToYou = [];
      const whoOwesUserPromises = whoOwesUserSnapshot.docs.map(async (document) => { 
        const additionalDataRef = doc(db, "Users", document.id); 
        const additionalDocSnapshot = await getDoc(additionalDataRef);    

        if (additionalDocSnapshot.exists()) { 
          // add the other members' details to the debtsOwedToYou array, together with the debt details
          return { 
            ...document.data(), 
            UID: document.id, 
            FirstName: additionalDocSnapshot.data().FirstName,
            LastName: additionalDocSnapshot.data().LastName,
            Username: additionalDocSnapshot.data().Username, 
          }
        } else { 
          return { 
            ...document.data(), 
            UID: document.id
          }
        }
      })

      const whoOwesYou = await Promise.all(whoOwesUserPromises);
      this.debtsOwedToYou = whoOwesYou;
      // sum up the total debt that other members owe this user
      this.totalDebtOwedToYou = this.sumUpDebts(this.debtsOwedToYou);
    }, 
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
    }, 
    showReminderPopup(debt) { 
      this.showReminderConfirmation = true;
      this.selectedUser = debt;
    },
    async remindUser(debt) { 
      // we shall send a reminder so that the user will check their "User Owes Who" collection with this specific user's ID and it'll display how much user owes that user 
      // we will add this as an attribute to the document 

      const tripDocRef = doc(db, "Trips", this.$route.params.tripID);
      const debtCollection = collection(tripDocRef, "Debts");
      const userDebtRef = doc(debtCollection, debt.UID); 
      const userOwesWhoRef = collection(userDebtRef, "User Owes Who"); 
      const userOwesWhoDoc = doc(userOwesWhoRef, this.user.uid); 
      this.showReminderConfirmation = true;

      try { 
        await updateDoc(userOwesWhoDoc, { 
          reminder: true
        })
        console.log("Reminder successfully sent to owing member!")

        this.showReminderConfirmation = false;
        this.selectedUser = null;
        // Show success message
        toast("Reminder sent successfully!", { autoClose: 2000 });

        // toast("Reminder successfully sent!", { 
        //   autoClose: 2000,
        // })
      } catch (error) { 
        console.error(error);
      }
    }, 
    clearDebt() { 
      // show ClearDebtPage
      this.showClearDebtPage = true;
    },
    cancelReminder() {
      this.showReminderConfirmation = false;
      this.selectedUser = null;
    },
    // Cancel Expense 
    showCancelExpensePopup(expense) {
      this.showCancelExpenseConfirmation = true;
      this.toDeleteExpense = expense;
    },
    cancelConfirmation() {
      this.showCancelExpenseConfirmation = false;
      this.toDeleteExpense = null;
    },
    async deleteExpense() {
      console.log(this.toDeleteExpense);
      // method to delete expense 
      // for each member in the owedMembers array of the expense,  we want to remove the expense from the expenses object of the user's debt collection, 
      // and update the corresponding totalAmount 
      const tripDocRef = doc(db, "Trips", this.trip.UID);
      const expenseDoc = doc(tripDocRef, "Expenses", this.toDeleteExpense.id);

      // for the paid member, check their who owes user collection and find each member's UID document (if it exists)
      const paidMemberDebtsRef = doc(tripDocRef, "Debts", this.toDeleteExpense.paidBy);

      for (const member of this.toDeleteExpense.owedMembers) { 
        // for each member involved in this expense, update the total debt that they owe the paid member (and vice versa)
        if (member.UID !== this.toDeleteExpense.paidBy) {
          const paidMemberWhoOwesUser = collection(paidMemberDebtsRef, "Who Owes User"); 
          const paidMemberWhoOwesUserDoc = doc(paidMemberWhoOwesUser, member.UID);
          const paidMemberWhoOwesUserSnapshot = await getDoc(paidMemberWhoOwesUserDoc);
          if (paidMemberWhoOwesUserSnapshot.exists()) { 
  
            const data = paidMemberWhoOwesUserSnapshot.data();
            if (data.expenses.hasOwnProperty(`expenses.${this.toDeleteExpense.id}`)) { 
              const amount = data.expenses[`expenses.${this.toDeleteExpense.id}`]
              console.log(amount);
              const totalAmount = data.totalAmount; 
              if (totalAmount > amount) { 
                await setDoc(paidMemberWhoOwesUserDoc, { 
                  expenses: { 
                    [`expenses.${this.toDeleteExpense.id}`]: deleteField()
                  },
                  totalAmount: increment(-amount)
                }, {merge: true })
              } else { 
                await deleteDoc(paidMemberWhoOwesUserDoc);
              }
              console.log("Expense removed from paid member's debt data")
            }
          }

          // update the owing member's user owes who collection by finding the paid member's UID document 
          const owingMemberDebtsRef = doc(tripDocRef, "Debts", member.UID);
          const owingMemberUserOwesWhoDoc = doc(owingMemberDebtsRef, "User Owes Who", this.toDeleteExpense.paidBy);
          const owingMemberUserOwesWhoSnapshot = await getDoc(owingMemberUserOwesWhoDoc); 

          if (owingMemberUserOwesWhoSnapshot.exists()) { 
            const debtData = owingMemberUserOwesWhoSnapshot.data();

            if (debtData.expenses.hasOwnProperty(`expenses.${this.toDeleteExpense.id}`)) { 
              const amount = debtData.expenses[`expenses.${this.toDeleteExpense.id}`]

              if (debtData.totalAmount > amount) { 
                // update owing member's expenses map 
                await setDoc(owingMemberUserOwesWhoDoc, { 
                  expenses: { 
                    [`expenses.${this.toDeleteExpense.id}`]: deleteField()
                  },
                  totalAmount: increment(-amount)
                }, { merge: true })
              } else { 
                await deleteDoc(owingMemberUserOwesWhoDoc);
              }
              console.log("Expense removed from owing member's debt data");
            }
          }
        }

      }

      // remove the entire expense from the "Expenses" collection inside the trip document
      await deleteDoc(expenseDoc);

      // update the debt and expenses data displayed 
      await this.fetchDebtData();
      await this.fetchExpensesData();

      this.showCancelExpenseConfirmation = false;
        // Show success message
        toast("Expense deleted successfully!", { autoClose: 2000 });
    }

  }, 
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        await this.fetchTripData();
        await this.fetchDebtData();
        await this.fetchExpensesData();
      }
    })
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  align-items: center;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: -80px auto 0;
  width: 63%;
}

.debt-overview {
  color: #16697A;
  margin-bottom: 20px;
}

.debt-container {
  flex-grow: 1;
  width: 100%;
  display: flex;
  justify-content: space-between; 
  margin-bottom: 20px;
  margin-right: 40px;
  margin-left: 10px;
}

.owed-container,
.owe-container {
  flex: 1;
  padding: 30px; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.902);
  border-radius: 10px;
  background: #fef7ee;
  overflow: hidden; 
  margin-left: 15px;
  display: flex;
  flex-direction: column;
}

.owed-container h2,
.owe-container h2 {
  text-align: center;
  font-size: large;
}

.owed-container .amount {
  display: inline; 
  font-weight: bold;
  font-size: 1.5rem;
  margin-left: 20px;
  margin-right: 20px;
  color: rgb(75, 159, 131);
}

.owe-container .amount {
  display: inline; 
  font-weight: bold;
  font-size: 1.5rem;
  margin-left: 20px;
  margin-right: 20px; 
  color:#d9534f;
}

.individual-debt {
  display: flex;
  align-items: center;
  margin-bottom: 10px; 
}

.debt-details {
  display: flex;
  align-items: center;
  justify-content: space-between; 
  width: 100%;
}

.initials {
  background-color: #CCCCCC; 
  border-radius: 50%;
  color: black; 
  width: 30px; 
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px; 
  font-weight: bold;
  font-size: 0.5em; 
}

.details {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.action-buttons {
  margin-left: auto; 
}

.remind-btn,
.clear-btn {
  padding: 10px;
  border-radius: 10px;
  width: 90px;
  cursor: pointer;
  font-size: 12px;
}

.remind-btn {
  background: #FFA62B; 
  color: white;
  font-family: 'Montserrat', sans-serif;
}

.remind-btn:hover {
  background-color: #f7bd6a;
}

.clear-btn {
  background: #5eaac7; 
  color: white;
  font-family: 'Montserrat', sans-serif;
}

.clear-btn:hover {
  background-color: #87cbe6;
}

.debt-amount {
  font-size: 13px;
  margin-left:5px;
  margin-right: 20px;
  font-weight: bold;
  text-decoration: underline;
}

.no-expense-msg {
  font-size: 20px;
  font-style: italic;
}

.expenses-list-container {
  padding: 50px;
  background: #f8f9faac;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px auto; 
  height: 400px; 
  width: 70%;
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

.reminder-msg { 
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: auto;
  background-color: #16697A; 
  border-radius: 30px; 
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
  margin: 10px; 
  font-family: 'Montserrat', sans-serif; 
  font-size: 0.9em;
  margin-bottom: 20px;
}

.reminder-icon {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.reminder-msg ul {
  margin: 10px;
  padding-left: 20px;
  color: #fff;  
}

.reminder-msg li {
  margin-bottom: 5px;
}

h1 { 
  color: #facf21;
  margin: auto;
}

.confirmation-popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height:150px;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
  z-index: 10;
  font-size: 15px;
  font-weight: bold;
}

.confirm-button, .cancel-button {
  font-weight: 500;
  font-size: 15px;
  background-color: white;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
}

.confirm-button {
  color: rgb(189, 1, 1);
  cursor: pointer;
}
.cancel-button {
  color: black;
  cursor: pointer;
}

.confirm-button:hover, .cancel-button:hover {
  background-color: #f2f2f2; 
}

.dustbin-icon {
  height: 15px;
  width: 16px;
  cursor: pointer;
}

.right-side {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: flex-end;
}

</style>