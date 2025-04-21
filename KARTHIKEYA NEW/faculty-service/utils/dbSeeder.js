const Faculty = require('../models/Faculty');

/**
 * Seeds the database with a default admin user if one doesn't exist
 */
async function seedAdminUser() {
  try {
    // Check if admin already exists
    const adminExists = await Faculty.findOne({ username: 'admin' });

    if (!adminExists) {
      console.log('Creating default admin user...');
      const adminUser = new Faculty({
        name: 'Administrator',
        email: 'admin@example.com',
        department: 'All Departments', // Admin has access to all departments
        designation: 'Admin', // Admin designation
        phone: '0000000000',
        office: 'Admin Office',
        username: 'admin',
        password: 'admin', // Default password
        passwordChanged: false
      });

      await adminUser.save();
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    console.error('Stack Trace:', error.stack); // Log stack trace for debugging
  }
}

module.exports = {
  seedAdminUser
};
