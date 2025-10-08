const API_BASE = "http://localhost:5000/api";

class WorkoutService {
  async createWorkout(workoutData) {
    try {
      const response = await fetch(`${API_BASE}/workout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create workout");
      }

      return await response.json();
    } catch (error) {
      console.error("Workout creation error:", error);
      throw error;
    }
  }

  async getUserWorkouts(userId) {
    try {
      const response = await fetch(`${API_BASE}/workout/user/${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch workouts");
      }

      return await response.json();
    } catch (error) {
      console.error("Get workouts error:", error);
      throw error;
    }
  }

  async getWorkout(workoutId) {
    try {
      const response = await fetch(`${API_BASE}/workout/${workoutId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch workout");
      }

      return await response.json();
    } catch (error) {
      console.error("Get workout error:", error);
      throw error;
    }
  }

  async deleteWorkout(workoutId) {
    try {
      const response = await fetch(`${API_BASE}/workout/${workoutId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete workout");
      }

      return await response.json();
    } catch (error) {
      console.error("Delete workout error:", error);
      throw error;
    }
  }
}

export default new WorkoutService();