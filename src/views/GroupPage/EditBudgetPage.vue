<template>
  <div class="app-container">
    <SideNavBar />
    <div class="main-content">
      <div class="edit-budget-card">
      <div class="header">
        <router-link to="/group/:tripName/budgets" class="budget-page-link">←</router-link>
        <h1>Edit Budget</h1>
        <button class="save-button" @click="saveBudget">Save</button>
      </div>
      <div class="budget-fields">
        <div class="field" v-for="(value, name) in budget" :key="name">
          <label :for="name">{{ name }}: </label>
          <input type="number" :id="name" v-model.number="budget[name]"/>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideNavBar from './SideNavBar.vue';

export default {
  data() {
    return {
      budget: {
        Food: 150,
        Shopping: 200,
        Transport: 100,
        Entertainment: 50,
        Accommodation: 100,
        Miscellaneous: 50
      }
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1); // Go back to the previous page
    },
    saveBudget() {
      // Here you would save the budget data to your state management or server
      console.log('Budget saved', this.budget);
      this.goBack();
    }
  },
  components:{
    SideNavBar
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh; /* Or adjust to the height you need */
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  /* Additional styles as needed */
}

h1 {
  color: white;
  font-size:x-large;
}

/* Centered card layout */
.edit-budget-card {
  background: #307A8D; 
  border-radius: 15px;
  width: 700px; /* Adjust width as needed */
  margin: 0 auto; /* Center the card horizontally */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4); /* subtle shadow */
  top: 60%; /* Adjust this value to control the vertical position */
  transform: translateY(20%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* Style your header */
}

.save-button {
  background-color: #ffb921;
  color: black;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 500;
  font-size: small;
  border-radius: 10px;
  width: 100px;
  margin-right: 2cap;
}

.save-button:hover {
  background-color: #e3be43; /* A slightly darker shade for hover state */
}

.budget-page-link {
  color: white;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 1000;
  font-size:larger;
  text-decoration: none;
  margin-left: 2cap;
}
.budget-fields {
  display: flex;
  flex-direction: column;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 700;
  color: white;
  margin-left: 8cap;
}

.field {
  margin-bottom: 15px;
  /* Style your fields */
}

input[type="number"] {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
}
</style>
