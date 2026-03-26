import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { authService } from '../services/auth';
import AuthContext from './context';

/**
 * AuthContext.jsx
 * -----------------------
 * This file defines the AuthContext and AuthProvider components for managing user authentication 
 * state across the application. 
 * It uses Firebase Authentication to listen for changes in the user's authentication status and 
 * provides login, registration, and logout functions through context.
 */

// Define the AuthProvider component that wraps around the app and provides authentication state 
// and functions to its children.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for changes in the user's authentication status using Firebase's onAuthStateChanged function.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    login: authService.login,
    register: authService.register,
    logout: authService.logout
  };

  // Render the AuthContext.Provider with the current user and authentication functions, and 
  // only render children when loading is complete.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};