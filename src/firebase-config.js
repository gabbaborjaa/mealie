import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import firebase from "firebase/compat/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfQg7-uC0PoYCOiSO2lik-LWLyEGGWQ48",
  authDomain: "mealie-e6c06.firebaseapp.com",
  projectId: "mealie-e6c06",
  storageBucket: "mealie-e6c06.firebasestorage.app",
  messagingSenderId: "465994510643",
  appId: "1:465994510643:web:467a1b74b5eece861e0e46"
};

// console.log("Firebase Config: ", firebaseConfig)
const app = initializeApp(firebaseConfig); // Establish connection

export const db = getFirestore(app);