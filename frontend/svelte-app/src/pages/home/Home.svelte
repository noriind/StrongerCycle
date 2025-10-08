<script>
	import { navigate } from "../../lib/router.js";
	import { userStore, isLoggedIn } from "../../stores/userStore.js";
	import styles from "./Home.module.css";

	// Render counter for performance testing
	let renderCount = 0;
	renderCount++;
	console.log("🔄 Svelte Home render count:", renderCount, "times");
</script>

<div class={styles.container}>
	<div class={styles.hero}>
		<div class={styles.content}>
			<h1 class={styles.title}>
				Sync Your <span class={styles.accent}>Strength</span> with Your{" "}
				<span class={styles.accent}>Cycle</span>
			</h1>
			<p class={styles.subtitle}>
				Unlock your body's natural power with personalized fitness
				tracking that works with your menstrual cycle, not against it.
			</p>

			<div class={styles.features}>
				<div class={styles.feature}>
					<span class={styles.emoji}>🌙</span>
					<span>Cycle-synced workouts</span>
				</div>
				<div class={styles.feature}>
					<span class={styles.emoji}>💪</span>
					<span>Strength optimization</span>
				</div>
				<div class={styles.feature}>
					<span class={styles.emoji}>📊</span>
					<span>Personalized insights</span>
				</div>
			</div>

			{#if $isLoggedIn}
				<div class={styles.actions}>
					<button
						class={styles.primaryButton}
						on:click={() => navigate("/dashboard")}
					>
						Your Dashboard ✨
					</button>
					<button
						class={styles.secondaryButton}
						on:click={() => navigate("/cycle")}
					>
						Track Your Cycle
					</button>
				</div>
			{:else}
				<div class={styles.actions}>
					<button
						class={styles.primaryButton}
						on:click={() => navigate("/auth")}
					>
						Start Your Journey
					</button>
					<p class={styles.subtitle}>
						Join thousands of women optimizing their fitness
						naturally
					</p>
				</div>
			{/if}
		</div>

		<div class={styles.illustration}>
			<div class={styles.circle}></div>
			<div class={styles.dots}>
				<span class={styles.dot}></span>
				<span class={styles.dot}></span>
				<span class={styles.dot}></span>
			</div>
		</div>
	</div>

	<div class={styles.stats}>
		<div class={styles.stat}>
			<span class={styles.statNumber}>28</span>
			<span class={styles.statLabel}>day cycles tracked</span>
		</div>
		<div class={styles.stat}>
			<span class={styles.statNumber}>4</span>
			<span class={styles.statLabel}>cycle phases optimized</span>
		</div>
		<div class={styles.stat}>
			<span class={styles.statNumber}>∞</span>
			<span class={styles.statLabel}>potential unlocked</span>
		</div>
	</div>
</div>
