User
<template> 
  <div class="navbar" v-if="user">
    <router-link to="/homepage">
    <img src="@/assets/triptallylogo.png" class="tt_logo" alt="TripTally">
    </router-link>
    <div class="navbar-item" @mouseover="isDropdownOpen = true" @mouseleave="isDropdownOpen = false">
    <router-link to="/homepage">
      <img src="@/assets/home.png" class="home_logo" alt="Home">
    </router-link>
      <div class="username">{{ Username }}</div>
      <div class="profile" v-if="Username">
        <div class="profile-placeholder">{{ generateInitials(FirstName, LastName) }}</div>
      </div>
    <i class="fa fa-caret-down"></i>
    <div class="dropdown-menu" v-if="isDropdownOpen">
      <router-link to="/profilepage" class="dropdown-item">Profile</router-link>
      <div class="dropdown-item" @click="showLogoutPopup = true">Log out</div>    
    </div>

    <div class="logout-popup" v-if="showLogoutPopup">
      <div class="logout-popup-content">
        <p class="logoutquestion">Are you sure you want to log out?</p>
        <button class="logoutbutton" @click="logout">Log out</button>
        <button class="cancelbutton" @click="showLogoutPopup = false">Cancel</button>
      </div>
    </div>
  </div>
  </div>
  <div v-else>
    <NavBar/>
  </div>

</template>
<script>
import NavBar from './NavBar.vue';
import { ref } from 'vue';
import { auth, db } from '@/firebase';
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { logoutUser } from '@/authState';

export default {
  name: 'NavigationBar',
  data() {
    return {
      user: false, 
      Username: 'No Authenticated User',
      FirstName: '',
      LastName: '',
      isDropdownOpen: false,
      showLogoutPopup: false,
    };
  },
  components: { 
    NavBar,
  },
  methods: {
    async fetchUserData() {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.Username = userData.Username; 
          this.FirstName = userData.FirstName; 
          this.LastName = userData.LastName; 
        }
      }
    },
    toggleDropdown() {
      this.isDropdownOpen = true;
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
    generateInitials(FirstName, LastName) {
      return FirstName[0] + LastName[0];
    },
    logout(event) {
      event.preventDefault(); 
      logoutUser().then(() => {
        console.log("User is logged out!");
        this.$router.push('/login'); // Redirect using Vue Router
      });
    }    
  },
  mounted() {
    const auth = getAuth(); 
    onAuthStateChanged(auth, (user) => { 
      if (user) { 
        this.user = user; 
      }
    })
    this.fetchUserData();
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  background-color: rgb(72, 159, 181); 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 56px;
  padding: 5px;
}

.tt_logo {
  height: 80px;
}
    
.home_logo {
  width: 26px;
  height: 22px;
  margin-top: 1.5px;
  border-right: 1px solid white;
  padding-right: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.navbar-item {
  display: flex;
  margin-right: 10px;
  padding-left: 10px;
  margin-left: auto;
  position: relative;
}

.username {
  color: white;
  font-size: 15px;
  cursor: pointer;
  padding-left: 8px;
  margin-top: 8px;
  margin-right: 8px;
}

.profile {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
  margin-top: 1.5px;
}

.profile-placeholder {
  font-size: 13px;
  color: rgb(72, 159, 181);
  text-transform: uppercase;
}

.dropdown-menu {
  display:none;
  position: absolute;
  top: 100%;
  background-color: #489FB5;
  width: 300px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.navbar-item:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  color: white;
  cursor: pointer;
}
.dropdown-item:hover {
  background-color: #1a7086;
  display: block;
}

.logout-popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 310px;
  height:160px;
  padding: 10px;
  background-color: white;
  border-radius: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
  z-index: 20;
  font-size: 15px;
  font-weight: 300;
}

  .logoutquestion {
    cursor: pointer;
    font-weight: 600; 
    padding-bottom: 8px;
  }

  .logoutbutton, .cancelbutton {
  font-weight: 500;
  font-size: 15px;
  background-color: white;
  font-family: 'MontserratRegular', Montserrat, sans-serif;
}

.logoutbutton {
  color: rgb(189, 1, 1);
  cursor: pointer;
}
.cancelbutton {
  color: black;
  cursor: pointer;
}

.logoutbutton:hover, .cancelbutton:hover {
  background-color: #f2f2f2; 
}

</style>