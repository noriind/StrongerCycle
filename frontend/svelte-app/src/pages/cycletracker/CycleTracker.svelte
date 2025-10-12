<script>
	import { onMount } from "svelte";
	import { userStore } from "../../stores/userStore.js";
	import onboardingService from "../../../../common/services/onboardingService.js";
	import workoutService from "../../../../common/services/workoutService.js";
	import styles from "../../../../common/styles/CycleTracker.module.css";

	// Render counter for performance testing
	let renderCount = 0;
	renderCount++;
	console.log("🔄 Svelte CycleTracker render count:", renderCount, "times");

	let profileData = null;
	let workoutData = [];
	let loading = true;
	let currentDate = new Date();

	onMount(async () => {
		const fetchData = async () => {
			if (!$userStore?.id) {
				loading = false;
				return;
			}

			try {
				// Fetch both profile and workout data
				const [profileResponse, workoutResponse] = await Promise.all([
					onboardingService
						.getProfile($userStore.id)
						.catch(() => ({ profile: $userStore.profile })),
					workoutService
						.getUserWorkouts($userStore.id)
						.catch(() => ({ workouts: [] })),
				]);

				profileData = profileResponse.profile;
				workoutData = workoutResponse.workouts || [];

				console.log(
					"📊 Loaded workouts:",
					workoutResponse.workouts?.length || 0
				);
			} catch (err) {
				console.error("Error loading data:", err);
				// Fallback to user profile if available
				if ($userStore.profile) {
					profileData = $userStore.profile;
				}
			} finally {
				loading = false;
			}
		};

		fetchData();
	});

	// Get workouts for a specific date
	function getWorkoutsForDate(date) {
		const dateStr = date.toISOString().split("T")[0];
		return workoutData.filter(workout => {
			const workoutDate = new Date(workout.date)
				.toISOString()
				.split("T")[0];
			return workoutDate === dateStr;
		});
	}

	// Calculate cycle phase for a given date
	function getCyclePhase(date) {
		if (!profileData?.lastPeriodStart) return "unknown";

		const lastPeriod = new Date(profileData.lastPeriodStart);
		const daysDiff = Math.floor(
			(date.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
		);
		const cycleDay =
			(((daysDiff % profileData.cycleLength) + profileData.cycleLength) %
				profileData.cycleLength) +
			1;

		if (cycleDay <= profileData.averagePeriodLength) {
			return "menstrual";
		} else if (cycleDay <= 13) {
			return "follicular";
		} else if (cycleDay <= 17) {
			return "ovulation";
		} else {
			return "luteal";
		}
	}

	// Generate calendar days for current month
	function generateCalendarDays() {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const firstDay = new Date(year, month, 1);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const days = [];
		const currentDay = new Date(startDate);

		// Generate 42 days (6 weeks) for calendar grid
		for (let i = 0; i < 42; i++) {
			const dateObj = new Date(currentDay);
			const isCurrentMonth = dateObj.getMonth() === month;
			const isToday =
				dateObj.toDateString() === new Date().toDateString();
			const phase = isCurrentMonth ? getCyclePhase(dateObj) : "unknown";
			const workouts = getWorkoutsForDate(dateObj);

			days.push({
				date: dateObj,
				day: dateObj.getDate(),
				isCurrentMonth,
				isToday,
				phase,
				workouts,
			});

			currentDay.setDate(currentDay.getDate() + 1);
		}

		return days;
	}

	// Calculate monthly workout stats
	function getMonthlyStats() {
		const currentMonth = currentDate.getMonth();
		const currentYear = currentDate.getFullYear();

		const monthlyWorkouts = workoutData.filter(workout => {
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
	}

	function navigateMonth(direction) {
		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() + direction);
		currentDate = newDate;
	}

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

	// Reactive calendar days and stats - automatically updates when currentDate or workoutData changes
	$: calendarDays = profileData && workoutData ? generateCalendarDays() : [];
	$: monthlyStats =
		workoutData.length >= 0
			? getMonthlyStats()
			: { total: 0, types: {}, workouts: [] };
</script>

<!-- Loading State -->
{#if loading}
	<div class={styles.pageWrapper}>
		<div class={styles.loadingContainer}>
			<div class={styles.spinner}></div>
			<p>Loading your cycle data...</p>
		</div>
	</div>

	<!-- Empty State -->
{:else if !profileData}
	<div class={styles.pageWrapper}>
		<div class={styles.emptyState}>
			<h2>Complete Your Profile</h2>
			<p>Set up your cycle information to start tracking.</p>
			<button
				class={styles.primaryButton}
				on:click={() => (window.location.href = "/onboarding")}
			>
				Complete Setup
			</button>
		</div>
	</div>

	<!-- Calendar Content -->
{:else}
	<div class={styles.pageWrapper}>
		<div class={styles.container}>
			<header class={styles.header}>
				<h1>Cycle & Workout Calendar 🌙💪</h1>
				<p>Track your menstrual cycle and workout progress together</p>
			</header>

			<!-- Calendar Navigation -->
			<div class={styles.calendarHeader}>
				<button
					class={styles.navButton}
					on:click={() => navigateMonth(-1)}
				>
					‹
				</button>
				<h2 class={styles.monthTitle}>
					{monthNames[currentDate.getMonth()]}
					{currentDate.getFullYear()}
				</h2>
				<button
					class={styles.navButton}
					on:click={() => navigateMonth(1)}
				>
					›
				</button>
			</div>

			<!-- Calendar with Workout Integration -->
			<div class={styles.calendar}>
				<!-- Day Headers -->
				<div class={styles.dayHeaders}>
					{#each dayNames as day}
						<div class={styles.dayHeader}>
							{day}
						</div>
					{/each}
				</div>

				<!-- Calendar Days -->
				<div class={styles.calendarGrid}>
					{#each calendarDays as dayObj}
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
							<span class={styles.dayNumber}>{dayObj.day}</span>

							<!-- Workout indicator dots -->
							{#if dayObj.workouts.length > 0}
								<div class={styles.workoutIndicators}>
									{#each dayObj.workouts.slice(0, 3) as workout}
										<div
											class={`${styles.workoutDot} ${styles[workout.type.replace("-", "")]}`}
											title={`${workout.type}: ${workout.exercises?.length || 0} exercises`}
										></div>
									{/each}
									{#if dayObj.workouts.length > 3}
										<div class={styles.workoutDot}>
											+{dayObj.workouts.length - 3}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Enhanced Legend with Both Cycle and Workout Types -->
			<div class={styles.legend}>
				<!-- Cycle Phases Legend -->
				<div class={styles.cyclePhases}>
					<h3>Cycle Phases</h3>
					<div class={styles.legendItems}>
						<div class={styles.legendItem}>
							<div
								class={`${styles.legendColor} ${styles.menstrual}`}
							></div>
							<span
								>Menstrual (Days 1-{profileData?.averagePeriodLength ||
									5})</span
							>
						</div>
						<div class={styles.legendItem}>
							<div
								class={`${styles.legendColor} ${styles.follicular}`}
							></div>
							<span
								>Follicular (Days {(profileData?.averagePeriodLength ||
									5) + 1}-13)</span
							>
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
							<span
								>Luteal (Days 18-{profileData?.cycleLength ||
									28})</span
							>
						</div>
					</div>
				</div>
			</div>

			<!-- Monthly Stats Bar -->
			<div class={styles.statsBar}>
				<div class={styles.statItem}>
					<span class={styles.statNumber}>{monthlyStats.total}</span>
					<span class={styles.statLabel}>workouts this month</span>
				</div>
				{#each Object.entries(monthlyStats.types) as [type, count]}
					<div class={styles.statItem}>
						<span class={styles.statNumber}>{count}</span>
						<span class={styles.statLabel}>
							{type
								.replace("-", " ")
								.replace(/\b\w/g, l => l.toUpperCase())}
						</span>
					</div>
				{/each}
			</div>

			<!-- Workout History Section -->
			{#if monthlyStats.workouts.length > 0}
				<div class={styles.workoutHistory}>
					<h3>Recent Workouts</h3>
					<div class={styles.workoutList}>
						{#each monthlyStats.workouts.slice(0, 5) as workout}
							<div class={styles.workoutItem}>
								<div class={styles.workoutDate}>
									{new Date(
										workout.date
									).toLocaleDateString()}
								</div>
								<div class={styles.workoutInfo}>
									<strong>
										{workout.type
											.replace("-", " ")
											.replace(/\b\w/g, l =>
												l.toUpperCase()
											)}
									</strong>
									{#if workout.duration}
										<span>{workout.duration} min</span>
									{/if}
									<span
										>Intensity: {workout.intensity}/10</span
									>
									<span
										>{workout.exercises?.length || 0} exercises</span
									>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
