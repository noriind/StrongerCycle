import { A } from "@solidjs/router";
import { UserProvider, useUser } from "./context/UserContext.jsx";
import { Show } from "solid-js";
import "./App.css";

function AppContent(props) {
  const { user, isLoggedIn, logout } = useUser();

  return (
    <div class="app-layout">
      <nav class="main-nav">
        <A href="/" end class="nav-link">
          Home
        </A>

        {/* Show these ONLY when user is logged in */}
        <Show when={isLoggedIn()}>
          <A href="/cycle" class="nav-link">
            CycleTracker
          </A>
          <A href="/workout" class="nav-link">
            WorkoutForm
          </A>
          <button
            onClick={logout}
            class="nav-link"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Logout
          </button>
        </Show>

        {/* Show this ONLY when user is NOT logged in */}
        <Show when={!isLoggedIn()}>
          <A href="/auth" class="nav-link">
            Login/Register
          </A>
        </Show>

        {/* Debug info - remove later */}
        <span style={{ color: "white", "margin-left": "20px" }}>
          User: {isLoggedIn() ? "Logged in" : "Not logged in"}
        </span>
      </nav>

      <div class="content-area">{props.children}</div>
    </div>
  );
}

export default function App(props) {
  return (
    <UserProvider>
      <AppContent>{props.children}</AppContent>
    </UserProvider>
  );
}
