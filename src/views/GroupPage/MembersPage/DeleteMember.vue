<template>
  <div v-if="isVisible" class="delete-member-overlay" @click.self="closeModal">
    <div class="delete-member-modal">
      <div class="modal-header">
        <span class="warning-icon">⚠️</span>
        <h3>Are you sure you want to remove:</h3>
      </div>
      <div class="modal-body">
        <div class="member-info">
          <span class="member-initials">{{ member.initials }}</span>
          <div class="member-details">
            <span class="member-name">{{ member.name }}</span>
            <span class="member-email">{{ member.email }}</span>
          </div>
        </div>
        <span class="member-trip">from {{ tripName }} ?</span>
      </div>
      <div class="modal-footer">
        <button class="confirm-button" @click="confirmDelete">Yes</button>
        <button class="cancel-button" @click="closeModal">No</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    member: {
      type: Object,
      default: () => ({})
    },
    tripName: { //backend to fetch tripName
      type: String,
      default: ''
    }
  },
  emits: ['confirm-delete', 'update:isVisible'],
  methods: {
    closeModal() {
      this.$emit('update:isVisible', false);
    },
    confirmDelete() {
      this.$emit('confirm-delete', this.member);
    }
  }
};
</script>

<style scoped>
.delete-member-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.delete-member-modal {
  background: white;
  border-radius: 15px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 350px;
  text-align: center;
}

.modal-header .warning-icon {
  font-size: 24px;
}

.member-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 10px;
}

.member-initials {
  background-color: #ececec;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  margin-left: 20px;
  font-weight: bold;
  margin-bottom: auto;
}

.member-details {
  text-align: left;
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: bold;
  font-size: 13px;
}

.member-email {
  font-size: 13px;
}

.member-trip {
  font-size: 15px;
  margin-left: 18px;
  font-weight: 600;
}

.modal-footer {
  margin-top: 10px;
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
