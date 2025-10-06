const mongoose = require("mongoose");
require("dotenv").config();

async function clearUsers() {
	try {
		await mongoose.connect(process.env.MONGO_URI);

		// Delete all users
		const userResult = await mongoose.connection.db
			.collection("users")
			.deleteMany({});
		console.log(`Deleted ${userResult.deletedCount} users`);

		// Delete all user profiles
		const profileResult = await mongoose.connection.db
			.collection("userprofiles")
			.deleteMany({});
		console.log(`Deleted ${profileResult.deletedCount} user profiles`);

		console.log("✅ All users and profiles cleared!");
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await mongoose.disconnect();
	}
}

clearUsers();
