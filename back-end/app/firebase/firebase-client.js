import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase web app's configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGYJCJROiRdOaTDEogVeLNwWDqV7tZCLE",
  authDomain: "ashbourne-scms.firebaseapp.com",
  projectId: "ashbourne-scms",
  storageBucket: "ashbourne-scms.firebasestorage.app",
  messagingSenderId: "292636467871",
  appId: "1:292636467871:web:9332748da214ef4baab8aa",
  measurementId: "G-CJD9TNVT9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };