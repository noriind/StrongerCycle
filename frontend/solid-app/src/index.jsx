import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import App from "./App.jsx";
import Home from "./pages/home/Home.jsx";
import CycleTracker from "./pages/cycletracker/CycleTracker.jsx";
import WorkoutForm from "./pages/workoutform/WorkoutForm.jsx";
import Auth from "./pages/auth/Auth.jsx";
import NotFound from "./pages/NotFound.jsx";
import Onboarding from "./pages/onboarding/Onboarding.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import "./index.css";

render(
	() => (
		<Router root={App}>
			<Route path="/" component={Home} />
			<Route path="/cycle" component={CycleTracker} />
			<Route path="/workout" component={WorkoutForm} />
			<Route path="/auth" component={Auth} />
			<Route path="/onboarding" component={Onboarding} />
			<Route path="/dashboard" component={Dashboard} />
			<Route path="*404" component={NotFound} />
		</Router>
	),
	document.getElementById("root")
);
