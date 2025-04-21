function checkRole(allowedRoles) {
  return (req, res, next) => {
    // Extract role from the faculty object (set by facultyAuth middleware)
    const role = req.faculty ? req.faculty.role : null;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Access Denied: Insufficient privileges' });
    }

    next();
  };
}

module.exports = checkRole;