# College Department Management System - Quick Start Guide

## 1. First Login (Admin)
- Open the frontend (`frontend/index.html`) in your browser.
- Login as **Admin**:
  - **Username:** admin
  - **Password:** admin
- If no users exist, this will create the admin user for you.
## Before logging in as faculty/HOD please switch to "Faculty/HOD login" in login page
## 2. Add Faculty and HODs
- After admin login, go to **Manage Users**.
- Add HODs and other faculty members for each department.
- HODs and faculty will use their email prefix as username (e.g., `jdoe` for `jdoe@example.com`).
- Default password for faculty: **faculty123** (unless you set a custom one).

## 3. Faculty/HOD Login
- Faculty and HODs login using their username and password under the Faculty/HOD Login tab.
- On first login, they can change their password.

## 4. Hierarchy & Permissions
- **Admin**: Can manage all users and events across all departments.
- **HOD**: Can manage faculty and events only within their department. 
- **Faculty (non-HOD)**: Can view only their own profile and events in all department. Cannot add/edit/delete other faculty or events (except events they created).

## 5. Event Management
- Admin and HODs can create, edit, and delete events for their department.( HOD cannot edit admin created event)
- Faculty can only see events in their department.

## 6. Running the System
- Start MongoDB locally (`mongod --dbpath=<your-data-directory>`)
- Start all three services in separate terminals:
  - `cd faculty-service && npm install && node server.js` (port 5001)
  - `cd event-service && npm install && node server.js` (port 3000)
  - `cd backend && node server.js` (port 5000)
- Open `frontend/index.html` in your browser.

## 7. Notes
- If you see errors when adding users/events, the reason will be shown 
- All role-based rules are enforced in the backend.
- For any new microservice, follow the same authentication and folder structure.

---
This guide summarizes the working and rules of the College Department Management System for quick setup and usage.