import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

const UserContext = createContext();

function UserProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	// Check for saved user on app start
	useEffect(() => {
		const savedUser = localStorage.getItem("strongcycles_user");
		if (savedUser) {
			try {
				setUser(JSON.parse(savedUser));
			} catch (error) {
				console.error("Error parsing saved user:", error);
				localStorage.removeItem("strongcycles_user");
			}
		}
		setIsLoading(false);
	}, []);

	const login = userData => {
		console.log("🔍 UserContext login called with:", userData);
		setUser(userData);
		localStorage.setItem("strongcycles_user", JSON.stringify(userData));
	};

	const logout = () => {
		console.log("🔍 UserContext logout called");
		setUser(null);
		localStorage.removeItem("strongcycles_user");
		navigate("/");
	};

	const updateUser = updatedData => {
		const newUserData = { ...user, ...updatedData };
		setUser(newUserData);
		localStorage.setItem("strongcycles_user", JSON.stringify(newUserData));
	};

	const value = {
		user,
		login,
		logout,
		updateUser,
		isLoggedIn: !!user,
		isLoading,
	};

	return (
		<UserContext.Provider value={value}>{children}</UserContext.Provider>
	);
}

function useUser() {
	const context = useContext(UserContext);

	if (!context) {
		throw new Error("useUser must be used inside UserProvider");
	}

	return context;
}

export { UserProvider, useUser };
