import { useAuth } from "../context/AuthContext";

const HeaderDesktop = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-l from-[#0008BF] to-[#164beb] text-white p-4 flex justify-ce items-center rounded-lg shadow-md ">
      {/* Logo/Title - Responsive sizing */}
      <h1 className="text-base md:text-lg font-bold truncate max-w-[60%]">
        Welcome, {user.firstName}
      </h1>
    </div>
  );
};

export default HeaderDesktop;
