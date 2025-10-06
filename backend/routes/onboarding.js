const express = require("express");
const UserProfile = require("../models/UserProfile");
const router = express.Router();

// POST /api/onboarding/profile - Create/Update user profile
router.post("/profile", async (req, res) => {
	try {
		const {
			userId,
			email,
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
			experienceWithCycleTracking,
		} = req.body;

		const profileUserId = userId || email || Date.now().toString();

		console.log("🔍 Creating profile for userId:", profileUserId); // Add debug

		const profileData = {
			userId: profileUserId,
			firstName,
			age,
			fitnessLevel,
			goals: goals || [],
			cycleLength,
			lastPeriodStart,
			averagePeriodLength,
			trackingSymptoms,
			preferredWorkoutTypes,
			notifications,
			motivationForTracking,
			experienceWithCycleTracking,
		};

		// Upsert (update if exists, create if not)
		const profile = await UserProfile.findOneAndUpdate(
			{ userId: profileUserId },
			profileData,
			{ new: true, upsert: true }
		);

		console.log("✅ Profile saved with userId:", profile.userId); // Add debug

		res.status(201).json({
			message: "Profile created/updated successfully",
			profile,
		});
	} catch (error) {
		console.error("Onboarding error:", error);
		res.status(500).json({ error: "Server error during onboarding" });
	}
});

// GET /api/onboarding/profile/:userId - Get user profile
router.get("/profile/:userId", async (req, res) => {
	try {
		const { userId } = req.params;
		const profile = await UserProfile.findOne({ userId });

		if (!profile) {
			return res.status(404).json({ error: "Profile not found" });
		}

		res.json({ profile });
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({ error: "Server error retrieving profile" });
	}
});

module.exports = router;
