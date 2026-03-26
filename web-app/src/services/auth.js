import { 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from './firebase';
import api from './api';

/**
 * auth.js
 * -----------------------
 * This service provides authentication-related functions for the TimeSync application. 
 * It includes methods for user registration, login, logout, and fetching the user's profile. 
 * The login function integrates with Firebase Authentication to verify user credentials and 
 * obtain a secure ID token, which is then sent to the backend API for authentication. The service 
 * uses Axios for making HTTP requests to the backend API and handles token management for secure 
 * communication between the frontend and backend. 
 * 
 */

// Define the authService object that contains methods for user registration, login, logout, and 
// fetching the user's profile.
export const authService = {
  async register(email, password, firstName, lastName, role) {
    
    
    // Register in backend
    const response = await api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      role,
    });

    return response.data.user;
  },

  async login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Get the secure ID token from Firebase
  const idToken = await userCredential.user.getIdToken();
  
  // Send the token to your backend instead of the raw UID
  const response = await api.post('/auth/login', {}, {
    headers: { Authorization: `Bearer ${idToken}` }
  });
console.log (response)
  return response.data.user;
},

  async logout() {
    await signOut(auth);
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.user;
  }
};