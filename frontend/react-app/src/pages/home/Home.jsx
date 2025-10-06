import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router";
import styles from "./Home.module.css";

export default function Home() {
	const { user } = useUser();
	const navigate = useNavigate();

	return (
		<div className={styles.container}>
			<div className={styles.hero}>
				<div className={styles.content}>
					<h1 className={styles.title}>
						Sync Your{" "}
						<span className={styles.accent}>Strength</span> with
						Your <span className={styles.accent}>Cycle</span>
					</h1>
					<p className={styles.subtitle}>
						Unlock your body's natural power with personalized
						fitness tracking that works with your menstrual cycle,
						not against it.
					</p>

					<div className={styles.features}>
						<div className={styles.feature}>
							<span className={styles.emoji}>🌙</span>
							<span>Cycle-synced workouts</span>
						</div>
						<div className={styles.feature}>
							<span className={styles.emoji}>💪</span>
							<span>Strength optimization</span>
						</div>
						<div className={styles.feature}>
							<span className={styles.emoji}>📊</span>
							<span>Personalized insights</span>
						</div>
					</div>

					{user ? (
						<div className={styles.actions}>
							<button
								className={styles.primaryButton}
								onClick={() => navigate("/dashboard")}
							>
								Your Dashboard ✨
							</button>
							<button
								className={styles.secondaryButton}
								onClick={() => navigate("/cycle")}
							>
								Track Your Cycle
							</button>
						</div>
					) : (
						<div className={styles.actions}>
							<button
								className={styles.primaryButton}
								onClick={() => navigate("/auth")}
							>
								Start Your Journey
							</button>
							<p className={styles.subtitle}>
								Join thousands of women optimizing their fitness
								naturally
							</p>
						</div>
					)}
				</div>

				<div className={styles.illustration}>
					<div className={styles.circle}></div>
					<div className={styles.dots}>
						<span className={styles.dot}></span>
						<span className={styles.dot}></span>
						<span className={styles.dot}></span>
					</div>
				</div>
			</div>

			<div className={styles.stats}>
				<div className={styles.stat}>
					<span className={styles.statNumber}>28</span>
					<span className={styles.statLabel}>day cycles tracked</span>
				</div>
				<div className={styles.stat}>
					<span className={styles.statNumber}>4</span>
					<span className={styles.statLabel}>
						cycle phases optimized
					</span>
				</div>
				<div className={styles.stat}>
					<span className={styles.statNumber}>∞</span>
					<span className={styles.statLabel}>potential unlocked</span>
				</div>
			</div>
		</div>
	);
}
