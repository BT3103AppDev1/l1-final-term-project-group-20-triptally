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
            <span class="member-trip">from {{ tripName }} ?</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="confirm-btn" @click="confirmDelete">Yes</button>
        <button class="cancel-btn" @click="closeModal">No</button>
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
  width: 300px;
  text-align: center;
}

.modal-header .warning-icon {
  font-size: 24px;
}

.member-info {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.member-initials {
  background-color: #ececec;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
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
}

.member-email {
  font-size: 0.9em;
}

.member-trip {
  font-size: 0.8em;
  margin-top: 20px;
}

.modal-footer {
  margin-top: 30px;
}

.confirm-btn,
.cancel-btn {
  border: none;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 30px;
}

.confirm-btn {
  background-color: #4CAF50;
  color: white;
  margin-bottom: 10px;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
}
</style>
