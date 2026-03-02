import { 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from './firebase';
import api from './api';

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