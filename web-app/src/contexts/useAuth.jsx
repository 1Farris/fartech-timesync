import AuthContext from "./context";
import { useContext } from "react";

/**
 * useAuth.jsx
 * -----------------------
 * A custom hook that provides easy access to the AuthContext, allowing components to access the current 
 * user and authentication functions without needing to directly use the context API. 
 * This hook ensures that it is used within an AuthProvider and simplifies the process of consuming 
 * authentication state and actions throughout the app.
 */

// Define the useAuth hook that retrieves the authentication context and ensures it is used within an 
// AuthProvider.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};