
import axios from 'axios';

// Use Vite environment variable for API URL, fallback to localhost for development
// Note: In Vite, env variables must start with VITE_
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stemverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.hash.replace('#', '');
      if (currentPath !== '/login' && currentPath !== '/' && currentPath !== '/register') {
          localStorage.removeItem('stemverse_token');
          // Optional: Trigger a global logout event or redirect
          // window.location.href = '/#/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
