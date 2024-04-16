<template>
  <div class="main-content">
    <header>
      <h1>Clear Debt</h1>
    </header>
    <div class="debt-list" v-for="debt in debtsYouOwe">
      <div class="debt-details">
        {{ debt.FirstName }} {{  debt.LastName }}
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
import { doc, getDoc, getDocs, collection, updateDoc } from 'firebase/firestore'

export default { 
  name: 'ClearDebtPage', 
  data() { 
    return { 
      user: false,
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

        if (additionalDocSnapshot.exists()) { 

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
       
    },
    async payUp(debt) { 
      // change totalAmount owed by the user to the paid member to 0, and delete all expenses! 
      const tripRef = doc(db, "Trips", this.$route.params.tripID);
      const debtsRef = collection(tripRef, "Debts");
      const userDebtRef = doc(debtsRef, this.user.uid);

      // debts that the user owes 
      const userOwesWhoRef = collection(userDebtRef, "User Owes Who");
      const userOwesDoc = doc(userOwesWhoRef, debt.UID);

      try { 
        await updateDoc(userOwesDoc, { 
          reminder: false, 
          totalAmount: 0, 
          expenses: {}
        })
        console.log("Debt settled")
        const indexOf = this.debtsYouOwe.indexOf(debt);
        this.debtsYouOwe = this.debtsYouOwe.splice(indexOf, 1);
        console.log(this.debtsYouOwe);
        this.$emit('refreshDebtData');
      } catch (error) { 
        console.error(error);
      }

    }
  }, 
  mounted() { 
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
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
}

.payUpButton { 
  background-color: #FFA62B;
  color: black;
}
</style>

