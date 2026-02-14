const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payPeriodStart: {
    type: Date,
    required: true
  },
  payPeriodEnd: {
    type: Date,
    required: true
  },
  regularHours: {
    type: Number,
    required: true
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  regularPay: {
    type: Number,
    required: true
  },
  overtimePay: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  totalPay: {
    type: Number,
    required: true
  },
  timeEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeEntry'
  }],
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending'
  },
  pdfUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);