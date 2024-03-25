<template> 
  <div class="navbar">
    <img src="@/assets/triptallylogo.png" class="tt_logo" alt="TripTally">
    <router-link to="/homepage">
      <img src="@/assets/home.png" class="home_logo" alt="Home">
    </router-link>
    <div class="navbar-item">
      <div class="username">{{ userName }}</div>
      <div class="profile" v-if="userName">
        <div class="profile-placeholder">{{ generateInitials(userName) }}</div>
      </div>
    <i class="fa fa-caret-down"></i>
    <div class="dropdown-menu">
      <router-link to="/profilepage" class="dropdown-item">Profile</router-link>
      <div class="dropdown-item" @click="showLogoutPopup = true">Log out</div>    
    </div>

    <div class="logout-popup" v-if="showLogoutPopup">
      <div class="logout-popup-content">
        <h2>Are you sure you want to log out?</h2>
        <button class="logoutbutton" @click="logout">Log out</button>
        <button class="cancelbutton" @click="showLogoutPopup = false">Cancel</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'NavigationBar',
  data() {
    return {
      userName: 'Vanessa Koh',
      isDropdownOpen: false,
      showLogoutPopup: false,
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = true;
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
    generateInitials(name) {
      return name.split(' ').map(n => n[0]).join('');
    },
    logout() {
      //logout logic 
      console.log("Logging out...");
      this.showLogoutPopup = false;
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgb(72, 159, 181); 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 56px;
  padding: 5px;
}

.tt_logo {
  height: 5vw;
}
    
.home_logo {
  width: 2.2vw;
  height: 1.8vw;
  margin-left: 75vw;
  margin-top: 1.5px;
  border-right: 1px solid white;
  padding-right: 15px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.navbar-item {
  display: flex;
  padding-left: 10px;
}

.username {
  color: white;
  font-size: 1.2vw;
  cursor: pointer;
  margin-right: 0.5vw;
  margin-top: 0.31vw;
}

.profile {
  width: 2.2vw;
  height: 2.2vw;
  border-radius: 50%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1vw;
}

.profile-placeholder {
  font-size: 1vw;
  color: rgb(72, 159, 181);
  text-transform: uppercase;
}

.dropdown-menu {
  display:none;
  position: absolute;
  right: 10px;
  top: 50px;
  background-color: #489FB5;
  min-width: 160px;
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
}
.dropdown-item:hover {
  background-color: #1a7086;
}
.profile-placeholder {
  font-size: 1vw;
  color: rgb(72, 159, 181);
  text-transform: uppercase;
}

.logout-popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height:180px;
  padding: 15px;
  background-color: rgb(237, 234, 234);
  font-family: Arial;
  font-size: 10px;
  border-radius: 10%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.logout-popup-content button {
  border: none;
  background-color: rgb(237, 234, 234);
  font-size: 15px;
  border-top: 1px solid rgb(244, 243, 243);
  border-radius: 0%;
  width: 330px;
}

.logoutbutton {
  color: rgb(189, 1, 1);
  height:5px;
}

.cancelbutton {
  color: black;
  height:5px;

}
</style>