// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'; 
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsztvNrVVoe7ncJRls1urDDozQbUcEXgA",
  authDomain: "trip-tally-c943b.firebaseapp.com",
  projectId: "trip-tally-c943b",
  storageBucket: "trip-tally-c943b.appspot.com",
  messagingSenderId: "517220520191",
  appId: "1:517220520191:web:fc191df9a29f73733dbcca"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp); 
export const db = getFirestore(firebaseApp);