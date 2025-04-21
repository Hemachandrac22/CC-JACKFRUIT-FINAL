const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');

// Add new faculty with default password
exports.addFaculty = async (req, res) => {
  try {
    const { name, email, department, designation, phone, office, password } = req.body;

    // Check if there is already an HOD for the department
    if (designation === 'HOD') {
      const existingHOD = await Faculty.findOne({ department, designation: 'HOD' });
      if (existingHOD) {
        return res.status(400).json({ message: 'There should be only one HOD for a department', reason: 'HOD already exists for this department' });
      }
    }

    // Create username from email (before @)
    const username = email.split('@')[0];

    const faculty = new Faculty({
      name,
      email,
      department,
      designation,
      phone,
      office,
      username,
      password: password || 'faculty123', // Default password if not provided
      passwordChanged: false
    });

    await faculty.save();
    res.status(201).json(faculty);
  } catch (err) {
    res.status(400).json({ error: err.message, reason: 'Validation or database error occurred' });
  }
};

// Get all faculty
exports.getFaculty = async (req, res) => {
  try {
    // Admin has unrestricted access to all faculty
    if (req.faculty.role === 'Admin' || req.faculty.role === 'admin') {
      const faculty = await Faculty.find().select('-password');
      return res.json(faculty);
    }
    
    // HOD can only see faculty in their department
    if (req.faculty.role === 'HOD') {
      const faculty = await Faculty.find({ department: req.faculty.department }).select('-password');
      return res.json(faculty);
    }
    
    // Regular faculty - can only see their own profile
    const faculty = await Faculty.findById(req.faculty.facultyId).select('-password');
    return res.json([faculty]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete faculty
exports.deleteFaculty = async (req, res) => {
  try {
    // Admin can delete any faculty
    if (req.faculty.role === 'Admin' || req.faculty.role === 'admin') {
      await Faculty.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Deleted Successfully' });
    }
    
    // Restrict HOD to their department
    if (req.faculty.role === 'HOD') {
      const target = await Faculty.findById(req.params.id);
      if (!target || target.department !== req.faculty.department) {
        return res.status(403).json({ message: 'Not allowed to delete faculty outside your department' });
      }
      await Faculty.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Deleted Successfully' });
    }
    
    // Regular faculty cannot delete
    return res.status(403).json({ message: 'You do not have permission to delete faculty' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Faculty login
exports.facultyLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Find faculty
    const faculty = await Faculty.findOne({ username });
    if (!faculty) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Compare password
    const isMatch = await faculty.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        facultyId: faculty._id, 
        role: faculty.designation,
        department: faculty.department, // Added department to token
        firstLogin: !faculty.passwordChanged
      },
      process.env.JWT_SECRET || 'faculty_jwt_secret',
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      faculty: {
        id: faculty._id,
        username: faculty.username,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        designation: faculty.designation,
        firstLogin: !faculty.passwordChanged
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    // Admin can update any faculty
    if (req.faculty.role === 'Admin' || req.faculty.role === 'admin') {
      const { name, email, department, designation, phone, office } = req.body;
      const updated = await Faculty.findByIdAndUpdate(
        req.params.id,
        { name, email, department, designation, phone, office },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
      return res.json(updated);
    }
    
    // HOD can edit faculty in their department
    if (req.faculty.role === 'HOD') {
      const target = await Faculty.findById(req.params.id);
      if (!target || target.department !== req.faculty.department) {
        return res.status(403).json({ message: 'Not allowed to edit faculty outside your department' });
      }
      const { name, email, department, designation, phone, office } = req.body;
      const updated = await Faculty.findByIdAndUpdate(
        req.params.id,
        { name, email, department, designation, phone, office },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
      return res.json(updated);
    }
    
    // Faculty can only update their own profile
    if (req.params.id !== req.faculty.facultyId) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }
    
    const { name, email, phone } = req.body;
    const updated = await Faculty.findByIdAndUpdate(
      req.faculty.facultyId,
      { name, email, phone }, // Limited fields that can be updated
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
