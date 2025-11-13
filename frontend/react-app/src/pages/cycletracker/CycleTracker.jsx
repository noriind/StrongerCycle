import { useState, useEffect, useRef } from "react";
import { useUser } from "../../context/UserContext";
import onboardingService from "../../../../common/services/onboardingService.js";
import workoutService from "../../../../common/services/workoutService.js";
import styles from "../../../../common/styles/CycleTracker.module.css";

// ===== PERFORMANCE INSTRUMENTATION SETUP =====
// This creates a global object to collect all performance metrics
if (!window.performanceMetrics) {
	window.performanceMetrics = {
		react: {
			monthNavigation: [],
			calendarRender: [],
			initialLoad: null
		}
	};
}

// Helper function to record metrics
const recordMetric = (category, duration) => {
	window.performanceMetrics.react[category].push(duration);
	console.log(`📊 React ${category}: ${duration.toFixed(2)}ms`);
};

// Helper to export metrics for your thesis
window.exportReactMetrics = () => {
	const metrics = window.performanceMetrics.react;
	const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;
	
	console.log("=== REACT PERFORMANCE METRICS ===");
	console.log(`Month Navigation (${metrics.monthNavigation.length} samples):`);
	console.log(`  Average: ${avg(metrics.monthNavigation)}ms`);
	console.log(`  Min: ${Math.min(...metrics.monthNavigation).toFixed(2)}ms`);
	console.log(`  Max: ${Math.max(...metrics.monthNavigation).toFixed(2)}ms`);
	console.log(`Calendar Render (${metrics.calendarRender.length} samples):`);
	console.log(`  Average: ${avg(metrics.calendarRender)}ms`);
	console.log(`Initial Load: ${metrics.initialLoad?.toFixed(2)}ms`);
	
	return metrics;
};
// ===== END INSTRUMENTATION SETUP =====

