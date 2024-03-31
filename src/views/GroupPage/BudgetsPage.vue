<template>
  <div class="app-container">
  <SideNavBar></SideNavBar>
  <div class="budget-page">
    <button class="edit-button" @click="editBudget">Edit</button>
    <h1>Total Budget: ${{ totalBudget }}</h1>
    <div class="budget-categories">
      <div class="category-block" v-for="(item, index) in budgetItems" :key="index">
        <div class="icon-and-category">
          <span class="icon">{{ getCategoryIcon(item.category) }}</span>
          <span class="category-name">{{ item.category }}</span>
        </div>
        <div class="progress-and-amount">
          <div class="progress-container">
            <div class="progress-bar" :style="{width: progressWidth(item), backgroundColor: getCategoryColor(item.category)}"></div>
          </div>
          <div class="amount-info">
            <span class="amount-allocated">${{ item.allocated }}</span>
            <span class="amount-left">left ${{ item.allocated - item.used }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>  
</template>

<script>
import SideNavBar from './SideNavBar.vue';

export default {
  name: 'BudgetPage',
  data() {
    return {
      totalBudget: 1000, // Example total budget
      budgetItems: [
        { category: 'Food', allocated: 150, used: 80 },
        { category: 'Shopping', allocated: 200, used: 150 },
        { category: 'Transport', allocated: 100, used: 50 },
        { category: 'Entertainment', allocated: 50, used: 40 },
        { category: 'Accommodations', allocated: 100, used: 100 },
        { category: 'Miscellaneous', allocated: 50, used: 10 }
      ],
    };
  },
  components: {
    SideNavBar
  },
  methods: {
    progressWidth(item) {
      const percentageUsed = (item.used / item.allocated) * 100;
      return `${percentageUsed}%`;
    },
    getCategoryIcon(category) {
      const icons = {
        'Food': '🍽️',
        'Shopping': '🛍️',
        'Transport': '🚌',
        'Entertainment': '🎭',
        'Accommodations': '🏨',
        'Miscellaneous': '📦'
      };
      return icons[category] || '❓';
    },
    getCategoryColor(category) {
      const colors = {
        'Food': '#B2DFAB',
        'Shopping': '#F0E694',
        'Transport': '#ABD9EA',
        'Entertainment': '#DDC9F7',
        'Accommodations': '#FCC2AB',
        'Miscellaneous': '#EDA5B9',
      };
      return colors[category] || '#cccccc'; // Default color if the category is not found
    },
    editBudget() {
    this.$router.push({ name: 'EditBudgetPage' });
  },
  }
};
</script>

<style scoped>

.app-container {
  display: flex;
  align-items: center;
}

.budget-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.edit-button {
  position: absolute; /* Position the button absolutely within the budget-page */
  top: 60px; /* Adjust as needed */
  right: 20px; /* Adjust as needed */
  padding: 10px 20px;
  background-color: #ffb921; /* Pastel yellow, or choose a color that fits your design */
  color: black;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 500;
  width: 100px;
}

.edit-button:hover {
  background-color: #e3be43; /* A slightly darker shade for hover state */
}

.category-name {
  font-size: medium;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 700;
}

h1 {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.budget-categories {
  display: flex;
  flex-direction: column;
}

.category-block {
  background-color: #f7f7f7; /* Soft pastel background */
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* subtle shadow */
  width: 800px;
  align-items: center;
}

.icon-and-category {
  display: flex;
  align-items: center;
  font-size: 1.2em;
  margin-bottom: 10px;
}

.icon {
  margin-right: 10px;
}

.category-name {
  flex-grow: 1;
}

.progress-and-amount {
  display: flex;
  align-items: center;
}

.progress-container {
  background-color: #e0e0e0;
  border-radius: 5px;
  flex-grow: 1;
  margin-right: 10px;
}

.progress-bar {
  height: 10px;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.amount-allocated {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 600;
}

.amount-left {
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-weight: 600;
  border-radius: 5px;
  padding: 5px 10px;
  color: #333;
  font-size: small;
}
</style>
