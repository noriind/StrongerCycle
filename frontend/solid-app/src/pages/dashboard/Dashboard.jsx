import { createSignal, onMount, Show } from "solid-js";
import { useUser } from "../../context/UserContext.jsx";
import onboardingService from "../../services/onboardingService.js";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
	const { user } = useUser();
	const [profileData, setProfileData] = createSignal(null);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal(null);

	onMount(async () => {
		const fetchProfileData = async () => {
			console.log("Dashboard onMount - user:", user());

			if (!user()?.id) {
				console.log("No user ID found");
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				console.log("Fetching profile for user:", user().id);
				const data = await onboardingService.getProfile(user().id);
				console.log("Profile data received:", data);
				setProfileData(data.profile);
			} catch (err) {
				console.error("Dashboard fetch error:", err);

				// Fallback: use profile from user state if available
				if (user().profile) {
					console.log(
						"Using fallback profile from user state:",
						user().profile
					);
					setProfileData(user().profile);
				} else {
					setError(err.message);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchProfileData();
	});

	return (
		<Show
			when={loading()}
			fallback={
				<Show
					when={error()}
					fallback={
						<Show
							when={profileData()}
							fallback={
								<div class={styles.pageWrapper}>
									<div class={styles.emptyState}>
										<h2>Welcome to StrongCycles!</h2>
										<p>
											Complete your onboarding to see your
											personalized dashboard.
										</p>
										<button
											class={styles.primaryButton}
											onClick={() =>
												(window.location.href =
													"/onboarding")
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
										<h1>
											Welcome back,{" "}
											{profileData().firstName}! 👋
										</h1>
										<p class={styles.subtitle}>
											Here's your StrongCycles overview
										</p>
									</header>

									<div class={styles.dashboardGrid}>
										<ProfileSummary
											profile={profileData()}
										/>
										<CycleOverview
											profile={profileData()}
										/>
										<QuickStats profile={profileData()} />
										<RecentActivity
											profile={profileData()}
										/>
									</div>
								</div>
							</div>
						</Show>
					}
				>
					<div class={styles.pageWrapper}>
						<div class={styles.errorContainer}>
							<h2>Unable to load dashboard</h2>
							<p>{error()}</p>
						</div>
					</div>
				</Show>
			}
		>
			<div class={styles.pageWrapper}>
				<div class={styles.loadingContainer}>
					<div class={styles.spinner}></div>
					<p>Loading your dashboard...</p>
				</div>
			</div>
		</Show>
	);
}

// Dashboard Components
function ProfileSummary(props) {
	return (
		<div class={styles.card}>
			<h3 class={styles.cardTitle}>Profile Summary</h3>
			<div class={styles.profileInfo}>
				<div class={styles.infoRow}>
					<span class={styles.label}>Age:</span>
					<span class={styles.value}>
						{props.profile.age} years old
					</span>
				</div>
				<div class={styles.infoRow}>
					<span class={styles.label}>Fitness Level:</span>
					<span class={styles.value}>
						{props.profile.fitnessLevel.charAt(0).toUpperCase() +
							props.profile.fitnessLevel.slice(1)}
					</span>
				</div>
				<div class={styles.infoRow}>
					<span class={styles.label}>Goals:</span>
					<span class={styles.value}>
						{props.profile.goals
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

function CycleOverview(props) {
	// Calculate cycle phase (simplified)
	const calculateCyclePhase = () => {
		if (!props.profile.lastPeriodStart)
			return { phase: "Unknown", daysInPhase: 0 };

		const lastPeriod = new Date(props.profile.lastPeriodStart);
		const today = new Date();
		const daysSincePeriod = Math.floor(
			(today - lastPeriod) / (1000 * 60 * 60 * 24)
		);

		if (daysSincePeriod <= props.profile.averagePeriodLength) {
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
		<div class={styles.card}>
			<h3 class={styles.cardTitle}>Cycle Overview</h3>
			<div class={styles.cycleInfo}>
				<div class={styles.currentPhase}>
					<span class={styles.phaseLabel}>Current Phase:</span>
					<span
						class={`${styles.phaseBadge} ${styles[phase.toLowerCase()]}`}
					>
						{phase}
					</span>
				</div>
				<div class={styles.cycleStats}>
					<div class={styles.stat}>
						<span class={styles.statValue}>{daysInPhase}</span>
						<span class={styles.statLabel}>Days in phase</span>
					</div>
					<div class={styles.stat}>
						<span class={styles.statValue}>
							{props.profile.cycleLength}
						</span>
						<span class={styles.statLabel}>Cycle length</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function QuickStats(props) {
	return (
		<div class={styles.card}>
			<h3 class={styles.cardTitle}>Quick Stats</h3>
			<div class={styles.statsGrid}>
				<div class={styles.stat}>
					<span class={styles.statValue}>
						{props.profile.preferredWorkoutTypes?.length || 0}
					</span>
					<span class={styles.statLabel}>Workout types</span>
				</div>
				<div class={styles.stat}>
					<span class={styles.statValue}>
						{props.profile.goals?.length || 0}
					</span>
					<span class={styles.statLabel}>Active goals</span>
				</div>
				<div class={styles.stat}>
					<span class={styles.statValue}>
						{props.profile.averagePeriodLength}
					</span>
					<span class={styles.statLabel}>Period days</span>
				</div>
			</div>
		</div>
	);
}

function RecentActivity(props) {
	return (
		<div class={styles.card}>
			<h3 class={styles.cardTitle}>Recent Activity</h3>
			<div class={styles.activityList}>
				<div class={styles.activityItem}>
					<span class={styles.activityIcon}>✅</span>
					<span class={styles.activityText}>Profile completed</span>
					<span class={styles.activityTime}>Recently</span>
				</div>
				<div class={styles.activityItem}>
					<span class={styles.activityIcon}>🎯</span>
					<span class={styles.activityText}>
						Goals set: {props.profile.goals?.join(", ") || "None"}
					</span>
					<span class={styles.activityTime}>Today</span>
				</div>
				<div class={styles.activityItem}>
					<span class={styles.activityIcon}>💪</span>
					<span class={styles.activityText}>
						Ready to start tracking!
					</span>
					<span class={styles.activityTime}>Now</span>
				</div>
			</div>
		</div>
	);
}
