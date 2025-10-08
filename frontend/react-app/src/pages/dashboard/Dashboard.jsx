import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import onboardingService from "../../../../common/services/onboardingService";
import styles from "../../../../common/styles/Dashboard.module.css";

export default function Dashboard() {
	const { user } = useUser();
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchProfileData = async () => {
			console.log("Dashboard useEffect - user:", user); // Add debug

			if (!user?.id) {
				console.log("No user ID found"); // Add debug
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				console.log("Fetching profile for user:", user.id); // Add debug
				const data = await onboardingService.getProfile(user.id);
				console.log("Profile data received:", data); // Add debug
				setProfileData(data.profile);
			} catch (err) {
				console.error("Dashboard fetch error:", err); // Add debug
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchProfileData();
	}, [user?.id]);

	if (loading) {
		return (
			<div className={styles.pageWrapper}>
				<div className={styles.loadingContainer}>
					<div className={styles.spinner}></div>
					<p>Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.pageWrapper}>
				<div className={styles.errorContainer}>
					<h2>Unable to load dashboard</h2>
					<p>{error}</p>
				</div>
			</div>
		);
	}

	if (!profileData) {
		return (
			<div className={styles.pageWrapper}>
				<div className={styles.emptyState}>
					<h2>Welcome to StrongCycles!</h2>
					<p>
						Complete your onboarding to see your personalized
						dashboard.
					</p>
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

	return (
		<div className={styles.pageWrapper}>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1>Welcome back, {profileData.firstName}! 👋</h1>
					<p className={styles.subtitle}>
						Here's your StrongCycles overview
					</p>
				</header>

				<div className={styles.dashboardGrid}>
					<ProfileSummary profile={profileData} />
					<CycleOverview profile={profileData} />
					<QuickStats profile={profileData} />
					<RecentActivity profile={profileData} />
				</div>
			</div>
		</div>
	);
}

// Dashboard Components
function ProfileSummary({ profile }) {
	return (
		<div className={styles.card}>
			<h3 className={styles.cardTitle}>Profile Summary</h3>
			<div className={styles.profileInfo}>
				<div className={styles.infoRow}>
					<span className={styles.label}>Age:</span>
					<span className={styles.value}>
						{profile.age} years old
					</span>
				</div>
				<div className={styles.infoRow}>
					<span className={styles.label}>Fitness Level:</span>
					<span className={styles.value}>
						{profile.fitnessLevel.charAt(0).toUpperCase() +
							profile.fitnessLevel.slice(1)}
					</span>
				</div>
				<div className={styles.infoRow}>
					<span className={styles.label}>Goals:</span>
					<span className={styles.value}>
						{profile.goals
							?.map(goal =>
								goal
									.replace("-", " ")
									.replace(/\b\w/g, l => l.toUpperCase())
							)
							.join(", ") || "None set"}
					</span>
				</div>
			</div>
		</div>
	);
}

function CycleOverview({ profile }) {
	// Calculate cycle phase (simplified)
	const calculateCyclePhase = () => {
		if (!profile.lastPeriodStart)
			return { phase: "Unknown", daysInPhase: 0 };

		const lastPeriod = new Date(profile.lastPeriodStart);
		const today = new Date();
		const daysSincePeriod = Math.floor(
			(today - lastPeriod) / (1000 * 60 * 60 * 24)
		);

		if (daysSincePeriod <= profile.averagePeriodLength) {
			return { phase: "Menstrual", daysInPhase: daysSincePeriod };
		} else if (daysSincePeriod <= 13) {
			return { phase: "Follicular", daysInPhase: daysSincePeriod };
		} else if (daysSincePeriod <= 17) {
			return { phase: "Ovulation", daysInPhase: daysSincePeriod };
		} else {
			return { phase: "Luteal", daysInPhase: daysSincePeriod };
		}
	};

	const { phase, daysInPhase } = calculateCyclePhase();

	return (
		<div className={styles.card}>
			<h3 className={styles.cardTitle}>Cycle Overview</h3>
			<div className={styles.cycleInfo}>
				<div className={styles.currentPhase}>
					<span className={styles.phaseLabel}>Current Phase:</span>
					<span
						className={`${styles.phaseBadge} ${styles[phase.toLowerCase()]}`}
					>
						{phase}
					</span>
				</div>
				<div className={styles.cycleStats}>
					<div className={styles.stat}>
						<span className={styles.statValue}>{daysInPhase}</span>
						<span className={styles.statLabel}>Days in phase</span>
					</div>
					<div className={styles.stat}>
						<span className={styles.statValue}>
							{profile.cycleLength}
						</span>
						<span className={styles.statLabel}>Cycle length</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function QuickStats({ profile }) {
	return (
		<div className={styles.card}>
			<h3 className={styles.cardTitle}>Quick Stats</h3>
			<div className={styles.statsGrid}>
				<div className={styles.stat}>
					<span className={styles.statValue}>
						{profile.preferredWorkoutTypes?.length || 0}
					</span>
					<span className={styles.statLabel}>Workout types</span>
				</div>
				<div className={styles.stat}>
					<span className={styles.statValue}>
						{profile.goals?.length || 0}
					</span>
					<span className={styles.statLabel}>Active goals</span>
				</div>
				<div className={styles.stat}>
					<span className={styles.statValue}>
						{profile.averagePeriodLength}
					</span>
					<span className={styles.statLabel}>Period days</span>
				</div>
			</div>
		</div>
	);
}

function RecentActivity({ profile }) {
	return (
		<div className={styles.card}>
			<h3 className={styles.cardTitle}>Recent Activity</h3>
			<div className={styles.activityList}>
				<div className={styles.activityItem}>
					<span className={styles.activityIcon}>✅</span>
					<span className={styles.activityText}>
						Profile completed
					</span>
					<span className={styles.activityTime}>Recently</span>
				</div>
				<div className={styles.activityItem}>
					<span className={styles.activityIcon}>🎯</span>
					<span className={styles.activityText}>
						Goals set: {profile.goals?.join(", ") || "None"}
					</span>
					<span className={styles.activityTime}>Today</span>
				</div>
				<div className={styles.activityItem}>
					<span className={styles.activityIcon}>💪</span>
					<span className={styles.activityText}>
						Ready to start tracking!
					</span>
					<span className={styles.activityTime}>Now</span>
				</div>
			</div>
		</div>
	);
}
