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
          <div class="group-member" v-for="member in Members" :key="member.initials">
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
      Members: [],
      showAddNewMemberInput: false,
      newMemberUsername: "",
      showDeleteMemberModal: false,
      selectedMemberToDelete: null,
    };
  },
  methods: {
  async fetchMembers() {
    try {
      console.log("trying to fetch members")
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
            console.log("this user exists:", memberObject)
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
    // remove tripID from the user's GroupTrips array 
    const userDocRef = doc(db, "Users", member.UID); 
    
    await updateDoc(userDocRef, { 
      GroupTrips: arrayRemove(this.trip.UID)
    })

    console.log("Trip ID removed from user's GroupTrips array");

    // remove userID from trip's Members array 
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
async handleAddMember() {
  if (this.newMemberUsername.trim()) {
    const usernameTemp = this.newMemberUsername.trim();  

    const tripID = this.$route.params.tripID;
    try {
      // check if this username exists 
      const usernameDocRef = doc(db, 'Usernames', usernameTemp);
      const usernameDocSnap = await getDoc(usernameDocRef);
      
      if (usernameDocSnap.exists()) { 
        console.log(usernameDocSnap.data().UID);
        // username exists, now fetch user data and check if it is already in the group 
        // check if user is in group already 
        if (this.trip.Members.includes(usernameDocSnap.data().UID)) { 
          // user is in this group already! 
          alert("This user is already in the group!")
        } else { 
          // can add user to the group
          // fetch user data first 
          const userDocRef = doc(db, 'Users', usernameDocSnap.data().UID); 
          const userDocSnap = await getDoc(userDocRef); 
          const memberData = userDocSnap.data();

          this.trip.Members.push(usernameDocSnap.data().UID);

          this.Members.push( { 
            initials: memberData.FirstName[0] + memberData.LastName[0],
            username: memberData.Username,
            name: memberData.FirstName + memberData.LastName,
            email: memberData.Email, 
            UID:  usernameDocSnap.data().UID
          })

          // add the trip ID to the user's GroupTrips array 
          await updateDoc(userDocRef, { 
            GroupTrips: arrayUnion(this.trip.UID)
          })

          // add the userID to the trip's Members array 
          const tripDocRef = doc(db, "Trips", this.trip.UID); 
          
          await updateDoc(tripDocRef, { 
            Members: arrayUnion(usernameDocSnap.data().UID)
          })

          console.log("User added"); 
          console.log(this.Members); 
          console.log(this.trip.Members);
        }
        this.newMemberUsername = "";
        
      } else { 
        // username does not exist. 
        alert("Username does not exist");
      }

    } catch (error) { 
      console.error(error);
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
  width: 1000px;
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
