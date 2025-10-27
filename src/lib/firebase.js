// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase config is valid
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error('Firebase configuration is missing! Please check your .env.local file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics = null;

// Function to initialize analytics safely
function initializeAnalytics() {
  if (typeof window !== 'undefined' && !analytics) {
    try {
      // Dynamic import to avoid SSR issues
      import('firebase/analytics').then(({ getAnalytics }) => {
        analytics = getAnalytics(app);
      }).catch(error => {
        console.warn('Firebase Analytics initialization failed:', error);
      });
    } catch (error) {
      console.warn('Firebase Analytics initialization failed:', error);
    }
  }
  return analytics;
}

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Note: Anonymous sign-in is now handled on-demand by components
// to ensure proper error handling and user authentication flow

export { 
  db, 
  auth, 
  initializeAnalytics,
  googleProvider, 
  signInAnonymously, 
  signInWithPopup, 
  onAuthStateChanged 
};

