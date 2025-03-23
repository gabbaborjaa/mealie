import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import firebase from "firebase/compat/app";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.APIKey,
  authDomain: process.env.authDomain,
  projectId: process.env.ProjectID,
  storageBucket: process.env.StorageBucket,
  messagingSenderId: process.env.MessagingSenderID,
  appId: process.env.AppID
};

const app = initializeApp(firebaseConfig); // Establish connection

export const db = getFirestore(app);