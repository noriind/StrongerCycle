import { createSignal, For, Show } from "solid-js";
import { useUser } from "../../context/UserContext.jsx";
import { useNavigate } from "@solidjs/router";
import workoutService from "../../../../common/services/workoutService.js";
import styles from "../../../../common/styles/WorkoutForm.module.css";

export default function WorkoutForm() {
	const { user } = useUser();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = createSignal(false);
	const [error, setError] = createSignal(null);
	const [showSuccessModal, setShowSuccessModal] = createSignal(false);

	// Form state signals
	const [workoutData, setWorkoutData] = createSignal({
		date: new Date().toISOString().split("T")[0], // Today's date
		type: "",
		duration: "",
		intensity: 5,
		exercises: [],
		notes: "",
	});

	// Exercise state for adding new exercises
	const [newExercise, setNewExercise] = createSignal({
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
		const currentExercise = newExercise();
		if (!currentExercise.name.trim()) return;

		const exercise = {
			id: Date.now(), // Simple ID for now
			name: currentExercise.name,
			sets: currentExercise.sets || null,
			reps: currentExercise.reps || null,
			weight: currentExercise.weight || null,
			duration: currentExercise.duration || null,
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
			// Create workout payload
			const currentWorkout = workoutData();
			const workoutPayload = {
				userId: user()?.id,
				date: currentWorkout.date,
				type: currentWorkout.type,
				duration: currentWorkout.duration
					? parseInt(currentWorkout.duration)
					: null,
				intensity: parseInt(currentWorkout.intensity),
				exercises: currentWorkout.exercises,
				notes: currentWorkout.notes,
			};

			console.log("Saving workout to backend:", workoutPayload);

			// Save to backend using real service
			const response = await workoutService.createWorkout(workoutPayload);

			console.log("✅ Workout saved successfully:", response);

			// Show success modal
			setShowSuccessModal(true);

			// Auto-close after 2 seconds
			setTimeout(() => {
				handleModalClose();
			}, 2000);
		} catch (err) {
			console.error("❌ Failed to save workout:", err);
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

	return (
		<Show
			when={user()}
			fallback={
				<div class={styles.pageWrapper}>
					<div class={styles.emptyState}>
						<h2>Login Required</h2>
						<p>Please login to log your workouts.</p>
						<button
							class={styles.primaryButton}
							onClick={() => navigate("/auth")}
						>
							Login
						</button>
					</div>
				</div>
			}
		>
			<div class={styles.pageWrapper}>
				<div class={styles.container}>
					<header class={styles.header}>
						<h1>Log Your Workout 💪</h1>
						<p>Track your exercises and progress</p>
					</header>

					<Show when={error()}>
						<div class={styles.errorMessage}>{error()}</div>
					</Show>

					<form onSubmit={handleSubmit} class={styles.form}>
						{/* Basic Workout Info */}
						<div class={styles.section}>
							<h3>Workout Details</h3>

							<div class={styles.inputRow}>
								<div class={styles.inputGroup}>
									<label>Date</label>
									<input
										type="date"
										value={workoutData().date}
										onInput={e =>
											handleInputChange(
												"date",
												e.target.value
											)
										}
										class={styles.input}
										required
									/>
								</div>

								<div class={styles.inputGroup}>
									<label>Workout Type</label>
									<select
										value={workoutData().type}
										onChange={e =>
											handleInputChange(
												"type",
												e.target.value
											)
										}
										class={styles.select}
										required
									>
										<option value="">Select type</option>
										<For each={workoutTypes}>
											{type => (
												<option value={type}>
													{type
														.replace("-", " ")
														.replace(/\b\w/g, l =>
															l.toUpperCase()
														)}
												</option>
											)}
										</For>
									</select>
								</div>
							</div>

							<div class={styles.inputRow}>
								<div class={styles.inputGroup}>
									<label>Duration (minutes)</label>
									<input
										type="number"
										value={workoutData().duration}
										onInput={e =>
											handleInputChange(
												"duration",
												e.target.value
											)
										}
										class={styles.input}
										min="1"
										max="300"
									/>
								</div>

								<div class={styles.inputGroup}>
									<label>Intensity (1-10)</label>
									<input
										type="range"
										value={workoutData().intensity}
										onInput={e =>
											handleInputChange(
												"intensity",
												e.target.value
											)
										}
										class={styles.slider}
										min="1"
										max="10"
									/>
									<span class={styles.intensityValue}>
										{workoutData().intensity}
									</span>
								</div>
							</div>
						</div>

						{/* Exercise Tracking */}
						<div class={styles.section}>
							<h3>Exercises</h3>

							{/* Add Exercise Form */}
							<div class={styles.exerciseForm}>
								<div class={styles.inputRow}>
									<div class={styles.inputGroup}>
										<label>Exercise Name</label>
										<input
											type="text"
											value={newExercise().name}
											onInput={e =>
												handleExerciseChange(
													"name",
													e.target.value
												)
											}
											placeholder="e.g., Push-ups, Running"
											class={styles.input}
										/>
									</div>

									<Show
										when={
											workoutData().type ===
											"strength-training"
										}
									>
										<div class={styles.inputGroup}>
											<label>Sets</label>
											<input
												type="number"
												value={newExercise().sets}
												onInput={e =>
													handleExerciseChange(
														"sets",
														e.target.value
													)
												}
												class={styles.input}
												min="1"
											/>
										</div>

										<div class={styles.inputGroup}>
											<label>Reps</label>
											<input
												type="number"
												value={newExercise().reps}
												onInput={e =>
													handleExerciseChange(
														"reps",
														e.target.value
													)
												}
												class={styles.input}
												min="1"
											/>
										</div>

										<div class={styles.inputGroup}>
											<label>Weight (lbs)</label>
											<input
												type="number"
												value={newExercise().weight}
												onInput={e =>
													handleExerciseChange(
														"weight",
														e.target.value
													)
												}
												class={styles.input}
												min="0"
												step="0.5"
											/>
										</div>
									</Show>

									<Show
										when={[
											"cardio",
											"running",
											"cycling",
										].includes(workoutData().type)}
									>
										<div class={styles.inputGroup}>
											<label>Duration (minutes)</label>
											<input
												type="number"
												value={newExercise().duration}
												onInput={e =>
													handleExerciseChange(
														"duration",
														e.target.value
													)
												}
												class={styles.input}
												min="1"
											/>
										</div>
									</Show>
								</div>

								<button
									type="button"
									onClick={addExercise}
									class={styles.addButton}
									disabled={!newExercise().name.trim()}
								>
									Add Exercise
								</button>
							</div>

							{/* Exercise List */}
							<Show when={workoutData().exercises.length > 0}>
								<div class={styles.exerciseList}>
									<h4>Added Exercises:</h4>
									<For each={workoutData().exercises}>
										{exercise => (
											<div class={styles.exerciseItem}>
												<div
													class={styles.exerciseInfo}
												>
													<strong>
														{exercise.name}
													</strong>
													<Show when={exercise.sets}>
														<span>
															{exercise.sets} sets
														</span>
													</Show>
													<Show when={exercise.reps}>
														<span>
															{exercise.reps} reps
														</span>
													</Show>
													<Show
														when={exercise.weight}
													>
														<span>
															{exercise.weight}{" "}
															lbs
														</span>
													</Show>
													<Show
														when={exercise.duration}
													>
														<span>
															{exercise.duration}{" "}
															min
														</span>
													</Show>
												</div>
												<button
													type="button"
													onClick={() =>
														removeExercise(
															exercise.id
														)
													}
													class={styles.removeButton}
												>
													×
												</button>
											</div>
										)}
									</For>
								</div>
							</Show>
						</div>

						{/* Notes */}
						<div class={styles.section}>
							<div class={styles.inputGroup}>
								<label>Notes (optional)</label>
								<textarea
									value={workoutData().notes}
									onInput={e =>
										handleInputChange(
											"notes",
											e.target.value
										)
									}
									placeholder="How did the workout feel? Any observations..."
									class={styles.textarea}
									rows={4}
								/>
							</div>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading() || !workoutData().type}
							class={styles.submitButton}
						>
							{isLoading() ? "Saving..." : "Log Workout"}
						</button>
					</form>

					{/* Beautiful Success Modal */}
					{showSuccessModal() && (
						<div
							style={{
								position: "fixed",
								top: "0",
								left: "0",
								width: "100vw",
								height: "100vh",
								background: "rgba(0,0,0,0.6)",
								display: "flex",
								"align-items": "center",
								"justify-content": "center",
								"z-index": "1000",
							}}
						>
							<div
								style={{
									background: "white",
									padding: "3rem 2rem",
									"border-radius": "16px",
									"text-align": "center",
									"max-width": "400px",
									width: "90%",
									"box-shadow": "0 20px 40px rgba(0,0,0,0.2)",
								}}
							>
								<div
									style={{
										"font-size": "4rem",
										"margin-bottom": "1rem",
									}}
								>
									🎉
								</div>
								<h2
									style={{
										color: "#10b981",
										"font-size": "2rem",
										"font-weight": "700",
										"margin-bottom": "1rem",
									}}
								>
									Workout Logged! 💪
								</h2>
								<p
									style={{
										color: "#64748b",
										"font-size": "1.1rem",
										"margin-bottom": "1.5rem",
										"line-height": "1.5",
									}}
								>
									Great job! Your workout has been
									successfully saved.
								</p>
								<div
									style={{
										color: "#94a3b8",
										"font-size": "0.9rem",
										"margin-bottom": "1.5rem",
									}}
								>
									Redirecting to your cycle calendar...
								</div>
								<div
									style={{
										display: "flex",
										"justify-content": "center",
										gap: "0.5rem",
									}}
								>
									<span
										style={{
											width: "8px",
											height: "8px",
											"border-radius": "50%",
											background: "#10b981",
											animation:
												"pulse 1.4s ease-in-out infinite both",
										}}
									></span>
									<span
										style={{
											width: "8px",
											height: "8px",
											"border-radius": "50%",
											background: "#10b981",
											animation:
												"pulse 1.4s ease-in-out infinite both",
											"animation-delay": "0.16s",
										}}
									></span>
									<span
										style={{
											width: "8px",
											height: "8px",
											"border-radius": "50%",
											background: "#10b981",
											animation:
												"pulse 1.4s ease-in-out infinite both",
											"animation-delay": "0.32s",
										}}
									></span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</Show>
	);
}
