const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  team_code: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    uppercase: true
  },
  team_name: {
    type: String,
    required: true,
    trim: true
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  leader_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  member_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['forming', 'complete', 'registered'],
    default: 'forming'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index to prevent duplicate team members
teamSchema.index({ event_id: 1, leader_id: 1 });
teamSchema.index({ event_id: 1, member_ids: 1 });

module.exports = mongoose.model('Team', teamSchema);

