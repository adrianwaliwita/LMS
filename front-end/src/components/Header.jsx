import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user } = useAuth();

  return (
    <div className="bg-blue-600 text-white p-4 flex justify-between rounded-lg">
      <h1 className="text-lg font-bold">Smart Campus System</h1>
      {user && (
        <p>
          Welcome, {user.name} ({user.role})
        </p>
      )}
    </div>
  );
};

export default Header;
