const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Import models
const User = require("./models/User");
const UserProfile = require("./models/UserProfile");
const Workout = require("./models/Workout");

// Configuration for different user types
const USER_PROFILES = [
  {
    type: "light",
    email: "light.user@test.com",
    password: "password123",
    firstName: "Sarah",
    age: 25,
    months: 3,
    workoutsPerWeek: 2.5,
  },
  {
    type: "medium",
    email: "medium.user@test.com",
    password: "password123",
    firstName: "Emma",
    age: 28,
    months: 6,
    workoutsPerWeek: 3.5,
  },
  {
    type: "heavy",
    email: "heavy.user@test.com",
    password: "password123",
    firstName: "Jessica",
    age: 30,
    months: 12,
    workoutsPerWeek: 4.5,
  },
  {
    type: "power",
    email: "power.user@test.com",
    password: "password123",
    firstName: "Amanda",
    age: 32,
    months: 18,
    workoutsPerWeek: 5.5,
  },
];

// Workout templates variety
const WORKOUT_TEMPLATES = {
  "strength-training": {
    exercises: [
      { name: "Squats", sets: [3, 4, 5], reps: [8, 10, 12], weight: [95, 115, 135] },
      { name: "Deadlifts", sets: [3, 4], reps: [5, 6, 8], weight: [135, 155, 185] },
      { name: "Bench Press", sets: [3, 4], reps: [8, 10, 12], weight: [65, 75, 85] },
      { name: "Rows", sets: [3, 4], reps: [10, 12], weight: [45, 55, 65] },
      { name: "Shoulder Press", sets: [3, 4], reps: [8, 10], weight: [35, 45, 55] },
      { name: "Lunges", sets: [3], reps: [10, 12], weight: [25, 35, 45] },
      { name: "Lat Pulldowns", sets: [3], reps: [10, 12], weight: [60, 70, 80] },
    ],
    duration: [45, 60, 75],
    intensity: [6, 7, 8, 9],
  },
  cardio: {
    exercises: [
      { name: "Treadmill Running", duration: [20, 30, 40] },
      { name: "Elliptical", duration: [25, 35, 45] },
      { name: "Rowing Machine", duration: [15, 20, 30] },
      { name: "Stair Climber", duration: [15, 20, 25] },
    ],
    duration: [30, 45, 60],
    intensity: [5, 6, 7, 8],
  },
  yoga: {
    exercises: [
      { name: "Sun Salutations", duration: [10, 15] },
      { name: "Warrior Sequence", duration: [10, 15] },
      { name: "Balance Poses", duration: [5, 10] },
      { name: "Flexibility Work", duration: [10, 15] },
    ],
    duration: [45, 60, 75],
    intensity: [3, 4, 5, 6],
  },
  pilates: {
    exercises: [
      { name: "Core Work", duration: [15, 20] },
      { name: "Leg Series", duration: [10, 15] },
      { name: "Arm Work", duration: [10, 15] },
      { name: "Stretching", duration: [10, 15] },
    ],
    duration: [45, 60],
    intensity: [4, 5, 6, 7],
  },
  running: {
    exercises: [
      { name: "Outdoor Run", duration: [20, 30, 40, 45, 60] },
    ],
    duration: [20, 30, 40, 45, 60],
    intensity: [6, 7, 8, 9],
  },
  cycling: {
    exercises: [
      { name: "Cycling Session", duration: [30, 45, 60, 90] },
    ],
    duration: [30, 45, 60, 90],
    intensity: [5, 6, 7, 8],
  },
};

const WORKOUT_TYPES = Object.keys(WORKOUT_TEMPLATES);

// Helper function to get random element from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to generate random date within range
const getRandomDate = (startDate, endDate) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

