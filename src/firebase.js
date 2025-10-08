// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Config values come from your Firebase Console → Project Settings → Web App
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ?? "AIzaSyD7AFxBfVUzXf_jFMTiXsbHfJfBDo5KuAY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ?? "projectdata-firebase.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ?? "projectdata-firebase",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ?? "projectdata-firebase.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER ?? "20916193303",
  appId: process.env.REACT_APP_FIREBASE_APP_ID ?? "1:20916193303:web:e0f2d4c8c792e44ae47452",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export helpers to use in the rest of your app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google provider used throughout the app.
export const googleProvider = new GoogleAuthProvider();

export const getProjectsCollectionRef = (database = db) =>
  database ? collection(database, "projects") : null;
