require('dotenv').config(); // Loads environment variables from .env file, allowing sensitive data like API keys to be stored securely.
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const AWS = require('aws-sdk');
// const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe client for payment processing

const app = express();
app.use(express.json());
// app.use(cors()); // Enables CORS for all routes, allowing requests from different origins.

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fartech';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));
// Test endpoint
app.get('/test-mongo', (req, res) => {
  res.json({ message: 'MongoDB connected successfully' });
});

app.get('/test-sync', (req, res) => res.json({ message: 'Sync OK' })); 

// User role endpoint
app.post('/users', (req, res) => {
  const { userId, role } = req.body;
  // TODO: Save to MongoDB (e.g., using a User model)
  res.status(201).json({ message: 'User role saved', userId, role });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// User Schema - Defines the structure for user data in the database (like a table in SQL).
const userSchema = new mongoose.Schema({
  userId: String,
  email: String,
  role: { type: String, enum: ['worker', 'team_leader', 'admin'] }, // Role can only be one of these.
  hourlyRate: Number,
  teamId: String
});
const User = mongoose.model('User', userSchema); // Creates a model to interact with users collection.

// Timesheet Schema - Structure for time entries.
const timesheetSchema = new mongoose.Schema({
  userId: String,
  date: String,
  hours: Number,
  minutes: Number,
  proof: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});
const Timesheet = mongoose.model('Timesheet', timesheetSchema);

// Team Schema - Structure for teams.
const teamSchema = new mongoose.Schema({
  name: String,
  leaderId: String,
  members: [String]
});
const Team = mongoose.model('Team', teamSchema);

// Authentication Middleware - Checks if the user has a valid token for protected routes.
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Unauthorized');
  jwt.verify(token.split(' ')[1], 'secret_key', (err, user) => { // 'secret_key' is a placeholder; use a strong secret in production.
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

// Time Entry Endpoint - Saves a new timesheet when a user logs time.
app.post('/timesheet', authenticate, async (req, res) => {
  const { hours, minutes, date } = req.body;
  const timesheet = new Timesheet({
    userId: req.user.userId,
    date,
    hours,
    minutes
  });
  await timesheet.save(); // Saves to MongoDB.
  res.status(201).json(timesheet); // Returns the saved timesheet as JSON.
});

// Proof Upload - Handles file uploads for proof (e.g., screenshots).
const upload = multer({ dest: 'uploads/' });
const s3 = new AWS.S3(); // AWS S3 client; configure with your AWS access keys in environment variables (e.g., process.env.AWS_ACCESS_KEY_ID).
app.post('/timesheet/proof/:id', authenticate, upload.single('proof'), async (req, res) => {
  const file = req.file;
  const params = {
    Bucket: 'fartech-timesync-proofs', // Your S3 bucket name.
    Key: `${req.params.id}/${file.originalname}`,
    Body: require('fs').createReadStream(file.path)
  };
  const result = await s3.upload(params).promise();
  await Timesheet.updateOne({ _id: req.params.id }, { proof: result.Location }); // Updates the timesheet with the S3 URL.
  res.json({ proof: result.Location });
});

// Payment Calculation - Calculates pay based on timesheets.
app.get('/payment/:userId/:period', authenticate, async (req, res) => {
  const { userId, period } = req.params;
  const user = await User.findOne({ userId });
  const timesheets = await Timesheet.find({ userId, date: { $gte: period.start, $lte: period.end }, status: 'approved' });
  
  let totalHours = 0;
  timesheets.forEach(ts => {
    totalHours += ts.hours + ts.minutes / 60;
  });
  
  const regularHours = Math.min(totalHours, 40);
  const overtimeHours = Math.max(totalHours - 40, 0);
  const regularPay = regularHours * user.hourlyRate;
  const overtimePay = overtimeHours * user.hourlyRate * 1.5;
  const bonus = 0; // Add bonus logic later.
  const totalPay = regularPay + overtimePay + bonus;

  res.json({
    regularHours,
    regularPay,
    overtimeHours,
    overtimePay,
    bonus,
    totalPay
  });
});

// Team Management Endpoint - Creates a new team (for admins).
app.post('/team', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Admins only');
  const { name, leaderId, members } = req.body;
  const team = new Team({ name, leaderId, members });
  await team.save();
  res.status(201).json(team);
});

app.listen(3000, () => console.log('Server running on port 3000'));