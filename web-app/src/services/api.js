import axios from 'axios';
import { auth } from './firebase';

/**
 * API Service
 * ------------
 * Centralized HTTP client for communicating
 * with the backend REST API.
 *
 * Uses Axios to perform requests such as:
 * - Authentication
 * - Time entry operations
 * - Analytics retrieval
 *
 * This allows consistent API communication
 * across the frontend application.
 */

// Create an Axios instance with the base URL from environment variables.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;