<script>
	import { path, link } from "./lib/router.js";
	import { userStore, isLoggedIn } from "./stores/userStore.js";
	import "./app.css";
	import Home from "./pages/home/Home.svelte";
	import CycleTracker from "./pages/cycletracker/CycleTracker.svelte";
	import WorkoutForm from "./pages/workoutform/WorkoutForm.svelte";
	import Auth from "./pages/auth/Auth.svelte";
	import Onboarding from "./pages/onboarding/Onboarding.svelte";
	import Dashboard from "./pages/dashboard/Dashboard.svelte";
	import NotFound from "./pages/NotFound.svelte";

	const routes = new Map([
		["/", Home],
		["/cycle", CycleTracker],
		["/workout", WorkoutForm],
		["/auth", Auth],
		["/dashboard", Dashboard],
		["/onboarding", Onboarding],
	]);

	$: pathname = $path.split("?")[0];
	$: Component = routes.get(pathname) ?? NotFound;
</script>

<div class="app-layout">
	<nav class="main-nav">
		<!-- Show these ONLY when user is logged in -->
		{#if $isLoggedIn}
			<a use:link href="/cycle" class="nav-link">CycleTracker</a>
			<a use:link href="/workout" class="nav-link">WorkoutForm</a>
			<a use:link href="/dashboard" class="nav-link">Dashboard</a>
			<button
				on:click={() => userStore.logout()}
				class="nav-link"
				style="background: none; border: none; cursor: pointer;"
			>
				Logout
			</button>
		{/if}

		<!-- Show this ONLY when user is NOT logged in -->
		{#if !$isLoggedIn}
			<a use:link href="/" class="nav-link">Home</a>

			<a use:link href="/auth" class="nav-link">Login/Register</a>
		{/if}
	</nav>

	<div class="content-area">
		<svelte:component this={Component} />
	</div>
</div>
