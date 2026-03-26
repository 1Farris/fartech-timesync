const admin = require('firebase-admin');
/**
 * Firebase Configuration
 * -----------------------
 * Initializes Firebase services used by the application.
 *
 * Services used:
 * - Firebase Authentication
 * - Firestore Database
 *
 * This configuration allows secure user authentication
 * and cloud data storage.
 */
/* ======================================================
   FIREBASE ADMIN INITIALIZATION
====================================================== */
const initializeFirebase = () => {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  // console.log(admin);
  console.log('Firebase Admin initialized');
};

/* ======================================================
   EXPORTS
====================================================== */
module.exports = { admin, initializeFirebase };