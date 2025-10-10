import { createSignal, onMount, Show, For } from "solid-js";
import { useUser } from "../../context/UserContext.jsx";
import onboardingService from "../../../../common/services/onboardingService.js";
import styles from "../../../../common/styles/CycleTracker.module.css";
import workoutService from "../../../../common/services/workoutService.js";

export default function CycleTracker() {
	const { user } = useUser();
	const [profileData, setProfileData] = createSignal(null);
	const [workoutData, setWorkoutData] = createSignal([]);
	const [loading, setLoading] = createSignal(true);
	const [currentDate, setCurrentDate] = createSignal(new Date());

	onMount(async () => {
		const fetchData = async () => {
			if (!user()?.id) {
				setLoading(false);
				return;
			}

			try {
				// Fetch both profile and workout data
				const [profileResponse, workoutResponse] = await Promise.all([
					onboardingService
						.getProfile(user().id)
						.catch(() => ({ profile: user().profile })),
					workoutService
						.getUserWorkouts(user().id)
						.catch(() => ({ workouts: [] })),
				]);

				setProfileData(profileResponse.profile);
				setWorkoutData(workoutResponse.workouts || []);

				console.log(
					"📊 Loaded workouts:",
					workoutResponse.workouts?.length || 0
				);
			} catch (err) {
				console.error("Error loading data:", err);
				// Fallback to user profile
				if (user().profile) {
					setProfileData(user().profile);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	});

	const getWorkoutsForDate = date => {
		const dateStr = date.toISOString().split("T")[0];
		return workoutData().filter(workout => {
			const workoutDate = new Date(workout.date)
				.toISOString()
				.split("T")[0];
			return workoutDate === dateStr;
		});
	};

	// Calculate cycle phase for a given date
	const getCyclePhase = date => {
		const profile = profileData();
		if (!profile?.lastPeriodStart) return "unknown";

		const lastPeriod = new Date(profile.lastPeriodStart);
		const daysDiff = Math.floor(
			(date - lastPeriod) / (1000 * 60 * 60 * 24)
		);
		const cycleDay =
			(((daysDiff % profile.cycleLength) + profile.cycleLength) %
				profile.cycleLength) +
			1;

		if (cycleDay <= profile.averagePeriodLength) {
			return "menstrual";
		} else if (cycleDay <= 13) {
			return "follicular";
		} else if (cycleDay <= 17) {
			return "ovulation";
		} else {
			return "luteal";
		}
	};

	// Generate calendar days with workout data
	const generateCalendarDays = () => {
		const current = currentDate();
		const year = current.getFullYear();
		const month = current.getMonth();

		const firstDay = new Date(year, month, 1);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const days = [];
		const currentDay = new Date(startDate);

		for (let i = 0; i < 42; i++) {
			const dateObj = new Date(currentDay);
			const isCurrentMonth = dateObj.getMonth() === month;
			const isToday =
				dateObj.toDateString() === new Date().toDateString();
			const phase = isCurrentMonth ? getCyclePhase(dateObj) : "unknown";
			const workouts = getWorkoutsForDate(dateObj); // Add workouts for this day

			days.push({
				date: dateObj,
				day: dateObj.getDate(),
				isCurrentMonth,
				isToday,
				phase,
				workouts, // Add workout data
			});

			currentDay.setDate(currentDay.getDate() + 1);
		}

		return days;
	};

	// Calculate monthly workout stats
	const getMonthlyStats = () => {
		const current = currentDate();
		const currentMonth = current.getMonth();
		const currentYear = current.getFullYear();

		const monthlyWorkouts = workoutData().filter(workout => {
			const workoutDate = new Date(workout.date);
			return (
				workoutDate.getMonth() === currentMonth &&
				workoutDate.getFullYear() === currentYear
			);
		});

		const workoutTypes = {};
		monthlyWorkouts.forEach(workout => {
			workoutTypes[workout.type] = (workoutTypes[workout.type] || 0) + 1;
		});

		return {
			total: monthlyWorkouts.length,
			types: workoutTypes,
			workouts: monthlyWorkouts,
		};
	};

	const navigateMonth = direction => {
		const newDate = new Date(currentDate());
		newDate.setMonth(newDate.getMonth() + direction);
		setCurrentDate(newDate);
	};

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	// Reactive calendar days
	const calendarDays = () => generateCalendarDays();
	const monthlyStats = () => getMonthlyStats();

	return (
		<Show
			when={loading()}
			fallback={
				<Show
					when={profileData()}
					fallback={
						<div class={styles.pageWrapper}>
							<div class={styles.emptyState}>
								<h2>Complete Your Profile</h2>
								<p>
									Set up your cycle information to start
									tracking.
								</p>
								<button
									class={styles.primaryButton}
									onClick={() =>
										(window.location.href = "/onboarding")
									}
								>
									Complete Setup
								</button>
							</div>
						</div>
					}
				>
					<div class={styles.pageWrapper}>
						<div class={styles.container}>
							<header class={styles.header}>
								<h1>Cycle & Workout Calendar 🌙💪</h1>
								<p>
									Track your menstrual cycle and workout
									progress together
								</p>
							</header>

							{/* Calendar Navigation */}
							<div class={styles.calendarHeader}>
								<button
									class={styles.navButton}
									onClick={() => navigateMonth(-1)}
								>
									‹
								</button>
								<h2 class={styles.monthTitle}>
									{monthNames[currentDate().getMonth()]}{" "}
									{currentDate().getFullYear()}
								</h2>
								<button
									class={styles.navButton}
									onClick={() => navigateMonth(1)}
								>
									›
								</button>
							</div>

							{/* Calendar with Workout Integration */}
							<div class={styles.calendar}>
								{/* Day Headers */}
								<div class={styles.dayHeaders}>
									<For each={dayNames}>
										{day => (
											<div class={styles.dayHeader}>
												{day}
											</div>
										)}
									</For>
								</div>

								{/* Calendar Days */}
								<div class={styles.calendarGrid}>
									<For each={calendarDays()}>
										{dayObj => (
											<div
												class={`
                        ${styles.calendarDay}
                        ${!dayObj.isCurrentMonth ? styles.otherMonth : ""}
                        ${dayObj.isToday ? styles.today : ""}
                        ${styles[dayObj.phase]}
                        ${dayObj.workouts.length > 0 ? styles.hasWorkout : ""}
                      `}
												title={`${dayObj.workouts.length} workout${dayObj.workouts.length !== 1 ? "s" : ""}`}
											>
												<span class={styles.dayNumber}>
													{dayObj.day}
												</span>
												{/* Workout indicator dots */}
												<Show
													when={
														dayObj.workouts.length >
														0
													}
												>
													<div
														class={
															styles.workoutIndicators
														}
													>
														<For
															each={dayObj.workouts.slice(
																0,
																3
															)}
														>
															{(workout, idx) => (
																<div
																	class={`${styles.workoutDot} ${styles[workout.type.replace("-", "")]}`}
																	title={`${workout.type}: ${workout.exercises?.length || 0} exercises`}
																></div>
															)}
														</For>
														<Show
															when={
																dayObj.workouts
																	.length > 3
															}
														>
															<div
																class={
																	styles.workoutDot
																}
															>
																+
																{dayObj.workouts
																	.length - 3}
															</div>
														</Show>
													</div>
												</Show>
											</div>
										)}
									</For>
								</div>
							</div>

							{/* Enhanced Legend with Both Cycle and Workout Types */}
							<div class={styles.legend}>
								{/* Cycle Phases Legend */}
								<div class={styles.cyclePhases}>
									<h3>Cycle Phases</h3>
									<div class={styles.legendItems}>
										<div class={styles.legendItem}>
											<div
												class={`${styles.legendColor} ${styles.menstrual}`}
											></div>
											<span>
												Menstrual (Days 1-
												{profileData()
													?.averagePeriodLength || 5}
												)
											</span>
										</div>
										<div class={styles.legendItem}>
											<div
												class={`${styles.legendColor} ${styles.follicular}`}
											></div>
											<span>
												Follicular (Days{" "}
												{(profileData()
													?.averagePeriodLength ||
													5) + 1}
												-13)
											</span>
										</div>
										<div class={styles.legendItem}>
											<div
												class={`${styles.legendColor} ${styles.ovulation}`}
											></div>
											<span>Ovulation (Days 14-17)</span>
										</div>
										<div class={styles.legendItem}>
											<div
												class={`${styles.legendColor} ${styles.luteal}`}
											></div>
											<span>
												Luteal (Days 18-
												{profileData()?.cycleLength ||
													28}
												)
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Monthly Stats Bar */}
							<div class={styles.statsBar}>
								<div class={styles.statItem}>
									<span class={styles.statNumber}>
										{monthlyStats().total}
									</span>
									<span class={styles.statLabel}>
										workouts this month
									</span>
								</div>
								<For
									each={Object.entries(monthlyStats().types)}
								>
									{([type, count]) => (
										<div class={styles.statItem}>
											<span class={styles.statNumber}>
												{count}
											</span>
											<span class={styles.statLabel}>
												{type
													.replace("-", " ")
													.replace(/\b\w/g, l =>
														l.toUpperCase()
													)}
											</span>
										</div>
									)}
								</For>
							</div>

							{/* Workout History Section */}
							<Show when={monthlyStats().workouts.length > 0}>
								<div class={styles.workoutHistory}>
									<h3>Recent Workouts</h3>
									<div class={styles.workoutList}>
										<For
											each={monthlyStats().workouts.slice(
												0,
												5
											)}
										>
											{workout => (
												<div class={styles.workoutItem}>
													<div
														class={
															styles.workoutDate
														}
													>
														{new Date(
															workout.date
														).toLocaleDateString()}
													</div>
													<div
														class={
															styles.workoutInfo
														}
													>
														<strong>
															{workout.type
																.replace(
																	"-",
																	" "
																)
																.replace(
																	/\b\w/g,
																	l =>
																		l.toUpperCase()
																)}
														</strong>
														<Show
															when={
																workout.duration
															}
														>
															<span>
																{
																	workout.duration
																}{" "}
																min
															</span>
														</Show>
														<span>
															Intensity:{" "}
															{workout.intensity}
															/10
														</span>
														<span>
															{workout.exercises
																?.length ||
																0}{" "}
															exercises
														</span>
													</div>
												</div>
											)}
										</For>
									</div>
								</div>
							</Show>
						</div>
					</div>
				</Show>
			}
		>
			<div class={styles.pageWrapper}>
				<div class={styles.loadingContainer}>
					<div class={styles.spinner}></div>
					<p>Loading your cycle data...</p>
				</div>
			</div>
		</Show>
	);
}
