// src/pages/NotAuthorized.jsx
import { Link } from "react-router-dom";

const NotAuthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white border-2 border-blue-700 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          403 - Not Authorized
        </h1>
        <p className="text-gray-700 mb-6">
          You don't have permission to access this page. Please contact tech
          support if you believe this is an error.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotAuthorized;
