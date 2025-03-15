// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuw7jRfibdCerguMpvWORJOOYn85yzBrs",
  authDomain: "park-o-meter-46d64.firebaseapp.com",
  projectId: "park-o-meter-46d64",
  storageBucket: "park-o-meter-46d64.firebasestorage.app",
  messagingSenderId: "270578299436",
  appId: "1:270578299436:web:90b33a83c9ecec23365789",
  measurementId: "G-Y0ZNJT8W06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;
