import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfQg7-uC0PoYCOiSO2lik-LWLyEGGWQ48",
  authDomain: process.env.authDomain,
  projectId: "mealie-e6c06",
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};

// console.log("Firebase Config: ", firebaseConfig)
const app = initializeApp(firebaseConfig); // Establish connection

export const db = getFirestore(app);
export const auth = getAuth(app);