const jwt = require('jsonwebtoken');

const facultyAuth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-faculty-token') || req.header('x-auth-token');
    
    // Log token for debugging (don't keep in production)
    console.log('Received token:', token ? token.substring(0, 15) + '...' : 'No token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token - try different secrets and formats
    let decoded;
    try {
      // Try faculty secret first
      const facultySecret = process.env.JWT_SECRET || 'faculty_jwt_secret';
      decoded = jwt.verify(token, facultySecret);
      console.log('Token verified with faculty secret:', decoded.designation || decoded.role);
    } catch (innerErr) {
      console.log('Faculty secret verification failed:', innerErr.message);
      try {
        // Try hardcoded faculty secret as fallback
        const hardcodedFacultySecret = 'faculty_jwt_secret';
        decoded = jwt.verify(token, hardcodedFacultySecret);
        console.log('Token verified with hardcoded faculty secret');
      } catch (facultySecretErr) {
        console.log('Hardcoded faculty secret failed:', facultySecretErr.message);
        try {
          // If faculty secret fails, try admin secret
          const adminSecret = 'your_jwt_secret';
          decoded = jwt.verify(token, adminSecret);
          console.log('Token verified with admin secret');
          
          // Convert admin token format to faculty token format
          if (decoded.userId) {
            decoded = {
              role: 'Admin',
              facultyId: decoded.userId,
              department: 'All Departments'
            };
          }
        } catch (adminErr) {
          console.log('Admin secret failed:', adminErr.message);
          // Both secrets failed
          throw new Error('Invalid token - no valid secret found');
        }
      }
    }
    
    // Extra handling for HOD designation from faculty service
    if (decoded.designation === 'HOD') {
      // Ensure we have 'role' property for HOD users
      decoded.role = 'HOD';
    }
    
    console.log('Decoded token:', JSON.stringify(decoded));

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