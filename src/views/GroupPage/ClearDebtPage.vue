<template>
  <div class="main-content">
    <header>
      <h1>Clear Debt</h1>
    </header>
    <div class="debt-list" v-for="debt in debtsYouOwe">
      <div v-if="debt.currency !== userCurrency" class="debt-details">
        {{ debt.FirstName }} {{  debt.LastName }} <br>
        You owe {{ debt.currency }} {{  debt.totalAmount }} = {{ userCurrency }} {{ debt.ConvertedAmount.toFixed(2) }}

        <button @click="payUp(debt)" class="payUpButton">Pay Up</button>

      </div>
      <div v-else class="debt-details">
        {{ debt.FirstName }} {{  debt.LastName }} <br>
        You owe {{ debt.currency }} {{  debt.totalAmount }}

        <button @click="payUp(debt)" class="payUpButton">Pay Up</button>
      </div>
    </div>
    <button @click="goBack">Back</button>
  </div>

</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '@/firebase'
import { doc, getDoc, getDocs, collection, updateDoc, deleteDoc } from 'firebase/firestore'
import axios from 'axios';

export default { 
  name: 'ClearDebtPage', 
  data() { 
    return { 
      user: false,
      userCurrency: "",
      debtsYouOwe: [], 
      showConfirmationPopup: false
    }
  },
  emits: ['returnToMainPage','refreshDebtData'],
  props: {
    tripID: String
  },
  methods: { 
    goBack() { 
      this.$emit('returnToMainPage');
    },
    async fetchDebtData() { 
      // fetch all the debts that user owes other people - this can be found in the "User Owes Who" collection 
      const tripRef = doc(db, "Trips", this.$route.params.tripID);
      const debtsRef = collection(tripRef, "Debts");
      const userDebtRef = doc(debtsRef, this.user.uid);
      const userOwesWhoRef = collection(userDebtRef, "User Owes Who");
      const userOwesWhoSnapshot = await getDocs(userOwesWhoRef);

      this.debtsYouOwe = [];
      const userOwesWhoPromises = userOwesWhoSnapshot.docs.map(async (document) => { 
        const additionalDataRef = doc(db, "Users", document.id); 
        const additionalDocSnapshot = await getDoc(additionalDataRef);
        const debtData = document.data();

        // if expense currency is not the same as the user's default currency, then fetch exchange rates  
        const expenseCurrency = document.data().currency; 
        var expenseInUserCurrency;

        if (expenseCurrency !== this.userCurrency) { 
          // fetch current exchange rate from freecurrencyapi
          const response = await axios.get('https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_iaKyOqNjZI0PjnMBKqchb1UFhMxXh12FLbkCuzNy');

          // must convert expense to USD first, then from USD convert to the user's default currency 
          const expenseInUSD = debtData.totalAmount / (response.data.data[expenseCurrency]);
          expenseInUserCurrency = expenseInUSD * (response.data.data[this.userCurrency]);
          console.log(response.data.data)
        } else { 
          expenseInUserCurrency = debtData.totalAmount;
        }

        // fetch paid member data
        if (additionalDocSnapshot.exists()) { 

          return { 
            ...document.data(), 
            UID: document.id, 
            FirstName: additionalDocSnapshot.data().FirstName,
            LastName: additionalDocSnapshot.data().LastName,
            Username: additionalDocSnapshot.data().Username,
            Email: additionalDocSnapshot.data().Email,
            ConvertedAmount: expenseInUserCurrency
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
       
    },
    async payUp(debt) { 
      // change totalAmount owed by the user to the paid member to 0, and delete all expenses! 
      const tripRef = doc(db, "Trips", this.$route.params.tripID);
      const debtsRef = collection(tripRef, "Debts");
      const userDebtRef = doc(debtsRef, this.user.uid);
      const payerDebtRef = doc(debtsRef, debt.UID); 

      // debts that the user owes 
      const userOwesWhoRef = collection(userDebtRef, "User Owes Who");
      const userOwesDoc = doc(userOwesWhoRef, debt.UID);

      // update the paid member's debts too! 
      const whoOwesUserRef = collection(payerDebtRef, "Who Owes User"); 
      const whoOwesUserDoc = doc(whoOwesUserRef, this.user.uid); 

      try { 

        // delete the debt
        await deleteDoc(userOwesDoc); 
        await deleteDoc(whoOwesUserDoc);

        // remove the debt from the debts array  
        const updatedDebts = this.debtsYouOwe.filter(d => d.UID !== debt.UID);
        this.debtsYouOwe = updatedDebts;

         // refresh the debt data in GroupPage and ClearDebtPage 
        this.$emit('refreshDebtData');
      } catch (error) { 
        console.error(error);
      }

    },
    async fetchUserData() { 
      const userDocRef = doc(db, "Users", this.user.uid); 
      const userData = await getDoc(userDocRef);
      this.userCurrency = userData.data().Currency;
    }
  }, 
  mounted() { 
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        await this.fetchUserData();
        await this.fetchDebtData();
      }
    })

  }

}

</script>


<style scoped>

.main-content {
  /* Styles for your main content */
  background-color: #16697A;
  width: 800px;
  height: 400px;
  margin: 10%;
  border-radius: 20px;
}

h1 { 
  color: White;
}

.debt-details { 
  background-color: white;
  width: 80%;
  border-radius: 5px;
  margin-left: auto;
  margin-right: auto;
  padding: 10px;
  display: flex;
  margin-bottom: 7px;
}

.payUpButton { 
  background-color: #FFA62B;
  color: black;
}
</style>

