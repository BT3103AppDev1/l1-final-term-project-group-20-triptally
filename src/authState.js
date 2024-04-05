import { onAuthStateChanged, getAuth, signOut } from "firebase/auth";

function getCurrentUser() {
  const auth = getAuth();
  const user = auth.currentUser;
  console.log("getCurrentUser() returning:", user);
  return user; // This will return null if no user is logged in
}

// Reusable logout function
function logoutUser() {
  const auth = getAuth();
  return signOut(auth).then(() => {
    // User is logged out
    console.log("User is logged out");
    // You might want to use Vue Router to change the location
    // but do not change `window.location.href` directly here
    // as it's not recommended to mix Vue Router with direct DOM manipulations
  });
}

export { getCurrentUser, logoutUser };

