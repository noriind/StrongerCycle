<script>
	import styles from "../../../../common/styles/Auth.module.css";
	import authService from "../../../../common/services/authService.js";
	import { userStore } from "../../stores/userStore.js";
	import { navigate } from "../../lib/router.js";

	let renderCount = 0;
	renderCount++;
	console.log(`Auth component rendered ${renderCount} times`);

	let isLogin = true;
	let email = "";
	let password = "";
	let confirmPassword = "";
	let isLoading = false;
	let error = null;
	let successMessage = "";

	async function handleSubmit(event) {
		event.preventDefault();
		error = null;
		successMessage = "";
		isLoading = true;

		try {
			if (isLogin) {
				const data = await authService.login(email, password);
				successMessage = data.message;

				userStore.login({
					email: email,
					id: data.user?.id || "temp-id",
					hasCompletedOnboarding: true,
				});

				setTimeout(() => {
					navigate("/dashboard");
				}, 1000);
			} else {
				const data = await authService.register(email, password);
				successMessage = data.message;

				userStore.login({
					email: email,
					id: data.user?.id || "temp-id",
					hasCompletedOnboarding: false,
				});

				setTimeout(() => {
					navigate("/onboarding");
				}, 1500);
			}
		} catch (err) {
			error = err.message;
		} finally {
			isLoading = false;
		}
	}

	function toggleMode() {
		isLogin = !isLogin;
		email = "";
		password = "";
		confirmPassword = "";
		error = null;
		successMessage = "";
	}
</script>

<div class={styles.pageWrapper}>
	<div class={styles.container}>
		<h1 class={styles.title}>
			{isLogin ? "Welcome Back" : "Create Account"}
		</h1>

		{#if successMessage}
			<div class={styles.successMessage}>
				{successMessage}
				{#if !isLogin}
					<div style="margin-top: 0.5rem; font-size: 0.9rem;">
						Redirecting to setup your profile...
					</div>
				{/if}
			</div>
		{/if}

		{#if error}
			<div class={styles.errorBanner}>
				{error}
			</div>
		{/if}

		<form class={styles.form} on:submit={handleSubmit}>
			<div class={styles.inputGroup}>
				<input
					type="email"
					placeholder="Email address"
					bind:value={email}
					class={styles.input}
				/>
			</div>

			<div class={styles.inputGroup}>
				<input
					type="password"
					placeholder="Password"
					bind:value={password}
					class={styles.input}
				/>
			</div>

			{#if !isLogin}
				<div class={styles.inputGroup}>
					<input
						type="password"
						placeholder="Confirm Password"
						bind:value={confirmPassword}
						class={styles.input}
					/>
				</div>
			{/if}

			<button
				type="submit"
				class={styles.submitButton}
				disabled={isLoading}
			>
				{isLoading
					? "Loading..."
					: isLogin
						? "Sign In"
						: "Create Account"}
			</button>
		</form>

		<div class={styles.toggleSection}>
			{isLogin ? "Don't have an account?" : "Already have an account?"}
			<button
				type="button"
				on:click={toggleMode}
				class={styles.toggleButton}
			>
				{isLogin ? "Sign up" : "Sign in"}
			</button>
		</div>
	</div>
</div>
