const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { sendStudentIdEmail } = require('../utils/emailService');
const { generateParticipantIdForUser } = require('../utils/participantId');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate Student ID: STU2025_<5 digit number>
const generateStudentId = async () => {
  const year = new Date().getFullYear();
  const studentCount = await User.countDocuments({ role: 'student', student_id: { $exists: true } });
  const studentNumber = String(studentCount + 1).padStart(5, '0');
  return `STU${year}_${studentNumber}`;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required'),
  body('college').trim().notEmpty().withMessage('College name is required'),
  body('role').isIn(['student', 'coordinator', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, mobile, college, role } = req.body;
    const userRole = role || 'student';

    // Check if user already exists
    let user = await User.findOne({ email });
    
    // Generate Student ID if registering as a student
    let studentId = null;
    let participantId = null;
    if (userRole === 'student') {
      if (user && user.student_id) {
        // Keep existing student_id if user already has one
        studentId = user.student_id;
      } else {
        // Generate new student_id
        studentId = await generateStudentId();
      }

      // Participant ID is per-user and shared across events
      if (user && user.participant_id) {
        participantId = user.participant_id;
      } else {
        participantId = await generateParticipantIdForUser();
      }
    }
    
    if (user) {
      // If user exists, update their information (allows re-registration)
      user.name = name;
      user.password = password; // Will be hashed by pre-save hook
      user.mobile = mobile;
      user.college = college;
      user.role = userRole;
      if (userRole === 'student' && studentId) {
        user.student_id = studentId;
      }
      if (userRole === 'student' && participantId) {
        user.participant_id = participantId;
      }
      user.created_at = new Date(); // Reset creation date
      await user.save();
    } else {
      // Create new user
      const userData = {
        name,
        email,
        password,
        mobile,
        college,
        role: userRole
      };
      if (userRole === 'student' && studentId) {
        userData.student_id = studentId;
      }
      if (userRole === 'student' && participantId) {
        userData.participant_id = participantId;
      }
      user = new User(userData);
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Send Student ID email if user is a student and has a student_id
    if (userRole === 'student' && studentId) {
      // Send email asynchronously (don't wait for it to complete)
      sendStudentIdEmail(user.email, user.name, studentId)
        .then(result => {
          if (result.success) {
            console.log(`Student ID email sent successfully to ${user.email}`);
          } else {
            console.error(`Failed to send Student ID email to ${user.email}:`, result.error || result.message);
          }
        })
        .catch(error => {
          console.error(`Error sending Student ID email to ${user.email}:`, error);
        });
    }

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        college: user.college,
        student_id: user.student_id || null,
        participant_id: user.participant_id || null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        college: user.college
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


