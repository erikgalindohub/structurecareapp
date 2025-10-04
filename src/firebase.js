// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Config values come from your Firebase Console → Project Settings → Web App
const firebaseConfig = {
  apiKey: "AIzaSyD7AFxBfVUzXf_jFMTiXsbHfJfBDo5KuAY",
  authDomain: "projectdata-firebase.firebaseapp.com",
  projectId: "projectdata-firebase",
  storageBucket: "projectdata-firebase.appspot.com",
  messagingSenderId: "20916193303",
  appId: "1:20916193303:web:e0f2d4c8c792e44ae47452"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export helpers to use in the rest of your app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
