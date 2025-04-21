const express = require('express');
const router = express.Router();
const facultyAuth = require('../middleware/facultyAuth');
const eventController = require('../controllers/eventController');

// Define routes
// GET all events
router.get('/', facultyAuth, eventController.getAllEvents);

// GET event by ID
router.get('/:id', facultyAuth, eventController.getEventById);

// POST new event
router.post('/', facultyAuth, eventController.createEvent);

// PUT update event
router.put('/:id', facultyAuth, eventController.updateEvent);

// DELETE event
router.delete('/:id', facultyAuth, eventController.deleteEvent);

module.exports = router;