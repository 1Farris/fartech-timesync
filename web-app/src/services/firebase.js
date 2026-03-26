import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * firebase.js
 * -----------------------
 * This file initializes the Firebase app and exports the authentication module for use 
 * across the frontend application. It uses environment variables to configure the Firebase 
 * app with the necessary credentials and settings. The getAuth function from Firebase is used to 
 * set up authentication services, allowing other parts of the application to easily access user 
 * authentication features such as login, registration, and token management.
 * 
 */

// Firebase configuration object that contains the necessary credentials and settings for initializing 
// the Firebase app. The values are sourced from environment variables for security and flexibility.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};


// Initialize the Firebase app with the provided configuration and export the authentication module for use in other parts of the frontend application.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };