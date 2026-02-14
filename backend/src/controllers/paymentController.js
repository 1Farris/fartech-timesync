const Payment = require('../models/Payment');
const TimeEntry = require('../models/TimeEntry');
const User = require('../models/User');

exports.calculatePayment = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const payRate = user.payRate;

    // Get approved time entries
    const timeEntries = await TimeEntry.find({
      userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: 'approved'
    });

    // Calculate total hours
    const totalHours = timeEntries.reduce((sum, entry) => {
      return sum + entry.hours + (entry.minutes / 60);
    }, 0);

    // Calculate regular and overtime
    const regularHours = Math.min(totalHours, 40);
    const overtimeHours = Math.max(totalHours - 40, 0);

    const regularPay = regularHours * payRate;
    const overtimePay = overtimeHours * payRate * 1.5;
    const bonus = 0; // Can be set based on performance

    const totalPay = regularPay + overtimePay + bonus;

    const payment = await Payment.create({
      userId,
      payPeriodStart: new Date(startDate),
      payPeriodEnd: new Date(endDate),
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      bonus,
      totalPay,
      timeEntries: timeEntries.map(entry => entry._id)
    });

    res.json({
      success: true,
      payment,
      breakdown: {
        totalHours: totalHours.toFixed(2),
        regularHours: regularHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        regularPay: regularPay.toFixed(2),
        overtimePay: overtimePay.toFixed(2),
        bonus: bonus.toFixed(2),
        totalPay: totalPay.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ payPeriodEnd: -1 })
      .populate('timeEntries');

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};