import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useUser } from "../../context/UserContext.jsx";
import styles from "./Auth.module.css";
import authService from "../../services/authService";

let renderCount = 0;

export default function Auth() {
	// for checking the re-renders
	renderCount++;
	console.log("Auth component rendered", renderCount, "times");

	const navigate = useNavigate();
	const { login: setUserLoggedIn } = useUser();
	const [isLogin, setIsLogin] = createSignal(true);
	const [email, setEmail] = createSignal("");
	const [password, setPassword] = createSignal("");
	const [confirmPassword, setConfirmPassword] = createSignal("");
	const [isLoading, setIsLoading] = createSignal(false);
	const [error, setError] = createSignal(null);
	const [successMessage, setSuccessMessage] = createSignal("");

	const handleSubmit = async e => {
		e.preventDefault();
		setError(null);
		setSuccessMessage("");
		setIsLoading(true);

		try {
			if (isLogin()) {
				const data = await authService.login(email(), password());
				setSuccessMessage(data.message);

				setUserLoggedIn({
					email: email(),
					id: data.user?.id || "temp-id",
					hasCompletedOnboarding: true,
				});
				setTimeout(() => {
					navigate("/dashboard");
				}, 2000);
			} else {
				const data = await authService.register(email(), password());
				setSuccessMessage(data.message);

				setUserLoggedIn({
					email: email(),
					id: data.user?.id || "temp-id",
					hasCompletedOnboarding: false,
				});

				setTimeout(() => {
					navigate("/onboarding");
				}, 2000); // Wait 2 seconds to show success message
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const toggleMode = () => {
		setIsLogin(!isLogin());
		setEmail("");
		setPassword("");
		setConfirmPassword("");
		setError(null);
		setSuccessMessage("");
	};

	return (
		<div class={styles.pageWrapper}>
			<div class={styles.container}>
				<h1 class={styles.title}>
					{isLogin() ? "Welcome Back" : "Create Account"}
				</h1>

				{/* Add success/error messages */}
				{successMessage() && (
					<div class={styles.successMessage}>{successMessage()}</div>
				)}

				{error() && <div class={styles.errorBanner}>{error()}</div>}

				<form class={styles.form} onSubmit={handleSubmit}>
					<div class={styles.inputGroup}>
						<input
							type="email"
							placeholder="Email address"
							value={email()}
							onInput={e => setEmail(e.target.value)}
							class={styles.input}
						/>
					</div>

					<div class={styles.inputGroup}>
						<input
							type="password"
							placeholder="Password"
							value={password()}
							onInput={e => setPassword(e.target.value)}
							class={styles.input}
						/>
					</div>

					{!isLogin() && (
						<div class={styles.inputGroup}>
							<input
								type="password"
								placeholder="Confirm Password"
								value={confirmPassword()}
								onInput={e =>
									setConfirmPassword(e.target.value)
								}
								class={styles.input}
							/>
						</div>
					)}

					<button
						type="submit"
						class={styles.submitButton}
						disabled={isLoading()}
					>
						{isLoading()
							? "Loading..."
							: isLogin()
								? "Sign In"
								: "Create Account"}
					</button>
				</form>

				<div class={styles.toggleSection}>
					{isLogin()
						? "Don't have an account?"
						: "Already have an account?"}{" "}
					<button
						type="button"
						onClick={toggleMode}
						class={styles.toggleButton}
					>
						{isLogin() ? "Sign up" : "Sign in"}
					</button>
				</div>
			</div>
		</div>
	);
}
