import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import onboardingService from "../../../../common/services/onboardingService.js";
import styles from "../../../../common/styles/components/CycleTracker.module.css";

export default function CycleTracker() {
	const { user } = useUser();
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [currentDate, setCurrentDate] = useState(new Date());

	useEffect(() => {
		const fetchProfile = async () => {
			if (!user?.id) {
				setLoading(false);
				return;
			}

			try {
				const data = await onboardingService.getProfile(user.id);
				setProfileData(data.profile);
			} catch (err) {
				// Fallback to user profile if available
				if (user.profile) {
					setProfileData(user.profile);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [user]);

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

	// Generate calendar days for current month
	const generateCalendarDays = () => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const days = [];
		const current = new Date(startDate);

		// Generate 42 days (6 weeks) for calendar grid
		for (let i = 0; i < 42; i++) {
			const dateObj = new Date(current);
			const isCurrentMonth = dateObj.getMonth() === month;
			const isToday =
				dateObj.toDateString() === new Date().toDateString();
			const phase = isCurrentMonth ? getCyclePhase(dateObj) : "unknown";

			days.push({
				date: dateObj,
				day: dateObj.getDate(),
				isCurrentMonth,
				isToday,
				phase,
			});

			current.setDate(current.getDate() + 1);
		}

		return days;
	};

	const navigateMonth = direction => {
		const newDate = new Date(currentDate);
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

	return (
		<div className={styles.pageWrapper}>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1>Cycle Calendar 🌙</h1>
					<p>Track your menstrual cycle and optimize your workouts</p>
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

				{/* Calendar */}
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
                `}
							>
								<span className={styles.dayNumber}>
									{dayObj.day}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Legend */}
				<div className={styles.legend}>
					<h3>Cycle Phases</h3>
					<div className={styles.legendItems}>
						<div className={styles.legendItem}>
							<div
								className={`${styles.legendColor} ${styles.menstrual}`}
							></div>
							<span>
								Menstrual (Days 1-
								{profileData.averagePeriodLength})
							</span>
						</div>
						<div className={styles.legendItem}>
							<div
								className={`${styles.legendColor} ${styles.follicular}`}
							></div>
							<span>
								Follicular (Days{" "}
								{profileData.averagePeriodLength + 1}-13)
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
								Luteal (Days 18-{profileData.cycleLength})
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
