import { NavLink, Routes, Route, Outlet } from "react-router";
import Home from "./pages/home/Home.jsx";
import CycleTracker from "./pages/cycletracker/CycleTracker.jsx";
import WorkoutForm from "./pages/workoutform/WorkoutForm.jsx";
import Auth from "./pages/auth/Auth.jsx";

function Layout() {
  const linkStyle = ({ isActive }) => ({
    marginRight: 12,
    textDecoration: isActive ? "underline" : "none",
  });
  return (
    <>
      <nav style={{ marginBottom: 16 }}>
        <NavLink to="/" end style={linkStyle}>Home</NavLink>
        <NavLink to="/cycle" style={linkStyle}>Cycle</NavLink>
        <NavLink to="/workout" style={linkStyle}>Workout</NavLink>
        <NavLink to="/auth" style={linkStyle}>Login/Register</NavLink>
      </nav>
      <Outlet />
    </>
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
      </Route>
    </Routes>
  );
}