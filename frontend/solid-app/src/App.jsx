import { A } from "@solidjs/router";
import "./App.css";

export default function App(props) {
  return (
    <div class="app-layout">
      <nav class="main-nav">
        <A href="/" end class="nav-link">
          Home
        </A>
        <A href="/cycle" class="nav-link">
          CycleTracker
        </A>
        <A href="/workout" class="nav-link">
          WorkoutForm
        </A>
        <A href="/auth" class="nav-link">
          Login/Register
        </A>
      </nav>
      <div class="content-area">{props.children}</div>
    </div>
  );
}
