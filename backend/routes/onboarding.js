const express = require('express');
const UserProfile = require('../models/UserProfile');
const router = express.Router();

// POST /api/onboarding/profile - Create/Update user profile
router.post('/profile', async (req, res) => {
  try {
    const {
      userId, firstName, age, fitnessLevel, goals,
      cycleLength, lastPeriodStart, averagePeriodLength,
      trackingSymptoms, preferredWorkoutTypes, notifications,
      motivationForTracking, experienceWithCycleTracking
    } = req.body;

    const uniqueId = userId || Date.now().toString(); // Uses timestamp as unique ID

    const profileData = {
      userId: uniqueId,
      firstName,
      age,
      fitnessLevel,
      goals,
      cycleLength,
      lastPeriodStart,
      averagePeriodLength,
      trackingSymptoms,
      preferredWorkoutTypes,
      notifications,
      motivationForTracking,
      experienceWithCycleTracking
    };

    // Upsert (update if exists, create if not)
    const profile = await UserProfile.findOneAndUpdate(
      { userId: uniqueId },
      profileData,
      { new: true, upsert: true }
    );

    res.status(201).json({
      message: 'Profile created/updated successfully',
      profile
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Server error during onboarding' });
  }
});

// GET /api/onboarding/profile/:userId - Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
});

module.exports = router;