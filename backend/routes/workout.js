const express = require("express");
const Workout = require("../models/Workout");
const router = express.Router();

// Create a new workout
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      date,
      type,
      duration,
      intensity,
      exercises,
      notes
    } = req.body;

    // Validate required fields
    if (!userId || !date || !type) {
      return res.status(400).json({ 
        error: "User ID, date, and workout type are required" 
      });
    }

    // Create workout 
    const workout = new Workout({
      userId,
      date,
      type,
      duration: duration ? parseInt(duration) : null,
      intensity: intensity ? parseInt(intensity) : 5,
      exercises: exercises || [],
      notes: notes || ""
    });

    // Save to MongoDB
    await workout.save();
    
    console.log(`✅ Workout saved for user ${userId}:`, workout);

    res.status(201).json({
      message: "Workout logged successfully!",
      workout
    });

  } catch (error) {
    console.error("Workout creation error:", error);
    res.status(500).json({ error: "Server error during workout creation" });
  }
});

// Get workouts for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find workouts in MongoDB
    const userWorkouts = await Workout.find({ userId })
      .sort({ date: -1 }) // Sort by date (newest first)
      .exec();

    console.log(`📊 Retrieved ${userWorkouts.length} workouts for user ${userId}`);

    res.json({
      workouts: userWorkouts,
      count: userWorkouts.length
    });

  } catch (error) {
    console.error("Get workouts error:", error);
    res.status(500).json({ error: "Server error retrieving workouts" });
  }
});

// Get specific workout
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find workout by MongoDB _id
    const workout = await Workout.findById(id);
    
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json({ workout });

  } catch (error) {
    console.error("Get workout error:", error);
    res.status(500).json({ error: "Server error retrieving workout" });
  }
});

// Delete a workout
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete from MongoDB
    const deletedWorkout = await Workout.findByIdAndDelete(id);
    
    if (!deletedWorkout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    console.log(`🗑️ Deleted workout ${id} for user ${deletedWorkout.userId}`);

    res.json({ 
      message: "Workout deleted successfully",
      workout: deletedWorkout 
    });

  } catch (error) {
    console.error("Delete workout error:", error);
    res.status(500).json({ error: "Server error deleting workout" });
  }
});

module.exports = router;