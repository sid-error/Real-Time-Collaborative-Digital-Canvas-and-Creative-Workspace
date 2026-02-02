import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: { 'Content-Type': 'application/json' }
});

// Attach token using the Bearer scheme
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    // FIX: Match the backend 'Authorization' header requirement
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;