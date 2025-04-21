const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'] 
  },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  phone: { type: String, required: true },
  office: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // removed minlength here
  passwordChanged: { type: Boolean, default: false }
}, { timestamps: true });

// Removed minimum password length validation
FacultySchema.path('password').validate(function(value) {
  if (this.username === 'admin' && value === 'admin') {
    return true;
  }
  return true; // Allow any password length
}, 'Password validation removed.');

// Hash password before saving with improved error handling
FacultySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    next(new Error('Password processing failed. Please try again.'));
  }
});

// Method to compare password with improved error handling
FacultySchema.methods.comparePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    console.error('Error comparing passwords:', err);
    return false;
  }
};

module.exports = mongoose.model('Faculty', FacultySchema);
