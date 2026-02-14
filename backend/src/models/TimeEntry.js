const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  minutes: {
    type: Number,
    required: true,
    min: 0,
    max: 59
  },
  taskType: {
    type: String,
    required: true,
    enum: ['AI Training', 'Search Quality Rating', 'Data Annotation', 'Other']
  },
  description: String,
  proofUrl: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  clockInTime: Date,
  clockOutTime: Date
}, {
  timestamps: true
});

// Calculate total hours
timeEntrySchema.virtual('totalHours').get(function() {
  return this.hours + (this.minutes / 60);
});

// Index for efficient querying
timeEntrySchema.index({ userId: 1, date: -1 });
timeEntrySchema.index({ status: 1 });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);