const API_BASE = "http://localhost:5000";

class OnboardingService {
	async saveProfile(profileData) {
		const response = await fetch(`${API_BASE}/api/onboarding/profile`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(profileData),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Failed to save profile");
		}

		return data;
	}

	async getProfile(userId) {
		const response = await fetch(
			`${API_BASE}/api/onboarding/profile/${userId}`
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Failed to get profile");
		}

		return data;
	}
}
 
export default new OnboardingService();
