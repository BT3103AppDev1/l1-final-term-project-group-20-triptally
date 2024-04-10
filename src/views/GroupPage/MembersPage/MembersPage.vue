<template>
  <div class="app-container">
    <SideNavBar v-if="user"></SideNavBar>
    <div class="main-content" v-if="user">
      <!-- Group Members Section -->
      <div class="group-members-section">
        <div class="group-members-header">
          <h2 class="group-members-title">Group Members</h2>
          <img
            :src="addMemberIcon"
            alt="Add Member"
            class="add-member-btn"
            @click="showAddNewMemberInput = !showAddNewMemberInput"
          />
        </div>
        <!-- New Member Input Box -->
        <div v-if="showAddNewMemberInput" class="new-member-input-box">
          <input
            type="text"
            v-model="newMemberUsername"
            placeholder="Enter new member username"
            @keyup.enter="handleAddMember"
          />
          <button @click="handleAddMember">+</button>
        </div>
        <!-- Group Members List -->
        <div class="group-members-list">
          <!-- Group Member Item -->
          <div class="group-member" v-for="member in members" :key="member.initials">
            <div class="member-initials">{{ member.initials }}</div>
            <div class="member-info">
              <div class="member-name">{{ member.name }}</div>
              <div class="member-email">{{ member.email }}</div>
            </div>
            <div class="member-settings">
              <img
                :src="deleteIcon"
                alt="Delete"
                class="delete-user-btn"
                @click="openDeleteMemberModal(member)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <h1 v-else>You must be logged in to view this!</h1>

    <!-- DeleteMember Modal -->
    <delete-member
      v-if="showDeleteMemberModal"
      :isVisible="showDeleteMemberModal"
      :member="selectedMemberToDelete"
      @update:isVisible="showDeleteMemberModal = $event"
      @confirm-delete="handleDeleteConfirmation"
    ></delete-member>
  </div>
</template>

<script>
import SideNavBar from '../SideNavBar.vue';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import deleteIcon from '@/assets/delete-minus-btn.png';
import addMemberIcon from '@/assets/add-member.png';
import DeleteMember from './DeleteMember.vue';

export default {
  components: {
    SideNavBar,
    DeleteMember
  },
  data() {
    return {
      user: false,
      deleteIcon: deleteIcon,
      addMemberIcon: addMemberIcon,
      members: [
      { initials: 'YA', name: 'Yuki Ang', email: 'yukiang@gmail.com' },
        { initials: 'VK', name: 'Vanessa Koh', email: 'vankoh@gmail.com' },
        { initials: 'HQ', name: 'Hui Qian Khoo', email: 'huiqian@yahoo.com' },
        { initials: 'CT', name: 'Calista Tan', email: 'calistatan@gmail.com' },
        { initials: 'PP', name: 'Petrine Pang', email: 'petrinepang@gmail.com' },
      ],
      showAddNewMemberInput: false,
      newMemberUsername: '',
      showDeleteMemberModal: false,
      selectedMemberToDelete: null,
    };
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.user = user ? user : null;
    });
  },
  methods: {
  openDeleteMemberModal(member) {
    this.selectedMemberToDelete = member;
    this.showDeleteMemberModal = true;
  },
  closeDeleteMemberModal() {
    this.selectedMemberToDelete = null;
    this.showDeleteMemberModal = false;
  },
  handleDeleteConfirmation(member) {
    // handle the deletion of member here
    console.log('Member deleted:', member);
    this.closeDeleteMemberModal();
  },
  handleAddMember() {
      if (this.newMemberUsername.trim()) {
        console.log('Adding new member:', this.newMemberUsername);
        // Perform the logic to add the new member
        // For example, push to the members array or make an API call
        this.members.push({
          initials: this.newMemberUsername[0].toUpperCase(),
          name: this.newMemberUsername,
          email: `${this.newMemberUsername}@gmail.com`
        });
        this.newMemberUsername = ''; 
        this.showAddNewMemberInput = false; 
      }
    }
}

};
</script>

<style scoped>
.app-container {
  display: flex;
}

.main-content {
  padding: 100px;
  width: 100%;
}

.group-members-section {
  background-color: #16697a;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-left: 20px; 
}

.group-members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px; 
  margin-left: 20px;
}

.group-members-title {
  margin-bottom: 20px;
  color: white;
}

.group-members-list {
  list-style: none;
  padding: 0;
}

.group-member {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #16697A;
  padding: 10px;
  font-size: 20px;
  border-radius: 10px;
}

.member-initials {
  font-weight: bold;
  color: #333;
  margin-right: 20px;
  background-color: #ececec;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-info {
  flex-grow: 1;
}

.member-name {
  font-weight: bold;
  color: white;
}

.member-email {
  color: white;
}

.member-settings {
  cursor: pointer;
  font-size: 1.5em; 
}

.delete-user-btn {
  width: 40px;
  margin-top: 10px;
}

.add-member-btn {
  cursor: pointer;
  width: 40px;
  height: 40px;
}

.new-member-input-box {
  display: flex;
  align-items: center;
  margin: 10px;
  background-color: #FFF; 
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 10px 10px;
  margin-bottom: 20px;
}

.new-member-input-box input {
  flex-grow: 1;
  border: none;
  margin-right: 10px;
  outline: none;
  padding: 10px;
  border-radius: 15px;
  font-size: 15px;
  font-family: 'Montserrat', sans-serif;
}

.new-member-input-box button {
  background-color: #16697a; 
  color: white;
  padding: 10px;
  cursor: pointer;
  border-radius: 50%;
  width: 45px;
  height: 45px;
}

.new-member-input-box button:hover {
  background-color: #144f5a; 
}
</style>
