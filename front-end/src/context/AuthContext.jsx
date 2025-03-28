import { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  getIdTokenResult,
} from "firebase/auth";
import axios from "axios";
import { auth } from "../config/firebase-client";

const AuthContext = createContext();
const baseUrl = import.meta.env.VITE_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get ID token
          const idToken = await getIdToken(firebaseUser);

          // Get token result for additional claims
          const tokenResult = await getIdTokenResult(firebaseUser);

          // // Log Firebase user object
          // console.log("Firebase User:", {
          //   uid: firebaseUser.uid,
          //   email: firebaseUser.email,
          //   emailVerified: firebaseUser.emailVerified,
          // });

          // // Log ID Token
          // console.log("ID Token:", idToken);

          // // Log Token Claims
          // console.log("Token Claims:", tokenResult.claims);

          // Fetch additional user details from your JSON server if needed
          const response = await axios.get(
            `${baseUrl}/users?email=${firebaseUser.email}`
          );
          const userDetails = response.data[0] || {};

          // Log JSON Server User Details
          console.log("JSON Server User Details:", userDetails);

          const combinedUser = {
            ...userDetails,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
          };

          // Log Combined User Object
          console.log("Combined User Object:", combinedUser);

          setUser(combinedUser);
          setToken(idToken);

          // Store user and token in localStorage
          localStorage.setItem("user", JSON.stringify(combinedUser));
          localStorage.setItem("token", idToken);
        } catch (error) {
          console.error("Authentication setup error:", error);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // onAuthStateChanged will handle setting the user and token
      return true;
    } catch (error) {
      console.error("Firebase Login Error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle clearing the user and token
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
