const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const facultyAuth = require('../middleware/facultyAuth');

// Public routes
router.post('/add', facultyController.addFaculty);
router.post('/login', facultyController.facultyLogin);

// Protected routes
router.get('/all', facultyAuth, facultyController.getFaculty);
router.put('/:id', facultyAuth, facultyController.updateFaculty);
router.delete('/:id', facultyAuth, facultyController.deleteFaculty);

module.exports = router;
