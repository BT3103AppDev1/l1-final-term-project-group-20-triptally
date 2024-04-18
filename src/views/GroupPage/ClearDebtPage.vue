<template>
  <div class="main-content">
    <div class="back-button" @click="goBack"><</div>
    <div class="debt-list">
      <h1 class="debt-heading">Clear Debt</h1>
      <div v-if="debtsYouOwe.length === 0" class="no-debt-message">
        You don't owe anyone money. Keep it up!
      </div>
      <div v-else>
        <div class="debt-details" v-for="debt in debtsYouOwe" :key="debt.UID" :data-initials="debt.FirstName.charAt(0) + debt.LastName.charAt(0)">
          <div class="debt-info">
            <div class="user-info">
              <div class="debt-name">{{ debt.FirstName }} {{  debt.LastName }}</div>
              <div class="user-email">{{ debt.Email }}</div>
            </div>
            <div class="debt-description">You owe {{ debt.currency }} {{ parseFloat(debt.totalAmount).toFixed(2) }}</div>
          </div>
          <button @click="confirmPayUp(debt)" class="payUpButton">Pay Up</button>
        </div>
      </div>
    </div>
    <div v-if="showConfirmationPopup" class="confirmation-popup">
      <div class="popup-content">
        <p>Are you sure you have paid {{ selectedUser.FirstName }} {{ selectedUser.LastName }}?</p>
        <div class="buttons">
          <button class="confirm-button" @click="payUp(selectedUser)">Yes</button>
          <button class="cancel-button" @click="cancelPayment">Cancel</button>
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
      showConfirmationPopup: false,
      selectedUser: null
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
        this.showConfirmationPopup = false;
      } catch (error) { 
        console.error(error);
      }

    },
    confirmPayUp(selectedUser) {
      this.selectedUser = selectedUser;
      this.showConfirmationPopup = true;
    },
    cancelPayment() {
      this.showConfirmationPopup = false;
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
.app-container {
  display: flex;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
}

.main-content {
  margin-left: 20%;
  margin-top: -30%;
}

.back-button {
  position: relative;
  top: 50px;
  left: 50px;
  font-weight: bold;
  cursor: pointer;
  font-size: 24px;
  color: white;
}

.debt-heading {
  color: white;
}

.debt-list {
  background-color: #16697a;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-left: 20px; 
  width: 1000px;
}

.debt-details {
  display: flex;
  align-items: center; 
  justify-content: space-between; 
  margin-bottom: 20px;
  background-color: white;
  padding: 10px;
  font-size: 20px;
  border-radius: 10px;
  position: relative;
}

.debt-description {
  margin-left: auto;
  margin-right: 20px;
  color: #e61b1b;
  font-weight: bold;
}

.debt-details::before {
  content: attr(data-initials);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  background-color: #ececec; 
  border-radius: 50%;
  position: absolute;
  left: 10px; 
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
}

.debt-info {
  display: flex;
  margin-left: 60px;
  flex: 1; 
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
}

.debt-name {
  font-weight: bold;
  margin-bottom: 4px; 
}

.user-email {
  font-size: small;
  color: #666; 
}

.debt-description {
  margin-top: 8px; 
  font-size: medium; 
  color: #e61b1b; 
  font-weight: bold;
}

.payUpButton { 
  background-color: #FFA62B;
  color: black;
  padding: 10px 10px;
  border-radius: 15px;
  width: auto;
  margin-left: auto; 
  font-family: 'Montserrat', sans-serif;
}

.payUpButton:hover {
  background-color: #f7bd6a;
}

.no-debt-message {
  color: white;
  text-align: center;
  margin-bottom: 20px;
  font-size: 20px;
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

</style>
