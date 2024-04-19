<template>


</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default { 
  name: 'BudgetAnalytics',
  data() { 
    return { 
      user: false
    }
  },
  mounted() { 
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
      }
    })
  }
}

</script>