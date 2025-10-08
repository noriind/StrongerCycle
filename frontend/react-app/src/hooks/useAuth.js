import { useState } from "react";
import authService from "../../../common/services/authService";
import { useUser } from "../context/UserContext";

export const useAuth = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [successMessage, setSuccessMessage] = useState("");

	const { login: setUserLoggedIn } = useUser(); // Use the login method

	const login = async (email, password) => {
		setIsLoading(true);
		setError(null);
		setSuccessMessage("");

		try {
			const data = await authService.login(email, password);
			setSuccessMessage(data.message);

			setUserLoggedIn({
				email: email,
				id: data.user?.id || "temp-id",
				hasCompletedOnboarding: true, // Existing users completed onboarding
			});

			return data;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (email, password) => {
		setIsLoading(true);
		setError(null);
		setSuccessMessage("");

		try {
			const data = await authService.register(email, password);
			setSuccessMessage(data.message);

			setUserLoggedIn({
				email: email,
				id: data.user?.id || "temp-id",
				hasCompletedOnboarding: false, // New users need onboarding
			});

			return data;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const clearMessages = () => {
		setError(null);
		setSuccessMessage("");
	};

	return {
		login,
		register,
		isLoading,
		error,
		successMessage,
		clearMessages,
	};
};
