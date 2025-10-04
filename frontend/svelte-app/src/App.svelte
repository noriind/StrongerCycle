<script>
  import { path, link } from "./lib/router.js";
  import "./app.css";
  import Home from "./pages/home/Home.svelte";
  import CycleTracker from "./pages/cycletracker/CycleTracker.svelte";
  import WorkoutForm from "./pages/workoutform/WorkoutForm.svelte";
  import Auth from "./pages/auth/Auth.svelte";
  import NotFound from "./pages/NotFound.svelte";

  const routes = new Map([
    ["/", Home],
    ["/cycle", CycleTracker],
    ["/workout", WorkoutForm],
    ["/auth", Auth],
  ]);

  $: pathname = $path.split("?")[0];
  $: Component = routes.get(pathname) ?? NotFound;
</script>

<div class="app-layout">
  <nav class="main-nav">
    <a use:link href="/" class="nav-link">Home</a>
    <a use:link href="/cycle" class="nav-link">CycleTracker</a>
    <a use:link href="/workout" class="nav-link">WorkoutForm</a>
    <a use:link href="/auth" class="nav-link">Login/Register</a>
  </nav>

  <div class="content-area">
    <svelte:component this={Component} />
  </div>
</div>