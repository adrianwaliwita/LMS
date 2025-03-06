import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaUser } from "react-icons/fa"; // Import icons

const HeaderDesktop = () => {
  const { user } = useAuth();
  const [showUserInfo, setShowUserInfo] = useState(false);
  <p className="hidden md:block">
    Welcome, {user.name} ({user.role})
  </p>;

  return (
    <div className=" bg-gradient-to-l from-[#0008BF] to-[#164beb] text-white p-4 flex justify-ce items-center rounded-lg shadow-md">
      {/* Logo/Title - Responsive sizing */}
      <h1 className="text-base md:text-lg font-bold truncate max-w-[60%]">
        Welcome, {user.name} ({user.role})
      </h1>
    </div>
  );
};

export default HeaderDesktop;
