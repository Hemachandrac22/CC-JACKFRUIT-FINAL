// Use port 5000 for staff/admin; 5001 for faculty
const STAFF_API_URL = 'http://localhost:5000/api/auth';
const FACULTY_API_URL = 'http://localhost:5001/api/faculty';

// Check if on login page and set up login form
if (document.getElementById('loginForm')) {
  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      // First try admin login
      const adminResponse = await fetch(`${STAFF_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (adminResponse.ok) {
        const data = await adminResponse.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify({
          username: data.user.username,
          role: data.user.role,
          department: data.user.department
        }));
        window.location.href = 'dashboard.html';
        return;
      }
      
      // If admin login fails, try faculty login
      const facultyResponse = await fetch(`${FACULTY_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (facultyResponse.ok) {
        const data = await facultyResponse.json();
        localStorage.setItem('facultyToken', data.token);
        localStorage.setItem('faculty', JSON.stringify(data.faculty));

        // No more redirect to change-password.html
        window.location.href = 'dashboard.html';
        return;
      }
      
      // If both fail, show error
      document.getElementById('errorMsg').style.display = 'block';
      document.getElementById('errorMsg').textContent = 'Invalid username or password';
      
    } catch (error) {
      console.error('Error during login:', error);
      document.getElementById('errorMsg').style.display = 'block';
      document.getElementById('errorMsg').textContent = 'Server error. Please try again later.';
    }
  });
}

// Function to check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  const facultyToken = localStorage.getItem('facultyToken');
  const currentUser = localStorage.getItem('currentUser');
  const faculty = localStorage.getItem('faculty');
  
  if (token && currentUser) {
    return JSON.parse(currentUser);
  } else if (facultyToken && faculty) {
    return JSON.parse(faculty);
  } else {
    window.location.href = 'index.html';
    return null;
  }
}

// Function to make authenticated API calls
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'x-auth-token': token,
    ...options.headers
  };
  
  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
      return;
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    return null;
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('facultyToken');
  localStorage.removeItem('faculty');
  window.location.href = 'index.html';
}
