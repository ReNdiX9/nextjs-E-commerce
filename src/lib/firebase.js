import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBd56KFZJgL2otUduGDC2re9A2T1GRJztw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "shoppingapp-eec37.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "shoppingapp-eec37",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "shoppingapp-eec37.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1065517940653",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1065517940653:web:4018d5d18643d9e7b1ab24"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider, signInAnonymously, signInWithPopup, onAuthStateChanged };
