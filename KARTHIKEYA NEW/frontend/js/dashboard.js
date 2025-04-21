document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated
  const user = checkAuth();
  if (!user) return;

  // Update welcome message
  let userRole = 'Unknown Role';
  
  // Debug information
  console.log("User data:", user);
  
  if (user.username && user.role) {
    // For admin users from the backend/server.js system
    userRole = user.role ? user.role.replace('_', ' ') : 'Unknown Role';
    document.getElementById('userRole').textContent = `${user.username} (${userRole})`;
    
    // Show appropriate actions based on user role
    if (user.role === 'admin') {
      document.getElementById('adminActions').classList.remove('hidden');
    }
  } else {
    // For faculty users from the faculty service
    userRole = user.designation || 'Unknown Role';
    document.getElementById('userRole').textContent = `${user.name} (${userRole})`;
    
    // Check for HOD designation (case-insensitive check)
    if (user.designation && user.designation.toUpperCase() === 'HOD') {
      console.log("HOD detected, showing HOD actions");
      document.getElementById('hodActions').classList.remove('hidden');
    } else if (user.designation && user.designation.toUpperCase() === 'ADMIN') {
      console.log("Admin detected, showing admin actions");
      document.getElementById('adminActions').classList.remove('hidden');
    } else {
      // For regular faculty, show professor actions
      console.log("Regular faculty detected, showing professor actions");
      document.getElementById('professorActions').classList.remove('hidden');
    }
  }
});
