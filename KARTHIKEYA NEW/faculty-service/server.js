const express = require('express');
const connectDB = require('./db/connection'); // Fix path to db connection
const facultyRoutes = require('./routes/facultyRoutes');
const cors = require('cors');
const { seedAdminUser } = require('./utils/dbSeeder');

const app = express();

// Connect to MongoDB using the centralized connection function
connectDB()
  .then(() => {
    // Seed the admin user after successful connection
    seedAdminUser();
  })
  .catch(err => {
    console.error('Failed to connect to database:', err.message);
    console.error('Stack Trace:', err.stack); // Log stack trace for debugging
  });

app.use(cors());
app.use(express.json());

app.use('/api/faculty', facultyRoutes);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  console.error('Stack Trace:', err.stack); // Log stack trace for debugging
  res.status(500).json({ message: 'Server error. Please try again later.' });
});

app.listen(5001, () => {
  console.log('Faculty Service running on port 5001');
});
