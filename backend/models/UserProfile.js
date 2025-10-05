const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Info
  firstName: { type: String, required: true },
  age: { type: Number, required: true },
  fitnessLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true 
  },
  goals: [{ type: String }], // e.g., ['strength', 'endurance', 'weight-loss']
  
  // Cycle Info
  cycleLength: { type: Number, default: 28 }, // days
  lastPeriodStart: { type: Date, required: true },
  averagePeriodLength: { type: Number, default: 5 },
  trackingSymptoms: [{ type: String }], // e.g., ['mood', 'energy', 'cramps']
  
  // Preferences
  preferredWorkoutTypes: [{ type: String }],
  notifications: {
    cycleReminders: { type: Boolean, default: true },
    workoutReminders: { type: Boolean, default: true }
  },
  
}, {
  timestamps: true
});

module.exports = mongoose.model('UserProfile', userProfileSchema);