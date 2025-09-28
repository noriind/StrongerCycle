import { useState } from "react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!isLogin && !confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    }
    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(isLogin ? "Login successful" : "Registration successful");
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>{isLogin ? "Login" : "Register"}</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: errors.email ? "1px solid red" : "1px solid #ccc"
            }}
          />
          {errors.email && <div style={{ color: "red", fontSize: 12 }}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: errors.password ? "1px solid red" : "1px solid #ccc"
            }}
          />
          {errors.password && <div style={{ color: "red", fontSize: 12 }}>{errors.password}</div>}
        </div>

        {!isLogin && (
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: errors.confirmPassword ? "1px solid red" : "1px solid #ccc"
              }}
            />
            {errors.confirmPassword && <div style={{ color: "red", fontSize: 12 }}>{errors.confirmPassword}</div>}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Loading..." : (isLogin ? "Login" : "Register")}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 16 }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setErrors({});
            setEmail("");
            setPassword("");
            setConfirmPassword("");
          }}
          style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer" }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}