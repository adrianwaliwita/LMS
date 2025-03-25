import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const baseUrl = import.meta.env.VITE_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email, password) => {
    try {
      // Query the JSON server specifically for the user with this email
      const response = await axios.get(`${baseUrl}/users?email=${email}`);

      // Check if we found any users with this email
      if (response.data.length === 0) {
        console.log("No user found with this email");
        return false;
      }

      const foundUser = response.data[0];

      // If the user has a password field, validate it
      if (foundUser.password && foundUser.password !== password) {
        console.log("Password incorrect");
        return false;
      }

      // Login successful
      console.log("Login successful", foundUser);

      const { password: _, ...userWithoutPassword } = foundUser;

      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };
  const logout = () => {
    setUser(null); // Clear user
    localStorage.removeItem("user");
    console.log(user);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
