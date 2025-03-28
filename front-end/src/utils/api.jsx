import axios from "axios";

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

export const setupAxiosInterceptors = (getToken) => {
  // Request interceptor
  api.interceptors.request.use(
    async (config) => {
      // Get the token
      const token = getToken();

      // If token exists, add it to the headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Optional: Response interceptor for handling unauthorized errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized error (e.g., logout user)
        console.log("Unauthorized - Token may be expired");
        // You might want to trigger a logout or token refresh here
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export default api;
