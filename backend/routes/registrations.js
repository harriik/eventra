const express = require('express');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate participant ID: EVT2025_<5 digit number>
const generateParticipantId = async () => {
  const year = new Date().getFullYear();
  const count = await Registration.countDocuments();
  const participantNumber = String(count + 1).padStart(5, '0');
  return `EVT${year}_${participantNumber}`;
};

// @route   POST /api/registrations
// @desc    Enroll in an event (Student only)
// @access  Private (Student)
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Check if event exists
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event requires team registration (check both old and new format)
    const maxTeamSize = event.max_team_size || event.team_size || 1;
    if (maxTeamSize > 1) {
      // Check if user is part of a team for this event
      const Team = require('../models/Team');
      const userTeam = await Team.findOne({
        event_id: event_id,
        $or: [
          { leader_id: req.user._id },
          { member_ids: req.user._id }
        ]
      });

      if (!userTeam) {
        return res.status(400).json({ 
          message: 'This event requires team registration. Please create or join a team first.',
          requires_team: true,
          team_size: event.team_size
        });
      }

      // Check if team is registered
      if (userTeam.status !== 'registered') {
        return res.status(400).json({ 
          message: 'Your team is not yet registered. The team leader needs to register the team.',
          team_status: userTeam.status
        });
      }
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      user_id: req.user._id,
      event_id: event_id
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Generate participant ID
    const participant_id = await generateParticipantId();

    // Generate registration ID
    const registrationCount = await Registration.countDocuments();
    const registration_id = `REG${new Date().getFullYear()}_${String(registrationCount + 1).padStart(5, '0')}`;

    // Create registration
    const registration = new Registration({
      registration_id,
      user_id: req.user._id,
      event_id: event_id,
      participant_id
    });

    await registration.save();

    // Create attendance record
    const attendanceCount = await Attendance.countDocuments();
    const attendance_id = `ATT${new Date().getFullYear()}_${String(attendanceCount + 1).padStart(5, '0')}`;

    const attendance = new Attendance({
      attendance_id,
      registration_id: registration._id,
      status: 'NotMarked'
    });

    await attendance.save();

    const populatedRegistration = await Registration.findById(registration._id)
      .populate('event_id')
      .populate('user_id', 'name email mobile college');

    res.status(201).json({
      message: 'Successfully enrolled in event',
      registration: populatedRegistration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/registrations/my-registrations
// @desc    Get current user's registrations
// @access  Private (Student)
router.get('/my-registrations', authenticate, authorize('student'), async (req, res) => {
  try {
    const registrations = await Registration.find({ user_id: req.user._id })
      .populate('event_id')
      .sort({ timestamp: -1 });

    // Get attendance for each registration
    const registrationsWithAttendance = await Promise.all(
      registrations.map(async (reg) => {
        const attendance = await Attendance.findOne({ registration_id: reg._id });
        return {
          ...reg.toObject(),
          attendance: attendance ? attendance.status : 'NotMarked'
        };
      })
    );

    res.json(registrationsWithAttendance);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/registrations/event/:eventId/participants
// @desc    Get participants for an event (Coordinator/Admin only)
// @access  Private (Coordinator, Admin)
router.get('/event/:eventId/participants', authenticate, authorize('coordinator', 'admin'), async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // If coordinator, verify they are assigned to this event
    if (req.user.role === 'coordinator') {
      const isAssigned = event.coordinator_ids?.some(
        coordId => coordId.toString() === req.user._id.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to this event' });
      }
    }

    const registrations = await Registration.find({ event_id: eventId })
      .populate('user_id', 'name email mobile college')
      .populate('event_id', 'title date venue')
      .sort({ timestamp: 1 });

    // Get attendance for each registration
    const participants = await Promise.all(
      registrations.map(async (reg) => {
        const attendance = await Attendance.findOne({ registration_id: reg._id });
        return {
          participant_id: reg.participant_id,
          name: reg.user_id.name,
          email: reg.user_id.email,
          mobile: reg.user_id.mobile,
          college: reg.user_id.college,
          registration_id: reg._id,
          attendance_status: attendance ? attendance.status : 'NotMarked',
          registered_at: reg.timestamp
        };
      })
    );

    res.json({
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue
      },
      participants,
      total: participants.length
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/registrations/all
// @desc    Get all registrations (Admin only)
// @access  Private (Admin)
router.get('/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { event_id, college } = req.query;
    let query = {};

    if (event_id) {
      query.event_id = event_id;
    }

    const registrations = await Registration.find(query)
      .populate('user_id', 'name email mobile college')
      .populate('event_id', 'title date venue')
      .sort({ timestamp: -1 });

    // Filter by college if provided
    let filteredRegistrations = registrations;
    if (college) {
      filteredRegistrations = registrations.filter(reg => 
        reg.user_id.college.toLowerCase().includes(college.toLowerCase())
      );
    }

    res.json(filteredRegistrations);
  } catch (error) {
    console.error('Get all registrations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


