const TimeEntry = require('../models/TimeEntry');
const { uploadToS3 } = require('../config/aws');

exports.createTimeEntry = async (req, res) => {
  try {
    const { date, hours, minutes, taskType, description } = req.body;
    let proofUrl = null;

    // Upload proof if provided
    if (req.file) {
      proofUrl = await uploadToS3(req.file, 'time-proofs');
    }

    const timeEntry = await TimeEntry.create({
      userId: req.user._id,
      date,
      hours,
      minutes,
      taskType,
      description,
      proofUrl
    });

    res.status(201).json({
      success: true,
      message: 'Time entry created successfully',
      timeEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTimeEntries = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      query.status = status;
    }

    const timeEntries = await TimeEntry.find(query)
      .sort({ date: -1 })
      .populate('approvedBy', 'firstName lastName');

    res.json({ success: true, timeEntries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clockIn = async (req, res) => {
  try {
    const timeEntry = await TimeEntry.create({
      userId: req.user._id,
      date: new Date(),
      hours: 0,
      minutes: 0,
      taskType: req.body.taskType,
      clockInTime: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Clocked in successfully',
      timeEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const { timeEntryId } = req.body;

    const timeEntry = await TimeEntry.findOne({
      _id: timeEntryId,
      userId: req.user._id,
      clockOutTime: null
    });

    if (!timeEntry) {
      return res.status(404).json({ error: 'Active time entry not found' });
    }

    const clockOutTime = new Date();
    const duration = (clockOutTime - timeEntry.clockInTime) / 1000 / 60; // minutes
    
    timeEntry.clockOutTime = clockOutTime;
    timeEntry.hours = Math.floor(duration / 60);
    timeEntry.minutes = Math.round(duration % 60);
    
    await timeEntry.save();

    res.json({
      success: true,
      message: 'Clocked out successfully',
      timeEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveTimeEntry = async (req, res) => {
  try {
    const { timeEntryId } = req.params;

    const timeEntry = await TimeEntry.findById(timeEntryId);

    if (!timeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    timeEntry.status = 'approved';
    timeEntry.approvedBy = req.user._id;
    timeEntry.approvedAt = new Date();
    
    await timeEntry.save();

    res.json({
      success: true,
      message: 'Time entry approved',
      timeEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};