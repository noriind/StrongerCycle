import { NavLink, Routes, Route, Outlet } from "react-router";
import Home from "./pages/home/Home.jsx";
import CycleTracker from "./pages/cycletracker/CycleTracker.jsx";
import WorkoutForm from "./pages/workoutform/WorkoutForm.jsx";
import Auth from "./pages/auth/Auth.jsx";
import Onboarding from "./pages/onboarding/Onboarding.jsx";

import "./App.css";

function Layout() {
  return (
    <div className="app-layout">
      <nav className="main-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Home
        </NavLink>
        <NavLink
          to="/cycle"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          CycleTracker
        </NavLink>
        <NavLink
          to="/workout"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          WorkoutForm
        </NavLink>
        <NavLink
          to="/auth"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Login/Register
        </NavLink>
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
      </Route>
    </Routes>
  );
}
