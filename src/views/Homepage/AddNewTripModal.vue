<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal">
      <button class="closeModal" @click="closeModal">X</button>
      <h2>New Group Trip</h2>
      <input v-model="tripName" type="text" id="tripName" placeholder="Enter Trip Name"><br>

      <button class="createTrip" @click="createTrip">Create New Trip!</button>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    isVisible: Boolean
  },
  data() { 
    return { 
      tripName: "", 
    }
  },
  emits: ['update:isVisible'],
  methods: {
    createTrip() {


    },
    closeModal() {
      this.$emit('update:isVisible', false);
    }, 
    userList() { 
      // retrieve users from firebase 
    }
  }
}
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #16697ae4;
  padding: 20px;
  color: white;
  border-radius: 20px;
  width: 50%;
  /* Add other styles as necessary */
}

.closeModal { 
  bottom: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  /* Distance from the right */
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
}


input[placeholder="Enter Trip Name"], #searchUser {
  width: 60%;
  /* Full width minus padding */
  height: 100%;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
  /* Space between inputs */
  border: 0px solid #ddd;
  border-radius: 10px;
  font-size: medium;
  font-family: 'Montserrat', sans-serif;
}

.createTrip { 
  background-color: #82C0CC;
}
</style>
