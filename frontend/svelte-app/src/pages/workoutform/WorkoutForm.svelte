<script>
	import { userStore } from "../../stores/userStore.js";
	import { navigate } from "../../lib/router.js";
	import workoutService from "../../../../common/services/workoutService.js";
	import styles from "../../../../common/styles/WorkoutForm.module.css";
	import modalStyles from "../../../../common/styles/SuccessModal.module.css";

	// Render counter for performance testing
	let renderCount = 0;
	renderCount++;
	console.log("🔄 Svelte WorkoutForm render count:", renderCount, "times");

	// Form state
	let isLoading = false;
	let error = null;
	let showSuccessModal = false;

	// Workout data
	let workoutData = {
		date: new Date().toISOString().split("T")[0], // Today's date
		type: "",
		duration: "",
		intensity: 5,
		exercises: [],
		notes: "",
	};

	// Exercise state for adding new exercises
	let newExercise = {
		name: "",
		sets: "",
		reps: "",
		weight: "",
		duration: "", // For cardio exercises
	};

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

	function addExercise() {
		if (!newExercise.name.trim()) return;

		const exercise = {
			id: Date.now(), // Simple ID for now
			name: newExercise.name,
			sets: newExercise.sets || null,
			reps: newExercise.reps || null,
			weight: newExercise.weight || null,
			duration: newExercise.duration || null,
		};

		workoutData.exercises = [...workoutData.exercises, exercise];

		// Reset exercise form
		newExercise = {
			name: "",
			sets: "",
			reps: "",
			weight: "",
			duration: "",
		};
	}

	function removeExercise(id) {
		workoutData.exercises = workoutData.exercises.filter(
			ex => ex.id !== id
		);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		isLoading = true;
		error = null;

		try {
			// Create workout payload
			const workoutPayload = {
				userId: $userStore?.id,
				date: workoutData.date,
				type: workoutData.type,
				duration: workoutData.duration
					? parseInt(workoutData.duration)
					: null,
				intensity: workoutData.intensity,
				exercises: workoutData.exercises,
				notes: workoutData.notes,
			};

			console.log("Saving workout to backend:", workoutPayload);

			// Save to backend using real service
			const response = await workoutService.createWorkout(workoutPayload);

			console.log("✅ Workout saved successfully:", response);

			// Show success modal
			showSuccessModal = true;

			// Auto-close after 2 seconds
			setTimeout(() => {
				handleModalClose();
			}, 2000);
		} catch (err) {
			console.error("❌ Failed to save workout:", err);
			error = err.message || "Failed to save workout";
		} finally {
			isLoading = false;
		}
	}

	function handleModalClose() {
		// Reset form
		workoutData = {
			date: new Date().toISOString().split("T")[0],
			type: "",
			duration: "",
			intensity: 5,
			exercises: [],
			notes: "",
		};

		// Close modal and navigate
		showSuccessModal = false;
		navigate("/cycle");
	}

	// Reactive statements for dynamic form fields
	$: isStrengthTraining = workoutData.type === "strength-training";
	$: isCardioType = ["cardio", "running", "cycling"].includes(
		workoutData.type
	);
</script>

