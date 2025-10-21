// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBd56KFZJgL2otUduGDC2re9A2T1GRJztw",
  authDomain: "shoppingapp-eec37.firebaseapp.com",
  projectId: "shoppingapp-eec37",
  storageBucket: "shoppingapp-eec37.firebasestorage.app",
  messagingSenderId: "1065517940653",
  appId: "1:1065517940653:web:4018d5d18643d9e7b1ab24",
  measurementId: "G-18J9LM9PMB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
  db, 
  auth, 
  googleProvider, 
  signInAnonymously, 
  signInWithPopup, 
  onAuthStateChanged 
};
