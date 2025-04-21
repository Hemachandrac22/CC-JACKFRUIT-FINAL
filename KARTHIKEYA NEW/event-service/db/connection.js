const mongoose = require('mongoose');

// Database Configuration
const DB_NAME = 'eventDB'; // Update this to your actual database name
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://Hemachandra:Hemachandra1!@ac-bvy31wv-shard-00-00.wsvfha9.mongodb.net:27017,ac-bvy31wv-shard-00-01.wsvfha9.mongodb.net:27017,ac-bvy31wv-shard-00-02.wsvfha9.mongodb.net:27017/?replicaSet=atlas-wumbjs-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0/${DB_NAME}`;

// Connect to MongoDB with improved error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Using database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Stack Trace:', error.stack); // Log stack trace for debugging
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;