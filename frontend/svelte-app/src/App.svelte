<script>
  import { path, link } from "./lib/router.js";
  import Home from "./pages//home/Home.svelte";
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

<nav style="margin-bottom:16px; display:flex; gap:12px">
  <a use:link href="/">Home</a>
  <a use:link href="/cycle">CycleTracker</a>
  <a use:link href="/workout">WorkoutForm</a>
  <a use:link href="/auth">Login/Register</a>
</nav>

<svelte:component this={Component} />