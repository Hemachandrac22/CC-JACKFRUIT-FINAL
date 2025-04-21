const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db/connection');
const eventRoutes = require('./routes/eventRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(err => {
    console.error('Failed to connect to database:', err.message);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  console.error('Stack Trace:', err.stack);
  res.status(500).json({ message: 'Server error. Please try again later.' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Event Service running on port ${PORT}`);
});