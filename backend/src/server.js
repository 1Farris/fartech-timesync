const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

dotenv.config();
connectDB();
initializeFirebase();

const app = express();

/* ======================================================
   🚨 STRIPE WEBHOOK MUST COME BEFORE express.json()
====================================================== */
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

/* ======================================================
   NORMAL MIDDLEWARE
====================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

/* ======================================================
   ROUTES
====================================================== */
const authRoutes = require('./routes/auth');
const timeRoutes = require('./routes/timeEntries');

if (typeof authRoutes !== 'function')
  console.error('CRITICAL: authRoutes is not a function!');

if (typeof timeRoutes !== 'function')
  console.error('CRITICAL: timeRoutes is not a function!');

app.use('/api/auth', authRoutes);
app.use('/api/time-entries', timeRoutes);
app.use('/api/payments', require('./routes/payments'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/users', require('./routes/users'));

/* ======================================================
   HEALTH CHECK
====================================================== */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

/* ======================================================
   ERROR HANDLER
====================================================== */
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

/* ======================================================
   START SERVER
====================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});