// Import the Firebase authentication methods and your auth instance
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase"; // Adjust the path as necessary to point to your Firebase config file

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Detach the listener once we get the user data to avoid memory leaks
      resolve(user);
    }, reject);
  });
};
