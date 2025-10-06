import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useRef } from "react";
import { useNavigate } from "react-router";
import styles from "./Auth.module.css";

export default function Auth() {
	// for checking the re-renders
	const renderCount = useRef(0);
	renderCount.current++;
	console.log("Auth component render count:", renderCount.current, "times");
	const [isLogin, setIsLogin] = useState(true);
	const navigate = useNavigate();
	const {
		login,
		register: registerUser,
		isLoading,
		error,
		successMessage,
		clearMessages,
	} = useAuth();

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const password = watch("password");

	const onSubmit = async data => {
		try {
			if (isLogin) {
				await login(data.email, data.password);
				// After successful login, go to dashboard or home
				navigate("/");
			} else {
				await registerUser(data.email, data.password);
				// After successful registration, go to onboarding
				setTimeout(() => {
					navigate("/onboarding");
				}, 2000); // Wait 2 seconds to show success message
			}
		} catch (err) {
			// Error handled by useAuth hook
		}
	};

	const toggleMode = () => {
		setIsLogin(!isLogin);
		reset();
		clearMessages();
	};

	return (
		<div className={styles.pageWrapper}>
			<div className={styles.container}>
				<h1 className={styles.title}>
					{isLogin ? "Welcome Back" : "Create Account"}
				</h1>

				{successMessage && (
					<div className={styles.successMessage}>
						{successMessage}
					</div>
				)}

				{error && <div className={styles.errorBanner}>{error}</div>}

				<form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
					<div className={styles.inputGroup}>
						<input
							type="email"
							placeholder="Email address"
							{...register("email", {
								required: "Email is required",
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: "Invalid email format",
								},
							})}
							className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
						/>
						{errors.email && (
							<div className={styles.errorMessage}>
								{errors.email.message}
							</div>
						)}
					</div>

					<div className={styles.inputGroup}>
						<input
							type="password"
							placeholder="Password"
							{...register("password", {
								required: "Password is required",
								minLength: {
									value: 6,
									message:
										"Password must be at least 6 characters",
								},
							})}
							className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
						/>
						{errors.password && (
							<div className={styles.errorMessage}>
								{errors.password.message}
							</div>
						)}
					</div>

					{!isLogin && (
						<div className={styles.inputGroup}>
							<input
								type="password"
								placeholder="Confirm Password"
								{...register("confirmPassword", {
									required: "Confirm password is required",
									validate: value =>
										value === password ||
										"Passwords don't match",
								})}
								className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
							/>
							{errors.confirmPassword && (
								<div className={styles.errorMessage}>
									{errors.confirmPassword.message}
								</div>
							)}
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className={styles.submitButton}
					>
						{isLoading
							? "Loading..."
							: isLogin
								? "Sign In"
								: "Create Account"}
					</button>
				</form>

				<div className={styles.toggleSection}>
					{isLogin
						? "Don't have an account?"
						: "Already have an account?"}{" "}
					<button
						type="button"
						onClick={toggleMode}
						className={styles.toggleButton}
					>
						{isLogin ? "Sign up" : "Sign in"}
					</button>
				</div>
			</div>
		</div>
	);
}
