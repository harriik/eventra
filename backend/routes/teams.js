const express = require('express');
const { body, validationResult } = require('express-validator');
const Team = require('../models/Team');
const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const { authenticate, authorize } = require('../middleware/auth');
const { ensureUserParticipantId } = require('../utils/participantId');

const router = express.Router();

// Generate unique team code
const generateTeamCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;
  
  while (exists) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existingTeam = await Team.findOne({ team_code: code });
    exists = !!existingTeam;
  }
  
  return code;
};

// @route   POST /api/teams
// @desc    Create a new team (Team leader)
// @access  Private (Student)
router.post('/', authenticate, authorize('student'), [
  body('team_name').trim().notEmpty().withMessage('Team name is required'),
  body('event_id').isMongoId().withMessage('Valid event ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { team_name, event_id } = req.body;

    // Check if event exists
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event allows teams (check both old and new format)
    const maxTeamSize = event.max_team_size || event.team_size || 1;
    if (maxTeamSize <= 1) {
      return res.status(400).json({ message: 'This event does not support team registration' });
    }

    // Check if user is already in a team for this event
    const existingTeam = await Team.findOne({
      event_id,
      $or: [
        { leader_id: req.user._id },
        { member_ids: req.user._id }
      ]
    });

    if (existingTeam) {
      return res.status(400).json({ message: 'You are already part of a team for this event' });
    }

    // Check if user is already registered individually
    const existingRegistration = await Registration.findOne({
      user_id: req.user._id,
      event_id,
      team_id: null
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered individually for this event' });
    }

    // Generate team code
    const team_code = await generateTeamCode();

    // Create team
    const team = new Team({
      team_code,
      team_name,
      event_id,
      leader_id: req.user._id,
      member_ids: [],
      status: 'forming'
    });

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('leader_id', 'name email mobile college student_id')
      .populate('member_ids', 'name email mobile college student_id')
      .populate('event_id', 'title team_size');

    res.status(201).json({
      message: 'Team created successfully',
      team: populatedTeam
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/teams/join
// @desc    Join a team using team code or team ID
// @access  Private (Student)
router.post('/join', authenticate, authorize('student'), [
  body('event_id').isMongoId().withMessage('Valid event ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { team_code, team_id, event_id } = req.body;

    if (!team_code && !team_id) {
      return res.status(400).json({ message: 'Either team_code or team_id is required' });
    }

    // Find team by code or ID
    let team;
    if (team_id) {
      team = await Team.findOne({ _id: team_id, event_id }).populate('event_id');
    } else {
      team = await Team.findOne({ 
        team_code: team_code.toUpperCase(),
        event_id 
      }).populate('event_id');
    }

    if (!team) {
      return res.status(404).json({ message: 'Team not found or invalid team code' });
    }

    // Check if team is already registered
    if (team.status === 'registered') {
      return res.status(400).json({ message: 'This team has already been registered for the event' });
    }

    // Check if user is already in a team for this event
    const existingTeam = await Team.findOne({
      event_id,
      $or: [
        { leader_id: req.user._id },
        { member_ids: req.user._id }
      ]
    });

    if (existingTeam) {
      return res.status(400).json({ message: 'You are already part of a team for this event' });
    }

    // Check if user is already registered individually
    const existingRegistration = await Registration.findOne({
      user_id: req.user._id,
      event_id,
      team_id: null
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered individually for this event' });
    }

    // Check if user is trying to join their own team
    if (team.leader_id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You are already the leader of this team' });
    }

    // Check if team is full
    const event = team.event_id;
    const maxTeamSize = event.max_team_size || event.team_size || 3;
    const currentSize = 1 + team.member_ids.length; // leader + members
    if (currentSize >= maxTeamSize) {
      return res.status(400).json({ message: `Team is full (maximum ${maxTeamSize} members)` });
    }

    // Add user to team
    team.member_ids.push(req.user._id);

    // Check if team is now complete (reached minimum size)
    const minTeamSize = event.min_team_size || 2;
    const newSize = 1 + team.member_ids.length;
    if (newSize >= minTeamSize && newSize <= maxTeamSize) {
      team.status = 'complete';
    }

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('leader_id', 'name email mobile college student_id')
      .populate('member_ids', 'name email mobile college student_id')
      .populate('event_id', 'title team_size');

    res.json({
      message: 'Successfully joined team',
      team: populatedTeam
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teams/available/:eventId
// @desc    Get available teams with free slots for an event
// @access  Private (Student)
router.get('/available/:eventId', authenticate, authorize('student'), async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const maxTeamSize = event.max_team_size || event.team_size || 3;

    // Find teams that are not full and not registered
    const teams = await Team.find({
      event_id: eventId,
      status: { $ne: 'registered' }
    })
      .populate('leader_id', 'name email college')
      .populate('member_ids', 'name email college')
      .populate('event_id', 'title');

    // Filter teams with available slots
    const availableTeams = teams.filter(team => {
      const currentSize = 1 + team.member_ids.length;
      return currentSize < maxTeamSize;
    }).map(team => ({
      ...team.toObject(),
      current_size: 1 + team.member_ids.length,
      max_size: maxTeamSize,
      slots_available: maxTeamSize - (1 + team.member_ids.length)
    }));

    res.json(availableTeams);
  } catch (error) {
    console.error('Get available teams error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teams/my-team/:eventId
// @desc    Get user's team for an event
// @access  Private (Student)
router.get('/my-team/:eventId', authenticate, authorize('student'), async (req, res) => {
  try {
    const { eventId } = req.params;

    const team = await Team.findOne({
      event_id: eventId,
      $or: [
        { leader_id: req.user._id },
        { member_ids: req.user._id }
      ]
    })
      .populate('leader_id', 'name email mobile college student_id')
      .populate('member_ids', 'name email mobile college student_id')
      .populate('event_id', 'title team_size date venue');

    if (!team) {
      return res.status(404).json({ message: 'You are not part of any team for this event' });
    }

    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/teams/:teamId/register
// @desc    Register the entire team for the event (Team leader only)
// @access  Private (Student)
router.post('/:teamId/register', authenticate, authorize('student'), async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId).populate('event_id');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the team leader
    if (team.leader_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can register the team' });
    }

    // Check if team is already registered
    if (team.status === 'registered') {
      return res.status(400).json({ message: 'Team is already registered' });
    }

    const event = team.event_id;
    const currentSize = 1 + team.member_ids.length;

    // Get min and max team sizes (support both old and new format)
    const minTeamSize = event.min_team_size || 2;
    const maxTeamSize = event.max_team_size || event.team_size || 3;

    // Check if team meets minimum size requirement
    if (currentSize < minTeamSize) {
      return res.status(400).json({ message: `Team must have at least ${minTeamSize} members to register` });
    }

    // Check if team exceeds maximum size
    if (currentSize > maxTeamSize) {
      return res.status(400).json({ message: `Team size exceeds the maximum allowed size of ${maxTeamSize}` });
    }

    // Check if any member is already registered
    const allMemberIds = [team.leader_id, ...team.member_ids];
    const existingRegistrations = await Registration.find({
      event_id: event._id,
      user_id: { $in: allMemberIds }
    });

    if (existingRegistrations.length > 0) {
      return res.status(400).json({ message: 'One or more team members are already registered for this event' });
    }

    // Register all team members
    const registrations = [];
    for (const userId of allMemberIds) {
      const registrationCount = await Registration.countDocuments();
      const registration_id = `REG${new Date().getFullYear()}_${String(registrationCount + 1).padStart(5, '0')}`;

      // Ensure each user has a participant_id (per-user, reused across events)
      const participant_id = await ensureUserParticipantId(userId);

      const registration = new Registration({
        registration_id,
        user_id: userId,
        event_id: event._id,
        participant_id,
        team_id: team._id
      });

      await registration.save();
      registrations.push(registration);

      // Create attendance record for each registration
      const attendanceCount = await Attendance.countDocuments();
      const attendance_id = `ATT${new Date().getFullYear()}_${String(attendanceCount + 1).padStart(5, '0')}`;

      const attendance = new Attendance({
        attendance_id,
        registration_id: registration._id,
        status: 'NotMarked'
      });

      await attendance.save();
    }

    // Update team status
    team.status = 'registered';
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('leader_id', 'name email mobile college student_id')
      .populate('member_ids', 'name email mobile college student_id')
      .populate('event_id', 'title team_size');

    res.json({
      message: 'Team registered successfully',
      team: populatedTeam,
      registrations_count: registrations.length
    });
  } catch (error) {
    console.error('Register team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/teams/:teamId/leave
// @desc    Leave a team (Member only, not leader)
// @access  Private (Student)
router.delete('/:teamId/leave', authenticate, authorize('student'), async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if team is already registered
    if (team.status === 'registered') {
      return res.status(400).json({ message: 'Cannot leave a registered team' });
    }

    // Check if user is the leader
    if (team.leader_id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Team leader cannot leave. Delete the team instead or transfer leadership' });
    }

    // Check if user is a member
    const memberIndex = team.member_ids.findIndex(
      id => id.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'You are not a member of this team' });
    }

    // Remove user from team
    team.member_ids.splice(memberIndex, 1);

    // Update status if team is no longer complete
    if (team.status === 'complete') {
      team.status = 'forming';
    }

    await team.save();

    res.json({
      message: 'Successfully left the team',
      team
    });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/teams/:teamId
// @desc    Delete a team (Team leader only)
// @access  Private (Student)
router.delete('/:teamId', authenticate, authorize('student'), async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the team leader
    if (team.leader_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can delete the team' });
    }

    // Check if team is already registered
    if (team.status === 'registered') {
      return res.status(400).json({ message: 'Cannot delete a registered team' });
    }

    await Team.findByIdAndDelete(teamId);

    res.json({
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

