import { onAuthStateChanged, getAuth } from "firebase/auth";

function getCurrentUser() {
  const auth = getAuth();
  const user = auth.currentUser;
  console.log("getCurrentUser() returning:", user);
  return user; // This will return null if no user is logged in
}

export { getCurrentUser };

