<template>
    <div class="profile-container">
      <div class="profile-content">
        <h1>Profile</h1>
        <form class="profile-form">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" v-model="profile.name" />
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="profile.email" readonly/>
          </div>
          <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" id="username" v-model="profile.username" readonly/>
          </div>
          <div class="form-group">
            <label for="currency">Default Currency:</label>
            <select id="currency" v-model="profile.currency">
              <option>SGD</option>
              <option>USD</option>
              <option>JPY</option>
              <option>EUR</option>
              <option>KRW</option>
              <option>AUD</option>
              <option>NZD</option>
            </select>
          </div>
        </form>
      <button type="button" @click="saveChanges">Save Changes</button>
      </div>
    </div>
</template>
  
  <script>
  export default {
    data() {
      return {
        profile: {
          name: 'Petrine Pang',
          email: 'petrinepang@gmail.com',
          username: 'petrine0123',
          currency: 'SGD',
        },
      };
    },
    methods: {
      saveChanges() {
        // Logic to save changes
      },
    },
  };
  </script>
  
<style scoped>
.profile-container {
  display: flex;
  align-items: center;
  text-align: center;

}

.profile-content {
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
  background: #EDE7E3; 
  border-radius: 10px; 
}

.profile-form {
  display: block;
  flex-direction: column;
  text-align: left;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  width:fit-content;
}

.form-group input {
  width: 300px; 
  height: 15px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-size: small;
  margin-bottom: 0.1rem;
  
}

select {
  width: 200px; 
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
  font-size: small;

}

button {
  background-color: #FFA500; /* Orange button */
  border: none;
  padding: 0.5rem 1rem;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 1rem;
  width:130px;
  float: right;
  font-size: small; 
  
}

button:hover {
  background-color: #cc8400; /* Darker shade for hover effect */
}

h1 {
  color: #333; /* Dark grey color for the heading */
  text-align: left;
  margin-bottom: 2rem;
}

/* Add additional styles if necessary */
</style>