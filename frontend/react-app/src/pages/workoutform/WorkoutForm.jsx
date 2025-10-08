import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router";
import styles from "../../../../common/styles/WorkoutForm.module.css";
import SuccessModal from "../../../../common/components/SuccessModal";

export default function WorkoutForm() {
	const { user } = useUser();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [successMessage, setSuccessMessage] = useState("");
	const [showSuccessModal, setShowSuccessModal] = useState(false);

	// Form state
	const [workoutData, setWorkoutData] = useState({
		date: new Date().toISOString().split("T")[0], // Today's date
		type: "",
		duration: "",
		intensity: 5,
		exercises: [],
		notes: "",
	});

	// Exercise state for adding new exercises
	const [newExercise, setNewExercise] = useState({
		name: "",
		sets: "",
		reps: "",
		weight: "",
		duration: "", // For cardio exercises
	});

	const workoutTypes = [
		"strength-training",
		"cardio",
		"yoga",
		"pilates",
		"swimming",
		"running",
		"cycling",
		"other",
	];

	const handleInputChange = (field, value) => {
		setWorkoutData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const handleExerciseChange = (field, value) => {
		setNewExercise(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const addExercise = () => {
		if (!newExercise.name.trim()) return;

		const exercise = {
			id: Date.now(), // Simple ID for now
			name: newExercise.name,
			sets: newExercise.sets || null,
			reps: newExercise.reps || null,
			weight: newExercise.weight || null,
			duration: newExercise.duration || null,
		};

		setWorkoutData(prev => ({
			...prev,
			exercises: [...prev.exercises, exercise],
		}));

		// Reset exercise form
		setNewExercise({
			name: "",
			sets: "",
			reps: "",
			weight: "",
			duration: "",
		});
	};

	const removeExercise = id => {
		setWorkoutData(prev => ({
			...prev,
			exercises: prev.exercises.filter(ex => ex.id !== id),
		}));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			// TODO: Create workout service to save to backend
			const workoutPayload = {
				userId: user?.id,
				...workoutData,
				createdAt: new Date().toISOString(),
			};

			console.log("Saving workout:", workoutPayload);

			// Simulate API call for now
			await new Promise(resolve => setTimeout(resolve, 1000));

			setShowSuccessModal(true);

			// Reset form after successful save
			setTimeout(() => {
				setWorkoutData({
					date: new Date().toISOString().split("T")[0],
					type: "",
					duration: "",
					intensity: 5,
					exercises: [],
					notes: "",
				});
				setSuccessMessage("");
			}, 2000);
		} catch (err) {
			setError(err.message || "Failed to save workout");
		} finally {
			setIsLoading(false);
		}
	};

	const handleModalClose = () => {
		// Reset form
		setWorkoutData({
			date: new Date().toISOString().split("T")[0],
			type: "",
			duration: "",
			intensity: 5,
			exercises: [],
			notes: "",
		});

		// Close modal and navigate
		setShowSuccessModal(false);
		navigate("/cycle");
	};

	if (!user) {
		return (
			<div className={styles.pageWrapper}>
				<div className={styles.emptyState}>
					<h2>Login Required</h2>
					<p>Please login to log your workouts.</p>
					<button
						className={styles.primaryButton}
						onClick={() => navigate("/auth")}
					>
						Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.pageWrapper}>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1>Log Your Workout 💪</h1>
					<p>Track your exercises and progress</p>
				</header>

				{successMessage && (
					<div className={styles.successMessage}>
						{successMessage}
					</div>
				)}

				{error && <div className={styles.errorMessage}>{error}</div>}

				<form onSubmit={handleSubmit} className={styles.form}>
					{/* Basic Workout Info */}
					<div className={styles.section}>
						<h3>Workout Details</h3>

						<div className={styles.inputRow}>
							<div className={styles.inputGroup}>
								<label>Date</label>
								<input
									type="date"
									value={workoutData.date}
									onChange={e =>
										handleInputChange(
											"date",
											e.target.value
										)
									}
									className={styles.input}
									required
								/>
							</div>

							<div className={styles.inputGroup}>
								<label>Workout Type</label>
								<select
									value={workoutData.type}
									onChange={e =>
										handleInputChange(
											"type",
											e.target.value
										)
									}
									className={styles.select}
									required
								>
									<option value="">Select type</option>
									{workoutTypes.map(type => (
										<option key={type} value={type}>
											{type
												.replace("-", " ")
												.replace(/\b\w/g, l =>
													l.toUpperCase()
												)}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className={styles.inputRow}>
							<div className={styles.inputGroup}>
								<label>Duration (minutes)</label>
								<input
									type="number"
									value={workoutData.duration}
									onChange={e =>
										handleInputChange(
											"duration",
											e.target.value
										)
									}
									className={styles.input}
									min="1"
									max="300"
								/>
							</div>

							<div className={styles.inputGroup}>
								<label>Intensity (1-10)</label>
								<input
									type="range"
									value={workoutData.intensity}
									onChange={e =>
										handleInputChange(
											"intensity",
											e.target.value
										)
									}
									className={styles.slider}
									min="1"
									max="10"
								/>
								<span className={styles.intensityValue}>
									{workoutData.intensity}
								</span>
							</div>
						</div>
					</div>

					{/* Exercise Tracking */}
					<div className={styles.section}>
						<h3>Exercises</h3>

						{/* Add Exercise Form */}
						<div className={styles.exerciseForm}>
							<div className={styles.inputRow}>
								<div className={styles.inputGroup}>
									<label>Exercise Name</label>
									<input
										type="text"
										value={newExercise.name}
										onChange={e =>
											handleExerciseChange(
												"name",
												e.target.value
											)
										}
										placeholder="e.g., Push-ups, Running"
										className={styles.input}
									/>
								</div>

								{workoutData.type === "strength-training" && (
									<>
										<div className={styles.inputGroup}>
											<label>Sets</label>
											<input
												type="number"
												value={newExercise.sets}
												onChange={e =>
													handleExerciseChange(
														"sets",
														e.target.value
													)
												}
												className={styles.input}
												min="1"
											/>
										</div>

										<div className={styles.inputGroup}>
											<label>Reps</label>
											<input
												type="number"
												value={newExercise.reps}
												onChange={e =>
													handleExerciseChange(
														"reps",
														e.target.value
													)
												}
												className={styles.input}
												min="1"
											/>
										</div>

										<div className={styles.inputGroup}>
											<label>Weight (lbs)</label>
											<input
												type="number"
												value={newExercise.weight}
												onChange={e =>
													handleExerciseChange(
														"weight",
														e.target.value
													)
												}
												className={styles.input}
												min="0"
												step="0.5"
											/>
										</div>
									</>
								)}

								{(workoutData.type === "cardio" ||
									workoutData.type === "running" ||
									workoutData.type === "cycling") && (
									<div className={styles.inputGroup}>
										<label>Duration (minutes)</label>
										<input
											type="number"
											value={newExercise.duration}
											onChange={e =>
												handleExerciseChange(
													"duration",
													e.target.value
												)
											}
											className={styles.input}
											min="1"
										/>
									</div>
								)}
							</div>

							<button
								type="button"
								onClick={addExercise}
								className={styles.addButton}
								disabled={!newExercise.name.trim()}
							>
								Add Exercise
							</button>
						</div>

						{/* Exercise List */}
						{workoutData.exercises.length > 0 && (
							<div className={styles.exerciseList}>
								<h4>Added Exercises:</h4>
								{workoutData.exercises.map(exercise => (
									<div
										key={exercise.id}
										className={styles.exerciseItem}
									>
										<div className={styles.exerciseInfo}>
											<strong>{exercise.name}</strong>
											{exercise.sets && (
												<span>
													{exercise.sets} sets
												</span>
											)}
											{exercise.reps && (
												<span>
													{exercise.reps} reps
												</span>
											)}
											{exercise.weight && (
												<span>
													{exercise.weight} lbs
												</span>
											)}
											{exercise.duration && (
												<span>
													{exercise.duration} min
												</span>
											)}
										</div>
										<button
											type="button"
											onClick={() =>
												removeExercise(exercise.id)
											}
											className={styles.removeButton}
										>
											×
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Notes */}
					<div className={styles.section}>
						<div className={styles.inputGroup}>
							<label>Notes (optional)</label>
							<textarea
								value={workoutData.notes}
								onChange={e =>
									handleInputChange("notes", e.target.value)
								}
								placeholder="How did the workout feel? Any observations..."
								className={styles.textarea}
								rows={4}
							/>
						</div>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={isLoading || !workoutData.type}
						className={styles.submitButton}
					>
						{isLoading ? "Saving..." : "Log Workout"}
					</button>

					<SuccessModal
						isVisible={showSuccessModal}
						title="Workout Logged! 💪"
						message="Great job! Your workout has been successfully saved."
						subtext="Redirecting to your cycle calendar..."
						icon="🎉"
						autoCloseDelay={2000}
						onClose={handleModalClose}
					/>
				</form>
				{/* Success Modal */}
			</div>
		</div>
	);
}
