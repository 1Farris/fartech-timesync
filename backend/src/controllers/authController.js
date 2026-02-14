const User = require('../models/User');
const { admin } = require('../config/firebase');


exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
console.log('Registering user with email:', email);
    // Create Firebase user
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`
    });

    // Create user in MongoDB
    const user = await User.create({
      email,
      firebaseUid: firebaseUser.uid,
      firstName,
      lastName,
      role: role || 'worker'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    // 1. Get token from Header
    const authHeader = req.headers.authorization;
    const idToken = authHeader && authHeader.split(' ')[1];

    if (!idToken) return res.status(401).json({ error: 'No token provided' });

    // 2. Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid; // This is now verified and safe!

    // 3. Find user in MongoDB
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('teamId', 'name leaderId');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};