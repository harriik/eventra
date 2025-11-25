const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  event_id: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  about: {
    type: String,
    required: true,
    trim: true
  },
  team_size: {
    type: Number,
    default: 1,
    min: 1
  },
  min_team_size: {
    type: Number,
    default: 1,
    min: 1
  },
  max_team_size: {
    type: Number,
    default: 1,
    min: 1
  },
  total_prize: {
    type: String,
    default: 'N/A',
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  coordinator_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);


