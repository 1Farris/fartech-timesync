const mongoose = require('mongoose');
const { initializeApp } = require('firebase/app');
//const { firebaseConfig } = require('../config/firebase');
//const app = initializeApp(firebaseConfig);
//exports.auth = getAuth(app);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['worker', 'team-leader', 'admin'],
    default: 'worker'
  },
  payRate: {
    type: Number,
    default: 15
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'basic', 'pro'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);