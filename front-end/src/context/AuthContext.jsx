import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Create Auth Context
const backendUrl =
  "https://ashbourne-scms-backend-292636467871.us-central1.run.app/v1/users";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Load user data from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (parseError) {
        console.error("Error parsing stored data:", parseError);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // Login with Firebase and fetch user details from backend
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get Firebase token
      const firebaseToken = await firebaseUser.getIdToken();
      setToken(firebaseToken);

      // Fetch user details from backend using email
      const response = await axios.get(`${backendUrl}?email=${email}`, {
        headers: { Authorization: `Bearer ${firebaseToken}` },
        timeout: 10000,
      });

      const userDetails = response.data;
      if (!userDetails || userDetails.length === 0) {
        throw new Error("User not found in backend");
      }

      // Combine Firebase and backend user data
      const fullUser = {
        ...firebaseUser,
        ...userDetails[0],
      };

      // Store user and token data
      setUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));
      localStorage.setItem("token", firebaseToken);

      return true;
    } catch (error) {
      console.error("Login Error:", error);
      setError(error.response?.data?.message || "Authentication failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function

  const logout = async () => {
    const navigate = useNavigate();

    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Redirect to login page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, error, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
