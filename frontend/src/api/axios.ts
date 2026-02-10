import axios from 'axios';

/**
 * Axios instance configured for the application's API.
 * This instance includes base configuration, interceptors for authentication,
 * and default headers for JSON communication.
 * 
 * @remarks
 * The API base URL is sourced from environment variables with a fallback
 * to local development server. Automatically attaches authentication tokens
 * from localStorage to all requests.
 * 
 * @example
 * ```typescript
 * // Basic GET request
 * const response = await api.get('/users');
 * 
 * // POST request with data
 * await api.post('/login', { email, password });
 * ```
 */
const api = axios.create({
  /**
   * Base URL for all API requests
   * @default 'http://localhost:5000/api'
   */
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  /**
   * Default headers for all requests
   */
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Request interceptor to automatically attach authentication tokens.
 * 
 * @description
 * This interceptor runs before every API request. It checks for an
 * authentication token in localStorage and, if present, adds it to
 * the request headers using the Bearer scheme format expected by
 * the backend server.
 * 
 * @param config - The Axios request configuration object
 * @returns The modified request configuration with authentication headers
 * 
 * @throws Will not throw but will silently skip token attachment if no token exists
 */
api.interceptors.request.use((config) => {
  // Retrieve authentication token from browser's localStorage
  const token = localStorage.getItem('auth_token');
  
  // Only add Authorization header if token exists
  if (token) {
    // Use Bearer token scheme as required by the backend
    // FIX: Match the backend 'Authorization' header requirement
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
});

export default api;