// Generate realistic workout for a specific date
const generateWorkout = (userId, date, userLevel) => {
  const workoutType = getRandom(WORKOUT_TYPES);
  const template = WORKOUT_TEMPLATES[workoutType];

  // Generate exercises based on workout type
  const exercises = [];
  const numExercises = workoutType === "strength-training" 
    ? Math.floor(Math.random() * 3) + 3  // 3-5 exercises
    : Math.floor(Math.random() * 2) + 2; // 2-3 exercises

  for (let i = 0; i < numExercises; i++) {
    const exerciseTemplate = getRandom(template.exercises);
    const exercise = {
      name: exerciseTemplate.name,
    };

    if (exerciseTemplate.sets) {
      exercise.sets = getRandom(exerciseTemplate.sets);
    }
    if (exerciseTemplate.reps) {
      exercise.reps = getRandom(exerciseTemplate.reps);
    }
    if (exerciseTemplate.weight) {
      exercise.weight = getRandom(exerciseTemplate.weight);
    }
    if (exerciseTemplate.duration) {
      exercise.duration = getRandom(exerciseTemplate.duration);
    }

    exercises.push(exercise);
  }

  return {
    userId: userId,
    date: date,
    type: workoutType,
    duration: getRandom(template.duration),
    intensity: getRandom(template.intensity),
    exercises: exercises,
    notes: Math.random() > 0.7 
      ? ["Great session!", "Felt strong today", "Tough but good", "Need more rest", "PR on squats!"][Math.floor(Math.random() * 5)]
      : "",
  };
};

// Generate workouts for a user over a time period
const generateUserWorkouts = (userId, months, workoutsPerWeek) => {
  const workouts = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  const totalWorkouts = Math.floor((months * 4.33 * workoutsPerWeek)); // 4.33 weeks per month

  console.log(`  Generating ${totalWorkouts} workouts over ${totalDays} days`);

  // Generate random workout dates, ensuring realistic spacing
  const workoutDates = [];
  let currentDate = new Date(startDate);

  while (workoutDates.length < totalWorkouts && currentDate < endDate) {
    // Random workout probability (higher on weekdays)
    const isWeekday = currentDate.getDay() >= 1 && currentDate.getDay() <= 5;
    const workoutProbability = isWeekday ? 0.6 : 0.4;

    if (Math.random() < workoutProbability && workoutDates.length < totalWorkouts) {
      workoutDates.push(new Date(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Generate workout objects
  workoutDates.forEach(date => {
    workouts.push(generateWorkout(userId, date, "intermediate"));
  });

  return workouts;
};

// Main seeding function
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing test data
    console.log("🗑️  Clearing existing test data...");
    await User.deleteMany({ email: { $regex: "@test.com$" } });
    await UserProfile.deleteMany({ userId: { $regex: "test" } });
    await Workout.deleteMany({ userId: { $regex: "test" } });

    // Generate users and their data
    for (const profile of USER_PROFILES) {
      console.log(`\n👤 Creating ${profile.type} user (${profile.email})...`);

      // Create user account
      const user = new User({
        email: profile.email,
        password: profile.password,
      });
      await user.save();
      console.log(`  ✅ User account created: ${user._id}`);

      // Create user profile
      const lastPeriodStart = new Date();
      lastPeriodStart.setDate(lastPeriodStart.getDate() - 10); // Period started 10 days ago

      const userProfile = new UserProfile({
        userId: user._id.toString(),
        firstName: profile.firstName,
        age: profile.age,
        fitnessLevel: "intermediate",
        goals: ["strength", "endurance"],
        cycleLength: 28,
        lastPeriodStart: lastPeriodStart,
        averagePeriodLength: 5,
        trackingSymptoms: ["energy", "mood"],
        preferredWorkoutTypes: ["strength-training", "cardio", "yoga"],
        notifications: {
          cycleReminders: true,
          workoutReminders: true,
        },
      });
      await userProfile.save();
      console.log(`  ✅ User profile created`);

      // Generate workouts
      const workouts = generateUserWorkouts(
        user._id.toString(),
        profile.months,
        profile.workoutsPerWeek
      );

      // Batch insert workouts
      await Workout.insertMany(workouts);
      console.log(`  ✅ Created ${workouts.length} workouts`);

      // Calculate and display stats
      const workoutTypes = {};
      workouts.forEach(w => {
        workoutTypes[w.type] = (workoutTypes[w.type] || 0) + 1;
      });
      console.log(`  📊 Workout distribution:`, workoutTypes);
    }

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📝 Test accounts:");
    USER_PROFILES.forEach(p => {
      console.log(`   ${p.type.toUpperCase()}: ${p.email} / password123`);
    });

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the seeder
seedDatabase();