const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('coordinator_ids', 'name email mobile')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('coordinator_ids', 'name email mobile');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/events
// @desc    Create event (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('about').trim().notEmpty().withMessage('About is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('team_size').optional().isInt({ min: 1 }).withMessage('Team size must be at least 1'),
  body('min_team_size').optional().isInt({ min: 1 }).withMessage('Min team size must be at least 1'),
  body('max_team_size').optional().isInt({ min: 1 }).withMessage('Max team size must be at least 1'),
  body('total_prize').optional().trim(),
  body('coordinator_ids').optional().isArray().withMessage('Coordinator IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, about, date, venue, team_size, min_team_size, max_team_size, total_prize, coordinator_ids } = req.body;
    
    // Set default team sizes - if team_size is provided, use it for both min and max
    // Otherwise use min_team_size and max_team_size
    let finalTeamSize = team_size || 1;
    let finalMinTeamSize = min_team_size || finalTeamSize;
    let finalMaxTeamSize = max_team_size || finalTeamSize;
    
    // If only team_size is provided, use it for both min and max (backward compatibility)
    if (team_size && !min_team_size && !max_team_size) {
      finalMinTeamSize = team_size;
      finalMaxTeamSize = team_size;
    }
    
    // Validate min <= max
    if (finalMinTeamSize > finalMaxTeamSize) {
      return res.status(400).json({ message: 'Min team size cannot be greater than max team size' });
    }
    
    // Convert datetime-local format to Date object
    let eventDate;
    try {
      eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Verify coordinators exist and are coordinators
    if (coordinator_ids && coordinator_ids.length > 0) {
      const coordinators = await User.find({ _id: { $in: coordinator_ids } });
      const invalidCoordinators = coordinators.filter(c => c.role !== 'coordinator');
      if (invalidCoordinators.length > 0) {
        return res.status(400).json({ message: 'One or more selected users are not coordinators' });
      }
      if (coordinators.length !== coordinator_ids.length) {
        return res.status(400).json({ message: 'One or more coordinators not found' });
      }
    }

    // Generate unique event_id
    const year = new Date().getFullYear();
    let event_id;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      // Find the highest event_id number for this year
      const existingEvents = await Event.find({
        event_id: new RegExp(`^EVT${year}_`)
      }).sort({ event_id: -1 }).limit(1);
      
      let nextNumber = 1;
      if (existingEvents.length > 0) {
        const lastEventId = existingEvents[0].event_id;
        const match = lastEventId.match(/EVT\d+_(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      event_id = `EVT${year}_${String(nextNumber).padStart(5, '0')}`;
      
      // Check if this event_id already exists (race condition check)
      const existing = await Event.findOne({ event_id });
      if (!existing) {
        break; // Unique ID found
      }
      
      attempts++;
      nextNumber++; // Try next number
    }
    
    if (attempts >= maxAttempts) {
      return res.status(500).json({ message: 'Failed to generate unique event ID. Please try again.' });
    }

    const event = new Event({
      event_id,
      title,
      description,
      about,
      date: eventDate,
      venue,
      team_size: finalMaxTeamSize, // Keep for backward compatibility
      min_team_size: finalMinTeamSize,
      max_team_size: finalMaxTeamSize,
      total_prize: total_prize || 'N/A',
      coordinator_ids: coordinator_ids || []
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('coordinator_ids', 'name email mobile');

    res.status(201).json({
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event (Admin only)
// @access  Private (Admin)
router.put('/:id', authenticate, authorize('admin'), [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('about').optional().trim().notEmpty().withMessage('About cannot be empty'),
  body('date').optional().notEmpty().withMessage('Date is required'),
  body('venue').optional().trim().notEmpty().withMessage('Venue cannot be empty'),
  body('team_size').optional().isInt({ min: 1 }).withMessage('Team size must be at least 1'),
  body('min_team_size').optional().isInt({ min: 1 }).withMessage('Min team size must be at least 1'),
  body('max_team_size').optional().isInt({ min: 1 }).withMessage('Max team size must be at least 1'),
  body('total_prize').optional().trim(),
  body('coordinator_ids').optional().isArray().withMessage('Coordinator IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, about, date, venue, team_size, min_team_size, max_team_size, total_prize, coordinator_ids } = req.body;
    
    // Handle date conversion if provided
    let eventDate;
    if (date) {
      try {
        eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
      } catch (error) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    }
    
    // Handle team sizes
    let finalMinTeamSize, finalMaxTeamSize;
    if (min_team_size !== undefined || max_team_size !== undefined) {
      finalMinTeamSize = min_team_size;
      finalMaxTeamSize = max_team_size;
    } else if (team_size !== undefined) {
      finalMinTeamSize = team_size;
      finalMaxTeamSize = team_size;
    }
    
    // Validate min <= max if both are provided
    if (finalMinTeamSize !== undefined && finalMaxTeamSize !== undefined && finalMinTeamSize > finalMaxTeamSize) {
      return res.status(400).json({ message: 'Min team size cannot be greater than max team size' });
    }

    // Verify coordinators if provided
    if (coordinator_ids !== undefined) {
      if (coordinator_ids.length > 0) {
        const coordinators = await User.find({ _id: { $in: coordinator_ids } });
        const invalidCoordinators = coordinators.filter(c => c.role !== 'coordinator');
        if (invalidCoordinators.length > 0) {
          return res.status(400).json({ message: 'One or more selected users are not coordinators' });
        }
        if (coordinators.length !== coordinator_ids.length) {
          return res.status(400).json({ message: 'One or more coordinators not found' });
        }
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (about !== undefined) updateData.about = about;
    if (date !== undefined) updateData.date = eventDate;
    if (venue !== undefined) updateData.venue = venue;
    if (finalMinTeamSize !== undefined) updateData.min_team_size = finalMinTeamSize;
    if (finalMaxTeamSize !== undefined) {
      updateData.max_team_size = finalMaxTeamSize;
      updateData.team_size = finalMaxTeamSize; // Keep for backward compatibility
    } else if (team_size !== undefined) {
      updateData.team_size = team_size;
      if (finalMinTeamSize === undefined) {
        updateData.min_team_size = team_size;
      }
      if (finalMaxTeamSize === undefined) {
        updateData.max_team_size = team_size;
      }
    }
    if (total_prize !== undefined) updateData.total_prize = total_prize;
    if (coordinator_ids !== undefined) updateData.coordinator_ids = coordinator_ids;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('coordinator_ids', 'name email mobile');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/events/:id/coordinators
// @desc    Assign coordinator(s) to event (Admin only)
// @access  Private (Admin)
router.post('/:id/coordinators', authenticate, authorize('admin'), [
  body('coordinator_ids').isArray({ min: 1 }).withMessage('At least one coordinator ID is required'),
  body('coordinator_ids.*').isMongoId().withMessage('Invalid coordinator ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coordinator_ids } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Verify coordinators exist and are coordinators
    const coordinators = await User.find({ _id: { $in: coordinator_ids } });
    const invalidCoordinators = coordinators.filter(c => c.role !== 'coordinator');
    if (invalidCoordinators.length > 0) {
      return res.status(400).json({ message: 'One or more selected users are not coordinators' });
    }
    if (coordinators.length !== coordinator_ids.length) {
      return res.status(400).json({ message: 'One or more coordinators not found' });
    }

    // Add coordinators (avoid duplicates)
    const existingIds = event.coordinator_ids.map(id => id.toString());
    const newIds = coordinator_ids.filter(id => !existingIds.includes(id.toString()));
    event.coordinator_ids = [...event.coordinator_ids, ...newIds];

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('coordinator_ids', 'name email mobile');

    res.json({
      message: 'Coordinator(s) assigned successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Assign coordinator error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/events/:id/coordinators
// @desc    Reassign coordinators for event (Admin only) - replaces all coordinators
// @access  Private (Admin)
router.put('/:id/coordinators', authenticate, authorize('admin'), [
  body('coordinator_ids').isArray().withMessage('Coordinator IDs must be an array'),
  body('coordinator_ids.*').optional().isMongoId().withMessage('Invalid coordinator ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coordinator_ids } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Verify coordinators if provided
    if (coordinator_ids && coordinator_ids.length > 0) {
      const coordinators = await User.find({ _id: { $in: coordinator_ids } });
      const invalidCoordinators = coordinators.filter(c => c.role !== 'coordinator');
      if (invalidCoordinators.length > 0) {
        return res.status(400).json({ message: 'One or more selected users are not coordinators' });
      }
      if (coordinators.length !== coordinator_ids.length) {
        return res.status(400).json({ message: 'One or more coordinators not found' });
      }
      event.coordinator_ids = coordinator_ids;
    } else {
      event.coordinator_ids = [];
    }

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('coordinator_ids', 'name email mobile');

    res.json({
      message: 'Coordinators reassigned successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Reassign coordinator error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/events/:id/coordinators/:coordinatorId
// @desc    Remove coordinator from event (Admin only)
// @access  Private (Admin)
router.delete('/:id/coordinators/:coordinatorId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove coordinator from array
    event.coordinator_ids = event.coordinator_ids.filter(
      id => id.toString() !== req.params.coordinatorId
    );

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('coordinator_ids', 'name email mobile');

    res.json({
      message: 'Coordinator removed successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Remove coordinator error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
