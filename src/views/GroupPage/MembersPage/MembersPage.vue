<template>
  <div class="app-container">
    <SideNavBar :tripName="$route.query.tripName" :tripID="$route.params.tripID"></SideNavBar>
    <div class="main-content" v-if="user">
      <!-- Group Members Section -->
      <div class="group-members-section">
        <div class="group-members-header">
          <h2 class="group-members-title">Group Members</h2>
          <img
            :src="addMemberIcon"
            alt="Add Member"
            class="add-member-btn"
            @click="toggleAddMember"
          />
        </div>
        <AddMember v-if="showAddNewMemberInput" :tripID="trip.UID" @member-added="fetchMembers"></AddMember>
        <!-- Group Members List -->
        <div class="group-members-list">
          <!-- Group Member Item -->
          <div class="group-member" v-for="member in Members" :key="member.UID">
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

    <!-- DeleteMember Modal -->
    <delete-member
      v-if="showDeleteMemberModal"
      :tripName="trip.TripName"
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
import { doc, getDoc, getDocs, updateDoc, getFirestore, arrayRemove, arrayUnion} from 'firebase/firestore';
import { db } from '@/firebase';
import AddMember from './AddMembers.vue';

export default {
  components: {
    SideNavBar,
    DeleteMember,
    AddMember
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
      Members: [],
      showAddNewMemberInput: false,
      showDeleteMemberModal: false,
      selectedMemberToDelete: null,
    };
  },
  methods: {
  toggleAddMember() {
    // display add member search dropdown
    this.showAddNewMemberInput = !this.showAddNewMemberInput;
  },
  async fetchMembers() {
    // fetch data of all members in group trip
    try {
      const tripRef = doc(db, 'Trips', this.$route.params.tripID); 
      const tripDocSnap = await getDoc(tripRef); 
      
      if (tripDocSnap.exists()) {
        const tripData = tripDocSnap.data();
        console.log('Trip data:', tripData);
        this.Members = tripData.Members; 
        console.log('Members array:', this.Members);

        const memberPromises = this.Members.map(async memberId => {
          const memberDocRef = doc(db, 'Users', memberId);
          const memberDocSnap = await getDoc(memberDocRef);
          if (memberDocSnap.exists()) {
            const memberData = memberDocSnap.data();
            console.log(`Member data for ID ${memberId}:`, memberData);
            const memberObject = {
              initials: memberData.FirstName[0] + memberData.LastName[0],
              username: memberData.Username,
              email: memberData.Email, 
              name: memberData.FirstName + " " + memberData.LastName,
              UID:  memberId
            };
            return memberObject;
          } else {
            console.error(`Member document with ID ${memberId} does not exist`);
            return null;
          }
        });
        this.Members = await Promise.all(memberPromises);

      } else {
        console.error('Trip document does not exist');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
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
    // remove tripID from the user's GroupTrips array in database
    const userDocRef = doc(db, "Users", member.UID); 
    
    await updateDoc(userDocRef, { 
      GroupTrips: arrayRemove(this.trip.UID)
    })

    console.log("Trip ID removed from user's GroupTrips array");

    // remove userID from trip's Members array in database
    const tripDocRef = doc(db, "Trips", this.trip.UID); 
    
    await updateDoc(tripDocRef, { 
      Members: arrayRemove(member.UID)
    })
    
    console.log("User ID removed from group trip's Members array")

    // update data within the MembersPage component so that no re-render is required, and members are updated immediately on the screen
    const newMembers = this.Members.filter(m => m.username !== member.username); 
    this.Members = newMembers; 

    const newTripMembers = this.trip.Members.filter(m => m !== member.UID); 
    this.trip.Members = newTripMembers;
    
  } catch (error) {
    console.error('Error removing member from trip:', error);
  }
  console.log('Member deleted:', member);
  this.closeDeleteMemberModal();
},
async fetchTripData() {
  // feetch trip data from database
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
}, 
mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        await this.fetchTripData();
        await this.fetchMembers();
      }
    })
  },

};

</script>

<style scoped>
.app-container {
  display: flex;
  background: url('@/assets/singapore.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(88, 85, 79, 0.2);
}

.main-content {
  margin: auto; 
  margin-top: 100px;
}

.group-members-section {
  background-color: #16697a;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-left: 20px; 
  width: 700px;
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
</style>
