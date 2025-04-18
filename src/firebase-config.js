import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth";
// import dotenv from "dotenv";
// dotenv.config()
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

console.log("Firebase Config: ", firebaseConfig); // Debugging log
// console.log("Firebase Config: ", firebaseConfig)
const app = initializeApp(firebaseConfig); // Establish connection
// console.log(process.env.authDomain)
export const db = getFirestore(app);
export const auth = getAuth(app);