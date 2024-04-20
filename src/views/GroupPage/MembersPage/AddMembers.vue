<template>
    <div class="select-wrapper">
        <input type="text" class="search-input" v-model="searchTerm" placeholder="Search username"
               @input="filterUsers" @focus="showDropdown = true" @blur="keepDropdownOpen">
        <div v-if="showDropdown" class="custom-dropdown">
            <div v-for="user in filteredUsers" :key="user.userID"
                 @click="selectUser(user)"
                 class="dropdown-item">
                {{ user.username }}
            </div>
        </div>
        <div class="selected-items">
            <span v-if="!selectedMembers.length" class="placeholder">Members</span>
            <div v-for="(user, index) in selectedMembers" :key="user.userID" class="selected-item">
                {{ user.username }}
                <span @click="removeSelectedMember(index)">x</span>
            </div>
            <button v-if="selectedMembers.length" @click="addSelectedMembers" class="add-members-btn">+</button>
        </div>
    </div>
</template>

<script>
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase";

export default {
  props: {
    tripID: String
  },
  data() {
    return {
      selectedMembers: [],
      allUsers: [],
      searchTerm: '',
      showDropdown: false,
    };
  },
  computed: {
    availableUsers() {
      return this.allUsers.filter(user => !this.selectedMembers.some(member => member.userID === user.userID));
    },
    filteredUsers() {
      return this.searchTerm ? this.availableUsers.filter(user => user.username.toLowerCase().includes(this.searchTerm.toLowerCase())) : this.availableUsers;
    },
  },
  methods: {
    keepDropdownOpen(event) {
      event.preventDefault();
      setTimeout(() => { this.showDropdown = this.searchTerm.trim().length > 0; }, 300);
    },
    async selectUser(user) {
      if (!this.selectedMembers.some(member => member.userID === user.userID)) {
        const userDocRef = doc(db, 'Users', user.userID);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const memberData = userDocSnap.data();
          this.selectedMembers.push({
            userID: user.userID,
            username: memberData.Username,
            initials: `${memberData.FirstName[0]}${memberData.LastName[0]}`,
            name: `${memberData.FirstName} ${memberData.LastName}`,
            email: memberData.Email,
          });
          this.searchTerm = ''; // Clear search term to reset dropdown
        } else {
          console.error('User data could not be fetched.');
        }
      } else {
        alert('This user is already in the group!');
      }
    },
    async fetchUsers() {
      const usersRef = collection(db, "Usernames");
      const querySnapshot = await getDocs(usersRef);
      this.allUsers = querySnapshot.docs.map(doc => ({ userID: doc.data().UID, username: doc.id }));
    },
    removeSelectedMember(index) {
      this.selectedMembers.splice(index, 1);
    },
    async addSelectedMembers() {
        const tripRef = doc(db, "Trips", this.tripID);
        const tripDoc = await getDoc(tripRef);

        if (tripDoc.exists()) {
            const currentMembers = tripDoc.data().Members || [];

            // Prepare to handle all selected members
            for (const member of this.selectedMembers) {
            if (!currentMembers.includes(member.userID)) {
                // Member is not already in the trip, fetch user details
                const userDocRef = doc(db, 'Users', member.userID);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                // Add user ID to the trip's Members array
                await updateDoc(tripRef, {
                    Members: arrayUnion(member.userID)
                });

                // Optionally, add the trip ID to the user's GroupTrips array
                await updateDoc(userDocRef, {
                    GroupTrips: arrayUnion(this.tripID)
                });

                console.log(`User ${member.username} added to the trip`);
                } else {
                console.error(`User data for ${member.username} could not be fetched.`);
                }
            } else {
                console.log(`User ${member.username} is already in the group!`);
            }
            }

            // Reset selected members after processing
            this.selectedMembers = [];
            this.$emit('member-added'); // Inform the parent component to update the member list.
        } else {
            console.error("Trip does not exist.");
        }
        }

  },
  async created() {
    await this.fetchUsers();
  }
}
</script>

<style scoped>
.search-input {
    width: 95%;
}

.custom-dropdown {
  position: absolute;
  width: 680px; 
  background-color: #82C0CC;
  border: 1px solid #ccc;
  z-index: 1000; 
  display: block; 
}

.dropdown-item {
  padding: 5px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #1b4851;
}

.select-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #ddd; 
  border-radius: 10px; 
  background-color: white;
  padding: 5px;
  width: 96%;
  background-color: #1b4851;
}

.selected-item {
  background-color: #82C0CC;
  color: white;
  border-radius: 10px;
  padding: 7px 10px;
  margin-right: 5px;
  cursor: pointer;
}

.selected-item span {
  margin-left: 5px;
  cursor: pointer;
  color: white;
}

.placeholder {
  color: #999;
  padding: 7px 10px;
}

.add-members-btn {
    width: 45px;
    height: 45px;
    margin-right: 10px;
}
</style>
