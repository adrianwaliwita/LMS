import { useState } from "react";
import Logo from "/SMSC.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard"); // Redirect after login
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="py-16">
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl min-h-[80vh]">
        <div className="hidden lg:block lg:w-1/2 bg-cover relative bg-gradient-to-l from-[#0008BF] to-[#164beb]">
          <img
            src={Logo}
            alt="Description of image"
            className="absolute inset-0 m-auto max-w-full max-h-full object-contain"
          />
        </div>
        <div className="w-full p-8 lg:w-1/2 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-gray-700 text-center">
            Ashbourne Smart Campus
          </h2>
          <p className="text-xl text-gray-600 text-center">Welcome!</p>

          {error && (
            <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <div className="flex justify-between">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <a href="#" className="text-xs text-gray-500">
                  Forget Password?
                </a>
              </div>
              <input
                className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-8">
              <button
                className=" cursor-pointer pointer-events-auto bg-gradient-to-l from-[#0008BF] to-[#164beb] text-white font-bold py-2 px-4 w-full rounded hover:bg-gray-600"
                type="submit"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