export default function CycleTracker() {
	const { user } = useUser();
	const [profileData, setProfileData] = useState(null);
	const [workoutData, setWorkoutData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [currentDate, setCurrentDate] = useState(new Date());
	
	// Ref to track if this is initial mount
	const isInitialMount = useRef(true);
	const loadStartTime = useRef(performance.now());

	useEffect(() => {
		const fetchData = async () => {
			if (!user?.id) {
				setLoading(false);
				return;
			}

			try {
				// Fetch both profile and workout data
				const [profileResponse, workoutResponse] = await Promise.all([
					onboardingService
						.getProfile(user.id)
						.catch(() => ({ profile: user.profile })),
					workoutService
						.getUserWorkouts(user.id)
						.catch(() => ({ workouts: [] })),
				]);

				setProfileData(profileResponse.profile);
				setWorkoutData(workoutResponse.workouts || []);

				console.log(
					"📊 Loaded workouts:",
					workoutResponse.workouts?.length || 0
				);
				
				// Record initial load time
				if (isInitialMount.current) {
					const loadTime = performance.now() - loadStartTime.current;
					window.performanceMetrics.react.initialLoad = loadTime;
					console.log(`📊 React Initial Load: ${loadTime.toFixed(2)}ms`);
					isInitialMount.current = false;
				}
			} catch (err) {
				console.error("Error loading data:", err);
				// Fallback to user profile
				if (user.profile) {
					setProfileData(user.profile);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user]);

	// Get workouts for a specific date
	const getWorkoutsForDate = date => {
		const dateStr = date.toISOString().split("T")[0];
		return workoutData.filter(workout => {
			const workoutDate = new Date(workout.date)
				.toISOString()
				.split("T")[0];
			return workoutDate === dateStr;
		});
	};

	// Calculate cycle phase for a given date
	const getCyclePhase = date => {
		if (!profileData?.lastPeriodStart) return "unknown";

		const lastPeriod = new Date(profileData.lastPeriodStart);
		const daysDiff = Math.floor(
			(date - lastPeriod) / (1000 * 60 * 60 * 24)
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
	};

	// Generate calendar days with workout data
	const generateCalendarDays = () => {
		// ===== INSTRUMENTATION: Start calendar render measurement =====
		const renderStart = performance.now();
		
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const days = [];
		const current = new Date(startDate);

		for (let i = 0; i < 42; i++) {
			const dateObj = new Date(current);
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

			current.setDate(current.getDate() + 1);
		}

		// ===== INSTRUMENTATION: End calendar render measurement =====
		const renderTime = performance.now() - renderStart;
		recordMetric('calendarRender', renderTime);

		return days;
	};

	// Calculate monthly workout stats
	const getMonthlyStats = () => {
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
	};

	const navigateMonth = direction => {
		// ===== INSTRUMENTATION: Start month navigation measurement =====
		const navStart = performance.now();
		
		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() + direction);
		setCurrentDate(newDate);
		
		// Measure after React has re-rendered (next frame)
		requestAnimationFrame(() => {
			const navTime = performance.now() - navStart;
			recordMetric('monthNavigation', navTime);
		});
		// ===== END INSTRUMENTATION =====
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

	if (loading) {
		return (
			<div className={styles.pageWrapper}>
				<div className={styles.loadingContainer}>
					<div className={styles.spinner}></div>
					<p>Loading your cycle data...</p>
				</div>
			</div>
		);
	}

	if (!profileData) {
		return (
			<div className={styles.pageWrapper}>
				<div className={styles.emptyState}>
					<h2>Complete Your Profile</h2>
					<p>Set up your cycle information to start tracking.</p>
					<button
						className={styles.primaryButton}
						onClick={() => (window.location.href = "/onboarding")}
					>
						Complete Setup
					</button>
				</div>
			</div>
		);
	}

	const calendarDays = generateCalendarDays();
	const monthlyStats = getMonthlyStats();

	return (
		<div className={styles.pageWrapper}>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1>Calendar 🌙💪</h1>
				</header>

				{/* Calendar Navigation */}
				<div className={styles.calendarHeader}>
					<button
						className={styles.navButton}
						onClick={() => navigateMonth(-1)}
					>
						‹
					</button>
					<h2 className={styles.monthTitle}>
						{monthNames[currentDate.getMonth()]}{" "}
						{currentDate.getFullYear()}
					</h2>
					<button
						className={styles.navButton}
						onClick={() => navigateMonth(1)}
					>
						›
					</button>
				</div>

				{/* Calendar with Workout Integration */}
				<div className={styles.calendar}>
					{/* Day Headers */}
					<div className={styles.dayHeaders}>
						{dayNames.map(day => (
							<div key={day} className={styles.dayHeader}>
								{day}
							</div>
						))}
					</div>

					{/* Calendar Days */}
					<div className={styles.calendarGrid}>
						{calendarDays.map((dayObj, index) => (
							<div
								key={index}
								className={`
					  ${styles.calendarDay}
					  ${!dayObj.isCurrentMonth ? styles.otherMonth : ""}
					  ${dayObj.isToday ? styles.today : ""}
					  ${styles[dayObj.phase]}
					  ${dayObj.workouts.length > 0 ? styles.hasWorkout : ""}
					`}
								title={`${dayObj.workouts.length} workout${dayObj.workouts.length !== 1 ? "s" : ""}`}
							>
								<span className={styles.dayNumber}>
									{dayObj.day}
								</span>
								{/* Workout indicator dots */}
								{dayObj.workouts.length > 0 && (
									<div className={styles.workoutIndicators}>
										{dayObj.workouts
											.slice(0, 3)
											.map((workout, idx) => (
												<div
													key={idx}
													className={`${styles.workoutDot} ${styles[workout.type.replace("-", "")]}`}
													title={`${workout.type}: ${workout.exercises?.length || 0} exercises`}
												></div>
											))}
										{dayObj.workouts.length > 3 && (
											<div className={styles.workoutDot}>
												+{dayObj.workouts.length - 3}
											</div>
										)}
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Cycle Phases Legend */}
				<div className={styles.cyclePhases}>
					<h3>Cycle Phases</h3>
					<div className={styles.legendItems}>
						<div className={styles.legendItem}>
							<div
								className={`${styles.legendColor} ${styles.menstrual}`}
							></div>
							<span>
								Menstrual (Days 1-
								{profileData?.averagePeriodLength || 5})
							</span>
						</div>
						<div className={styles.legendItem}>
							<div
								className={`${styles.legendColor} ${styles.follicular}`}
							></div>
							<span>
								Follicular (Days{" "}
								{(profileData?.averagePeriodLength || 5) + 1}
								-13)
							</span>
						</div>
						<div className={styles.legendItem}>
							<div
								className={`${styles.legendColor} ${styles.ovulation}`}
							></div>
							<span>Ovulation (Days 14-17)</span>
						</div>
						<div className={styles.legendItem}>
							<div
								className={`${styles.legendColor} ${styles.luteal}`}
							></div>
							<span>
								Luteal (Days 18-
								{profileData?.cycleLength || 28})
							</span>
						</div>
					</div>
				</div>

				{/* Monthly Stats Bar */}
				<div className={styles.statsBar}>
					<div className={styles.statItem}>
						<span className={styles.statNumber}>
							{monthlyStats.total}
						</span>
						<span className={styles.statLabel}>
							workouts this month
						</span>
					</div>
					{Object.entries(monthlyStats.types).map(([type, count]) => (
						<div key={type} className={styles.statItem}>
							<span className={styles.statNumber}>{count}</span>
							<span className={styles.statLabel}>
								{type
									.replace("-", " ")
									.replace(/\b\w/g, l => l.toUpperCase())}
							</span>
						</div>
					))}
				</div>

				{/* Workout History Section */}
				{monthlyStats.workouts.length > 0 && (
					<div className={styles.workoutHistory}>
						<h3>Recent Workouts</h3>
						<div className={styles.workoutList}>
							{monthlyStats.workouts.slice(0, 5).map(workout => (
								<div
									key={workout._id}
									className={styles.workoutItem}
								>
									<div className={styles.workoutDate}>
										{new Date(
											workout.date
										).toLocaleDateString()}
									</div>
									<div className={styles.workoutInfo}>
										<strong>
											{workout.type
												.replace("-", " ")
												.replace(/\b\w/g, l =>
													l.toUpperCase()
												)}
										</strong>
										{workout.duration && (
											<span>{workout.duration} min</span>
										)}
										<span>
											Intensity: {workout.intensity}/10
										</span>
										<span>
											{workout.exercises?.length || 0}{" "}
											exercises
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}