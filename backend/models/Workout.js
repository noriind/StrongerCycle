const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number },
  reps: { type: Number },
  weight: { type: Number },
  duration: { type: Number } // for cardio
});

const WorkoutSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['strength-training', 'cardio', 'yoga', 'pilates', 'swimming', 'running', 'cycling', 'other']
  },
  duration: { type: Number }, // total workout duration
  intensity: { type: Number, min: 1, max: 10, default: 5 },
  exercises: [ExerciseSchema],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Workout", WorkoutSchema);