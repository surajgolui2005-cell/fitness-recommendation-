const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');
const Profile  = require('../models/Profile');

/**
 * @route   POST /api/feedback
 * @desc    Save or update a user's 👍/👎 rating for their diet & workout plan
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  const { dietRating, workoutRating, comment } = req.body;

  // Validate ratings
  if (![1, -1].includes(dietRating) || ![1, -1].includes(workoutRating)) {
    return res.status(400).json({ msg: 'Ratings must be 1 (👍) or -1 (👎)' });
  }

  try {
    // Get user's current profile to snapshot their data
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ msg: 'Complete your profile first before rating.' });
    }

    // Upsert: update if exists, create if not
    const feedback = await Feedback.findOneAndUpdate(
      { user: req.user.id },
      {
        user:              req.user.id,
        goal:              profile.goal,
        dietaryPreference: profile.dietaryPreference,
        activityLevel:     profile.activityLevel,
        bmi:               profile.stats.bmi,
        dietRating,
        workoutRating,
        comment:           comment || '',
        createdAt:         new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ msg: 'Thanks for your feedback! 🙌', feedback });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/feedback/similar
 * @desc    Find users with similar goal + BMI (±3 range) and return
 *          the most common highly-rated plan type among them
 * @access  Private
 */
router.get('/similar', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ msg: 'No profile found.' });
    }

    const bmi  = profile.stats.bmi;
    const goal = profile.goal;

    // Find similar users: same goal, BMI within ±3
    const similarFeedbacks = await Feedback.find({
      user: { $ne: req.user.id },   // exclude self
      goal,
      bmi: { $gte: bmi - 3, $lte: bmi + 3 },
    }).limit(50);

    if (similarFeedbacks.length === 0) {
      return res.json({
        similarUsersCount: 0,
        insight: null,
        msg: 'Not enough similar users yet. Be one of the first! 🚀',
      });
    }

    // Tally ratings
    const dietLikes    = similarFeedbacks.filter(f => f.dietRating    === 1).length;
    const workoutLikes = similarFeedbacks.filter(f => f.workoutRating === 1).length;
    const total        = similarFeedbacks.length;

    const dietApproval    = Math.round((dietLikes    / total) * 100);
    const workoutApproval = Math.round((workoutLikes / total) * 100);

    res.json({
      similarUsersCount: total,
      insight: {
        dietApprovalPct:    dietApproval,
        workoutApprovalPct: workoutApproval,
        msg: `${total} users with similar profile (${goal}, BMI ~${bmi}) rated their plans. Diet 👍 ${dietApproval}% · Workout 👍 ${workoutApproval}%`,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
