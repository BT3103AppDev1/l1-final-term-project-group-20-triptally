<template>
  <div class="app-container">
    <SideNavBar v-if="user" :tripName="trip.TripName" :tripID="$route.params.tripID"></SideNavBar>
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
import { doc, getDoc, getDocs, updateDoc, getFirestore } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  components: {
    SideNavBar,
    DeleteMember
  },
  data() {
    return {
      user: false,
      trip: { 
        TripName: "",
        Members: [],
        Currency: "", 
        UID: ""
      },
      deleteIcon: deleteIcon,
      addMemberIcon: addMemberIcon,
      Members: [
      { initials: 'YA', username: 'Yuki Ang', email: 'yukiang@gmail.com' },
        { initials: 'VK', username: 'Vanessa Koh', email: 'vankoh@gmail.com' },
        { initials: 'HQ', username: 'Hui Qian Khoo', email: 'huiqian@yahoo.com' },
        { initials: 'CT', username: 'Calista Tan', email: 'calistatan@gmail.com' },
        { initials: 'PP', username: 'Petrine Pang', email: 'petrinepang@gmail.com' },
      ],
      showAddNewMemberInput: false,
      newMemberUsername: '',
      showDeleteMemberModal: false,
      selectedMemberToDelete: null,
    };
  },
  async mounted() {
    const auth = getAuth();
    await this.fetchTripData();
    await this.fetchMembers();
    onAuthStateChanged(auth, (user) => {
      this.user = user ? user : null;
    });
    
  },
  methods: {
  async fetchMembers() {
    try {
      console.log("trying to fetch members")
      const db = getFirestore(); 
      const tripRef = doc(db, 'Trips', this.$route.params.tripID); 
      const tripDocSnap = await getDoc(tripRef); 
      
      if (tripDocSnap.exists()) {
        const tripData = tripDocSnap.data();
        console.log('Trip data:', tripData);
        const membersArray = tripData.Members;
        console.log('Members array:', membersArray);

        const memberPromises = membersArray.map(async memberId => {
          const memberDocRef = doc(db, 'Users', memberId);
          const memberDocSnap = await getDoc(memberDocRef);
          if (memberDocSnap.exists()) {
            const memberData = memberDocSnap.data();
            console.log(`Member data for ID ${memberId}:`, memberData);
            const memberObject = {
              initials: memberData.FirstName[0] + memberData.LastName[0],
              username: memberData.Username,
              email: memberData.Email
            };
            console.log("this user exists:", memberObject)
            return memberObject;
          } else {
            console.error(`Member document with ID ${memberId} does not exist`);
            return null;
          }
        });
        const members = await Promise.all(memberPromises);
        this.members = members.filter(member => member !== null);
      
      } else {
        console.error('Trip document does not exist');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  },
  async fetchUserData() {
    const usernameTemp = this.newMemberUsername.trim();
    const tripID = this.$route.params.tripID;
    try {
      const userDocRef = doc(db, 'Usernames', usernameTemp);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        this.userExists = false;
        this.inTrip = false;
        return;
      }

      this.uniqueID = userDocSnap.data().UID;
      const tripDocRef = doc(db, 'Trips', tripID);
      const tripDocSnap = await getDoc(tripDocRef);
      if (!tripDocSnap.exists()) {
        this.inTrip = false;
        return;
      }
      const tripData = tripDocSnap.data();
      if (tripData.Members && tripData.Members.includes(this.uniqueID)) {
          this.inTrip = true; 
      } else {
        console.log('Members:', tripData.Members);
        console.log("Unique ID:", this.uniqueID)
          this.inTrip = false;
      }
      this.userExists = true;

    } catch (error) {
      console.error('Error fetching user data:', error);
      this.userExists = false;
      this.inTrip = false;
    }
  },
  openDeleteMemberModal(member) {
    this.selectedMemberToDelete = member;
    this.showDeleteMemberModal = true;
  },
  closeDeleteMemberModal() {
    this.selectedMemberToDelete = null;
    this.showDeleteMemberModal = false;
  },
  async handleDeleteConfirmation(member) {
  try {
    console.log("currently deleting:", member);
    
    const delUsername = member.username;
    console.log("Deleting member with Username:", delUsername);

    const index = this.members.findIndex(m => m.username == delUsername);
    console.log("Index of member to delete:", index);

    if (index !== -1) {
      const delRef = doc(db, "Usernames", delUsername);
      const delDocSnap = await getDoc(delRef);
      const delM = delDocSnap.data();
      const delID = delM.UID;

      this.members.splice(index, 1);

      const tripRef = doc(db, "Trips", this.$route.params.tripID);
      console.log("Original Members array:", this.trip.Members);

      const updatedMembers = this.trip.Members.filter(m => m !== delID);
      console.log("Updated Members array:", updatedMembers);

      await updateDoc(tripRef, { Members: updatedMembers });
      console.log('Member removed from trip:', delUsername);
      this.inTrip = false;
    } else {
      console.error('Member not found in members array:', delUsername);
    }
  } catch (error) {
    console.error('Error removing member from trip:', error);
  }
  console.log('Member deleted:', member);
  window.location.reload();
  this.closeDeleteMemberModal();
},
async handleAddMember() {
  if (this.newMemberUsername.trim()) {
    const usernameTemp = this.newMemberUsername.trim();  
    try {
      await this.fetchUserData(); 
      if (this.userExists) {
        if (this.trip.Members.includes(this.uniqueID) && this.inTrip) {
          console.log('User is already part of the trip:', usernameTemp);
          this.errorMessage = 'The user is already part of this trip';//in the same page, it keeps adding the same user
        } else {
          console.log('Adding new member:', usernameTemp);
          const tripRef = doc(db, "Trips", this.$route.params.tripID);
          const updatedMembers = [...this.trip.Members, this.uniqueID];
          await updateDoc(tripRef, { Members: updatedMembers });
          
          const memberDocRef = doc(db, 'Users', this.uniqueID);
          const memberDocSnap = await getDoc(memberDocRef);
          const memberData = memberDocSnap.data();

          this.Members.push({ 
              initials: memberData.FirstName[0] + memberData.LastName[0],
              username: usernameTemp,
              email: memberData.Email });

          this.inTrip = true;
          window.location.reload();
        }
      } else {
        console.log('User does not exist:', usernameTemp);
        this.errorMessage = 'There is no user with this username';
      }
    } catch (error) {
      console.error('Error handling user addition:', error);
    }
  }
},
async fetchTripData() {
  const tripDocRef = doc(db, "Trips", this.$route.params.tripID); 
  try {
    const docSnap = await getDoc(tripDocRef);
    if (docSnap.exists()) {
      const tripData = docSnap.data();
      this.trip.TripName = tripData.TripName; 
      this.trip.Currency = tripData.Currency; 
      this.trip.Members = tripData.Members;
      this.trip.UID = this.$route.params.tripID; 
    } else {
      console.error("Trip document does not exist");
    }
  } catch (error) {
    console.error("Error fetching trip data:", error);
  }
}

}};

</script>

<style scoped>
.app-container {
  display: flex;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
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
