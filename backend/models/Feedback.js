const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  // Reference to the user who gave feedback
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },

  // Profile snapshot at the time of feedback (used for finding similar users)
  goal: {
    type: String,
    enum: ['weight loss', 'muscle gain', 'maintenance'],
    required: true,
  },
  dietaryPreference: {
    type: String,
    enum: ['vegan', 'vegetarian', 'non-vegetarian'],
    required: true,
  },
  activityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  bmi: {
    type: Number,
    required: true,
  },

  // Ratings: 1 = thumbs up 👍, -1 = thumbs down 👎
  dietRating: {
    type: Number,
    enum: [1, -1],
    required: true,
  },
  workoutRating: {
    type: Number,
    enum: [1, -1],
    required: true,
  },

  // Optional comment from user
  comment: {
    type: String,
    maxlength: 500,
    default: '',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One feedback per user (update if they re-rate)
FeedbackSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('feedback', FeedbackSchema);
