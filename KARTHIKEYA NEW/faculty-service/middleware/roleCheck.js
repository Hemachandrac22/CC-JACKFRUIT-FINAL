function checkRole(allowedRoles) {
  return (req, res, next) => {
    const role = req.headers['role']; // Example: 'admin', 'faculty', 'student'

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Access Denied' });
    }

    next();
  };
}

module.exports = checkRole;
