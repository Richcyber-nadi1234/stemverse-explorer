
import axios from 'axios';

// Attempt to determine API URL from environment or default to localhost
// In Vite, import.meta.env is used.
let API_URL = 'http://localhost:3000';

try {
  // @ts-ignore
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    // @ts-ignore
    API_URL = import.meta.env.VITE_API_URL;
  } else if (process.env.REACT_APP_API_URL) {
    API_URL = process.env.REACT_APP_API_URL;
  }
} catch (e) {
  // Silent fallback
}

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
      // Only redirect if not on a public route to prevent loops
      const currentHash = window.location.hash;
      if (!currentHash.includes('/login') && !currentHash.includes('/register') && currentHash !== '#/') {
          localStorage.removeItem('stemverse_token');
          localStorage.removeItem('stemverse_user');
          window.location.href = '/#/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;