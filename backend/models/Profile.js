const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  height: { type: Number, required: true }, // in cm
  weight: { type: Number, required: true }, // in kg
  goal: { type: String, enum: ['weight loss', 'muscle gain', 'maintenance'], required: true },
  activityLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  dietaryPreference: { type: String, enum: ['vegetarian', 'non-vegetarian', 'vegan'], required: true },
  stats: {
    bmi: Number,
    bmr: Number,
    tdee: Number // daily calorie needs
  },
  weightHistory: [
    {
      weight: Number,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('profile', ProfileSchema);
