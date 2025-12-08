const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Critical env validation
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  // Fail fast if JWT secret is missing to avoid 500s during login
  // eslint-disable-next-line no-console
  console.error('FATAL: JWT_SECRET is not set. Please set it in backend/.env and restart the server.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teams', require('./routes/teams'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EVENTRA API is running' });
});

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventra';

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoURI.split('@')[1]?.split('?')[0] || 'eventra'}`);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('\n⚠️  CRITICAL: Database not connected!');
  console.error('\nTroubleshooting:');
  console.error('1. MongoDB Atlas: Whitelist your IP (0.0.0.0/0 for testing)');
  console.error('2. Verify username/password in MONGODB_URI');
  console.error('3. Check network connectivity');
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


