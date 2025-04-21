const jwt = require('jsonwebtoken');

const facultyAuth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-faculty-token') || req.header('x-auth-token'); // Check both headers
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token - try both secrets
    let decoded;
    try {
      // Try faculty secret first
      const facultySecret = process.env.JWT_SECRET || 'faculty_jwt_secret';
      decoded = jwt.verify(token, facultySecret);
    } catch (innerErr) {
      try {
        // If faculty secret fails, try admin secret
        const adminSecret = 'your_jwt_secret'; // Same secret used in backend/server.js
        decoded = jwt.verify(token, adminSecret);
        // Convert admin token format to faculty token format
        decoded = {
          role: 'Admin', // Special designation for unlimited access
          facultyId: decoded.userId,
          department: 'All Departments'
        };
      } catch (adminErr) {
        // Both secrets failed
        throw new Error('Invalid token');
      }
    }

    // Set decoded data to request
    req.faculty = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = facultyAuth;
