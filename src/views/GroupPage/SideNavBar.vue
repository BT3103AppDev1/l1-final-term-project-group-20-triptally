<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-trip">
            <span>{{ tripName }}</span>
          </li>
          <router-link :to="{ name: 'GroupPage', params: { tripID: tripID } }" class="nav-item">
            <img src="@/assets/expensestab.png" alt="Expenses" class="nav-icon">
            <span>Expenses</span>
          </router-link>
          <router-link :to="{ name: 'AnalyticsPage', params: { tripID: tripID } }" class="nav-item">
            <img src="@/assets/analyticstab.png" alt="Analytics" class="nav-icon">
            <span>Analytics</span>
          </router-link>
          <router-link :to="{ name: 'BudgetsPage', params: { tripID: tripID } }" class="nav-item">
            <img src="@/assets/budgetstab.png" alt="Budgets" class="nav-icon">
            <span>Budgets</span>
          </router-link>
          <router-link :to="{ name: 'MembersPage', params: { tripID: tripID } }" class="nav-item">
            <img src="@/assets/memberstab.png" alt="Members" class="nav-icon">
            <span>Members</span>
          </router-link>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default {
  data() { 
    return { 
      user: false, 
      tripName: "",
      tripUID: ""
    }
  },
  props: {
    tripID: String,
    tripName: String
  }, 
  mounted() { 
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
        // retrieve relevant trips from firestore database 
      }
    })
  }, 

};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #AFD4DB;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  height: 110vh;
}

.sidebar-content {
  padding: 2.5rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-trip {
  margin-bottom: 30px;
  text-align: center;
  font-size: 20px;
  color: rgb(34, 85, 126);
  font-weight: bold;
}

.nav-item {
  display: flex;
  background-color: #84C0CB;
  align-items: center;
  margin-bottom: 1rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 20px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: white;
}

.nav-item:hover,
.router-link-active {
  background-color: #307A8D;
  border-radius: 20px;
}

.router-link-active {
  background-color: #307A8D;
  border-radius: 20px;
}

.nav-item span {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.nav-icon {
  width: 30px;
  margin-left: 1rem;
}
</style>