{#if !$userStore}
	<div class={styles.pageWrapper}>
		<div class={styles.emptyState}>
			<h2>Login Required</h2>
			<p>Please login to log your workouts.</p>
			<button
				class={styles.primaryButton}
				on:click={() => navigate("/auth")}
			>
				Login
			</button>
		</div>
	</div>
{:else}
	<div class={styles.pageWrapper}>
		<div class={styles.container}>
			<header class={styles.header}>
				<h1>Log Your Workout 💪</h1>
				<p>Track your exercises and progress</p>
			</header>

			{#if error}
				<div class={styles.errorMessage}>
					{error}
				</div>
			{/if}

			<form on:submit={handleSubmit} class={styles.form}>
				<!-- Basic Workout Info -->
				<div class={styles.section}>
					<h3>Workout Details</h3>

					<div class={styles.inputRow}>
						<div class={styles.inputGroup}>
							<label for="workout-date">Date</label>
							<input
								id="workout-date"
								type="date"
								bind:value={workoutData.date}
								class={styles.input}
								required
							/>
						</div>

						<div class={styles.inputGroup}>
							<label for="workout-type">Workout Type</label>
							<select
								id="workout-type"
								bind:value={workoutData.type}
								class={styles.select}
								required
							>
								<option value="">Select type</option>
								{#each workoutTypes as type}
									<option value={type}>
										{type
											.replace("-", " ")
											.replace(/\b\w/g, l =>
												l.toUpperCase()
											)}
									</option>
								{/each}
							</select>
						</div>
					</div>

					<div class={styles.inputRow}>
						<div class={styles.inputGroup}>
							<label for="workout-duration"
								>Duration (minutes)</label
							>
							<input
								id="workout-duration"
								type="number"
								bind:value={workoutData.duration}
								class={styles.input}
								min="1"
								max="300"
							/>
						</div>

						<div class={styles.inputGroup}>
							<label for="workout-intensity"
								>Intensity (1-10)</label
							>
							<input
								id="workout-intensity"
								type="range"
								bind:value={workoutData.intensity}
								class={styles.slider}
								min="1"
								max="10"
							/>
							<span class={styles.intensityValue}
								>{workoutData.intensity}</span
							>
						</div>
					</div>
				</div>

				<!-- Exercise Tracking -->
				<div class={styles.section}>
					<h3>Exercises</h3>

					<!-- Add Exercise Form -->
					<div class={styles.exerciseForm}>
						<div class={styles.inputRow}>
							<div class={styles.inputGroup}>
								<label for="exercise-name">Exercise Name</label>
								<input
									id="exercise-name"
									type="text"
									bind:value={newExercise.name}
									placeholder="e.g., Push-ups, Running"
									class={styles.input}
								/>
							</div>

							{#if isStrengthTraining}
								<div class={styles.inputGroup}>
									<label for="exercise-sets">Sets</label>
									<input
										id="exercise-sets"
										type="number"
										bind:value={newExercise.sets}
										class={styles.input}
										min="1"
									/>
								</div>

								<div class={styles.inputGroup}>
									<label for="exercise-reps">Reps</label>
									<input
										id="exercise-reps"
										type="number"
										bind:value={newExercise.reps}
										class={styles.input}
										min="1"
									/>
								</div>

								<div class={styles.inputGroup}>
									<label for="exercise-weight"
										>Weight (lbs)</label
									>
									<input
										id="exercise-weight"
										type="number"
										bind:value={newExercise.weight}
										class={styles.input}
										min="0"
										step="0.5"
									/>
								</div>
							{/if}

							{#if isCardioType}
								<div class={styles.inputGroup}>
									<label for="exercise-duration"
										>Duration (minutes)</label
									>
									<input
										id="exercise-duration"
										type="number"
										bind:value={newExercise.duration}
										class={styles.input}
										min="1"
									/>
								</div>
							{/if}
						</div>

						<button
							type="button"
							on:click={addExercise}
							class={styles.addButton}
							disabled={!newExercise.name.trim()}
						>
							Add Exercise
						</button>
					</div>

					<!-- Exercise List -->
					{#if workoutData.exercises.length > 0}
						<div class={styles.exerciseList}>
							<h4>Added Exercises:</h4>
							{#each workoutData.exercises as exercise (exercise.id)}
								<div class={styles.exerciseItem}>
									<div class={styles.exerciseInfo}>
										<strong>{exercise.name}</strong>
										{#if exercise.sets}
											<span>{exercise.sets} sets</span>
										{/if}
										{#if exercise.reps}
											<span>{exercise.reps} reps</span>
										{/if}
										{#if exercise.weight}
											<span>{exercise.weight} lbs</span>
										{/if}
										{#if exercise.duration}
											<span>{exercise.duration} min</span>
										{/if}
									</div>
									<button
										type="button"
										on:click={() =>
											removeExercise(exercise.id)}
										class={styles.removeButton}
										aria-label="Remove {exercise.name} exercise"
									>
										×
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Notes -->
				<div class={styles.section}>
					<div class={styles.inputGroup}>
						<label for="workout-notes">Notes (optional)</label>
						<textarea
							id="workout-notes"
							bind:value={workoutData.notes}
							placeholder="How did the workout feel? Any observations..."
							class={styles.textarea}
							rows="4"
						></textarea>
					</div>
				</div>

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isLoading || !workoutData.type}
					class={styles.submitButton}
				>
					{isLoading ? "Saving..." : "Log Workout"}
				</button>
			</form>

			<!-- Beautiful Success Modal -->
			{#if showSuccessModal}
				<div class={modalStyles.modalOverlay}>
					<div class={modalStyles.modalContent}>
						<div class={modalStyles.modalIcon}>🎉</div>
						<h2 class={modalStyles.modalTitle}>
							Workout Logged! 💪
						</h2>
						<p class={modalStyles.modalMessage}>
							Great job! Your workout has been successfully saved.
						</p>
						<div class={modalStyles.modalSubtext}>
							Redirecting to your cycle calendar...
						</div>
						<div class={modalStyles.loadingDots}>
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
