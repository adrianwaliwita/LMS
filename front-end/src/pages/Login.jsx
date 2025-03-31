import { useState } from "react";
import Logo from "/SMSC.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const success = await login(email, password);

      if (success) {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid email or password.");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const response = await axios.post(
        "https://ashbourne-scms-backend-292636467871.us-central1.run.app/v1/reset-user-password",
        { email }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Password reset link sent to your email!"
        );
        setShowResetForm(false);
      } else {
        toast.error(response.data.message || "Failed to send reset link");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Network error. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-16">
      {/* Toast Container - can be placed anywhere in the component */}
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
        {/* Logo section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-l from-[#0008BF] to-[#164beb] items-center justify-center h-[500px]">
          <div className="flex items-center justify-center w-full h-full p-8">
            <img
              src={Logo}
              alt="Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {/* Form section */}
        <div className="w-full p-8 lg:w-1/2 flex flex-col justify-center h-[500px]">
          <h2 className="text-2xl font-semibold text-gray-700 text-center">
            Ashbourne Smart Campus
          </h2>
          <p className="text-xl text-gray-600 text-center">Welcome!</p>

          {!showResetForm ? (
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-4">
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
              <div className="mb-6">
                <div className="flex justify-between">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowResetForm(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <button
                  className="cursor-pointer bg-gradient-to-l from-[#0008BF] to-[#164beb] text-white font-bold py-2 px-4 w-full rounded hover:bg-gray-600"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="mt-4">
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Enter your email to reset password
                </label>
                <input
                  className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  className="cursor-pointer bg-gradient-to-l from-[#0008BF] to-[#164beb] text-white font-bold py-2 px-4 w-full rounded hover:bg-gray-600"
                  type="submit"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  className="cursor-pointer bg-gray-300 text-gray-700 font-bold py-2 px-4 w-full rounded hover:bg-gray-400"
                  type="button"
                  onClick={() => setShowResetForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
