const User = require('../models/User');

// Generate a unique participant ID for a user: PAR2025_<5 digit number>
const generateParticipantIdForUser = async () => {
  const year = new Date().getFullYear();

  // Use a simple loop with collision check to avoid duplicates
  while (true) {
    const count = await User.countDocuments({ participant_id: { $exists: true } });
    const participantNumber = String(count + 1).padStart(5, '0');
    const candidate = `PAR${year}_${participantNumber}`;

    const existing = await User.findOne({ participant_id: candidate });
    if (!existing) {
      return candidate;
    }
  }
};

// Ensure a user has a participant_id; generate and save if missing
const ensureUserParticipantId = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found while generating participant ID');
  }

  if (!user.participant_id) {
    user.participant_id = await generateParticipantIdForUser();
    await user.save();
  }

  return user.participant_id;
};

module.exports = {
  generateParticipantIdForUser,
  ensureUserParticipantId
};


