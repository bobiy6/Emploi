import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api'),
});

// Robust URL handling to ensure correct path joining
api.interceptors.request.use((config) => {
  // Ensure baseURL ends with / and url doesn't start with /
  if (config.baseURL && !config.baseURL.endsWith('/')) {
    config.baseURL += '/';
  }

  // Handle URL carefully. If it's absolute, don't modify it.
  if (config.url && !config.url.startsWith('http')) {
    // If the URL starts with / we strip it because baseURL already ends with /
    if (config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }
  }

  return config;
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
