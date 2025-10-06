import { createContext, useContext } from "solid-js";
import { createSignal } from "solid-js";

const UserContext = createContext();

export function UserProvider(props) {
	const [user, setUser] = createSignal(null);

	const login = userData => {
		setUser(userData);
		localStorage.setItem("strongcycles_user", JSON.stringify(userData));
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("strongcycles_user");
	};

	// Check for saved user on startup
	const savedUser = localStorage.getItem("strongcycles_user");
	if (savedUser && !user()) {
		try {
			setUser(JSON.parse(savedUser));
		} catch (error) {
			console.error("Error parsing saved user:", error);
			localStorage.removeItem("strongcycles_user");
		}
	}

	const value = {
		user,
		login,
		logout,
		isLoggedIn: () => !!user(),
	};

	return (
		<UserContext.Provider value={value}>
			{props.children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}
