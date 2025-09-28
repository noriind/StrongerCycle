import { A } from "@solidjs/router";

export default function App(props) {
  return (
    <>
      <nav style={{ "margin-bottom": "16px" }}>
        <A href="/" end style={{ "margin-right": "12px" }}>Home</A>
        <A href="/cycle" style={{ "margin-right": "12px" }}>CycleTracker</A>
        <A href="/workout" style={{ "margin-right": "12px" }}>WorkoutForm</A>
        <A href="/auth" style={{ "margin-right": "12px" }}>Login/Register</A>
      </nav>
      {props.children}
    </>
  );
}