const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    // Total students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Total events
    const totalEvents = await Event.countDocuments();

    // Total registrations
    const totalRegistrations = await Registration.countDocuments();

    // Get events with participant counts
    const events = await Event.find().populate('coordinator_ids', 'name email mobile');
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.countDocuments({ event_id: event._id });
        const attendances = await Attendance.find({
          registration_id: { $in: (await Registration.find({ event_id: event._id })).map(r => r._id) }
        });
        const present = attendances.filter(a => a.status === 'Present').length;
        const attendancePercentage = registrations > 0 ? ((present / registrations) * 100).toFixed(2) : 0;

        const coordinators = event.coordinator_ids && event.coordinator_ids.length > 0
          ? event.coordinator_ids.map(c => c.name).join(', ')
          : 'Not assigned';

        return {
          _id: event._id,
          event_id: event.event_id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          coordinator: coordinators,
          coordinator_ids: event.coordinator_ids || [],
          participants_count: registrations,
          attendance_percentage: attendancePercentage
        };
      })
    );

    // Overall attendance stats
    const allAttendances = await Attendance.find();
    const totalPresent = allAttendances.filter(a => a.status === 'Present').length;
    const overallAttendancePercentage = totalRegistrations > 0 
      ? ((totalPresent / totalRegistrations) * 100).toFixed(2) 
      : 0;

    res.json({
      stats: {
        total_students: totalStudents,
        total_events: totalEvents,
        total_registrations: totalRegistrations,
        overall_attendance_percentage: overallAttendancePercentage
      },
      events: eventsWithStats
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { role, college } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ created_at: -1 });

    // Filter by college if provided
    let filteredUsers = users;
    if (college) {
      filteredUsers = users.filter(user => 
        user.college.toLowerCase().includes(college.toLowerCase())
      );
    }

    res.json(filteredUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/events/stats
// @desc    Get event-wise enrollment and attendance stats
// @access  Private (Admin)
router.get('/events/stats', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    const eventsStats = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.find({ event_id: event._id });
        const registrationIds = registrations.map(r => r._id);
        const attendances = await Attendance.find({ registration_id: { $in: registrationIds } });

        const present = attendances.filter(a => a.status === 'Present').length;
        const absent = attendances.filter(a => a.status === 'Absent').length;
        const notMarked = attendances.filter(a => a.status === 'NotMarked').length;
        const total = registrations.length;
        const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

        return {
          event_id: event.event_id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          total_registered: total,
          present,
          absent,
          not_marked: notMarked,
          attendance_percentage: attendancePercentage
        };
      })
    );

    res.json(eventsStats);
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/coordinators
// @desc    Create a new coordinator with generated password
// @access  Private (Admin)
router.post('/coordinators', async (req, res) => {
  try {
    const { name, email, mobile, college, roll_no } = req.body;

    if (!name || !email || !mobile || !college || !roll_no) {
      return res.status(400).json({ message: 'Name, email, mobile, college and roll number are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Generate a random password for coordinator
    const rawPassword = `COORD-${Math.random().toString(36).slice(-8)}`;

    const coordinator = new User({
      name,
      email,
      password: rawPassword, // Will be hashed by pre-save hook
      mobile,
      college,
      role: 'coordinator',
      student_id: roll_no
    });

    await coordinator.save();

    res.status(201).json({
      message: 'Coordinator created successfully',
      coordinator: {
        id: coordinator._id,
        name: coordinator.name,
        email: coordinator.email,
        mobile: coordinator.mobile,
        college: coordinator.college,
        roll_no: coordinator.student_id
      },
      generated_password: rawPassword
    });
  } catch (error) {
    console.error('Create coordinator error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


