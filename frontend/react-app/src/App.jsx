import { NavLink, Routes, Route, Outlet } from "react-router";
import { useUser } from "./context/UserContext.jsx";
import Home from "./pages/home/Home.jsx";
import CycleTracker from "./pages/cycletracker/CycleTracker.jsx";
import WorkoutForm from "./pages/workoutform/WorkoutForm.jsx";
import Auth from "./pages/auth/Auth.jsx";
import Onboarding from "./pages/onboarding/Onboarding.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";

import "./App.css";

function Layout() {
	const { user, logout } = useUser();

	console.log("Current user:", user);

	return (
		<div className="app-layout">
			<nav className="main-nav">
				{/* Show these ONLY when user is logged in */}
				{user && (
					<>
						<NavLink
							to="/cycle"
							className={({ isActive }) =>
								`nav-link ${isActive ? "active" : ""}`
							}
						>
							CycleTracker
						</NavLink>
						<NavLink
							to="/workout"
							className={({ isActive }) =>
								`nav-link ${isActive ? "active" : ""}`
							}
						>
							WorkoutForm
						</NavLink>
						<NavLink
							to="/dashboard"
							className={({ isActive }) =>
								`nav-link ${isActive ? "active" : ""}`
							}
						>
							Dashboard
						</NavLink>
						{/* Add logout button */}
						<button
							onClick={logout}
							className="nav-link"
							style={{
								background: "none",
								border: "none",
								cursor: "pointer",
							}}
						>
							Logout
						</button>
					</>
				)}

				{/* Show this ONLY when user is NOT logged in */}
				{!user && (
					<>
						<NavLink
							to="/"
							end
							className={({ isActive }) =>
								`nav-link ${isActive ? "active" : ""}`
							}
						>
							Home
						</NavLink>
						<NavLink
							to="/auth"
							className={({ isActive }) =>
								`nav-link ${isActive ? "active" : ""}`
							}
						>
							Login/Register
						</NavLink>
					</>
				)}
			</nav>
			<div className="content-area">
				<Outlet />
			</div>
		</div>
	);
}

export default function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route index element={<Home />} />
				<Route path="cycle" element={<CycleTracker />} />
				<Route path="workout" element={<WorkoutForm />} />
				<Route path="auth" element={<Auth />} />
				<Route path="onboarding" element={<Onboarding />} />
				<Route path="*" element={<div>Page Not Found</div>} />
				<Route path="dashboard" element={<Dashboard />} />
			</Route>
		</Routes>
	);
}
