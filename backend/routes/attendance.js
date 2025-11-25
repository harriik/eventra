const express = require('express');
const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/attendance/mark
// @desc    Mark attendance (Coordinator only)
// @access  Private (Coordinator)
router.post('/mark', authenticate, authorize('coordinator'), async (req, res) => {
  try {
    const { registration_id, status } = req.body;

    if (!registration_id || !status) {
      return res.status(400).json({ message: 'Registration ID and status are required' });
    }

    if (!['Present', 'Absent', 'NotMarked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Present, Absent, or NotMarked' });
    }

    // Get registration
    const registration = await Registration.findById(registration_id)
      .populate('event_id');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Verify coordinator is assigned to this event
    const isAssigned = registration.event_id.coordinator_ids?.some(
      coordId => coordId.toString() === req.user._id.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this event' });
    }

    // Update or create attendance
    let attendance = await Attendance.findOne({ registration_id });

    if (attendance) {
      attendance.status = status;
      attendance.marked_at = new Date();
      attendance.marked_by = req.user._id;
      await attendance.save();
    } else {
      const attendanceCount = await Attendance.countDocuments();
      const attendance_id = `ATT${new Date().getFullYear()}_${String(attendanceCount + 1).padStart(5, '0')}`;

      attendance = new Attendance({
        attendance_id,
        registration_id,
        status,
        marked_by: req.user._id
      });
      await attendance.save();
    }

    res.json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/event/:eventId
// @desc    Get attendance for an event
// @access  Private (Coordinator, Admin)
router.get('/event/:eventId', authenticate, authorize('coordinator', 'admin'), async (req, res) => {
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

    // Get all registrations for this event
    const registrations = await Registration.find({ event_id: eventId })
      .populate('user_id', 'name email mobile college');

    // Get attendance for each registration
    const attendanceRecords = await Promise.all(
      registrations.map(async (reg) => {
        const attendance = await Attendance.findOne({ registration_id: reg._id });
        return {
          registration_id: reg._id,
          participant_id: reg.participant_id,
          name: reg.user_id.name,
          college: reg.user_id.college,
          mobile: reg.user_id.mobile,
          status: attendance ? attendance.status : 'NotMarked',
          marked_at: attendance ? attendance.marked_at : null
        };
      })
    );

    // Calculate summary
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(a => a.status === 'Present').length;
    const absent = attendanceRecords.filter(a => a.status === 'Absent').length;
    const notMarked = attendanceRecords.filter(a => a.status === 'NotMarked').length;
    const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.json({
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue
      },
      summary: {
        total_registered: total,
        present,
        absent,
        not_marked: notMarked,
        attendance_percentage: attendancePercentage
      },
      attendance: attendanceRecords
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


