const mongoose = require('mongoose');

/**
 * Team Model
 * -----------------------
 * Represents a team within the organization, including its name, leader, members, and description.
 */
const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);