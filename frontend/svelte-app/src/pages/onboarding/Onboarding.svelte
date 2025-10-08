<script>
	import { navigate } from "../../lib/router.js"; // Using your custom router
	import { userStore } from "../../stores/userStore.js";
	import onboardingService from "../../../../common/services/onboardingService.js";
	import styles from "../../../../common/styles/components/Onboarding.module.css";

	// Render counter for performance testing
	let renderCount = 0;
	renderCount++;
	console.log("🔄 Svelte Onboarding render count:", renderCount, "times");

	// Form state variables (Svelte's reactive variables)
	let currentStep = 1;
	let isLoading = false;
	let error = null;
	let successMessage = "";

	// Form data variables
	let firstName = "";
	let age = "";
	let fitnessLevel = "";
	let goals = [];
	let cycleLength = 28;
	let lastPeriodStart = "";
	let averagePeriodLength = 5;
	let preferredWorkoutTypes = [];

	const totalSteps = 3;

	// Step navigation functions
	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep += 1;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep -= 1;
		}
	}

	// Checkbox handling function
	function handleCheckboxChange(value, currentArray) {
		if (currentArray.includes(value)) {
			return currentArray.filter(item => item !== value);
		} else {
			return [...currentArray, value];
		}
	}

	// Form submission
	async function handleSubmit(event) {
		event.preventDefault();
		isLoading = true;
		error = null;

		const formData = {
			userId: $userStore?.id,
			email: $userStore?.email,
			firstName,
			age: parseInt(age),
			fitnessLevel,
			goals,
			cycleLength,
			lastPeriodStart,
			averagePeriodLength,
			preferredWorkoutTypes,
		};

		try {
			await onboardingService.saveProfile(formData);

			// Update user store
			userStore.updateUser({
				hasCompletedOnboarding: true,
				profile: formData,
			});

			successMessage =
				"Profile created successfully! Welcome to StrongCycles!";
		} catch (err) {
			error = err.message;
		} finally {
			isLoading = false;
		}
	}

	// Reactive step rendering
	$: stepComponent = (() => {
		switch (currentStep) {
			case 1:
				return "personal";
			case 2:
				return "cycle";
			case 3:
				return "preferences";
			default:
				return "personal";
		}
	})();
</script>

{#if successMessage}
	<div class={styles.pageWrapper}>
		<div class={styles.container}>
			<div class={styles.successMessage}>
				<h2>🎉 Welcome to StrongCycles!</h2>
				<p>{successMessage}</p>
				<button
					class={styles.primaryButton}
					on:click={() => navigate("/dashboard")}
				>
					Go to Dashboard
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class={styles.pageWrapper}>
		<div class={styles.container}>
			<div class={styles.progressBar}>
				<div
					class={styles.progress}
					style="width: {(currentStep / totalSteps) * 100}%"
				></div>
			</div>

			<h1 class={styles.title}>Let's Set Up Your Profile</h1>
			<p class={styles.subtitle}>Step {currentStep} of {totalSteps}</p>

			{#if error}
				<div class={styles.errorMessage}>{error}</div>
			{/if}

			<!-- Form -->
			<form on:submit={handleSubmit}>
				<div class={styles.stepContent}>
					{#if stepComponent === "personal"}
						<h2>Personal Information</h2>

						<div class={styles.inputGroup}>
							<label for="firstName">First Name</label>
							<input
								id="firstName"
								type="text"
								bind:value={firstName}
								class={styles.input}
								required
							/>
						</div>

						<div class={styles.inputGroup}>
							<label for="age">Age</label>
							<input
								id="age"
								type="number"
								bind:value={age}
								class={styles.input}
								min="13"
								max="65"
								required
							/>
						</div>

						<div class={styles.inputGroup}>
							<label for="fitnessLevel">Fitness Level</label>
							<select
								id="fitnessLevel"
								bind:value={fitnessLevel}
								class={styles.select}
								required
							>
								<option value="">Choose your level</option>
								<option value="beginner">Beginner</option>
								<option value="intermediate"
									>Intermediate</option
								>
								<option value="advanced">Advanced</option>
							</select>
						</div>
					{:else if stepComponent === "cycle"}
						<h2>Cycle Information</h2>

						<div class={styles.inputGroup}>
							<label for="cycleLength"
								>Average Cycle Length (days)</label
							>
							<input
								id="cycleLength"
								type="number"
								bind:value={cycleLength}
								class={styles.input}
								min="21"
								max="35"
								required
							/>
						</div>

						<div class={styles.inputGroup}>
							<label for="lastPeriodStart"
								>Last Period Start Date</label
							>
							<input
								id="lastPeriodStart"
								type="date"
								bind:value={lastPeriodStart}
								class={styles.input}
								required
							/>
						</div>

						<div class={styles.inputGroup}>
							<label for="averagePeriodLength"
								>Average Period Length (days)</label
							>
							<input
								id="averagePeriodLength"
								type="number"
								bind:value={averagePeriodLength}
								class={styles.input}
								min="3"
								max="8"
							/>
						</div>
					{:else if stepComponent === "preferences"}
						<h2>Your Preferences</h2>

						<div class={styles.inputGroup}>
							<div class="label-text">
								Your Goals (select all that apply)
							</div>
							<div class={styles.checkboxGroup}>
								{#each ["strength", "endurance", "weight-loss", "general-fitness", "muscle-gain"] as goal}
									<label class={styles.checkboxLabel}>
										<input
											type="checkbox"
											checked={goals.includes(goal)}
											on:change={() =>
												(goals = handleCheckboxChange(
													goal,
													goals
												))}
										/>
										{goal
											.replace("-", " ")
											.replace(/\b\w/g, l =>
												l.toUpperCase()
											)}
									</label>
								{/each}
							</div>
						</div>

						<div class={styles.inputGroup}>
							<div class="label-text">
								Preferred Workout Types
							</div>
							<div class={styles.checkboxGroup}>
								{#each ["strength-training", "cardio", "yoga", "pilates", "swimming", "running"] as type}
									<label class={styles.checkboxLabel}>
										<input
											type="checkbox"
											checked={preferredWorkoutTypes.includes(
												type
											)}
											on:change={() =>
												(preferredWorkoutTypes =
													handleCheckboxChange(
														type,
														preferredWorkoutTypes
													))}
										/>
										{type
											.replace("-", " ")
											.replace(/\b\w/g, l =>
												l.toUpperCase()
											)}
									</label>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class={styles.buttonGroup}>
					{#if currentStep > 1}
						<button
							type="button"
							on:click={prevStep}
							class={styles.secondaryButton}
						>
							Previous
						</button>
					{/if}

					{#if currentStep < totalSteps}
						<button
							type="button"
							on:click={nextStep}
							class={styles.primaryButton}
						>
							Next
						</button>
					{:else}
						<button
							type="submit"
							disabled={isLoading}
							class={styles.primaryButton}
						>
							{isLoading ? "Saving..." : "Complete Setup"}
						</button>
					{/if}
				</div>
			</form>
		</div>
	</div>
{/if}
