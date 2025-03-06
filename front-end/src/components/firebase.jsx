// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0ZC9rV42UwfbNaFECD-DQRfC4UCVka9Y",
  authDomain: "smsc-auth.firebaseapp.com",
  projectId: "smsc-auth",
  storageBucket: "smsc-auth.firebasestorage.app",
  messagingSenderId: "2357056093",
  appId: "1:2357056093:web:0fb310f249dc3e4c8f33b4",
  measurementId: "G-JD0VMM6R47",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth();
export default app;
