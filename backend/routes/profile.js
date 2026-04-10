const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Profile = require('../models/Profile');

// ─── Fitness Logic Helpers ───────────────────────────────────────────────────

/**
 * Calculate BMI from weight (kg) and height (cm)
 */
const calculateBMI = (weight, heightCm) => {
  const heightM = heightCm / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(2));
};

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 */
const calculateBMR = (weight, heightCm, age, gender) => {
  if (gender === 'Male') {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure) based on activity level
 */
const calculateTDEE = (bmr, activityLevel) => {
  let multiplier = 1.2; // sedentary / low
  if (activityLevel === 'medium') multiplier = 1.55; // moderately active
  if (activityLevel === 'high')   multiplier = 1.725; // very active
  return Math.round(bmr * multiplier);
};

/**
 * Adjust target calories based on fitness goal
 */
const adjustCalories = (tdee, goal) => {
  if (goal === 'weight loss')  return tdee - 500;
  if (goal === 'muscle gain')  return tdee + 300;
  return tdee; // maintenance
};

/**
 * Generate a personalised diet plan
 */
const generateDietPlan = (goal, dietaryPreference) => {
  let plan = { breakfast: '', lunch: '', dinner: '', snacks: '' };

  if (dietaryPreference === 'vegan') {
    plan.breakfast = 'Overnight oats with almond milk, chia seeds, banana slices & a drizzle of maple syrup';
    plan.lunch     = 'Quinoa bowl with roasted chickpeas, avocado, cherry tomatoes & lemon tahini dressing';
    plan.dinner    = 'Tofu & vegetable stir-fry with edamame, bok choy, bell peppers & jasmine rice';
    plan.snacks    = 'Apple slices with almond butter or a handful of mixed nuts & dried fruit';
  } else if (dietaryPreference === 'vegetarian') {
    plan.breakfast = 'Greek yogurt parfait with granola, honey, fresh berries & crushed walnuts';
    plan.lunch     = 'Red lentil dal with cumin-spiced brown rice & a fresh cucumber-tomato salad';
    plan.dinner    = 'Paneer tikka masala with whole-wheat roti, steamed basmati & mint raita';
    plan.snacks    = 'Whey protein shake with milk or a small bowl of roasted chana & almonds';
  } else {
    // non-vegetarian
    plan.breakfast = 'Three-egg spinach omelette with whole-grain toast, avocado & fresh orange juice';
    plan.lunch     = 'Grilled chicken breast (180 g) with roasted sweet potato wedges & steamed asparagus';
    plan.dinner    = 'Baked salmon (200 g) with quinoa pilaf, lemon herb sauce & roasted Brussels sprouts';
    plan.snacks    = 'Low-fat cottage cheese with cucumber sticks or a hard-boiled egg & whole-grain crackers';
  }

  // Goal-specific snack adjustment
  if (goal === 'weight loss') {
    plan.snacks = 'Fresh cucumber & carrot sticks with hummus (keeps calories low)';
  } else if (goal === 'muscle gain') {
    plan.snacks = plan.snacks + ' + extra whey protein shake post-workout';
  }

  return plan;
};

/**
 * Generate a personalised workout plan
 */
const generateWorkoutPlan = (goal, activityLevel) => {
  if (goal === 'weight loss') {
    return [
      { day: 'Mon / Wed / Fri', activity: 'HIIT Cardio', detail: '20–30 min high-intensity intervals (sprint 30 s, rest 30 s)' },
      { day: 'Tue / Thu',       activity: 'Full-Body Strength',  detail: 'Bodyweight circuits – squats, lunges, push-ups, planks (3 sets × 15 reps)' },
      { day: 'Saturday',        activity: 'Active Recovery',     detail: '45-min brisk walk or light cycling to stay active without overtraining' },
      { day: 'Sunday',          activity: 'Rest / Stretch',      detail: 'Yoga or full-body stretching session (30 min) for mobility & recovery' },
    ];
  } else if (goal === 'muscle gain') {
    return [
      { day: 'Monday',   activity: 'Push Day',  detail: 'Bench press, overhead press, incline DB press, tricep dips (4 × 8–10)' },
      { day: 'Tuesday',  activity: 'Pull Day',  detail: 'Barbell rows, pull-ups, face pulls, barbell curls (4 × 8–10)' },
      { day: 'Wednesday',activity: 'Legs Day',  detail: 'Squats, Romanian deadlifts, leg press, calf raises (4 × 8–12)' },
      { day: 'Thursday', activity: 'Rest',      detail: 'Active rest – light walk or mobility work' },
      { day: 'Fri / Sat',activity: 'Upper + Lower Repeat', detail: 'Repeat Push/Pull or Legs with progressive overload; aim to beat last week' },
      { day: 'Sunday',   activity: 'Rest',      detail: 'Full rest – adequate sleep is critical for muscle protein synthesis' },
    ];
  } else {
    // maintenance
    return [
      { day: 'Mon / Thu', activity: 'Moderate Cardio',   detail: '30-min jog, cycling or swimming at comfortable aerobic pace' },
      { day: 'Tue / Fri', activity: 'Resistance Training', detail: 'Full-body compound lifts at moderate weight (3 × 12 reps)' },
      { day: 'Wednesday', activity: 'Yoga / Pilates',    detail: '45-min flexibility & core stability session' },
      { day: 'Weekend',   activity: 'Fun Activity',      detail: 'Hiking, sports, dancing – keep moving & enjoy it!' },
    ];
  }
};

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/profile
 * @desc    Create or update user profile; recalculates all fitness stats
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  const { age, gender, height, weight, goal, activityLevel, dietaryPreference } = req.body;

  const bmi            = calculateBMI(weight, height);
  const bmr            = calculateBMR(weight, height, age, gender);
  const tdee           = calculateTDEE(bmr, activityLevel);
  const targetCalories = adjustCalories(tdee, goal);

  const profileData = {
    user: req.user.id,
    age, gender, height, weight, goal, activityLevel, dietaryPreference,
    stats: { bmi, bmr, tdee: targetCalories },
  };

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Append weight to history only when it changes
      if (Number(profile.weight) !== Number(weight)) {
        profileData.weightHistory = [...profile.weightHistory, { weight: Number(weight) }];
      } else {
        profileData.weightHistory = profile.weightHistory;
      }
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileData },
        { new: true }
      );
      return res.json(profile);
    }

    // First time – seed weight history
    profileData.weightHistory = [{ weight: Number(weight) }];
    profile = new Profile(profileData);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/profile/me
 * @desc    Get current user's profile + generated recommendations
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
    if (!profile) {
      return res.status(400).json({ msg: 'No profile found for this user' });
    }

    const dietPlan   = generateDietPlan(profile.goal, profile.dietaryPreference);
    const workoutPlan = generateWorkoutPlan(profile.goal, profile.activityLevel);

    res.json({ profile, recommendations: { dietPlan, workoutPlan } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/profile/weight
 * @desc    Log a new weight entry for progress tracking
 * @access  Private
 */
router.post('/weight', auth, async (req, res) => {
  const { weight } = req.body;
  if (!weight || isNaN(weight)) {
    return res.status(400).json({ msg: 'Please provide a valid weight value' });
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found. Please complete profile setup first.' });
    }

    // Push new entry and update current weight & BMI
    profile.weightHistory.push({ weight: Number(weight), date: new Date() });
    profile.weight    = Number(weight);
    profile.stats.bmi = calculateBMI(Number(weight), profile.height);

    await profile.save();
    res.json({ weightHistory: profile.weightHistory, currentBMI: profile.stats.bmi });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
