<template> 
  <div class="navbar">

    <img src="@/assets/triptallylogo.png" class="tt_logo" alt="TripTally">
    <img src="@/assets/home.png" class="home_logo" alt="Home">

    <div class="username" v-if="userName"> {{ userName }} </div>
    <div class="profile" v-if="userName">
      <div class="profile-placeholder"> {{ generateInitials(userName) }} </div>
    </div>
  </div>

</template>

<script>
export default {
  name: 'NavigationBar',
  data() {
    return {
      userName: 'Vanessa Koh'
    };
  },

  methods: {
    generateInitials(name){
      const words = name.split(' ');
      return words.map(word => word.charAt(0)).join('');
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
    height: 4vw;
  }


.tt_logo {
        height: 3vw;
    }
    
.home_logo {
  width: 2.5vw; 
  height: 2vw; 
  margin-left: 70vw ;
  margin-bottom: 3px;
}
.username {
  color: white;
  margin-left: auto;
  font-size: 1.2vw;
}

.profile {
  width: 3.5vw; 
  height: 3.5vw; 
  border-radius: 50%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 1vw;
  margin-right: 1vw;
}

.profile-placeholder {
  font-size: 1.5vw;
  color: rgb(72, 159, 181);
  text-transform: uppercase;
}
</style>