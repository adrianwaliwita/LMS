import axios from "axios";

const baseURL =
  "https://ashbourne-scms-backend-292636467871.us-central1.run.app/v1";

// Create axios instance
const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
