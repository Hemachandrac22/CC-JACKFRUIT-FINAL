const Event = require('../models/Event');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    // Admin can see all events
    if (req.faculty.role === 'Admin' || req.faculty.role === 'admin') {
      const events = await Event.find();
      return res.json(events);
    }

    // HOD can see events from their department
    if (req.faculty.role === 'HOD') {
      const events = await Event.find({ department: req.faculty.department });
      return res.json(events);
    }

    // Regular faculty can see events only in their department
    const events = await Event.find({ department: req.faculty.department });
    return res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, department } = req.body;
    
    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      organizer: req.faculty.facultyId,
      department,
      isActive: true
    });
    
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check permissions - Admin can update any event
    if (req.faculty.role !== 'Admin' && req.faculty.role !== 'admin') {
      // Non-admin can only update their own events
      if (event.organizer.toString() !== req.faculty.facultyId.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check permissions - Admin can delete any event
    if (req.faculty.role !== 'Admin' && req.faculty.role !== 'admin') {
      // HOD can delete events in their department
      if (req.faculty.role === 'HOD' && event.department !== req.faculty.department) {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
      }
      
      // Non-HOD faculty can only delete their own events
      if (req.faculty.role !== 'HOD' && event.organizer.toString() !== req.faculty.facultyId.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
      }
    }
    
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};