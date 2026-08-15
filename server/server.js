require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many AI requests, please slow down.'
});

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow production origin dynamic matching
    }
  },
  credentials: true
}));

// Rate Limiting
app.use(globalLimiter);

// Body parser
app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Mount routes
app.use('/api/questions', aiLimiter);
app.use('/api/interviews/cheat-sheet', aiLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/results', require('./routes/results'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/verify', require('./routes/verify'));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
