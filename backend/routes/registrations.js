const express = require('express');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Team = require('../models/Team');
const { authenticate, authorize } = require('../middleware/auth');
const { ensureUserParticipantId } = require('../utils/participantId');

const router = express.Router();

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

    // Get participant ID for this user (per-user, reused across events)
    const participant_id = await ensureUserParticipantId(req.user._id);

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

        // If this registration belongs to a team, fetch basic team info + teammates
        let teamInfo = null;
        if (reg.team_id) {
          const team = await Team.findById(reg.team_id)
            .populate('leader_id', 'name')
            .populate('member_ids', 'name');

          if (team) {
            const allMembers = [team.leader_id, ...team.member_ids].filter(Boolean);
            teamInfo = {
              team_name: team.team_name,
              teammates: allMembers
                .filter(m => m._id.toString() !== reg.user_id.toString())
                .map(m => ({ id: m._id, name: m.name }))
            };
          }
        }

        return {
          ...reg.toObject(),
          attendance: attendance ? attendance.status : 'NotMarked',
          team_info: teamInfo
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
      let isAssigned = false;

      if (Array.isArray(event.coordinator_ids) && event.coordinator_ids.length > 0) {
        isAssigned = event.coordinator_ids.some(
          coordId => coordId.toString() === req.user._id.toString()
        );
      } else if (event.coordinator_id) {
        const legacyId = event.coordinator_id._id || event.coordinator_id;
        isAssigned = legacyId.toString() === req.user._id.toString();
      }

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


