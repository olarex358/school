// src/firebase/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsyUqpWYk6aJz_1XNeloX6kPsiwlbdU",
  authDomain: "school-af571.firebaseapp.com",
  projectId: "school-af571",
  storageBucket: "school-af571.appspot.com",
  messagingSenderId: "288060215433",
  appId: "1:288060215433:web:b9d4b92b7ca2d303c87658",
  measurementId: "G-G5QLV670ZN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Corrected export statement to include all initialized services
export { db, storage };
