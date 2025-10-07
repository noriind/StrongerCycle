import { createSignal, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useUser } from "../../context/UserContext.jsx";
import onboardingService from "../../services/onboardingService.js";
import styles from "./Onboarding.module.css";

export default function Onboarding() {
	let renderCount = 0;
	renderCount++;
	console.log("Onboarding component render count:", renderCount, "times");

	const navigate = useNavigate();
	const { user, login } = useUser();

	// Form state signals
	const [currentStep, setCurrentStep] = createSignal(1);
	const [isLoading, setIsLoading] = createSignal(false);
	const [error, setError] = createSignal(null);
	const [successMessage, setSuccessMessage] = createSignal("");

	// Form data signals
	const [firstName, setFirstName] = createSignal("");
	const [age, setAge] = createSignal("");
	const [fitnessLevel, setFitnessLevel] = createSignal("");
	const [goals, setGoals] = createSignal([]);
	const [cycleLength, setCycleLength] = createSignal(28);
	const [lastPeriodStart, setLastPeriodStart] = createSignal("");
	const [averagePeriodLength, setAveragePeriodLength] = createSignal(5);
	const [preferredWorkoutTypes, setPreferredWorkoutTypes] = createSignal([]);

	const totalSteps = 3;

	const nextStep = () => {
		if (currentStep() < totalSteps) {
			setCurrentStep(currentStep() + 1);
		}
	};

	const prevStep = () => {
		if (currentStep() > 1) {
			setCurrentStep(currentStep() - 1);
		}
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = {
			email: user()?.email || user?.email, // Include user email for proper userprofile creation for now
			firstName: firstName(),
			age: parseInt(age()),
			fitnessLevel: fitnessLevel(),
			goals: goals(),
			cycleLength: cycleLength(),
			lastPeriodStart: lastPeriodStart(),
			averagePeriodLength: averagePeriodLength(),
			preferredWorkoutTypes: preferredWorkoutTypes(),
		};

		try {
			await onboardingService.saveProfile(formData);

			// Update user context
			login({
				...user(),
				hasCompletedOnboarding: true,
				profile: formData,
			});

			setSuccessMessage(
				"Profile created successfully! Welcome to StrongCycles!"
			);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCheckboxChange = (value, currentArray, setter) => {
		const newArray = currentArray().includes(value)
			? currentArray().filter(item => item !== value)
			: [...currentArray(), value];
		setter(newArray);
	};

	const renderStep = () => {
		switch (currentStep()) {
			case 1:
				return (
					<PersonalInfoStep
						firstName={firstName}
						setFirstName={setFirstName}
						age={age}
						setAge={setAge}
						fitnessLevel={fitnessLevel}
						setFitnessLevel={setFitnessLevel}
					/>
				);
			case 2:
				return (
					<CycleInfoStep
						cycleLength={cycleLength}
						setCycleLength={setCycleLength}
						lastPeriodStart={lastPeriodStart}
						setLastPeriodStart={setLastPeriodStart}
						averagePeriodLength={averagePeriodLength}
						setAveragePeriodLength={setAveragePeriodLength}
					/>
				);
			case 3:
				return (
					<PreferencesStep
						goals={goals}
						setGoals={setGoals}
						preferredWorkoutTypes={preferredWorkoutTypes}
						setPreferredWorkoutTypes={setPreferredWorkoutTypes}
						handleCheckboxChange={handleCheckboxChange}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<Show
			when={successMessage()}
			fallback={
				<div class={styles.pageWrapper}>
					<div class={styles.container}>
						<div class={styles.progressBar}>
							<div
								class={styles.progress}
								style={{
									width: `${(currentStep() / totalSteps) * 100}%`,
								}}
							/>
						</div>

						<h1 class={styles.title}>Let's Set Up Your Profile</h1>
						<p class={styles.subtitle}>
							Step {currentStep()} of {totalSteps}
						</p>

						<Show when={error()}>
							<div class={styles.errorMessage}>{error()}</div>
						</Show>

						<form onSubmit={handleSubmit}>
							{renderStep()}

							<div class={styles.buttonGroup}>
								<Show when={currentStep() > 1}>
									<button
										type="button"
										onClick={prevStep}
										class={styles.secondaryButton}
									>
										Previous
									</button>
								</Show>

								<Show
									when={currentStep() < totalSteps}
									fallback={
										<button
											type="submit"
											disabled={isLoading()}
											class={styles.primaryButton}
										>
											{isLoading()
												? "Saving..."
												: "Complete Setup"}
										</button>
									}
								>
									<button
										type="button"
										onClick={nextStep}
										class={styles.primaryButton}
									>
										Next
									</button>
								</Show>
							</div>
						</form>
					</div>
				</div>
			}
		>
			<div class={styles.pageWrapper}>
				<div class={styles.container}>
					<div class={styles.successMessage}>
						<h2>🎉 Welcome to StrongCycles!</h2>
						<p>{successMessage()}</p>
						<button
							class={styles.primaryButton}
							onClick={() => navigate("/dashboard")}
						>
							Go to Dashboard
						</button>
					</div>
				</div>
			</div>
		</Show>
	);
}

// Step Components
function PersonalInfoStep(props) {
	return (
		<div class={styles.stepContent}>
			<h2>Personal Information</h2>

			<div class={styles.inputGroup}>
				<label>First Name</label>
				<input
					type="text"
					value={props.firstName()}
					onInput={e => props.setFirstName(e.target.value)}
					class={styles.input}
					required
				/>
			</div>

			<div class={styles.inputGroup}>
				<label>Age</label>
				<input
					type="number"
					value={props.age()}
					onInput={e => props.setAge(e.target.value)}
					class={styles.input}
					min="13"
					max="65"
					required
				/>
			</div>

			<div class={styles.inputGroup}>
				<label>Fitness Level</label>
				<select
					value={props.fitnessLevel()}
					onChange={e => props.setFitnessLevel(e.target.value)}
					class={styles.select}
					required
				>
					<option value="">Choose your level</option>
					<option value="beginner">Beginner</option>
					<option value="intermediate">Intermediate</option>
					<option value="advanced">Advanced</option>
				</select>
			</div>
		</div>
	);
}

function CycleInfoStep(props) {
	return (
		<div class={styles.stepContent}>
			<h2>Cycle Information</h2>

			<div class={styles.inputGroup}>
				<label>Average Cycle Length (days)</label>
				<input
					type="number"
					value={props.cycleLength()}
					onInput={e =>
						props.setCycleLength(parseInt(e.target.value))
					}
					class={styles.input}
					min="21"
					max="35"
					required
				/>
			</div>

			<div class={styles.inputGroup}>
				<label>Last Period Start Date</label>
				<input
					type="date"
					value={props.lastPeriodStart()}
					onInput={e => props.setLastPeriodStart(e.target.value)}
					class={styles.input}
					required
				/>
			</div>

			<div class={styles.inputGroup}>
				<label>Average Period Length (days)</label>
				<input
					type="number"
					value={props.averagePeriodLength()}
					onInput={e =>
						props.setAveragePeriodLength(parseInt(e.target.value))
					}
					class={styles.input}
					min="3"
					max="8"
				/>
			</div>
		</div>
	);
}

function PreferencesStep(props) {
	const goalOptions = [
		"strength",
		"endurance",
		"weight-loss",
		"general-fitness",
		"muscle-gain",
	];
	const workoutOptions = [
		"strength-training",
		"cardio",
		"yoga",
		"pilates",
		"swimming",
		"running",
	];

	return (
		<div class={styles.stepContent}>
			<h2>Your Preferences</h2>

			<div class={styles.inputGroup}>
				<label>Your Goals (select all that apply)</label>
				<div class={styles.checkboxGroup}>
					<For each={goalOptions}>
						{goal => (
							<label class={styles.checkboxLabel}>
								<input
									type="checkbox"
									checked={props.goals().includes(goal)}
									onChange={() =>
										props.handleCheckboxChange(
											goal,
											props.goals,
											props.setGoals
										)
									}
								/>
								{goal
									.replace("-", " ")
									.replace(/\b\w/g, l => l.toUpperCase())}
							</label>
						)}
					</For>
				</div>
			</div>

			<div class={styles.inputGroup}>
				<label>Preferred Workout Types</label>
				<div class={styles.checkboxGroup}>
					<For each={workoutOptions}>
						{type => (
							<label class={styles.checkboxLabel}>
								<input
									type="checkbox"
									checked={props
										.preferredWorkoutTypes()
										.includes(type)}
									onChange={() =>
										props.handleCheckboxChange(
											type,
											props.preferredWorkoutTypes,
											props.setPreferredWorkoutTypes
										)
									}
								/>
								{type
									.replace("-", " ")
									.replace(/\b\w/g, l => l.toUpperCase())}
							</label>
						)}
					</For>
				</div>
			</div>
		</div>
	);
}
