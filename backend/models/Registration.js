const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registration_id: {
    type: String,
    unique: true,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participant_id: {
    type: String,
    unique: true,
    required: true
  },
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate registrations
registrationSchema.index({ user_id: 1, event_id: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);


