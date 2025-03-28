// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGYJCJROiRdOaTDEogVeLNwWDqV7tZCLE",
  authDomain: "ashbourne-scms.firebaseapp.com",
  projectId: "ashbourne-scms",
  storageBucket: "ashbourne-scms.firebasestorage.app",
  messagingSenderId: "292636467871",
  appId: "1:292636467871:web:9332748da214ef4baab8aa",
  measurementId: "G-CJD9TNVT9L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth();
export default app;
