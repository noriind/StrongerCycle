import { writable } from "svelte/store";

// Create a writable store for user data
function createUserStore() {
	const { subscribe, set, update } = writable(null);

	// Check for saved user on initialization
	const savedUser = localStorage.getItem("strongcycles_user");
	if (savedUser) {
		try {
			set(JSON.parse(savedUser));
		} catch (error) {
			console.error("Error parsing saved user:", error);
			localStorage.removeItem("strongcycles_user");
		}
	}

	return {
		subscribe,
		login: userData => {
			set(userData);
			localStorage.setItem("strongcycles_user", JSON.stringify(userData));
		},
		logout: () => {
			set(null);
			localStorage.removeItem("strongcycles_user");
		},
		updateUser: updatedData => {
			update(currentUser => {
				const newUserData = { ...currentUser, ...updatedData };
				localStorage.setItem(
					"strongcycles_user",
					JSON.stringify(newUserData)
				);
				return newUserData;
			});
		},
	};
}

export const userStore = createUserStore();

// Derived store for checking if user is logged in
import { derived } from "svelte/store";
export const isLoggedIn = derived(userStore, $user => !!$user);
