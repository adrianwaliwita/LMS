import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email, password) => {
    // Simulate login logic (you can replace this with actual backend validation)
    let role = "";

    // Example credentials (to be replaced with real API or DB check)
    if (email === "admin@example.com" && password === "123") {
      role = "admin";
    } else if (email === "lecturer@example.com" && password === "123") {
      role = "lecturer";
    } else if (email === "student@example.com" && password === "123") {
      role = "student";
    } else if (email === "coord@example.com" && password === "123") {
      role = "coordinator";
    }

    // If role is valid, set the user
    if (role) {
      setUser({ email, role });
      localStorage.setItem("user", JSON.stringify({ email, role }));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
